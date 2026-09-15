import test from 'node:test'
import assert from 'node:assert/strict'
import { walletOrderPayload, verifiedWalletOrder } from '../server/paypal-wallet-core.js'

const merchant = 'ABCDEFG123456', orderId = 'ABC12345678901234'
const row = () => ({ id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', payment_mode: 'direct', invoice_id: '3279', total: 104.25, tax: 9.25,
  checkout: { subtotal: 100, discount: 5, total: 95, description: 'Print order', customer: { firstName: 'Test', lastName: 'Buyer', deliveryMethod: 'pickup' },
    items: [{ category: 'Stickers', name: 'Die cut stickers', option: '100 pieces', size: '2 × 2', material: 'Matte', shape: 'Die cut', price: 100, quantity: 1, addOns: [] }] } })
const completed = r => ({ ...walletOrderPayload(r, merchant), id: orderId, status: 'COMPLETED', payment_source: { apple_pay: {} }, purchase_units: walletOrderPayload(r, merchant).purchase_units.map(unit => ({ ...unit, payments: { captures: [{ id: 'CAP12345678901234', status: 'COMPLETED', final_capture: true, amount: { currency_code: 'USD', value: '104.25' } }] } })) })

test('Apple Pay amount includes exact QuickBooks tax and discount, with itemized print batch', () => {
  const r = row(), p = walletOrderPayload(r, merchant).purchase_units[0]
  assert.equal(p.amount.value, '104.25')
  assert.equal(p.amount.breakdown.tax_total.value, '9.25')
  assert.equal(p.amount.breakdown.discount.value, '5.00')
  assert.equal(p.items[0].description, '100 pieces · 2 × 2 · Matte · Die cut')
  assert.equal(verifiedWalletOrder(completed(r), r, merchant, orderId).paid, true)
})
test('rejects missing tax, malformed totals and hosted invoice payment mode', () => {
  for (const patch of [{tax:null}, {total:95}, {tax:9.251}, {payment_mode:'invoice'}]) assert.throws(() => walletOrderPayload({...row(),...patch},merchant))
})
test('never accepts a paid result from another merchant, order, invoice or currency', () => {
  const changes = [o=>o.id='OTHER123456789012', o=>o.purchase_units[0].payee.merchant_id='OTHER12345678', o=>o.purchase_units[0].invoice_id='other',
    o=>o.purchase_units[0].payments.captures[0].amount.value='95.00', o=>o.purchase_units[0].amount.currency_code='EUR', o=>o.purchase_units[0].custom_id='other']
  for (const change of changes) { const r=row(), o=completed(r); change(o); assert.throws(()=>verifiedWalletOrder(o,r,merchant,orderId)) }
})
test('rejects changed itemization even when the aggregate total is unchanged', () => {
  for (const change of [u=>u.items[0].quantity='2',u=>u.amount.breakdown.tax_total.value='0.00',u=>u.items[0].sku='other']) {
    const r=row(),o=completed(r); change(o.purchase_units[0]); assert.throws(()=>verifiedWalletOrder(o,r,merchant,orderId))
  }
})
test('approval and pending capture are not payment; duplicate captures require review', () => {
  const r=row(), approved={...walletOrderPayload(r,merchant),id:orderId,status:'APPROVED'}
  assert.equal(verifiedWalletOrder(approved,r,merchant,orderId).paid,false)
  const pending=completed(r); pending.purchase_units[0].payments.captures[0].status='PENDING'
  assert.equal(verifiedWalletOrder(pending,r,merchant,orderId).paid,false)
  const duplicate=completed(r); duplicate.purchase_units[0].payments.captures.push({...duplicate.purchase_units[0].payments.captures[0]})
  assert.throws(()=>verifiedWalletOrder(duplicate,r,merchant,orderId))
  const refunded=completed(r);refunded.purchase_units[0].payments.captures[0].status='REFUNDED'
  assert.equal(verifiedWalletOrder(refunded,r,merchant,orderId).paid,false)
})
test('rejects changed delivery address and a non-Apple-Pay capture', () => {
  const r=row(); Object.assign(r.checkout.customer,{deliveryMethod:'shipping',address:'1 Example St',city:'Hayward',state:'CA',zip:'94545'})
  const moved=completed(r); moved.purchase_units[0].shipping.address.postal_code='10001'
  assert.throws(()=>verifiedWalletOrder(moved,r,merchant,orderId))
  const otherMethod=completed(r);delete otherMethod.payment_source.apple_pay
  assert.throws(()=>verifiedWalletOrder(otherMethod,r,merchant,orderId))
})
