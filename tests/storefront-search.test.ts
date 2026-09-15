import test from 'node:test'
import assert from 'node:assert/strict'
import { searchStorefront } from '../src/lib/storefrontSearch.ts'

test('customer plural, multiword, case and whitespace searches reach the right service', () => {
  for (const query of ['signs', ' BUSINESS SIGNS ', 'storefront signs']) {
    assert.ok(searchStorefront(query).some(item => item.href === '/services/business-signage#shop'), query)
  }
  assert.ok(searchStorefront('sticker sheets').some(item => item.href === '/sticker-sheets'))
  assert.ok(searchStorefront('roll labels').some(item => item.href === '/roll-labels'))
  assert.ok(searchStorefront('car wraps').some(item => item.href === '/services/vehicle-graphics#quote'))
  assert.ok(searchStorefront('banners').some(item => item.name === 'Retractable Banners'))
})
test('empty, punctuation-only and unrelated queries do not return misleading results', () => {
  for (const query of ['', ' ', '?', '!!!', 'zebra spacecraft']) assert.deepEqual(searchStorefront(query), [])
})

test('common customer typos find relevant products without approximating sizes', () => {
  for (const [query, name] of [
    ['stikcers', 'Custom Stickers'], ['buisness cards', 'Business Cards'],
    ['holograhpic', 'Holographic Stickers'], ['roll lables', 'Roll Labels in Hayward'],
    ['banners', 'Retractable Banners'], ['singage', 'Business Signage'],
  ]) assert.ok(searchStorefront(query).some(item => item.name === name), query)
  assert.deepEqual(searchStorefront('99x99'), [])
  assert.equal(searchStorefront('business cards')[0].name, 'Business Cards')
})
