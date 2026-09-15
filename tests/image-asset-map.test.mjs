import test from 'node:test'
import assert from 'node:assert/strict'
import { imageReplacements } from '../scripts/image-asset-map.mjs'

test('refreshes cross-platform hashes only for the same image and dimensions', () => {
  const old = { 'photo-old.webp': 'photo:240:160:webp' }
  const current = { 'photo-new.webp': 'photo:240:160:webp', 'photo-large.webp': 'photo:960:640:webp', 'other.webp': 'other:240:160:webp' }
  assert.equal(imageReplacements(old, current).get('photo-old.webp'), 'photo-new.webp')
})

test('preserves existing references and refuses missing or ambiguous matches', () => {
  const old = { 'same.webp': 'photo:240:160:webp', 'missing.webp': 'missing:240:160:webp', 'old.webp': 'photo:240:160:webp' }
  const current = { 'same.webp': 'photo:240:160:webp', 'duplicate.webp': 'photo:240:160:webp' }
  assert.equal(imageReplacements(old, current).size, 0)
})
