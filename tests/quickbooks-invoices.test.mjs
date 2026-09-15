import test from 'node:test'
import assert from 'node:assert/strict'
import { invoicePayload, invoicePaymentState, safeInvoiceLink, runInvoiceTest } from '../server/quickbooks-invoices.js'
const checkout = { items: [{ category: 'Business Cards', name: 'Standard', option: '250 pcs', size: '3.5 × 2 in', quantity: 2, price: 65, addOns: [{ name: 'Soft-Touch', price: 25 }] }], subtotal: 180, discount: 27, total: 153, promoCode: 'WELCOME15', customer: { email: 'qa@example.com', deliveryMethod: 'pickup' } }
const expected = { invoice_id: '100', customer_id: '200', checkout }
const invoice = () => ({ Id: '100', CustomerRef: { value: '200' }, CurrencyRef: { value: 'USD' }, TotalAmt: 153, Balance: 153, LinkedTxn: [] })
const payment = amount => ({ Id: '300', CustomerRef: { value: '200' }, CurrencyRef: { value: 'USD' }, TotalAmt: amount, Line: [{ Amount: amount, LinkedTxn: [{ TxnId: '100', TxnType: 'Invoice' }] }] })
test('invoice itemizes batch counts, finishing and approved discounts exactly', () => {
  const data = invoicePayload(checkout, '200', '10', 'test-reference', 'NON')
  assert.equal(data.Line[0].Amount, 130)
  assert.equal(data.Line[1].Amount, 50)
  assert.equal(data.Line[2].Amount, 27)
  assert.equal(data.Line[0].SalesItemLineDetail.Qty, 2)
  assert.match(data.Line[0].Description, /250 pcs.*2 print batches/)
  assert.match(data.Line[1].Description, /Soft-Touch/)
  assert.equal(data.AllowOnlineCreditCardPayment, true)
  assert.equal(data.AllowOnlineACHPayment, false)
  assert.equal(data.EmailStatus, 'NotSet')
  assert.equal(data.BillEmailCc.Address, '')
  assert.match(data.CustomerMemo.value, /Nothing prints until/)
  assert.throws(() => invoicePayload(checkout, '200', undefined, 'test', 'NON'), /mapping/)
})
test('unpaid, partial and fully allocated payments are distinct', () => {
  let inv = invoice()
  assert.equal(invoicePaymentState(inv, [], expected).status, 'awaiting_payment')
  inv.LinkedTxn = [{ TxnId: '300', TxnType: 'Payment' }]; inv.Balance = 100
  assert.equal(invoicePaymentState(inv, [payment(53)], expected).status, 'partially_paid')
  inv.Balance = 0
  assert.equal(invoicePaymentState(inv, [payment(153)], expected).status, 'payment_recorded')
  // Repeated notifications never inflate a linked payment.
  inv.LinkedTxn.push({ TxnId: '300', TxnType: 'Payment' })
  assert.equal(invoicePaymentState(inv, [payment(153)], expected).status, 'payment_recorded')
})
test('voids, credits, mismatches and missing payment evidence do not mean paid', () => {
  for (const change of [{ Balance: 0 }, { TotalAmt: 0, Balance: 0 }, { CurrencyRef: { value: 'CAD' } }, { CustomerRef: { value: '999' } }, { Id: '101' }, { Balance: null }, { Balance: -1 }]) {
    assert.equal(invoicePaymentState({ ...invoice(), ...change }, [], expected).status, 'needs_review')
  }
  const inv = { ...invoice(), Balance: 0, LinkedTxn: [{ TxnId: '300', TxnType: 'Payment' }] }
  for (const p of [undefined, { ...payment(153), CurrencyRef: { value: 'CAD' } }, payment(152.99), payment(154)]) assert.equal(invoicePaymentState(inv, [p], expected).status, 'needs_review')
  const credit = payment(153); credit.Line[0].LinkedTxn.push({ TxnId: '900', TxnType: 'CreditMemo' })
  assert.equal(invoicePaymentState(inv, [credit], expected).status, 'needs_review')
})
test('only https Intuit invoice links are accepted', () => {
  assert.equal(safeInvoiceLink('https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-test'), 'https://connect.intuit.com/portal/app/CommerceNetwork/view/scs-v1-test')
  for (const url of ['javascript:alert(1)', 'https://intuit.com.evil.test/', 'https://evilintuit.com/', 'https://user:secret@intuit.com/', 'http://intuit.com', 'https://intuit.com:8443/', undefined]) assert.equal(safeInvoiceLink(url), null)
})
test('sandbox harness cannot create production accounting records', async () => {
  const old = process.env.QUICKBOOKS_ENVIRONMENT
  process.env.QUICKBOOKS_ENVIRONMENT = 'production'
  try { await assert.rejects(runInvoiceTest(), /sandbox_only/) }
  finally { if (old === undefined) delete process.env.QUICKBOOKS_ENVIRONMENT; else process.env.QUICKBOOKS_ENVIRONMENT = old }
})
