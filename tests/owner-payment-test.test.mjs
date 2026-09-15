import test from 'node:test'
import assert from 'node:assert/strict'
import { ownerTestCheckout, prepareOwnerPaymentTest } from '../server/owner-payment-test.js'
import { orderEmailPayload, purchaseAnalyticsPayload } from '../server/quickbooks-delivery.js'

const user = { id: 'verified-owner-id', email: 'owner@example.com' }
test('owner test ignores browser prices, recipient, products and discounts', async () => {
  let saved
  const result = await prepareOwnerPaymentTest({ id: 'test', token: 'nonce', checkout: { total: 0.01, email: 'other@example.com' }, ga4: { clientId: '123.456', debugMode: false } }, user, {
    prepare: async (body, rateKey, options) => {
      saved = await options.normalize(body.checkout)
      assert.deepEqual(body.checkout, { ownerPaymentTest: user.id, paymentMode: 'wallet' })
      assert.equal(body.ga4.debugMode, true)
      assert.equal(options.paymentMode, 'wallet')
      return { total: 1, tax: 0.10 }
    },
  })
  assert.equal(result.total, 1); assert.equal(saved.total, 0.90); assert.equal(saved.discount, 0)
  assert.equal(saved.customer.email, user.email); assert.equal(saved.items.length, 1)
  assert.match(saved.items[0].name, /no production/)
})
test('owner test rejects absent identity and any tax quote above or below one dollar', async () => {
  assert.throws(() => ownerTestCheckout(null), /admin_access_required/)
  for (const quote of [{total:1.01,tax:0.11},{total:0.90,tax:0},{total:1,tax:0}]) {
    await assert.rejects(prepareOwnerPaymentTest({},user,{prepare:async()=>quote}),/owner_test_total_mismatch/)
  }
})
test('test receipts explicitly prohibit fulfillment and purchases are labelled internal', () => {
  const checkout = {...ownerTestCheckout(user),ga4:{clientId:'123.456',debugMode:true}}
  const row = {checkout,payment_mode:'wallet',order_id:'TESTORDER12345',total:1,tax:0.10}
  const email = orderEmailPayload(row,'staff_email',{FROM_EMAIL:'shop@example.com'})
  assert.match(email.subject,/no production/);assert.match(email.html,/Do not print, ship or fulfill/)
  const event = purchaseAnalyticsPayload(row,new Date().toISOString()).events[0].params
  assert.equal(event.test_mode,true);assert.equal(event.traffic_type,'internal');assert.equal(event.value,0.90);assert.equal(event.tax,0.10)
  assert.doesNotMatch(JSON.stringify(event),/owner@example.com/)
})
