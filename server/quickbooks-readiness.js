import { accountingRequest, configuration, getConnection } from './quickbooks-api.js'
import { readCatalog } from './quickbooks-catalog.js'
import { QuickBooksError } from './quickbooks-core.js'

// Admin-only, read-only discovery. Never infer a merchant's tax policy from an
// arbitrary catalog item or create an accounting record during a settings check.
export async function checkoutReadiness({ connection = getConnection, config = configuration, call = accountingRequest, env = process.env } = {}) {
  const current = await connection()
  if (current?.status !== 'connected') throw new QuickBooksError('reconnect_required', 409)
  const ctx = { environment: config().environment, realmId: current.realm_id }
  const [preferences, catalog] = await Promise.all([
    call('/preferences', ctx),
    readCatalog(call, ctx),
  ])
  const prefs = preferences.Preferences || {}
  return {
    environment: ctx.environment,
    companyName: current.company_name,
    currency: prefs.CurrencyPrefs?.HomeCurrency?.value || null,
    multiCurrency: prefs.CurrencyPrefs?.MultiCurrencyEnabled ?? null,
    salesTaxEnabled: prefs.TaxPrefs?.UsingSalesTax ?? null,
    automatedSalesTax: prefs.TaxPrefs?.PartnerTaxEnabled ?? null,
    onlinePayments: prefs.SalesFormsPrefs?.AllowOnlineCreditCardPayment ?? null,
    autoEmail: prefs.SalesFormsPrefs?.AutoEmailOnTxnCreation ?? null,
    serverPurchaseTracking: Boolean(env.GA4_API_SECRET && /^G-[A-Z0-9]+$/.test(env.VITE_GA4_MEASUREMENT_ID || '')),
    items: catalog.map(item => ({
      id: item.Id, name: item.FullyQualifiedName || item.Name, type: item.Type,
      taxable: item.Taxable ?? null, incomeAccount: item.IncomeAccountRef?.name || null,
    })),
    checkoutEnabled: false,
  }
}
