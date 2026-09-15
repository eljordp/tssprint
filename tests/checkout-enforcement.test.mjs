import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { defaultPricing } from '../src/lib/pricingCatalog.js'
import { getStickerPrice } from '../src/lib/stickerPricing.js'
import { normalizeCheckout, buildPayPalOrderPayload, assertPayPalCheckout } from '../server/paypal-api.js'
import { priceItem, approvedDiscount, loadServerPricing } from '../server/checkout-pricing.js'

const dependencies = { loadPricing: async () => defaultPricing, hasPaidOrder: async () => false }
const card = { id: 'test', name: 'Standard (3.5"×2")', size: 'Standard (3.5"×2")', option: '250 pcs', quantity: 1, price: 65, category: 'Business Cards' }
const customerInfo = { firstName: 'Checkout', lastName: 'Test', email: 'checkout-test@example.com', deliveryMethod: 'pickup' }
const body = () => ({ items: [structuredClone(card)], customerInfo: { ...customerInfo }, total: '65.00' })

test('server recalculates an approved product, add-ons, copies and promo', async () => {
  const request = body()
  request.items[0].addOns = [{ name: 'Soft-Touch', price: 25 }]
  request.items[0].quantity = 2
  Object.assign(request, { promoCode: 'WELCOME15', promoDiscount: 27, total: 153 })
  const quote = await normalizeCheckout(request, dependencies)
  assert.equal(quote.subtotal, 180)
  assert.equal(quote.total, 153)
  assert.equal(quote.items[0].price, 65)
})

test('client price and total tampering never defines a payable price', async () => {
  for (const bad of [0, 0.01, 1, -1, NaN, Infinity, '65', null]) {
    const request = body(); request.items[0].price = bad; request.total = bad
    await assert.rejects(normalizeCheckout(request, dependencies), /price/i)
  }
  for (const bad of ['NaN', 'Infinity', {}, '64.99', null]) {
    if (bad === null) continue // omitted totals are calculated from approved prices
    const request = body(); request.total = bad
    await assert.rejects(normalizeCheckout(request, dependencies), /total/i)
  }
})

test('unknown, retired, renamed, fractional and unsupported products fail closed', async () => {
  for (const changes of [{ name: 'Full vehicle wrap' }, { size: 'made up' }, { quantity: 1.5 }, { quantity: 0 }, { option: '1 pcs' }, { category: 'Security Film' }, { option: '250 pcs · Free foil' }]) {
    const request = body(); Object.assign(request.items[0], changes)
    await assert.rejects(normalizeCheckout(request, dependencies))
  }
})

test('unknown, duplicated, discounted and nonnumeric add-ons fail closed', async () => {
  for (const addOns of [[{ name: 'Free printing', price: 1 }], [{ name: 'Soft-Touch', price: 0 }], [{ name: 'Soft-Touch', price: NaN }], [{ name: 'Soft-Touch', price: 25 }, { name: 'Soft-Touch', price: 25 }]]) {
    const request = body(); request.items[0].addOns = addOns
    await assert.rejects(normalizeCheckout(request, dependencies), /add-on/i)
  }
})

test('only approved promos apply; minimums and prior purchase are enforced', async () => {
  assert.equal(await approvedDiscount('AUTO10', 65, customerInfo.email, async () => false), 6.5)
  assert.equal(await approvedDiscount('FIRST10', 65, customerInfo.email, async () => false), 10)
  await assert.rejects(approvedDiscount('FAKE30', 65, customerInfo.email), /not approved/)
  await assert.rejects(approvedDiscount('__proto__', 65, customerInfo.email), /not approved/)
  await assert.rejects(approvedDiscount('WELCOME15', 49, customerInfo.email), /at least/)
  await assert.rejects(approvedDiscount('AUTO10', 65, customerInfo.email, async () => true), /first orders/)
  await assert.rejects(approvedDiscount('AUTO10', 65, customerInfo.email, async () => { throw new Error('Unavailable') }), /Unavailable/)
  const request = body(); request.promoDiscount = 10
  await assert.rejects(normalizeCheckout(request, dependencies), /discount/)
  request.promoCode = 'AUTO10'; request.promoDiscount = NaN
  await assert.rejects(normalizeCheckout(request, dependencies), /discount/)
})

test('all displayed catalog tiers match server arithmetic', () => {
  const allowed = ['Mylar Packaging', 'Event Displays', 'Backdrops & Displays', 'Table Covers', 'Retractable Banners', 'Business Cards', 'A-Frame Signs', 'Flyers & Door Hangers', 'Postcards', 'Vehicle Magnets']
  for (const category of defaultPricing.products.filter(c => allowed.includes(c.name))) {
    for (const variant of category.items) for (const tier of variant.quantities) {
      const totalTier = ['Business Cards', 'Flyers & Door Hangers', 'Postcards'].includes(category.name)
      const bulk = !totalTier && category.items.some(v => v.quantities.some(t => t.qty >= 50))
      const factor = !totalTier && (bulk || variant.quantities.length > 1) ? tier.qty : 1
      const item = { id: 'test', category: category.name, name: variant.size, size: variant.size, option: tier.qty > 1 ? `${tier.qty} pcs` : '1', quantity: 1, price: +(tier.price * factor).toFixed(2), addOns: category.addOns.map(a => ({ name: a.name, price: +(a.value * factor).toFixed(2) })) }
      assert.equal(priceItem(item, defaultPricing).price, item.price, `${category.name} ${variant.size} ${tier.qty}`)
    }
  }
})

