import test from 'node:test'
import assert from 'node:assert/strict'
import { setupWebsiteProducts, readCatalog, WEBSITE_PRODUCTS } from '../server/quickbooks-catalog.js'
import { mappedInvoice } from '../server/quickbooks-checkout-core.js'
function fixture() {
  const catalog = [{ Id: '10', Name: 'Custom Card Stock', Active: true, Type: 'NonInventory', Taxable: true, IncomeAccountRef: { value: '7', name: 'Sales of Product Income' } }]
  const writes = new Map()
  let lost = false
  return { catalog, writes, loseNext: () => { lost = true }, connection: async () => ({ status: 'connected', realm_id: '123' }), config: () => ({ environment: 'production' }),
    call: async (path, opts) => {
      assert.equal(opts.realmId, '123'); assert.equal(opts.environment, 'production')
      if (path === '/preferences') return { Preferences: { CurrencyPrefs: { HomeCurrency: { value: 'USD' } }, TaxPrefs: { UsingSalesTax: true, PartnerTaxEnabled: true } } }
      if (path === '/query') return { QueryResponse: { Item: structuredClone(catalog) } }
      assert.equal(path, '/item'); assert.equal(opts.method, 'POST'); assert.equal(opts.body.IncomeAccountRef.value, '7'); assert.equal(opts.body.Taxable, true)
      let item = writes.get(opts.requestId)
      if (!item) { item = { Id: String(catalog.length + 10), ...opts.body }; writes.set(opts.requestId, item); catalog.push(item) }
      if (lost) { lost = false; throw new Error('Lost response') }
      return { Item: item }
    },
  }
}
test('creates three taxable product records in the existing income account and repeats without duplicates', async () => {
  const f = fixture(); const result = await setupWebsiteProducts(f)
  assert.equal(result.products.length, 3); assert.equal(f.writes.size, 3)
  assert.ok(result.products.every(p => p.created && p.taxable))
  const second = await setupWebsiteProducts(f)
  assert.ok(second.products.every(p => !p.created)); assert.equal(f.writes.size, 3)
  const checkout = { customer: { firstName: 'QA', lastName: 'Test', email: 'qa@example.com', deliveryMethod: 'pickup' }, items: WEBSITE_PRODUCTS.map(p => ({ category:p.category, name:p.category, option:'1', size:'test', quantity:1, price:100, unitPrice:110, lineTotal:110, addOns:[{name:'Finish',price:10}] })), subtotal:330,discount:0,total:330 }
  const invoice = mappedInvoice(checkout, f.catalog, '20', 'test')
  const lines = invoice.Line.filter(l => l.DetailType === 'SalesItemLineDetail')
  assert.equal(lines.length, 6)
  assert.ok(lines.every(l => l.SalesItemLineDetail.TaxCodeRef.value === 'TAX'))
  assert.equal(new Set(lines.map(l => l.SalesItemLineDetail.ItemRef.value)).size, 3)
})
test('lost create response recovers the same catalog product on retry', async () => {
  const f=fixture(); f.loseNext(); await assert.rejects(setupWebsiteProducts(f), /Lost response/)
  await setupWebsiteProducts(f); assert.equal(f.writes.size,3); assert.equal(f.catalog.length,4)
})
test('existing non-taxable names and missing income accounts stop before any writes', async () => {
  const f=fixture(); f.catalog.push({Id:'99',Name:WEBSITE_PRODUCTS[2].name,Type:'NonInventory',Active:true,Taxable:false,IncomeAccountRef:{value:'7'}})
  await assert.rejects(setupWebsiteProducts(f),{code:'website_product_conflict'}); assert.equal(f.writes.size,0)
  f.catalog[0].IncomeAccountRef={}; await assert.rejects(setupWebsiteProducts(f),{code:'product_income_account_required'}); assert.equal(f.writes.size,0)
})
test('catalog reads additional pages instead of treating products past the first 100 as missing', async () => {
  const starts=[]; const all=await readCatalog(async (_path,opts)=>{ starts.push(opts.body.query); return {QueryResponse:{Item:starts.length===1?Array.from({length:100},(_,i)=>({Id:String(i)})):[{Id:'last'}]}} }, {realmId:'123',environment:'production'})
  assert.equal(all.length,101); assert.match(starts[1],/startposition 101/)
})
