import crypto from 'node:crypto'
import { accountingRequest, configuration, getConnection } from './quickbooks-api.js'
import { QuickBooksError, digest } from './quickbooks-core.js'
import { supabaseFetch } from './square-api.js'
import { normalizeCheckout, checkoutFingerprint } from './paypal-api.js'
import { loadServerPricing } from './checkout-pricing.js'

const id = value => /^\d{1,32}$/.test(String(value || ''))
const cents = value => typeof value === 'number' && Number.isFinite(value) ? Math.round(value * 100) : NaN
const money = value => Math.round(value * 100) / 100
export function invoicePayload(checkout, customerId, itemId, reference, taxCode) {
  if (!id(customerId) || !id(itemId) || !['TAX', 'NON'].includes(taxCode)) throw new QuickBooksError('invoice_mapping_required', 409)
  const lines = checkout.items.flatMap(item => {
    const detail = [item.category || item.name, item.option, item.size, item.material, item.shape].filter(Boolean).join(' · ')
    const line = (description, price) => ({ DetailType: 'SalesItemLineDetail', Description: description.slice(0, 4000), Amount: money(price * item.quantity),
      SalesItemLineDetail: { ItemRef: { value: itemId }, Qty: item.quantity, UnitPrice: price, TaxCodeRef: { value: taxCode } } })
    return [line(`${detail} · ${item.quantity} print batch${item.quantity === 1 ? '' : 'es'}`, item.price), ...item.addOns.map(addOn => line(`${detail} · ${addOn.name}`, addOn.price))]
  })
  if (checkout.discount > 0) lines.push({ DetailType: 'DiscountLineDetail', Amount: checkout.discount, Description: `Promo ${checkout.promoCode}`, DiscountLineDetail: { PercentBased: false } })
  if (!lines.length || lines.length > 100) throw new QuickBooksError('invoice_too_large', 400)
  const customer = checkout.customer
  const shop = { Line1: '23673 Connecticut St', City: 'Hayward', CountrySubDivisionCode: 'CA', PostalCode: '94545', Country: 'USA' }
  const orderDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  return { CustomerRef: { value: customerId }, Line: lines, CurrencyRef: { value: 'USD' }, ApplyTaxAfterDiscount: true,
    TxnDate: orderDate, DueDate: orderDate,
    BillEmail: { Address: customer.email }, BillEmailCc: { Address: '' }, BillEmailBcc: { Address: '' }, EmailStatus: 'NotSet',
    AllowOnlineCreditCardPayment: true, AllowOnlineACHPayment: false, AllowOnlinePayPalPayment: false, AllowOnlineAffirmPayment: false,
    PrivateNote: `TSS website reference ${reference}`, CustomerMemo: { value: `Order ${reference}. Payment is required before we start your order. We review your artwork and send a proof. Nothing prints until you approve it. ${customer.deliveryMethod === 'pickup' ? 'Local pickup: wait for your ready-for-pickup notice.' : 'Shipping to the address shown.'}` },
    ShipFromAddr: shop, ShipAddr: customer.deliveryMethod === 'pickup' ? shop : { Line1: customer.address, City: customer.city, CountrySubDivisionCode: customer.state, PostalCode: customer.zip, Country: 'USA' },
  }
}
export function safeInvoiceLink(value) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !(url.hostname === 'intuit.com' || url.hostname.endsWith('.intuit.com'))) return null
    return url.toString()
  } catch { return null }
}
// Accounting evidence, not a claim that a processor settled funds. Zero balance
// alone can mean a credit or write-off. Require matching linked payment records.
export function invoicePaymentState(invoice, payments, expected) {
  if (!invoice || String(invoice.Id) !== String(expected.invoice_id) || invoice.CustomerRef?.value !== expected.customer_id || invoice.CurrencyRef?.value !== 'USD' || cents(invoice.TotalAmt) !== cents(expected.checkout.total)) return { status: 'needs_review', reason: 'invoice_mismatch' }
  if (!Number.isFinite(cents(invoice.Balance)) || invoice.Balance < 0 || invoice.Balance > invoice.TotalAmt) return { status: 'needs_review', reason: 'invalid_balance' }
  const linkedIds = [...new Set((invoice.LinkedTxn || []).filter(link => link.TxnType === 'Payment').map(link => String(link.TxnId)))]
  let applied = 0
  for (const paymentId of linkedIds) {
    const payment = payments.find(p => String(p?.Id) === paymentId)
    if (!payment || payment.CustomerRef?.value !== expected.customer_id || payment.CurrencyRef?.value !== 'USD' || !(cents(payment.TotalAmt) > 0)) return { status: 'needs_review', reason: 'payment_mismatch' }
    for (const line of payment.Line || []) {
      const links = line.LinkedTxn || []
      if (links.some(link => link.TxnType === 'Invoice' && String(link.TxnId) === String(invoice.Id))) {
        // Never count a combined credit/payment allocation as cash received.
        if (links.length !== 1 || !(cents(line.Amount) > 0) || cents(line.Amount) > cents(payment.TotalAmt)) return { status: 'needs_review', reason: 'ambiguous_payment_allocation' }
        applied += cents(line.Amount)
      }
    }
  }
  if (applied > cents(invoice.TotalAmt)) return { status: 'needs_review', reason: 'overallocated_payment' }
  if (cents(invoice.Balance) === 0) return applied === cents(invoice.TotalAmt)
    ? { status: 'payment_recorded', paymentIds: linkedIds }
    : { status: 'needs_review', reason: 'balance_without_matching_payment' }
  return { status: applied > 0 ? 'partially_paid' : 'awaiting_payment', paymentIds: linkedIds }
}
const table = '/rest/v1/quickbooks_invoice_tests'
async function context() {
  const config = configuration()
  // This harness can never write to the real company, even with production keys.
  if (config.environment !== 'sandbox') throw new QuickBooksError('sandbox_only', 409)
  const connection = await getConnection()
  if (connection?.status !== 'connected' || !id(connection.realm_id)) throw new QuickBooksError('reconnect_required', 409)
  return { environment: config.environment, realmId: connection.realm_id }
}
const rowPath = row => `${table}?id=eq.${row.id}`
async function ensureTestRow(ctx) {
  const query = `${table}?environment=eq.${ctx.environment}&realm_id=eq.${ctx.realmId}&run_key=eq.itemized-v1`
  const existing = (await supabaseFetch(query))?.[0]
  if (existing) return existing
  const pricing = await loadServerPricing()
  const product = pricing.products.find(p => p.name === 'Business Cards')
  const variant = product?.items[0]
  const tier = variant?.quantities.find(q => q.qty === 250)
  const extra = product?.addOns.find(a => a.name === 'Soft-Touch')
  if (!tier || !extra || extra.type !== 'flat') throw new QuickBooksError('test_catalog_changed', 409)
  const checkout = await normalizeCheckout({ items: [{ id: 'quickbooks-sandbox-card', name: variant.size, category: product.name, size: variant.size, option: '250 pcs', quantity: 1, price: tier.price, addOns: [{ name: extra.name, price: extra.value }], artworkIntent: 'send_later' }],
    customerInfo: { firstName: 'TSS Sandbox', lastName: 'Checkout Test', email: 'tss-quickbooks-test@example.com', deliveryMethod: 'pickup' }, promoCode: 'WELCOME15',
  }, { loadPricing: async () => pricing, hasPaidOrder: async () => false })
  await supabaseFetch(`${table}?on_conflict=environment,realm_id,run_key`, { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ environment: ctx.environment, realm_id: ctx.realmId, run_key: 'itemized-v1', checkout, fingerprint: checkoutFingerprint(checkout) }) })
  const row = (await supabaseFetch(query))?.[0]
  if (!row) throw new QuickBooksError('invoice_storage_failed')
  return row
}
function safeSummary(row) {
  return { id: row.id, invoiceId: row.invoice_id, invoiceNumber: row.invoice_number, status: row.status, total: row.checkout.total,
    subtotal: row.checkout.subtotal, discount: row.checkout.discount, items: row.checkout.items.map(item => ({ name: item.category, option: item.option, size: item.size, quantity: item.quantity, price: item.price, addOns: item.addOns })),
    invoiceLink: safeInvoiceLink(row.invoice_link), lastChecked: row.last_checked_at, issue: row.last_error, environment: row.environment }
}
export async function listInvoiceTests() {
  const ctx = await context()
  return (await supabaseFetch(`${table}?environment=eq.sandbox&realm_id=eq.${ctx.realmId}&order=created_at.desc&limit=10`)).map(safeSummary)
}
export async function runInvoiceTest({ recordPayment = false } = {}) {
  const ctx = await context()
  let row = await ensureTestRow(ctx)
  const lockId = crypto.randomUUID()
  const locked = await supabaseFetch('/rest/v1/rpc/acquire_quickbooks_invoice_test_lock', { method: 'POST', body: JSON.stringify({ p_id: row.id, p_lock_id: lockId }) })
  if (!locked?.[0]) throw new QuickBooksError('invoice_busy', 409)
  row = locked[0]
  const save = async values => {
    // A stale invocation cannot modify a row after another invocation took over.
    const rows = await supabaseFetch(`${rowPath(row)}&lock_id=eq.${lockId}&lock_expires_at=gt.${encodeURIComponent(new Date().toISOString())}`, { method: 'PATCH', body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }) })
    if (!rows?.[0]) throw new QuickBooksError('invoice_busy', 409)
    row = rows[0]
  }
  const call = (path, options = {}) => accountingRequest(path, { ...ctx, ...options })
  try {
    if (!row.customer_id) {
      // Dedicated test contact, never an existing merchant/customer record.
      const name = 'TSS Website Sandbox QA'
      const found = await call('/query', { body: { query: `select * from Customer where DisplayName = '${name}'` } })
      const customer = found.QueryResponse?.Customer?.[0] || (await call('/customer', { method: 'POST', requestId: `tss-c-${digest(ctx.realmId).slice(0, 32)}`, body: { DisplayName: name, GivenName: 'TSS Sandbox', FamilyName: 'Checkout Test', PrimaryEmailAddr: { Address: 'tss-quickbooks-test@example.com' } } })).Customer
      if (!id(customer?.Id) || customer.PrimaryEmailAddr?.Address !== 'tss-quickbooks-test@example.com') throw new QuickBooksError('test_customer_mismatch', 409)
      await save({ customer_id: customer.Id })
    }
    if (!row.invoice_payload) {
      const found = await call('/query', { body: { query: "select * from Item where Type = 'Service' and Active = true maxresults 1" } })
      const itemId = found.QueryResponse?.Item?.[0]?.Id
      if (!id(itemId)) throw new QuickBooksError('invoice_mapping_required', 409)
      // NON is exclusively a sandbox fixture; this is not a production tax policy.
      await save({ invoice_payload: invoicePayload(row.checkout, row.customer_id, itemId, row.id, 'NON') })
    }
    if (!row.invoice_id) {
      // Store the exact payload first. Retries reuse both it and Intuit requestid.
      const result = await call('/invoice', { method: 'POST', requestId: `tss-i-${row.id}`, body: row.invoice_payload })
      if (!id(result.Invoice?.Id)) throw new QuickBooksError('invalid_invoice_response')
      await save({ invoice_id: result.Invoice.Id, invoice_number: result.Invoice.DocNumber || result.Invoice.Id })
    }
    const data = await call('/query', { body: { query: `select * from Invoice where Id = '${row.invoice_id}'` } })
    let invoice = data.QueryResponse?.Invoice?.[0]
    if (recordPayment) {
      const before = invoicePaymentState(invoice, [], row)
      if (before.reason === 'invoice_mismatch' || before.reason === 'invalid_balance') throw new QuickBooksError('payment_review_required', 409)
      if (cents(invoice.Balance) === cents(row.checkout.total)) {
        // A sandbox accounting entry only. ProcessPayment=false never charges a card.
        await call('/payment', { method: 'POST', requestId: `tss-p-${row.id}`, body: {
          CustomerRef: { value: row.customer_id }, CurrencyRef: { value: 'USD' }, TotalAmt: row.checkout.total, ProcessPayment: false,
          PrivateNote: `TSS SANDBOX ONLY simulated payment ${row.id}; no funds charged`,
          Line: [{ Amount: row.checkout.total, LinkedTxn: [{ TxnId: row.invoice_id, TxnType: 'Invoice' }] }],
        } })
        invoice = (await call('/invoice/' + row.invoice_id)).Invoice
      } else if (cents(invoice.Balance) !== 0) throw new QuickBooksError('payment_review_required', 409)
    }
    const paymentIds = [...new Set((invoice?.LinkedTxn || []).filter(txn => txn.TxnType === 'Payment').map(txn => String(txn.TxnId)))]
    if (paymentIds.length > 20 || paymentIds.some(value => !id(value))) throw new QuickBooksError('payment_review_required', 409)
    const payments = []
    for (const paymentId of paymentIds) payments.push((await call(`/payment/${paymentId}`)).Payment)
    const result = invoicePaymentState(invoice, payments, row)
    await save({ status: result.status, invoice_link: result.status === 'needs_review' ? null : safeInvoiceLink(invoice?.InvoiceLink), last_error: result.reason || null, last_checked_at: new Date().toISOString() })
    return safeSummary(row)
  } catch (error) {
    await save({ last_error: error instanceof QuickBooksError ? error.code : 'invoice_service_unavailable' }).catch(() => {})
    throw error
  } finally {
    await supabaseFetch(`${rowPath(row)}&lock_id=eq.${lockId}`, { method: 'PATCH', body: JSON.stringify({ lock_id: null, lock_expires_at: null }) }).catch(() => {})
  }
}