test('sticker custom quantities, materials and size multipliers use shared pricing', () => {
  for (const pieces of [50, 51, 100, 101, 499, 500, 1000, 2500, 7000]) {
    for (const material of defaultPricing.materialMultipliers) for (const size of defaultPricing.sizeMultipliers) {
      const label = { 'Matte Vinyl': 'Matte', 'Glossy Vinyl': 'Gloss' }[material.name] || material.name
      const price = getStickerPrice(pieces, defaultPricing, size.multiplier, material.multiplier).subtotal
      const item = { name: `Die-Cut ${label} Stickers`, material: material.name, shape: 'Die-Cut', size: size.name, option: `${pieces} pcs · Individual stickers`, quantity: 1, price }
      assert.equal(priceItem(item, defaultPricing).price, price)
    }
  }
})

test('changed or legacy PayPal approval cannot be captured against another cart', async () => {
  const quote = await normalizeCheckout(body(), dependencies)
  const approved = buildPayPalOrderPayload(quote)
  assert.doesNotThrow(() => assertPayPalCheckout(approved, quote))
  const changed = structuredClone(quote); changed.customer.email = 'different@example.com'
  assert.throws(() => assertPayPalCheckout(approved, changed), /does not match/)
  approved.purchase_units[0].amount.value = '0.01'
  assert.throws(() => assertPayPalCheckout(approved, quote), /does not match/)
  assert.throws(() => assertPayPalCheckout({ purchase_units: [{ amount: { value: '65', currency_code: 'USD' } }] }, quote), /does not match/)
})

test('database outage cannot fall back to potentially stale default prices', async () => {
  const oldFetch = globalThis.fetch
  const old = process.env.VITE_SUPABASE_ANON_KEY
  const oldUrl = process.env.VITE_SUPABASE_URL
  process.env.VITE_SUPABASE_ANON_KEY = 'test'; process.env.VITE_SUPABASE_URL = 'https://example.invalid'
  globalThis.fetch = async () => new Response('', { status: 503 })
  try { await assert.rejects(loadServerPricing(), /temporarily unavailable/) }
  finally { globalThis.fetch = oldFetch; if (old === undefined) delete process.env.VITE_SUPABASE_ANON_KEY; else process.env.VITE_SUPABASE_ANON_KEY = old; if (oldUrl === undefined) delete process.env.VITE_SUPABASE_URL; else process.env.VITE_SUPABASE_URL = oldUrl }
})

test('quote endpoint validates without calling any payment provider', async () => {
  const { default: handler } = await import('../api/paypal/quote.js')
  const oldFetch = globalThis.fetch
  const oldKey = process.env.VITE_SUPABASE_ANON_KEY, oldUrl = process.env.VITE_SUPABASE_URL
  process.env.VITE_SUPABASE_ANON_KEY = 'test'; process.env.VITE_SUPABASE_URL = 'https://example.invalid'
  const calls = []
  globalThis.fetch = async url => { calls.push(url); return Response.json([]) }
  const req = Readable.from([Buffer.from(JSON.stringify(body()))]); req.method = 'POST'
  const res = { setHeader() {}, end(value) { this.body = JSON.parse(value) } }
  try {
    await handler(req, res)
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.total, 65)
    assert.equal(calls.length, 1)
    assert.match(calls[0], /pricing_configs/)
  } finally { globalThis.fetch = oldFetch; if (oldKey === undefined) delete process.env.VITE_SUPABASE_ANON_KEY; else process.env.VITE_SUPABASE_ANON_KEY = oldKey; if (oldUrl === undefined) delete process.env.VITE_SUPABASE_URL; else process.env.VITE_SUPABASE_URL = oldUrl }
})


test('PayPal gets stable product names, piece counts and separately priced upgrades', async () => {
  const request = body()
  request.items[0].addOns = [{ name: 'Soft-Touch', price: 25 }]
  request.items[0].quantity = 2
  Object.assign(request, { promoCode: 'WELCOME15', promoDiscount: 27, total: 153 })
  const quote = await normalizeCheckout(request, dependencies)
  const unit = buildPayPalOrderPayload(quote).purchase_units[0]
  assert.equal(unit.items[0].name, 'Business Cards')
  assert.match(unit.items[0].description, /250 pcs/)
  assert.equal(unit.items[1].name, 'Business Cards — Soft-Touch')
  assert.equal(unit.items.reduce((sum, item) => sum + Number(item.unit_amount.value) * Number(item.quantity), 0), 180)
  assert.equal(unit.amount.breakdown.discount.value, '27.00')
  assert.equal(unit.amount.value, '153.00')
})

test('an invalid item identifies what the shopper can edit or remove', async () => {
  const request = body()
  request.items.push({ id: 'expired-item', name: 'Saved sample sticker', option: 'Legacy format', size: 'Test', quantity: 1, price: 1 })
  await assert.rejects(normalizeCheckout(request, dependencies), error => {
    assert.equal(error.status, 400)
    assert.match(error.message, /Saved sample sticker/)
    assert.match(error.message, /Edit or remove this item/)
    return true
  })
})

test('product-page descriptive labels and legacy carts share approved pricing', async () => {
  const request = body()
  request.items[0].name = `Business Cards — ${card.size}`
  assert.equal((await normalizeCheckout(request, dependencies)).total, 65)
  request.items[0].price = 0.01
  await assert.rejects(normalizeCheckout(request, dependencies), /price/i)
  request.items[0].price = 65
  request.items[0].name = `Unapproved Cards — ${card.size}`
  await assert.rejects(normalizeCheckout(request, dependencies), /details/i)
})
