import crypto from 'node:crypto'
import { accountingRequest, configuration, getConnection } from './quickbooks-api.js'
import { QuickBooksError, digest, validNonce } from './quickbooks-core.js'
import { normalizeCheckout } from './paypal-api.js'
import { supabaseFetch } from './square-api.js'
import { safeInvoiceLink } from './quickbooks-invoices.js'
import { mappedInvoice, verifiedInvoicePayment } from './quickbooks-checkout-core.js'

const table = '/rest/v1/quickbooks_checkouts'
const uuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '')
const numericId = value => /^\d{1,32}$/.test(String(value || ''))
export const checkoutEnabled = () => process.env.QUICKBOOKS_CHECKOUT_ENABLED === 'true' && configuration().environment === 'production'
export async function checkoutContext() {
  const connection = await getConnection()
  if (connection?.status !== 'connected' || !numericId(connection.realm_id)) throw new QuickBooksError('reconnect_required', 409)
  return { environment: configuration().environment, realmId: connection.realm_id }
}
export function publicCheckout(row) {
  return {
    id: row.id, status: row.status, invoiceNumber: row.invoice_number, orderId: row.order_id,
    subtotal: row.checkout.subtotal, discount: row.checkout.discount, tax: row.tax, total: row.total,
    // This response is protected by an unguessable token in the POST body.
    items: row.checkout.items, email: row.checkout.customer.email,
    deliveryMethod: row.checkout.customer.deliveryMethod, customerName: row.checkout.customer.firstName,
    invoiceLink: row.status === 'awaiting_payment' || row.status === 'partially_paid' ? safeInvoiceLink(row.invoice_link) : null,
    lastChecked: row.last_checked_at, issue: row.last_error,
  }
}
export async function ownedCheckout(body, db = supabaseFetch) {
  if (!uuid(body?.id) || !validNonce(body?.token)) throw new QuickBooksError('checkout_not_found', 404)
  const [row] = await db(`${table}?id=eq.${body.id}&token_hash=eq.${digest(body.token)}`)
  if (!row) throw new QuickBooksError('checkout_not_found', 404)
  return row
}
export async function prepareCheckout(body, rateKey, { db = supabaseFetch, normalize = normalizeCheckout, context = checkoutContext, call = accountingRequest } = {}) {
  if (!uuid(body?.id) || !validNonce(body?.token) || !body.checkout) throw new QuickBooksError('invalid_checkout', 400)
  const requestHash = digest(JSON.stringify(body.checkout))
  let [row] = await db(`${table}?id=eq.${body.id}`)
  if (row) {
    if (row.token_hash !== digest(body.token)) throw new QuickBooksError('checkout_not_found', 404)
    if (row.request_hash !== requestHash) throw new QuickBooksError('checkout_changed', 409)
  } else {
    if (!await db('/rest/v1/rpc/allow_quickbooks_checkout', { method: 'POST', body: JSON.stringify({ p_key: rateKey }) })) throw new QuickBooksError('rate_limited', 429)
    const checkout = await normalize(body.checkout)
    checkout.ga4 = /^\d{1,20}\.\d{1,20}$/.test(body.ga4?.clientId || '') ? { clientId: body.ga4.clientId, sessionId: /^\d{1,20}$/.test(body.ga4?.sessionId || '') ? body.ga4.sessionId : null } : null
    const ctx = await context()
    await db(`${table}?on_conflict=id`, { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' }, body: JSON.stringify({ id: body.id, token_hash: digest(body.token), request_hash: requestHash, environment: ctx.environment, realm_id: ctx.realmId, checkout, cart_session: body.checkout.cartSession || null }) })
    row = await ownedCheckout(body, db)
    if (row.request_hash !== requestHash) throw new QuickBooksError('checkout_changed', 409)
  }
  return withCheckoutLock(row, async (record, save, ctx) => {
    if (!record.invoice_id && Date.now() - Date.parse(record.created_at) > 23 * 3600000) throw new QuickBooksError('creation_review_required', 409)
    if (!record.invoice_payload) {
      const [settings, products] = await Promise.all([
        call('/preferences', ctx), call('/query', { ...ctx, body: { query: 'select * from Item where Active = true maxresults 100' } }),
      ])
      const prefs = settings.Preferences
      if (prefs?.CurrencyPrefs?.HomeCurrency?.value !== 'USD' || prefs?.TaxPrefs?.UsingSalesTax !== true || prefs?.TaxPrefs?.PartnerTaxEnabled !== true) throw new QuickBooksError('tax_configuration_required', 409)
      // Check every mapping before creating a contact or an invoice.
      mappedInvoice(record.checkout, products.QueryResponse?.Item || [], '1', record.id)
      if (!record.customer_payload) {
        const c = record.checkout.customer
        await save({ customer_payload: { DisplayName: `${c.firstName} ${c.lastName} · Web ${record.id.slice(0, 8)}`, GivenName: c.firstName, FamilyName: c.lastName, PrimaryEmailAddr: { Address: c.email }, ...(c.phone ? { PrimaryPhone: { FreeFormNumber: c.phone } } : {}) } })
      }
      if (!record.customer_id) {
        const result = await call('/customer', { ...ctx, method: 'POST', requestId: `tss-c-${record.id}`, body: record.customer_payload })
        if (!numericId(result.Customer?.Id)) throw new QuickBooksError('invalid_customer_response')
        await save({ customer_id: result.Customer.Id })
      }
      await save({ invoice_payload: mappedInvoice(record.checkout, products.QueryResponse?.Item || [], record.customer_id, record.id) })
    }
    if (!record.invoice_id) {
      // Do not reissue an ambiguous creation after the provider deduplication
      // window; staff must locate the original reference first.
      if (Date.now() - Date.parse(record.created_at) > 23 * 3600000) throw new QuickBooksError('creation_review_required', 409)
      const data = await call('/invoice', { ...ctx, method: 'POST', requestId: `tss-i-${record.id}`, body: record.invoice_payload })
      if (!numericId(data.Invoice?.Id)) throw new QuickBooksError('invalid_invoice_response')
      await save({ invoice_id: data.Invoice.Id, invoice_number: data.Invoice.DocNumber || data.Invoice.Id })
    }
    await inspectInvoice(record, save, ctx, { db, call })
    return publicCheckout(record)
  }, { db, context })
}
async function withCheckoutLock(row, run, { db = supabaseFetch, context = checkoutContext } = {}) {
  const ctx = await context()
  if (ctx.realmId !== row.realm_id || ctx.environment !== row.environment) throw new QuickBooksError('connection_changed', 409)
  const lockId = crypto.randomUUID()
  const [record] = await db('/rest/v1/rpc/acquire_quickbooks_checkout_lock', { method: 'POST', body: JSON.stringify({ p_id: row.id, p_lock_id: lockId }) })
  if (!record) throw new QuickBooksError('checkout_busy', 409)
  const save = async values => {
    const [saved] = await db(`${table}?id=eq.${row.id}&lock_id=eq.${lockId}&lock_expires_at=gt.${encodeURIComponent(new Date().toISOString())}`, { method: 'PATCH', body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }) })
    if (!saved) throw new QuickBooksError('checkout_busy', 409)
    Object.assign(record, saved)
  }
  try { return await run(record, save, ctx) }
  catch (error) {
    const code = error instanceof QuickBooksError ? error.code : 'checkout_service_unavailable'
    if (record.order_id && /mismatch|changed/.test(code)) await db(`/rest/v1/orders?id=eq.${encodeURIComponent(record.order_id)}&payment_provider=eq.quickbooks`, { method: 'PATCH', body: JSON.stringify({ payment_status: 'unverified' }) }).catch(() => {})
    await save({ last_error: code, ...(code.includes('mismatch') || code.includes('changed') || code === 'creation_review_required' ? { status: 'needs_review', invoice_link: null } : {}), next_check_at: new Date(Date.now() + 15 * 60000).toISOString() }).catch(() => {})
    throw error
  } finally { await db(`${table}?id=eq.${row.id}&lock_id=eq.${lockId}`, { method: 'PATCH', body: JSON.stringify({ lock_id: null, lock_expires_at: null }) }).catch(() => {}) }
}
async function inspectInvoice(row, save, ctx, { db, call }) {
  const data = await call('/query', { ...ctx, body: { query: `select * from Invoice where Id = '${row.invoice_id}'` } })
  const invoice = data.QueryResponse?.Invoice?.[0]
  const ids = [...new Set((invoice?.LinkedTxn || []).filter(link => link.TxnType === 'Payment').map(link => String(link.TxnId)))]
  if (ids.length > 20 || ids.some(id => !numericId(id))) throw new QuickBooksError('payment_review_required', 409)
  const payments = []
  for (const id of ids) payments.push((await call(`/payment/${id}`, ctx)).Payment)
  const state = verifiedInvoicePayment(invoice, payments, row)
  if (row.order_id && state.status !== 'payment_recorded') {
    await db(`/rest/v1/orders?id=eq.${encodeURIComponent(row.order_id)}&payment_provider=eq.quickbooks`, { method: 'PATCH', body: JSON.stringify({ payment_status: 'unverified' }) })
    state.status = 'needs_review'; state.reason = 'recorded_payment_changed'
  }
  // An existing paid order stays visible; later changes are flagged for staff.
  const link = safeInvoiceLink(invoice?.InvoiceLink)
  await save({ status: state.status === 'payment_recorded' && !row.order_id ? 'awaiting_payment' : state.status, tax: state.tax, total: state.total, invoice_link: state.status === 'needs_review' ? null : link, last_error: state.reason || (!link && state.status === 'awaiting_payment' ? 'invoice_link_unavailable' : null), last_checked_at: new Date().toISOString(), next_check_at: new Date(Date.now() + 15 * 60000).toISOString() })
  if (state.status === 'payment_recorded' && !row.order_id) {
    const orderId = await db('/rest/v1/rpc/finalize_quickbooks_checkout', { method: 'POST', body: JSON.stringify({ p_id: row.id, p_lock_id: row.lock_id, p_payments: state.paymentIds }) })
    Object.assign(row, { order_id: orderId, payment_ids: state.paymentIds, status: 'payment_recorded' })
  } else if (state.status === 'payment_recorded' && row.order_id) {
    await db(`/rest/v1/orders?id=eq.${encodeURIComponent(row.order_id)}&payment_provider=eq.quickbooks`, { method: 'PATCH', body: JSON.stringify({ payment_status: 'payment_recorded', payment_verified_at: new Date().toISOString() }) })
    await save({ payment_ids: state.paymentIds })
  }
}
export async function refreshCheckout(row, { db = supabaseFetch, call = accountingRequest, context = checkoutContext, force = false } = {}) {
  if (!row.invoice_id) return publicCheckout(row)
  // Persisted paid state can be read without depending on a fresh provider call.
  if (row.status === 'payment_recorded' && row.order_id && !force) return publicCheckout(row)
  return withCheckoutLock(row, async (record, save, ctx) => { await inspectInvoice(record, save, ctx, { db, call }); return publicCheckout(record) }, { db, context })
}
export async function reconcileCheckouts({ realmId, invoiceIds, deadline = Date.now() + 35000, limit = 10 } = {}) {
  const ctx = await checkoutContext()
  if (realmId && realmId !== ctx.realmId) return 0
  if (invoiceIds && (!invoiceIds.length || invoiceIds.some(id => !numericId(id)))) return 0
  const filter = invoiceIds ? `&invoice_id=in.(${invoiceIds.join(',')})` : `&next_check_at=lte.${encodeURIComponent(new Date().toISOString())}&status=neq.payment_recorded`
  const rows = await supabaseFetch(`${table}?environment=eq.${ctx.environment}&realm_id=eq.${ctx.realmId}&invoice_id=not.is.null${filter}&order=next_check_at.asc&limit=${Math.max(1, Math.min(10, limit))}`)
  let checked = 0
  for (const row of rows) {
    if (Date.now() >= deadline) break
    try { await refreshCheckout(row, { force: true, call: (path, options) => accountingRequest(path, { ...options, deadline }) }); checked++ } catch { /* Saved issue remains visible to staff. */ }
  }
  return checked
}
export async function listCheckouts() {
  const ctx = await checkoutContext()
  const rows = await supabaseFetch(`${table}?environment=eq.${ctx.environment}&realm_id=eq.${ctx.realmId}&order=created_at.desc&limit=50`)
  const jobs = await supabaseFetch('/rest/v1/quickbooks_delivery_jobs?status=in.(pending,retry,processing,needs_review)&select=checkout_id,kind,status,last_error&limit=100')
  return rows.map(row => ({ ...publicCheckout(row), createdAt: row.created_at, jobs: jobs.filter(job => job.checkout_id === row.id) }))
}
