import { requireAdmin, supabaseFetch } from '../../server/square-api.js'
import { recoverWalletPayment } from '../../server/paypal-wallet.js'
import {
  getCompletedCapture,
  paypalFetch,
  readBody,
  requirePayPalEnv,
  sendJson,
} from '../../server/paypal-api.js'

function getOrderIdFromRequest(req, body) {
  if (req.method === 'GET') {
    const url = new URL(req.url || '/', `https://${req.headers.host || 'tssprint.com'}`)
    return String(url.searchParams.get('orderID') || url.searchParams.get('id') || '').trim()
  }
  return String(body?.orderID || body?.id || '').trim()
}

function isPayPalNotFound(error) {
  const issue = error.paypal?.details?.[0]?.issue
  return error.status === 404 || issue === 'RESOURCE_NOT_FOUND'
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return sendJson(res, 405, { error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'no-store')
  try { await requireAdmin(req) } catch { return sendJson(res, 403, { error: 'Admin access required.' }) }
  if (!requirePayPalEnv(res)) return

  let orderID = ''

  try {
    const body = req.method === 'POST' ? await readBody(req) : null
    orderID = getOrderIdFromRequest(req, body)
    if (!orderID) return sendJson(res, 400, { error: 'Missing PayPal order ID.' })

    if (!/^[A-Z0-9]{10,32}$/.test(orderID)) return sendJson(res, 400, { error: 'Invalid PayPal order ID.' })
    const [wallet] = await supabaseFetch(`/rest/v1/quickbooks_checkouts?order_id=eq.${orderID}&payment_mode=eq.wallet`)
    if (wallet) {
      const result = await recoverWalletPayment(wallet)
      const [saved] = await supabaseFetch(`/rest/v1/quickbooks_checkouts?id=eq.${wallet.id}`)
      return sendJson(res, 200, { id: orderID, orderID, paypalStatus: saved.wallet_payment.status, paymentStatus: result.status === 'payment_recorded' ? 'captured' : ['REFUNDED','PARTIALLY_REFUNDED'].includes(saved.wallet_payment.status) ? 'refunded' : 'unverified', captured: result.status === 'payment_recorded', captureId: saved.wallet_payment.captureId, amount: saved.total.toFixed(2), currency: 'USD', verifiedAt: saved.last_checked_at })
    }
    const paypalOrder = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderID)}`)
    const capture = getCompletedCapture(paypalOrder)

    sendJson(res, 200, {
      id: paypalOrder?.id || orderID,
      orderID: paypalOrder?.id || orderID,
      paypalStatus: paypalOrder?.status || 'UNKNOWN',
      paymentStatus: capture ? 'captured' : 'not_captured',
      captured: Boolean(capture),
      captureId: capture?.id,
      amount: capture?.amount?.value,
      currency: capture?.amount?.currency_code,
      verifiedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (isPayPalNotFound(error)) {
      return sendJson(res, 200, {
        id: orderID,
        orderID,
        paypalStatus: 'NOT_FOUND',
        paymentStatus: 'not_found',
        captured: false,
        verifiedAt: new Date().toISOString(),
        error: 'No live PayPal order/payment was found for this ID.',
      })
    }

    sendJson(res, error.status || 400, {
      error: error.message || 'Could not verify PayPal order.',
      details: error.paypal?.details,
    })
  }
}
