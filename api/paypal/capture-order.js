import { quickBooksOnly, taxEnabledPaymentMessage } from '../../server/payment-policy.js'
import { markCartPaid } from '../../server/cart-api.js'
import { hasPaidOrder } from '../../server/checkout-pricing.js'
import {
  getCompletedCapture,
  assertPayPalCheckout,
  normalizeCheckout,
  paypalFetch,
  readBody,
  requirePayPalEnv,
  saveCapturedOrder,
  sendJson,
} from '../../server/paypal-api.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  if (!requirePayPalEnv(res)) return

  try {
    const body = await readBody(req)
    const orderID = String(body?.orderID || '').trim()
    if (!orderID) return sendJson(res, 400, { error: 'Missing PayPal order ID.' })

    const approved = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderID)}`)
    if (quickBooksOnly() && !getCompletedCapture(approved)) return sendJson(res, 409, { error: taxEnabledPaymentMessage })
    const checkout = await normalizeCheckout(body, { hasPaidOrder: email => hasPaidOrder(email, orderID) })
    assertPayPalCheckout(approved, checkout)
    const capture = getCompletedCapture(approved) ? approved : await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `capture-${orderID}` },
      body: '{}',
    })

    if (!getCompletedCapture(capture)) {
      return sendJson(res, 400, {
        error: 'PayPal did not confirm a completed capture.',
        orderID: capture?.id || orderID,
        status: capture?.status,
      })
    }

    const completed = getCompletedCapture(capture)
    if (completed.amount?.currency_code !== 'USD' || Math.round(Number(completed.amount?.value) * 100) !== Math.round(checkout.total * 100)) {
      return sendJson(res, 409, { error: 'Payment was received but its total does not match this checkout. Contact the shop with your payment ID.', orderID: capture.id || orderID })
    }
    try { await markCartPaid(body.cartSession, 'paypal', capture.id || orderID, checkout) }
    catch (error) { console.error('[cart-conversion] PayPal linkage failed', { orderID, message: error.message }) }

    const saved = await saveCapturedOrder(capture.id || orderID, checkout, capture)

    sendJson(res, 200, {
      id: capture.id || orderID,
      orderID: capture.id || orderID,
      status: capture.status,
      orderSaved: saved.saved,
      orderSaveIssue: saved.saved ? undefined : saved.reason,
      capture,
    })
  } catch (error) {
    const issue = error.paypal?.details?.[0]?.issue
    sendJson(res, error.status || 400, {
      error: error.message || 'Could not capture PayPal order.',
      instrumentDeclined: issue === 'INSTRUMENT_DECLINED',
      details: error.paypal?.details,
    })
  }
}
