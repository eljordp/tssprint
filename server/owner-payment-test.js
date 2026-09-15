import { prepareCheckout } from './quickbooks-checkout.js'
import { QuickBooksError } from './quickbooks-core.js'

// Called only behind requireAdmin. Never accept a browser price, recipient,
// discount or product, and never change the public catalog or order minimum.
export function ownerTestCheckout(user) {
  if (!user?.id || !user.email) throw new QuickBooksError('admin_access_required', 403)
  return {
    ownerTest: true, testOwnerId: user.id,
    items: [{ id: 'owner-payment-verification', name: 'Owner payment test — no production', category: 'Stickers',
      option: '1 test payment', size: 'No physical product', quantity: 1, price: 0.90, unitPrice: 0.90,
      lineTotal: 0.90, addOns: [] }],
    customer: { firstName: 'Owner', lastName: 'Payment Test', email: user.email, phone: '', deliveryMethod: 'pickup', address: '', city: 'Hayward', state: 'CA', zip: '94545' },
    subtotal: 0.90, discount: 0, total: 0.90, promoCode: null,
    description: 'Owner payment verification only — no production or fulfillment',
    visitorId: null, sessionId: null, attribution: null,
  }
}

export async function prepareOwnerPaymentTest(body, user, dependencies = {}) {
  const checkout = ownerTestCheckout(user)
  const result = await (dependencies.prepare || prepareCheckout)({
    id: body.id, token: body.token,
    checkout: { ownerPaymentTest: user.id, paymentMode: 'wallet' },
    ga4: body.ga4 ? { ...body.ga4, debugMode: true } : null,
  }, `owner-payment-test:${user.id}`, { normalize: async () => checkout, paymentMode: 'wallet' })
  // The real tax quote must fit the user's exact $1 authorization.
  if (result.total !== 1 || result.tax !== 0.10) throw new QuickBooksError('owner_test_total_mismatch', 409)
  return result
}
