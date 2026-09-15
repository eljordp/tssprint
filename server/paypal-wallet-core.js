// Prepared Apple Pay contract. No live route calls this module until the
// merchant setup, recovery flow and QuickBooks accounting sync are verified.
import { buildPayPalOrderPayload } from './paypal-api.js'
import { QuickBooksError } from './quickbooks-core.js'

const fail = () => { throw new QuickBooksError('wallet_payment_mismatch', 409) }
const cents = value => {
  if (typeof value === 'string' && !/^\d+\.\d{2}$/.test(value)) return NaN
  if (!['number', 'string'].includes(typeof value)) return NaN
  const amount = Number(value)
  return Number.isFinite(amount) && Math.abs(amount * 100 - Math.round(amount * 100)) < 0.000001 ? Math.round(amount * 100) : NaN
}
const providerId = value => typeof value === 'string' && /^[A-Z0-9]{10,32}$/.test(value)
const cash = value => ({ currency_code: 'USD', value: (value / 100).toFixed(2) })

function expectedAmounts(row, merchantId) {
  const total = cents(row.total), tax = cents(row.tax), base = cents(row.checkout?.total)
  if (row.payment_mode !== 'direct' || !row.invoice_id || !providerId(merchantId) ||
      !/^[0-9a-f-]{36}$/i.test(row.id || '') || !Number.isSafeInteger(total) || total <= 0 ||
      !Number.isSafeInteger(tax) || tax < 0 || !Number.isSafeInteger(base) || base + tax !== total) fail()
  return { total, tax }
}

export function walletOrderPayload(row, merchantId) {
  const { total, tax } = expectedAmounts(row, merchantId)
  const payload = buildPayPalOrderPayload(row.checkout)
  const unit = payload.purchase_units[0]
  unit.reference_id = row.id
  unit.custom_id = row.id
  unit.invoice_id = `TSS-${row.id}`
  unit.payee = { merchant_id: merchantId }
  unit.amount.value = cash(total).value
  unit.amount.breakdown.tax_total = cash(tax)
  return payload
}

export function verifiedWalletOrder(order, row, merchantId, expectedOrderId) {
  const { total } = expectedAmounts(row, merchantId)
  if (!providerId(expectedOrderId) || order?.id !== expectedOrderId || order.intent !== 'CAPTURE' ||
      !['CREATED', 'PAYER_ACTION_REQUIRED', 'APPROVED', 'COMPLETED', 'VOIDED'].includes(order.status) ||
      order.purchase_units?.length !== 1) fail()
  const unit = order.purchase_units[0]
  const expected = walletOrderPayload(row, merchantId).purchase_units[0]
  if (unit.custom_id !== row.id || unit.invoice_id !== expected.invoice_id || unit.reference_id !== row.id ||
      unit.payee?.merchant_id !== merchantId || unit.amount?.currency_code !== 'USD' || cents(unit.amount.value) !== total) fail()
  for (const key of new Set([...Object.keys(expected.amount.breakdown), ...Object.keys(unit.amount.breakdown || {})])) {
    const actual = unit.amount.breakdown?.[key], planned = expected.amount.breakdown[key]
    if (!planned || actual?.currency_code !== 'USD' || cents(actual.value) !== cents(planned.value)) fail()
  }
  if (unit.items?.length !== expected.items.length || unit.items.some((item, i) => {
    const planned = expected.items[i]
    return item.name !== planned.name || item.sku !== planned.sku || item.quantity !== planned.quantity ||
      item.unit_amount?.currency_code !== 'USD' || cents(item.unit_amount.value) !== cents(planned.unit_amount.value)
  })) fail()
  if (expected.shipping && (unit.shipping?.name?.full_name !== expected.shipping.name.full_name ||
      Object.entries(expected.shipping.address).some(([key, value]) => unit.shipping?.address?.[key] !== value))) fail()
  const captures = unit.payments?.captures || []
  if (captures.length > 1 || (unit.payments?.authorizations || []).length || (unit.payments?.refunds || []).length) fail()
  if (!captures.length) {
    if (order.status === 'COMPLETED') fail()
    return { paid: false, status: order.status, orderId: order.id }
  }
  const capture = captures[0]
  if (!order.payment_source?.apple_pay) fail()
  if (!providerId(capture.id) || capture.amount?.currency_code !== 'USD' || cents(capture.amount.value) !== total ||
      !['COMPLETED', 'PENDING', 'DECLINED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(capture.status)) fail()
  if (capture.status === 'COMPLETED' && (order.status !== 'COMPLETED' || capture.final_capture !== true)) fail()
  return { paid: capture.status === 'COMPLETED', status: capture.status, orderId: order.id, captureId: capture.id }
}
