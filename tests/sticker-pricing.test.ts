import assert from 'node:assert/strict'
import test from 'node:test'
import { defaultStickerBasePrices, getBasePrice, getStickerPrice, isValidStickerQuantity, formatPriceAdjustment } from '../src/lib/stickerPricing.js'

const config = { basePrices: defaultStickerBasePrices }

test('preserves all advertised preset totals, including the open-ended tier', () => {
  for (const [qty, expected] of [[50, 47.50], [100, 62], [250, 117.50], [500, 190], [1000, 310], [2500, 700], [5000, 1400]]) {
    assert.equal(getStickerPrice(qty, config).subtotal, expected)
  }
  assert.equal(getStickerPrice(100, config, 1.3).subtotal, 80.60)
})

test('custom quantities interpolate totals across every tier boundary', () => {
  for (const [qty, expected] of [[51, 47.79], [75, 54.75], [99, 61.71], [101, 62.37], [251, 117.79], [501, 190.24], [1001, 310.26], [2501, 700.28]]) {
    assert.equal(getStickerPrice(qty, config).subtotal, expected, `${qty} stickers`)
  }
})

test('preserves existing half-cent rounding in material and size preset quotes', () => {
  for (const [qty, size, material, expected] of [[50, 1.3, 0.9, 55.57], [50, 1.65, 1.4, 109.72], [250, 1.25, 1, 146.87], [250, 1.85, 1.8, 391.27]]) {
    assert.equal(getStickerPrice(qty, config, size, material).subtotal, expected)
  }
})

test('adding pieces never lowers total or increases the unrounded per-piece rate', () => {
  for (const size of [1, 1.15, 1.3, 1.7, 2.5, 3]) {
    for (const material of [0.9, 1, 1.4, 1.8, 2]) {
      let previousTotal = 0
      let previousUnit = Infinity
      for (let qty = 50; qty <= 10000; qty++) {
        const current = getStickerPrice(qty, config, size, material).subtotal
        const unit = getBasePrice(qty, config)
        assert.ok(current >= previousTotal, `total fell at ${qty}, ${size}, ${material}`)
        assert.ok(unit <= previousUnit + 1e-10, `unit price rose at ${qty}`)
        previousTotal = current
        previousUnit = unit
      }
    }
  }
})

test('displayed adjustments sum exactly to the subtotal in cents', () => {
  for (const qty of [50, 51, 73, 100, 101, 249, 251, 1001, 2500]) {
    for (const size of [1, 1.15, 1.3, 1.65, 2.3]) {
      for (const material of [0.9, 1.4, 1.8, 2]) {
        const price = getStickerPrice(qty, config, size, material)
        const cents = [price.baseTotal, price.sizeAdjustment, price.materialAdjustment].reduce((sum, value) => sum + Math.round(value * 100), 0)
        assert.equal(cents, Math.round(price.subtotal * 100))
      }
    }
  }
  assert.equal(formatPriceAdjustment(getStickerPrice(50, config, 1, 0.9).materialAdjustment), '−$4.75')
  assert.equal(formatPriceAdjustment(19), '+$19.00')
})

test('uses saved admin rates rather than hardcoding default totals', () => {
  const custom = { basePrices: defaultStickerBasePrices.map(tier => ({ ...tier, price: tier.price * 2 })) }
  assert.equal(getStickerPrice(51, custom).subtotal, 95.58)
  assert.equal(getStickerPrice(2500, custom).subtotal, 1400)
  assert.deepEqual(defaultStickerBasePrices, config.basePrices)
})

test('defends against decreasing totals in legacy admin configurations', () => {
  const custom = { basePrices: [{ maxQty: 50, price: 1 }, { maxQty: 100, price: 0.1 }, { maxQty: Infinity, price: 0.01 }] }
  for (const qty of [50, 51, 100, 101, 2500, 2501]) {
    assert.equal(getStickerPrice(qty, custom).subtotal, 50)
  }
})

test('rejects fractional, below-minimum, and unsafe quantities', () => {
  for (const qty of [NaN, Infinity, -1, 0, 49, 50.5, 51.9, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(isValidStickerQuantity(qty), false)
  }
  for (const qty of [50, 51, 2500, 10000]) assert.equal(isValidStickerQuantity(qty), true)
})
