import { QuickBooksError } from './quickbooks-core.js'

const cents = value => {
  if (!['string','number'].includes(typeof value) || !/^\d+(\.\d{1,2})?$/.test(String(value))) return NaN
  const result = Math.round(Number(value) * 100)
  return Number.isSafeInteger(result) ? result : NaN
}

// Verify evidence returned by the processor, never a browser success callback
// or an accounting entry. Only these fields may be retained from a charge.
export function verifiedCharge(charge, expected) {
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(charge?.id || '') ||
      (expected.chargeId && charge.id !== expected.chargeId) ||
      charge.currency !== 'USD' || !(cents(expected.total) > 0) || cents(charge.amount) !== cents(expected.total)) {
    throw new QuickBooksError('charge_mismatch', 409)
  }
  if (!['AUTHORIZED','DECLINED','CAPTURED','CANCELLED','SETTLED','REFUNDED'].includes(charge.status)) throw new QuickBooksError('charge_status_unknown', 409)
  return { chargeId: charge.id, amount: cents(charge.amount) / 100, currency: 'USD', status: charge.status,
    paid: ['CAPTURED','SETTLED'].includes(charge.status) }
}

export function directChargePayload(row, token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_+=/-]{10,512}$/.test(token)) throw new QuickBooksError('invalid_payment_token', 400)
  if (row.payment_mode !== 'direct' || !row.invoice_id || row.status !== 'awaiting_payment' ||
      !(cents(row.total) > 0) || cents(row.total) > 9999999 || !Number.isFinite(cents(row.tax))) throw new QuickBooksError('payment_not_ready', 409)
  return { token, currency: 'USD', amount: (cents(row.total) / 100).toFixed(2), capture: true,
    context: { isEcommerce: true, tax: cents(row.tax) / 100 }, description: `TSS order ${row.id}` }
}

export function assertDirectInvoice(invoice, row) {
  if (invoice?.AllowOnlineCreditCardPayment !== false || invoice.AllowOnlineACHPayment !== false ||
      invoice.AllowOnlinePayPalPayment === true || invoice.AllowOnlineAffirmPayment === true ||
      cents(invoice.Balance) !== cents(row.total) || (invoice.LinkedTxn || []).length) {
    throw new QuickBooksError('invoice_payment_conflict', 409)
  }
}
