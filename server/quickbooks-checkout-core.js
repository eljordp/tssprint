import { QuickBooksError } from './quickbooks-core.js'
import { invoicePayload, invoicePaymentState } from './quickbooks-invoices.js'

export const moneyCents = value => typeof value === 'number' && Number.isFinite(value) ? Math.round(value * 100) : NaN
export const QB_PRODUCT_NAMES = Object.freeze({
  Stickers: 'Stickers:Vinyl Stickers', 'Business Cards': 'Custom Card Stock',
  'Flyers & Door Hangers': 'Custom Card Stock', Postcards: 'Custom Card Stock',
  'Vehicle Magnets': 'Vehicle Magnets', 'Retractable Banners': 'Custom Banners',
  'A-Frame Signs': 'Signage', 'Backdrops & Displays': 'Fabric Backdrop',
})
export function mappedInvoice(checkout, catalog, customerId, reference) {
  const mapping = checkout.items.map(item => {
    const name = QB_PRODUCT_NAMES[item.category]
    const matches = catalog.filter(candidate => (candidate.FullyQualifiedName || candidate.Name) === name && candidate.Active !== false && ['Service','NonInventory'].includes(candidate.Type))
    if (!name || matches.length !== 1 || typeof matches[0].Taxable !== 'boolean') throw new QuickBooksError('product_mapping_required', 409)
    return matches[0]
  })
  const result = invoicePayload(checkout, customerId, mapping[0].Id, reference, mapping[0].Taxable ? 'TAX' : 'NON')
  let offset = 0
  for (let i = 0; i < checkout.items.length; i++) {
    for (let n = 0; n <= checkout.items[i].addOns.length; n++) {
      result.Line[offset++].SalesItemLineDetail.ItemRef.value = mapping[i].Id
      result.Line[offset - 1].SalesItemLineDetail.TaxCodeRef.value = mapping[i].Taxable ? 'TAX' : 'NON'
    }
  }
  // Intuit computes automated tax using its configured item categories and the
  // real ship-from/delivery address. Do not force a rate or a zero-tax override.
  result.BillAddr = result.ShipAddr
  return result
}
export function invoiceAmounts(invoice, expected) {
  const tax = moneyCents(invoice?.TxnTaxDetail?.TotalTax)
  const total = moneyCents(invoice?.TotalAmt)
  if (!invoice || String(invoice.Id) !== String(expected.invoice_id) || invoice.CustomerRef?.value !== expected.customer_id || invoice.CurrencyRef?.value !== 'USD' || !Number.isSafeInteger(tax) || tax < 0 || total !== moneyCents(expected.checkout.total) + tax) throw new QuickBooksError('invoice_total_mismatch', 409)
  // Preserve and compare the commercial lines as well as the aggregate total.
  const actual = (invoice.Line || []).filter(l => ['SalesItemLineDetail','DiscountLineDetail'].includes(l.DetailType))
  const planned = expected.invoice_payload.Line
  if (actual.length !== planned.length || actual.some((line, i) => {
    const original = planned[i]
    if (line.DetailType !== original.DetailType || moneyCents(line.Amount) !== moneyCents(original.Amount)) return true
    if (line.DetailType === 'SalesItemLineDetail') return line.SalesItemLineDetail?.ItemRef?.value !== original.SalesItemLineDetail.ItemRef.value || line.SalesItemLineDetail.Qty !== original.SalesItemLineDetail.Qty || moneyCents(line.SalesItemLineDetail.UnitPrice) !== moneyCents(original.SalesItemLineDetail.UnitPrice)
    return line.DiscountLineDetail?.PercentBased !== false
  })) throw new QuickBooksError('invoice_lines_changed', 409)
  return { tax: tax / 100, total: total / 100 }
}
export function verifiedInvoicePayment(invoice, payments, expected) {
  const amounts = invoiceAmounts(invoice, expected)
  if (expected.total !== null && (moneyCents(expected.total) !== moneyCents(amounts.total) || moneyCents(expected.tax) !== moneyCents(amounts.tax))) throw new QuickBooksError('invoice_total_changed', 409)
  return { ...invoicePaymentState(invoice, payments, { ...expected, checkout: { ...expected.checkout, total: amounts.total } }), ...amounts }
}
