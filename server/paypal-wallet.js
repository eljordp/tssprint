import { supabaseFetch } from './square-api.js'
import { paypalFetch, missingPayPalEnv } from './paypal-api.js'
import { QuickBooksError } from './quickbooks-core.js'
import { accountingRequest } from './quickbooks-api.js'
import { invoiceAmounts } from './quickbooks-checkout-core.js'
import { ownedCheckout, publicCheckout, withCheckoutLock } from './quickbooks-checkout.js'
import { walletOrderPayload, verifiedWalletOrder } from './paypal-wallet-core.js'

export function walletConfiguration() {
  const merchantId = (process.env.PAYPAL_MERCHANT_ID || '').trim()
  const clientId = (process.env.PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID || '').trim()
  const enabled = !['sandbox'].includes((process.env.PAYPAL_ENV || process.env.PAYPAL_MODE || 'live').toLowerCase()) && process.env.PAYPAL_APPLE_PAY_ENABLED === 'true' && missingPayPalEnv().length === 0
  return { enabled, merchantId, clientId: enabled ? clientId : null }
}
const pay = (path, options = {}) => paypalFetch(path, { ...options, signal: AbortSignal.timeout(12000) })
const depsFor = deps => ({ ...deps, db: deps?.db || supabaseFetch, pay: deps?.pay || pay, call: deps?.call || accountingRequest, merchantId: deps?.merchantId || walletConfiguration().merchantId })
const assertWallet = row => {
  if (row.payment_mode !== 'wallet' || row.invoice_id || row.direct_payment) throw new QuickBooksError('wallet_method_mismatch', 409)
  if (row.checkout?.ownerTest && (row.total !== 1 || row.tax !== 0.10)) throw new QuickBooksError('owner_test_total_mismatch', 409)
}
async function checkQuote(row, ctx, call) {
  if (Date.now() - Date.parse(row.created_at) > 23 * 3600000) throw new QuickBooksError('wallet_quote_expired', 409)
  const data = await call(`/estimate/${row.estimate_id}`, ctx)
  const amounts = invoiceAmounts(data.Estimate, { ...row, invoice_id: row.estimate_id })
  if (amounts.total !== row.total || amounts.tax !== row.tax || (data.Estimate.LinkedTxn || []).length) throw new QuickBooksError('wallet_quote_changed', 409)
  for (const key of ['ShipAddr', 'ShipFromAddr']) for (const field of ['Line1','City','CountrySubDivisionCode','PostalCode']) {
    if (data.Estimate[key]?.[field] !== row.invoice_payload[key]?.[field]) throw new QuickBooksError('wallet_quote_changed', 409)
  }
}
async function inspect(row, save, deps) {
  const wallet = row.wallet_payment
  if (!wallet?.orderId) return publicCheckout(row)
  if (deps.merchantId && wallet.merchantId !== deps.merchantId) throw new QuickBooksError('wallet_merchant_changed', 409)
  const remote = await deps.pay(`/v2/checkout/orders/${wallet.orderId}`)
  const result = verifiedWalletOrder(remote, row, wallet.merchantId, wallet.orderId)
  await save({ wallet_payment: { ...wallet, ...result }, last_checked_at: new Date().toISOString(), next_check_at: new Date(Date.now() + (result.paid ? 24 * 60 : 5) * 60000).toISOString(), last_error: null })
  if (result.paid && !row.order_id) {
    const orderId = await deps.db('/rest/v1/rpc/finalize_wallet_checkout', { method: 'POST', body: JSON.stringify({ p_id: row.id, p_lock_id: row.lock_id }) })
    Object.assign(row, { order_id: orderId, status: 'payment_recorded' })
  } else if (!result.paid && row.order_id) {
    await deps.db(`/rest/v1/orders?id=eq.${encodeURIComponent(row.order_id)}&payment_provider=eq.paypal`, { method: 'PATCH', body: JSON.stringify({ payment_status: ['REFUNDED','PARTIALLY_REFUNDED'].includes(result.status) ? 'refunded' : 'unverified' }) })
    await save({ status: 'needs_review', last_error: 'recorded_payment_changed' })
  }
  return publicCheckout(row)
}
export async function createWalletOrder(body, dependencies = {}) {
  const deps = depsFor(dependencies)
  const row = await ownedCheckout(body, deps.db)
  return withCheckoutLock(row, async (record, save, ctx) => {
    assertWallet(record)
    if (body.expectedTotal !== record.total) throw new QuickBooksError('wallet_quote_changed', 409)
    if (record.wallet_payment?.orderId) return inspect(record, save, deps)
    await checkQuote(record, ctx, deps.call)
    const startedAt = record.wallet_payment?.startedAt || new Date().toISOString()
    // PayPal's default idempotency window is six hours. Never recreate an
    // ambiguous request outside it, even if the customer lost the response.
    if (Date.now() - Date.parse(startedAt) > 5 * 3600000) throw new QuickBooksError('wallet_creation_review_required', 409)
    await save({ wallet_payment: { merchantId: deps.merchantId, startedAt, status: 'CREATING' } })
    const payload = walletOrderPayload(record, deps.merchantId || 'DEFAULTMERCHANT')
    if (!deps.merchantId) delete payload.purchase_units[0].payee // PayPal selects the merchant authenticated by server credentials.
    const created = await deps.pay('/v2/checkout/orders', { method: 'POST', headers: { 'PayPal-Request-Id': `tss-wallet-${record.id}`, Prefer: 'return=representation' }, body: JSON.stringify(payload) })
    if (!/^[A-Z0-9]{10,32}$/.test(created?.id || '')) throw new QuickBooksError('wallet_invalid_response', 503)
    const merchantId = created.purchase_units?.[0]?.payee?.merchant_id
    if (!/^[A-Z0-9]{10,32}$/.test(merchantId || '') || (deps.merchantId && merchantId !== deps.merchantId)) throw new QuickBooksError('wallet_merchant_mismatch', 409)
    await save({ wallet_payment: { ...record.wallet_payment, merchantId, orderId: created.id } })
    return inspect(record, save, deps)
  }, deps)
}
export async function captureWalletOrder(body, dependencies = {}) {
  const deps = depsFor(dependencies)
  const row = await ownedCheckout(body, deps.db)
  return withCheckoutLock(row, async (record, save, ctx) => {
    assertWallet(record)
    if (!record.wallet_payment?.orderId || body.orderId !== record.wallet_payment.orderId || body.expectedTotal !== record.total) throw new QuickBooksError('wallet_payment_mismatch', 409)
    let result = await inspect(record, save, deps)
    if (result.orderId || record.wallet_payment.captureStartedAt) return result
    if (record.wallet_payment.status !== 'APPROVED') throw new QuickBooksError('wallet_not_approved', 409)
    await checkQuote(record, ctx, deps.call)
    await save({ wallet_payment: { ...record.wallet_payment, captureStartedAt: new Date().toISOString() } })
    try {
      await deps.pay(`/v2/checkout/orders/${record.wallet_payment.orderId}/capture`, { method: 'POST', headers: { 'PayPal-Request-Id': `tss-cap-${record.id}`, Prefer: 'return=representation' }, body: '{}' })
    } catch { /* Retrieve the same order; never submit another charge on timeout. */ }
    result = await inspect(record, save, deps)
    return result
  }, deps)
}
export async function recoverWalletPayment(row, dependencies = {}) {
  // A paid PayPal order must still be saved if Intuit temporarily disconnects.
  // This path reads PayPal only and verifies the original merchant, order and amount.
  const deps = depsFor({ ...dependencies, context: dependencies.context || (async () => ({ environment: row.environment, realmId: row.realm_id })) })
  return withCheckoutLock(row, async (record, save) => { assertWallet(record); return inspect(record, save, deps) }, deps)
}
