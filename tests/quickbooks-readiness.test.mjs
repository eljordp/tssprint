import test from 'node:test'
import assert from 'node:assert/strict'
import { checkoutReadiness } from '../server/quickbooks-readiness.js'
test('readiness uses only company-bound reads and preserves unknown payment/tax preferences', async () => {
  const calls = []
  const result = await checkoutReadiness({
    connection: async () => ({ status: 'connected', realm_id: '123', company_name: 'Shop' }),
    config: () => ({ environment: 'production' }),
    call: async (path, options) => {
      calls.push({ path, ...options })
      return path === '/preferences' ? { Preferences: { CurrencyPrefs: { HomeCurrency: { value: 'USD' } }, TaxPrefs: { UsingSalesTax: false } } } : { QueryResponse: { Item: [{ Id: '5', Name: 'Cards', Type: 'NonInventory', Taxable: true, IncomeAccountRef: { name: 'Sales' }, privateField: 'never exposed' }] } }
    },
  })
  assert.equal(result.salesTaxEnabled, false)
  assert.equal(result.onlinePayments, null)
  assert.equal(result.automatedSalesTax, null)
  assert.equal(result.checkoutEnabled, false)
  assert.equal(result.items[0].privateField, undefined)
  assert.ok(calls.every(call => call.realmId === '123' && call.environment === 'production' && !call.method))
})
test('disconnected company is rejected before any API call', async () => {
  await assert.rejects(checkoutReadiness({ connection: async () => null, call: () => { throw new Error('must not call') } }), { code: 'reconnect_required' })
})
