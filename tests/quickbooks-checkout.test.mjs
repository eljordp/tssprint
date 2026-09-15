import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { mappedInvoice, invoiceAmounts, verifiedInvoicePayment } from '../server/quickbooks-checkout-core.js'
import { validSignature, changedCompanies } from '../server/quickbooks-webhook.js'
import { prepareCheckout, refreshCheckout, ownedCheckout } from '../server/quickbooks-checkout.js'
import { orderEmailPayload } from '../server/quickbooks-delivery.js'
const checkout = { customer: { firstName: 'QA', lastName: 'Test', email: 'qa@example.com', deliveryMethod: 'pickup' }, items: [{ id: 'card', category: 'Business Cards', name: 'Standard', option: '250 pcs', size: '3.5 × 2', price: 65, unitPrice: 90, quantity: 1, addOns: [{ name: 'Soft-Touch', price: 25 }], artworkIntent: 'send_later' }], subtotal: 90, discount: 13.5, total: 76.5, promoCode: 'WELCOME15' }
const catalog = [{ Id: '10', Name: 'Custom Card Stock', Type: 'NonInventory', Active: true, Taxable: true }]
const payload = () => mappedInvoice(checkout, catalog, '20', 'test-ref')
const invoice = () => ({ ...payload(), Id: '30', TotalAmt: 84.72, TxnTaxDetail: { TotalTax: 8.22 }, Balance: 84.72, InvoiceLink: 'https://connect.intuit.com/portal/invoice/example' })
const expected = () => ({ checkout, invoice_id: '30', customer_id: '20', invoice_payload: payload(), total: null, tax: null })
test('uses actual item taxability and preserves tax supplied by QuickBooks', () => {
  assert.equal(payload().Line[0].SalesItemLineDetail.TaxCodeRef.value, 'TAX')
  assert.equal(payload().TxnTaxDetail, undefined)
  assert.deepEqual(invoiceAmounts(invoice(), expected()), { tax: 8.22, total: 84.72 })
  assert.throws(() => mappedInvoice(checkout, [], '20', 'r'), { code: 'product_mapping_required' })
})
test('missing tax, changed prices, currency, customer or invoice are rejected', () => {
  for (const change of [i => delete i.TxnTaxDetail, i => i.TotalAmt = 76.5, i => i.CurrencyRef.value = 'CAD', i => i.CustomerRef.value = '99', i => i.Line[0].SalesItemLineDetail.Qty = 2]) {
    const i = structuredClone(invoice()); change(i); assert.throws(() => invoiceAmounts(i, expected()))
  }
})
test('zero balance without a matching payment is never paid; matching payment includes tax', () => {
  const i = { ...invoice(), Balance: 0, LinkedTxn: [{ TxnType: 'Payment', TxnId: '40' }] }
  assert.equal(verifiedInvoicePayment(i, [], expected()).status, 'needs_review')
  const payment = { Id: '40', CustomerRef: { value: '20' }, CurrencyRef: { value: 'USD' }, TotalAmt: 84.72, Line: [{ Amount: 84.72, LinkedTxn: [{ TxnType: 'Invoice', TxnId: '30' }] }] }
  assert.equal(verifiedInvoicePayment(i, [payment], expected()).status, 'payment_recorded')
  assert.throws(() => verifiedInvoicePayment(i, [payment], { ...expected(), total: 83, tax: 6.5 }), { code: 'invoice_total_changed' })
})
test('signature rejects altered bodies, missing secrets and malformed signatures', () => {
  const raw = Buffer.from('[{"type":"qbo.invoice.updated.v1"}]')
  const signature = crypto.createHmac('sha256', 'secret').update(raw).digest('base64')
  assert.equal(validSignature(raw, signature, 'secret'), true)
  assert.equal(validSignature(Buffer.from('[]'), signature, 'secret'), false)
  assert.equal(validSignature(raw, signature, ''), false)
  assert.equal(validSignature(raw, 'invalid', 'secret'), false)
})
test('CloudEvents and legacy notifications select only invoice/payment companies', () => {
  assert.deepEqual(changedCompanies([{ specversion: '1.0', type: 'qbo.invoice.updated.v1', intuitaccountid: '123' }, { specversion: '1.0', type: 'qbo.customer.updated.v1', intuitaccountid: '456' }]), ['123'])
  assert.deepEqual(changedCompanies({ eventNotifications: [{ realmId: '123', dataChangeEvent: { entities: [{ name: 'Payment' }] } }] }), ['123'])
})
test('customer/staff notices use saved totals, escape content and exclude storage paths', () => {
  const row = { checkout: structuredClone(checkout), order_id: 'QB-1', invoice_number: '100', tax: 8.22, total: 84.72 }
  row.checkout.customer.firstName = '<script>'
  row.checkout.items[0].artwork = { path: 'private-secret-path' }
  const mail = orderEmailPayload(row, 'customer_email', { FROM_EMAIL: 'shop@example.com' })
  assert.match(mail.html, /&lt;script&gt;/); assert.match(mail.html, /Tax: \$8.22/); assert.doesNotMatch(mail.html, /private-secret-path|Now Printing/)
})
function fixture() {
  let row, remote, lost = true, finalized = 0
  const writes = new Map()
  const ctx = { environment: 'production', realmId: '123' }
  const db = async (path, options = {}) => {
    const body = options.body && JSON.parse(options.body)
    if (path.includes('allow_quickbooks_checkout')) return true
    if (path.includes('acquire_quickbooks_checkout_lock')) {
      if (row.lock_id) return []
      Object.assign(row, { lock_id: body.p_lock_id, lock_expires_at: new Date(Date.now()+180000).toISOString() }); return [structuredClone(row)]
    }
    if (path.includes('finalize_quickbooks_checkout')) { finalized++; row.order_id = `QB-${row.id}`; row.status='payment_recorded'; return row.order_id }
    if (options.method === 'POST') row ||= { status: 'creating', total: null, tax: null, ...body, created_at: new Date().toISOString() }
    if (!row) return []
    const url = new URL(path, 'https://db.invalid')
    if (url.searchParams.get('token_hash') && url.searchParams.get('token_hash') !== `eq.${row.token_hash}`) return []
    if (url.searchParams.get('lock_id') && url.searchParams.get('lock_id') !== `eq.${row.lock_id}`) return []
    if (options.method === 'PATCH') Object.assign(row, body)
    return [structuredClone(row)]
  }
  const call = async (path, opts) => {
    assert.equal(opts.realmId, '123'); assert.equal(opts.environment, 'production')
    if (path === '/preferences') return { Preferences: { CurrencyPrefs: { HomeCurrency: { value: 'USD' } }, TaxPrefs: { UsingSalesTax: true, PartnerTaxEnabled: true } } }
    if (path === '/query' && opts.body.query.includes('from Item')) return { QueryResponse: { Item: catalog } }
    if (path === '/query') return { QueryResponse: { Invoice: [remote] } }
    if (path === '/customer') { writes.set(opts.requestId, opts.body); return { Customer: { Id: '20' } } }
    if (path === '/invoice') {
      writes.set(opts.requestId, opts.body)
      remote ||= { ...opts.body, Id: '30', TotalAmt: 84.72, TxnTaxDetail: { TotalTax: 8.22 }, Balance: 84.72, InvoiceLink: 'https://connect.intuit.com/portal/invoice/example' }
      if (lost) { lost = false; throw new Error('Lost response after provider accepted invoice') }
      return { Invoice: remote }
    }
    if (path === '/payment/40') return { Payment: { Id: '40', CustomerRef: { value: '20' }, CurrencyRef: { value: 'USD' }, TotalAmt: 84.72, Line: [{ Amount: 84.72, LinkedTxn: [{ TxnType: 'Invoice', TxnId: '30' }] }] } }
    throw new Error(path)
  }
  return { db, call, context: async () => ctx, normalize: async () => structuredClone(checkout), writes, get row() { return row }, get remote() { return remote }, get finalized() { return finalized } }
}
test('lost invoice response retries same request; private status and atomic finalization stay idempotent', async () => {
  const f = fixture(), body = { id: crypto.randomUUID(), token: crypto.randomBytes(32).toString('base64url'), checkout: { cart: 'fixture' } }
  await assert.rejects(prepareCheckout(body, 'rate', f))
  const retried = await prepareCheckout(body, 'rate', f)
  assert.equal(retried.status, 'awaiting_payment'); assert.equal(retried.total, 84.72); assert.equal(f.writes.size, 2)
  await assert.rejects(ownedCheckout({ ...body, token: 'a'.repeat(43) }, f.db), { code: 'checkout_not_found' })
  await assert.rejects(prepareCheckout({ ...body, checkout: { changed: true } }, 'rate', f), { code: 'checkout_changed' })
  f.remote.Balance=0; f.remote.LinkedTxn=[{ TxnType: 'Payment', TxnId: '40' }]
  const paid = await refreshCheckout(f.row, f)
  assert.equal(paid.status, 'payment_recorded'); assert.ok(paid.orderId); assert.equal(f.finalized, 1)
  await refreshCheckout(f.row, f); assert.equal(f.finalized, 1)
})

