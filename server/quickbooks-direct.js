import crypto from 'node:crypto'
import { accountingRequest, configuration, paymentsAccess, paymentsRequest } from './quickbooks-api.js'
import { QuickBooksError, decryptTokens, encryptTokens, encryptionKey } from './quickbooks-core.js'
import { checkoutContext, ownedCheckout, withCheckoutLock, publicCheckout, inspectInvoice } from './quickbooks-checkout.js'
import { invoiceAmounts } from './quickbooks-checkout-core.js'
import { assertDirectInvoice, directChargePayload, verifiedCharge } from './quickbooks-direct-core.js'
import { supabaseFetch } from './square-api.js'

export async function directPaymentsEnabled() {
  return process.env.QUICKBOOKS_DIRECT_PAYMENTS_ENABLED === 'true' && await paymentsAccess()
}
const defaults = { db: supabaseFetch, call: accountingRequest, pay: paymentsRequest, context: checkoutContext }

async function recoverLocked(row, save, ctx, deps, firstSubmission = false) {
  let attempt = row.direct_payment
  if (!attempt) return publicCheckout(row)
  if (['DECLINED','CANCELLED'].includes(attempt.status)) return publicCheckout(row)
  let response
  if (attempt.chargeId) {
    response = await deps.pay(`/charges/${attempt.chargeId}`, { ...ctx, requestId: crypto.randomUUID() })
  } else {
    // A lost charge response is ambiguous. Do not automatically replay a write
    // until Intuit's production deduplication retention has been verified.
    if (!firstSubmission) throw new QuickBooksError('charge_review_required', 409)
    const payload = decryptTokens(attempt.encryptedPayload, encryptionKey(configuration().key), ctx.environment, `${ctx.realmId}:${row.id}`)
    try {
      response = await deps.pay('/charges', { ...ctx, method: 'POST', requestId: attempt.requestId, body: payload })
    } catch (error) {
      if (error.code !== 'invalid_card') throw error
      await save({ direct_payment: { ...attempt, status: 'DECLINED', encryptedPayload: null, rejection: 'invalid_card' }, last_error: null })
      return publicCheckout(row)
    }
  }
  const charge = verifiedCharge(response, { total: row.total, chargeId: attempt.chargeId })
  attempt = { ...attempt, ...charge, encryptedPayload: null }
  await save({ direct_payment: attempt, last_error: null, last_checked_at: new Date().toISOString() })
  if (!charge.paid) {
    if (row.order_id || charge.status === 'REFUNDED') throw new QuickBooksError('charge_status_changed', 409)
    return publicCheckout(row)
  }
  if (!attempt.accountingPaymentId) {
    const invoice = (await deps.call('/query', { ...ctx, body: { query: `select * from Invoice where Id = '${row.invoice_id}'` } })).QueryResponse?.Invoice?.[0]
    invoiceAmounts(invoice, row)
    const linked = (invoice.LinkedTxn || []).filter(t => t.TxnType === 'Payment')
    if (linked.length) {
      if (linked.length !== 1 || !/^\d{1,32}$/.test(String(linked[0].TxnId))) throw new QuickBooksError('accounting_payment_mismatch', 409)
      const payment = (await deps.call(`/payment/${linked[0].TxnId}`, ctx)).Payment
      if (payment?.CreditCardPayment?.CreditChargeResponse?.CCTransId !== charge.chargeId) throw new QuickBooksError('accounting_payment_mismatch', 409)
      attempt.accountingPaymentId = String(payment.Id)
    } else {
      assertDirectInvoice(invoice, row)
      if (Date.now() - Date.parse(attempt.startedAt) > 23 * 3600000) throw new QuickBooksError('accounting_review_required', 409)
      // Intuit's nested ProcessPayment flag stores the existing processor
      // response for reconciliation. No card/token is sent to Accounting.
      const payment = (await deps.call('/payment', { ...ctx, method: 'POST', requestId: `tss-dp-${row.id}`, body: {
        CustomerRef: { value: row.customer_id }, CurrencyRef: { value: 'USD' }, TotalAmt: row.total, TxnSource: 'IntuitPayment',
        PaymentRefNum: charge.chargeId, PrivateNote: `TSS captured charge ${charge.chargeId}; order ${row.id}`,
        CreditCardPayment: { CreditChargeInfo: { ProcessPayment: true }, CreditChargeResponse: { CCTransId: charge.chargeId } },
        Line: [{ Amount: row.total, LinkedTxn: [{ TxnId: row.invoice_id, TxnType: 'Invoice' }] }],
      } })).Payment
      if (!/^\d{1,32}$/.test(String(payment?.Id))) throw new QuickBooksError('invalid_payment_response')
      attempt.accountingPaymentId = String(payment.Id)
    }
    await save({ direct_payment: attempt })
  }
  await inspectInvoice(row, save, ctx, deps)
  return publicCheckout(row)
}

export async function chargeCheckout(body, overrides = {}) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body?.paymentAttemptId || '')) throw new QuickBooksError('invalid_request_id', 400)
  const deps = { ...defaults, ...overrides }
  const row = await ownedCheckout(body, deps.db)
  if (row.payment_mode !== 'direct') throw new QuickBooksError('payment_not_ready', 409)
  if (row.checkout?.ownerTest && (Number(row.total) !== 1 || Number(row.tax) !== 0.10)) throw new QuickBooksError('owner_test_total_mismatch', 409)
  return withCheckoutLock(row, async (record, save, ctx) => {
    if (record.checkout?.ownerTest && (Number(record.total) !== 1 || Number(record.tax) !== 0.10)) throw new QuickBooksError('owner_test_total_mismatch', 409)
    const previous = record.direct_payment
    const retryDecline = previous?.status === 'DECLINED' && previous.requestId !== body.paymentAttemptId
    if (previous && !retryDecline) return recoverLocked(record, save, ctx, deps)
    if (retryDecline && (previous.attempts || 1) >= 3) throw new QuickBooksError('rate_limited', 429)
    if (typeof body.expectedTotal !== 'number' || body.expectedTotal !== record.total) throw new QuickBooksError('checkout_changed', 409)
    const invoice = (await deps.call('/query', { ...ctx, body: { query: `select * from Invoice where Id = '${record.invoice_id}'` } })).QueryResponse?.Invoice?.[0]
    const amounts = invoiceAmounts(invoice, record)
    if (amounts.total !== record.total || amounts.tax !== record.tax) throw new QuickBooksError('invoice_total_changed', 409)
    assertDirectInvoice(invoice, record)
    const payload = directChargePayload(record, body.paymentToken)
    await save({ direct_payment: {
      status: 'PROCESSING', requestId: body.paymentAttemptId, startedAt: new Date().toISOString(), attempts: (previous?.attempts || 0) + 1,
      declinedChargeIds: [...(previous?.declinedChargeIds || []), ...(retryDecline && previous.chargeId ? [previous.chargeId] : [])],
      encryptedPayload: encryptTokens(payload, encryptionKey(configuration().key), ctx.environment, `${ctx.realmId}:${record.id}`),
    } })
    return recoverLocked(record, save, ctx, deps, true)
  }, deps)
}
export async function recoverDirectPayment(row, overrides = {}) {
  const deps = { ...defaults, ...overrides }
  return withCheckoutLock(row, (record, save, ctx) => recoverLocked(record, save, ctx, deps), deps)
}
