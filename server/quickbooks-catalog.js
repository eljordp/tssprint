import { accountingRequest, configuration, getConnection } from './quickbooks-api.js'
import { QuickBooksError, digest } from './quickbooks-core.js'

// Separate product records keep the website's taxable goods out of the existing
// non-taxable Event Displays item and preserve historical accounting records.
export const WEBSITE_PRODUCTS = Object.freeze([
  { category: 'Mylar Packaging', name: 'Website Mylar Packaging' },
  { category: 'Event Displays', name: 'Website Canopies' },
  { category: 'Table Covers', name: 'Website Table Covers' },
])
export async function readCatalog(call, ctx, { includeInactive = false } = {}) {
  const items = []
  for (let start = 1; start <= 10000; start += 100) {
    const result = await call('/query', { ...ctx, body: { query: `select * from Item${includeInactive ? '' : ' where Active = true'} startposition ${start} maxresults 100` } })
    const page = result.QueryResponse?.Item || []
    items.push(...page)
    if (page.length < 100) return items
  }
  throw new QuickBooksError('catalog_too_large', 409)
}
export async function setupWebsiteProducts({ connection = getConnection, config = configuration, call = accountingRequest } = {}) {
  const current = await connection()
  if (current?.status !== 'connected') throw new QuickBooksError('reconnect_required', 409)
  const ctx = { environment: config().environment, realmId: current.realm_id }
  const [catalog, settings] = await Promise.all([readCatalog(call, ctx, { includeInactive: true }), call('/preferences', ctx)])
  const prefs = settings.Preferences
  if (prefs?.CurrencyPrefs?.HomeCurrency?.value !== 'USD' || prefs?.TaxPrefs?.UsingSalesTax !== true || prefs?.TaxPrefs?.PartnerTaxEnabled !== true) throw new QuickBooksError('tax_configuration_required', 409)
  const reference = catalog.filter(i => (i.FullyQualifiedName || i.Name) === 'Custom Card Stock' && i.Active !== false && i.Type === 'NonInventory' && i.Taxable === true)
  if (reference.length !== 1 || !/^\d+$/.test(reference[0].IncomeAccountRef?.value || '')) throw new QuickBooksError('product_income_account_required', 409)
  const income = reference[0].IncomeAccountRef
  // Validate all existing matches before the first write; never silently change
  // an existing item's tax flag, account or active status.
  const plan = WEBSITE_PRODUCTS.map(product => {
    const matches = catalog.filter(i => (i.FullyQualifiedName || i.Name) === product.name)
    if (matches.length > 1 || (matches.length === 1 && (matches[0].Active === false || matches[0].Type !== 'NonInventory' || matches[0].Taxable !== true || matches[0].IncomeAccountRef?.value !== income.value))) throw new QuickBooksError('website_product_conflict', 409)
    return { ...product, existing: matches[0] }
  })
  const results = []
  for (const product of plan) {
    let item = product.existing
    if (!item) {
      const result = await call('/item', { ...ctx, method: 'POST', requestId: `tss-item-${digest(`${ctx.environment}:${ctx.realmId}:${product.name}:v1`).slice(0,36)}`, body: {
        Name: product.name, Type: 'NonInventory', Active: true, Taxable: true,
        IncomeAccountRef: { value: income.value }, Description: `${product.category} sold through tssprint.com; order lines contain the selected size, quantity and finish.`,
      } })
      item = result.Item
      if (!/^\d+$/.test(item?.Id || '') || item.Name !== product.name || item.Taxable !== true || item.IncomeAccountRef?.value !== income.value) throw new QuickBooksError('invalid_product_response', 502)
    }
    results.push({ category: product.category, name: product.name, id: item.Id, taxable: item.Taxable, created: !product.existing })
  }
  return { products: results, incomeAccount: income.name || 'Same product-income account as Custom Card Stock' }
}
