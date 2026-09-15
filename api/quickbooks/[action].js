import { requireAdmin, sendJson } from '../../server/square-api.js'
import { beginConnection, checkConnection, configuration, disconnectConnection, finishConnection, getConnection, stateCookie } from '../../server/quickbooks-api.js'
import { QuickBooksError } from '../../server/quickbooks-core.js'
import { listInvoiceTests, runInvoiceTest } from '../../server/quickbooks-invoices.js'
import { checkoutReadiness } from '../../server/quickbooks-readiness.js'
import { waitUntil } from '@vercel/functions'
import { checkoutEnabled, checkoutContext, prepareCheckout, ownedCheckout, refreshCheckout, reconcileCheckouts, listCheckouts } from '../../server/quickbooks-checkout.js'
import { processQuickBooksDelivery } from '../../server/quickbooks-delivery.js'
import { acceptWebhook, boundedBody, processWebhookEvents } from '../../server/quickbooks-webhook.js'
import { consumeRateLimit } from '../../server/request-guards.js'
import { digest } from '../../server/quickbooks-core.js'
import { claimWorker, runWorker, workerHealth } from '../../server/quickbooks-worker.js'
import { quickBooksOnly } from '../../server/payment-policy.js'
import { QB_PRODUCT_NAMES } from '../../server/quickbooks-checkout-core.js'

export const config = { api: { bodyParser: false } }
const followUp = id => processQuickBooksDelivery(id).catch(() => console.warn('QuickBooks follow-up remains queued'))

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  const action = new URL(req.url, 'https://tssprint.com').pathname.split('/').at(-1)
  if (action === 'worker') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
    try {
      const id = await claimWorker(JSON.parse((await boundedBody(req)).toString('utf8')))
      const result = await runWorker(id)
      return sendJson(res, 200, result)
    } catch (error) { return sendJson(res, error instanceof QuickBooksError ? error.status : 503, { error: error instanceof QuickBooksError ? error.code : 'worker_failed' }) }
  }
  if (['checkout-config', 'checkout', 'checkout-status', 'webhook'].includes(action)) {
    if (req.method !== (action === 'checkout-config' ? 'GET' : 'POST')) return sendJson(res, 405, { error: 'Method not allowed' })
    try {
      if (action === 'checkout-config') {
        let enabled = checkoutEnabled()
        if (enabled) { try { await checkoutContext() } catch { enabled = false } }
        return sendJson(res, 200, { enabled, quickBooksOnly: quickBooksOnly(), categories: Object.keys(QB_PRODUCT_NAMES) })
      }
      const raw = await boundedBody(req)
      if (action === 'webhook') {
        if (await acceptWebhook(raw, req.headers['intuit-signature'])) waitUntil(processWebhookEvents().then(() => followUp(null)).catch(() => console.warn('QuickBooks reconciliation remains queued')))
        return sendJson(res, 200, { received: true })
      }
      if (req.headers.origin !== configuration().origin) return sendJson(res, 403, { error: 'Use the checkout on tssprint.com.' })
      if (!consumeRateLimit(req, { key: `qb-${action}`, limit: action === 'checkout' ? 10 : 40, windowMs: 60000 }).allowed) return sendJson(res, 429, { error: 'rate_limited' })
      const body = JSON.parse(raw.toString('utf8'))
      let result
      if (action === 'checkout') {
        if (!checkoutEnabled()) {
          // Admin can verify the prepared flow before public availability.
          try { await requireAdmin(req) } catch { throw new QuickBooksError('admin_access_required', 403) }
        }
        const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim()
        result = await prepareCheckout(body, digest(`${configuration().key}:${ip}`))
      } else result = await refreshCheckout(await ownedCheckout(body))
      if (result.orderId) waitUntil(followUp(result.id))
      return sendJson(res, 200, result)
    } catch (error) {
      const known = error instanceof QuickBooksError
      return sendJson(res, known ? error.status : 503, { error: known ? error.code : 'checkout_service_unavailable' })
    }
  }
  if (!['connect', 'callback', 'status', 'check', 'disconnect', 'invoice-tests', 'test-invoice', 'test-payment', 'readiness', 'checkouts', 'reconcile'].includes(action)) return sendJson(res, 404, { error: 'Not found' })
  const expectedMethod = ['status', 'callback', 'invoice-tests', 'readiness', 'checkouts'].includes(action) ? 'GET' : 'POST'
  if (req.method !== expectedMethod) { res.setHeader('Allow', expectedMethod); return sendJson(res, 405, { error: 'Method not allowed' }) }
  if (action === 'callback') {
    let result = 'connected'
    try { await finishConnection(req) }
    catch (error) {
      result = error instanceof QuickBooksError ? error.code : 'connection_failed'
      console.warn(JSON.stringify({ provider: 'quickbooks', operation: 'callback', code: result }))
    }
    res.setHeader('Set-Cookie', stateCookie('', 0))
    res.statusCode = 303
    res.setHeader('Location', `/admin?tab=quickbooks&quickbooks=${encodeURIComponent(result)}`)
    return res.end()
  }
  let user
  try { user = await requireAdmin(req) }
  catch { return sendJson(res, 403, { error: 'Admin access required.' }) }
  try {
    const config = configuration()
    if (req.method === 'POST' && req.headers.origin !== config.origin) return sendJson(res, 403, { error: 'Use the admin page on the configured site.' })
    if (action === 'status') {
      let connection = null
      let databaseReady = false
      try { connection = await getConnection(); databaseReady = Boolean(connection) } catch { /* Setup state is visible only to admins. */ }
      return sendJson(res, 200, { environment: config.environment, configured: !config.missing.length, missing: config.missing, databaseReady,
        status: connection?.status || 'disconnected', companyName: connection?.company_name || null, redirectUri: config.redirectUri })
    }
    if (action === 'connect') {
      const result = await beginConnection(user.id)
      res.setHeader('Set-Cookie', result.cookie)
      return sendJson(res, 200, { authorizationUrl: result.authorizationUrl })
    }
    if (action === 'check') return sendJson(res, 200, await checkConnection())
    if (action === 'readiness') return sendJson(res, 200, await checkoutReadiness())
    if (action === 'checkouts') return sendJson(res, 200, { checkouts: await listCheckouts(), worker: await workerHealth() })
    if (action === 'reconcile') { await processWebhookEvents(); const checked = await reconcileCheckouts(); waitUntil(followUp(null)); return sendJson(res, 200, { checked }) }
    if (action === 'invoice-tests') return sendJson(res, 200, { invoices: await listInvoiceTests() })
    if (action === 'test-invoice' || action === 'test-payment') return sendJson(res, 200, await runInvoiceTest({ recordPayment: action === 'test-payment' }))
    await disconnectConnection()
    return sendJson(res, 200, { disconnected: true })
  } catch (error) {
    const code = error instanceof QuickBooksError ? error.code : 'connection_service_unavailable'
    console.warn(JSON.stringify({ provider: 'quickbooks', operation: action, code }))
    return sendJson(res, error instanceof QuickBooksError ? error.status : 503, { error: code })
  }
}
