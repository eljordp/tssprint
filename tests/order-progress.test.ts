import test from 'node:test'
import assert from 'node:assert/strict'
import { orderProgress, orderSupportLink } from '../src/lib/orderProgress.ts'

test('processing does not claim proof approval or production', () => {
  const progress = orderProgress('processing')
  assert.equal(progress.label, 'Order received')
  assert.match(progress.detail, /does not confirm proof approval/)
})
test('unknown status is not promoted to received, approved or complete', () => {
  for (const status of ['', 'paid', 'approved', 'unexpected']) {
    assert.equal(orderProgress(status).label, 'Contact shop for status')
  }
})
test('fulfillment states describe the recorded event without claiming delivery', () => {
  assert.equal(orderProgress('shipped').label, 'Shipped')
  assert.match(orderProgress('completed').detail, /ready-for-pickup message/)
})
test('order support link preserves the reference without injecting mail headers', () => {
  const url = new URL(orderSupportLink('order-123&bcc=other@example.com'))
  assert.equal(url.pathname, 'thestickersmith@gmail.com')
  assert.equal(url.searchParams.get('bcc'), null)
  assert.match(url.searchParams.get('subject') || '', /order-123&bcc=other@example.com/)
})
