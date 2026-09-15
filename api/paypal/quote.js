import { normalizeCheckout, readBody, sendJson } from '../../server/paypal-api.js'

// Validation only: never creates an order, captures money or sends email.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
  try {
    const checkout = await normalizeCheckout(await readBody(req))
    sendJson(res, 200, { subtotal: checkout.subtotal, discount: checkout.discount, total: checkout.total, currency: 'USD' })
  } catch (error) {
    sendJson(res, error.status || 400, { error: error.message || 'Could not validate checkout.' })
  }
}
