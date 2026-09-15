import test from 'node:test'
import assert from 'node:assert/strict'
import { cartEditHref, resolveProductEdit } from '../src/lib/productCartEditing.ts'
import { defaultPricing } from '../src/lib/pricingCatalog.js'
import { priceItem } from '../server/checkout-pricing.js'
import { validateCartItems } from '../server/cart-core.js'
import type { CartItem } from '../src/context/CartContext'

const card: CartItem = { id: 'card-fixture', name: 'Business Cards — Standard (3.5"×2")', category: 'Business Cards', size: 'Standard (3.5"×2")', option: '250 pcs', price: 65, quantity: 2, addOns: [{ name: 'Soft-Touch', price: 25 }], artworkIntent: 'uploaded', artwork: { bucket: 'order-artwork', path: 'test/file.pdf', fileName: 'two-sided.pdf', contentType: 'application/pdf', size: 200, uploadedAt: '2026-09-15T04:00:00Z' } }

test('old card restores by catalog keys, survives reorder, and retains artwork through save serialization', () => {
  const original = structuredClone(card)
  const config = resolveProductEdit(card, [...defaultPricing.products].reverse())!
  assert.equal(config.variant, card.size)
  assert.equal(config.pieces, 250)
  assert.deepEqual(config.addOns, ['Soft-Touch'])
  const stored = JSON.parse(JSON.stringify(validateCartItems([{ ...card, productConfiguration: config }])))[0]
  assert.deepEqual(resolveProductEdit(stored, defaultPricing.products), config)
  assert.deepEqual(stored.artwork, card.artwork)
  assert.equal(stored.quantity, 2)
  assert.deepEqual(card, original)
})

test('a changed card run with two batches still matches server pricing', () => {
  const edited = { ...card, size: 'Square (2.5"×2.5")', name: 'Business Cards — Square (2.5"×2.5")', option: '500 pcs', price: 119 }
  assert.equal(priceItem(edited, defaultPricing).price, 119)
  assert.equal((edited.price + edited.addOns[0].price) * edited.quantity, 288)
  assert.equal(resolveProductEdit(edited, defaultPricing.products)?.pieces, 500)
  assert.throws(() => priceItem({ ...edited, price: 65 }, defaultPricing), /price/i)
})

test('unrecoverable variants, quantities, extras and configuration versions never use defaults', () => {
  const config = resolveProductEdit(card, defaultPricing.products)!
  for (const change of [{ size: 'Retired card' }, { option: '251 pcs' }, { option: '250.5 pcs' }, { addOns: [{ name: 'Removed finish', price: 25 }] }, { productConfiguration: { ...config, version: 2 } }, { productConfiguration: { ...config, pieces: NaN } }]) {
    assert.equal(resolveProductEdit({ ...card, ...change } as CartItem, defaultPricing.products), null)
  }
})

test('old pouches recover finish/color/upgrades, and corrected pouch and jar packets pass pricing', () => {
  const category = defaultPricing.products.find(c => c.name === 'Mylar Packaging')!
  const old: CartItem = { id:'pouch-fixture', category:category.name, name:'Custom 3"×5" pouch', size:category.items[0].size, option:'250 pcs · gloss · black · Holo', price:312.5, quantity:1, addOns:[{name:'Holographic Upgrade',price:112.5}] }
  const config = resolveProductEdit(old, defaultPricing.products)!
  assert.equal(config.finish, 'gloss'); assert.equal(config.pouchColor, 'black')
  assert.deepEqual(config.addOns, ['Holographic Upgrade'])
  const corrected = { ...old, name: `${category.name} — ${old.size}`, addOns:[{name:'Holographic Upgrade',price:category.addOns.find(a=>a.name==='Holographic Upgrade')!.value*250}], productConfiguration:config }
  assert.equal(priceItem(corrected, defaultPricing).price, 312.5)
  const jar = { ...old, size:'2oz Jar + Custom Label', name:'Mylar Packaging — 2oz Jar + Custom Label', option:'250 pcs', price:812.5, addOns:[] }
  assert.equal(priceItem(jar,defaultPricing).price,812.5)
  assert.equal(resolveProductEdit({...jar,option:'250 jars with custom labels'},defaultPricing.products)?.pieces,250)
  assert.equal(resolveProductEdit({...old,option:'99 pcs · gloss · black · Holo'},defaultPricing.products),null)
})

test('edit links go to the matching configurator and carry only a known return destination', () => {
  assert.equal(cartEditHref(card, 'checkout'), '/services/business-print?edit=card-fixture&returnTo=checkout#shop')
  assert.equal(cartEditHref({...card,category:'Mylar Packaging'}), '/mylar?edit=card-fixture&returnTo=cart#configure')
  assert.equal(cartEditHref({...card,category:'Wall Graphics'}), null)
})
