import { requireAdmin, sendJson } from '../../server/square-api.js'
import { beginConnection, checkConnection, configuration, disconnectConnection, finishConnection, getConnection, stateCookie } from '../../server/quickbooks-api.js'
import { QuickBooksError } from '../../server/quickbooks-core.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  const action = new URL(req.url, 'https://tssprint.com').pathname.split('/').at(-1)
  if (!['connect', 'callback', 'status', 'check', 'disconnect'].includes(action)) return sendJson(res, 404, { error: 'Not found' })
  const expectedMethod = ['status', 'callback'].includes(action) ? 'GET' : 'POST'
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
    await disconnectConnection()
    return sendJson(res, 200, { disconnected: true })
  } catch (error) {
    const code = error instanceof QuickBooksError ? error.code : 'connection_service_unavailable'
    console.warn(JSON.stringify({ provider: 'quickbooks', operation: action, code }))
    return sendJson(res, error instanceof QuickBooksError ? error.status : 503, { error: code })
  }
}
