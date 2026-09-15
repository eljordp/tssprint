import { test } from 'node:test'
import assert from 'node:assert/strict'
import { orderingActivity, type OrderingSignal } from '../src/lib/orderingActivity.ts'
const signal = (event_type: string, second: number, session_id: string | null = 'session-a'): OrderingSignal => ({ visitor_id: 'browser-a', session_id, event_type, created_at: new Date(1000 * second).toISOString() })
test('direct checkout counts without a cart page or an upload', () => {
  const result = orderingActivity([signal('view_item', 1), signal('add_to_cart', 2), signal('begin_checkout', 3)])
  assert.deepEqual(result.stages.map(s => s.count), [1, 1, 1])
  assert.deepEqual(result.uploads.map(s => s.count), [0, 0, 0])
})
test('reloads and repeated events count a session once', () => {
  const result = orderingActivity([signal('view_item', 1), signal('view_item', 2), signal('add_to_cart', 3), signal('begin_checkout', 4), signal('begin_checkout', 5)])
  assert.deepEqual(result.stages.map(s => s.count), [1, 1, 1])
})
test('does not join different sessions or events in the wrong order', () => {
  const result = orderingActivity([signal('begin_checkout', 1), signal('view_item', 2), signal('add_to_cart', 3), signal('begin_checkout', 4, 'session-b')])
  assert.deepEqual(result.stages.map(s => s.count), [1, 1, 0])
})
test('unknown identity and invalid times are excluded and reported', () => {
  const result = orderingActivity([signal('view_item', 1, null), { ...signal('view_item', 1), created_at: 'invalid' }])
  assert.deepEqual(result.stages.map(s => s.count), [0, 0, 0])
  assert.equal(result.unidentified, 2)
})
test('failed upload then successful retry appears in both outcome groups', () => {
  const result = orderingActivity([signal('artwork_upload_started', 1), signal('artwork_upload_failed', 2), signal('artwork_upload_started', 3), signal('artwork_upload_succeeded', 4)])
  assert.deepEqual(result.uploads.map(s => s.count), [1, 1, 1])
})