test('expired ambiguous creation never creates another customer or invoice', async () => {
  const f = fixture(), body = { id: crypto.randomUUID(), token: crypto.randomBytes(32).toString('base64url'), checkout: { cart: 'fixture' } }
  await assert.rejects(prepareCheckout(body, 'rate', f))
  f.row.created_at = new Date(Date.now() - 24 * 3600000).toISOString()
  f.row.customer_id = null
  f.row.invoice_payload = null
  let calls = 0
  await assert.rejects(prepareCheckout(body, 'rate', { ...f, call: async () => { calls++; throw new Error('Must not call provider') } }), { code: 'creation_review_required' })
  assert.equal(calls, 0)
})
test('changed paid invoices are flagged and a corrected invoice restores payment status without a duplicate order', async () => {
  const f = fixture(), body = { id: crypto.randomUUID(), token: crypto.randomBytes(32).toString('base64url'), checkout: { cart: 'fixture' } }
  await assert.rejects(prepareCheckout(body, 'rate', f)); await prepareCheckout(body, 'rate', f)
  f.remote.Balance = 0; f.remote.LinkedTxn = [{ TxnType: 'Payment', TxnId: '40' }]
  await refreshCheckout(f.row, f)
  f.remote.Balance = 84.72; f.remote.LinkedTxn = []
  assert.equal((await refreshCheckout(f.row, { ...f, force: true })).status, 'needs_review')
  f.remote.Balance = 0; f.remote.LinkedTxn = [{ TxnType: 'Payment', TxnId: '40' }]
  assert.equal((await refreshCheckout(f.row, { ...f, force: true })).status, 'payment_recorded')
  assert.equal(f.finalized, 1)
})
