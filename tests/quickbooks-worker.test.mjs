import test from 'node:test'
import assert from 'node:assert/strict'
import { processWebhookEvents } from '../server/quickbooks-webhook.js'
import { claimWorker, runWorker } from '../server/quickbooks-worker.js'
import { QuickBooksError, digest } from '../server/quickbooks-core.js'

const connection = async () => ({ status: 'connected', realm_id: '123' })
const config = () => ({ environment: 'production' })
test('a locked checkout keeps its notification durable, then a later worker completes it', async () => {
  const event = { id: 'event-1', entity: 'invoice', entity_id: '3275', attempts: 0, processed_at: null }
  let busy = true, inspections = 0
  const db = async (path, options = {}) => {
    if (path.includes('claim_quickbooks_webhooks')) {
      if (event.processed_at || event.lease_id) return []
      event.attempts++; event.lease_id = `lease-${event.attempts}`
      return [structuredClone(event)]
    }
    if (path.startsWith('/rest/v1/quickbooks_checkouts')) return [{ id: 'checkout-1', invoice_id: '3275' }]
    assert.ok(path.includes(`lease_id=eq.${event.lease_id}`))
    Object.assign(event, JSON.parse(options.body)); return [event]
  }
  const refresh = async (_, options) => { assert.equal(options.force, true); inspections++; if (busy) throw new QuickBooksError('checkout_busy', 409) }
  assert.deepEqual(await processWebhookEvents({ db, connection, config, refresh }), { processed: 0, retried: 1 })
  assert.equal(event.processed_at, null); assert.equal(event.last_error, 'checkout_busy'); assert.equal(event.lease_id, null)
  assert.ok(Date.parse(event.next_attempt_at) > Date.now())
  busy = false
  assert.deepEqual(await processWebhookEvents({ db, connection, config, refresh }), { processed: 1, retried: 0 })
  assert.ok(event.processed_at); assert.equal(event.last_error, null)
  assert.deepEqual(await processWebhookEvents({ db, connection, config, refresh }), { processed: 0, retried: 0 })
  assert.equal(inspections, 2)
})
test('an expired batch budget releases claimed events for another run without acknowledging them', async () => {
  let patch
  const db = async (path, options) => path.includes('claim_quickbooks_webhooks') ? [{ id: 'e', lease_id: 'l', attempts: 1 }] : (patch = JSON.parse(options.body), [])
  const result = await processWebhookEvents({ db, connection, config, deadline: Date.now() - 1, refresh: () => assert.fail('must not inspect') })
  assert.equal(result.retried, 1); assert.equal(patch.last_error, 'worker_time_budget'); assert.equal(patch.processed_at, undefined); assert.equal(patch.lease_id, null)
})
test('deleted payments recheck invoices that previously referenced them', async () => {
  const seen = []
  const db = async (path) => path.includes('claim_quickbooks_webhooks') ? [{ id: 'e', lease_id: 'l', entity: 'payment', entity_id: '40', attempts: 1 }]
    : path.includes('payment_ids=cs') ? [{ invoice_id: '30' }] : path.includes('quickbooks_checkouts') ? [{ invoice_id: '30' }] : []
  await processWebhookEvents({ db, connection, config, call: async () => { throw Object.assign(new Error(), { providerStatus: 404 }) }, refresh: async (row, opts) => { seen.push(row.invoice_id); assert.equal(opts.force, true) } })
  assert.deepEqual(seen, ['30'])
})
test('worker authentication sends only the token hash to an atomic single-use claim', async () => {
  const body = { id: '12345678-1234-4234-8234-123456789012', token: 'a'.repeat(64) }
  let used = false
  const db = async (_, options) => { const p = JSON.parse(options.body); assert.equal(p.p_token_hash, digest(body.token)); assert.equal(p.p_id, body.id); if (used) return false; used = true; return true }
  await assert.rejects(claimWorker({ id: body.id, token: 'short' }, () => assert.fail()), { code: 'invalid_worker_token' })
  assert.equal(await claimWorker(body, db), body.id)
  await assert.rejects(claimWorker(body, db), { code: 'invalid_worker_token' })
})
test('worker finishes earlier order follow-ups before processing later notifications and records its result', async () => {
  const stages = [], writes = []
  const db = async (_, options) => { writes.push(JSON.parse(options.body)); return [] }
  const result = await runWorker('run', { db, delivery: async () => { stages.push('delivery'); return 2 }, events: async () => { stages.push('events'); return { processed: 1, retried: 0 } }, reconcile: async () => { stages.push('poll'); return 1 } })
  assert.deepEqual(stages, ['delivery','events','poll']); assert.equal(result.checked, 1); assert.equal(writes[0].status, 'completed')
})
test('worker outages remain visible and do not report a successful run', async () => {
  const writes = []
  await assert.rejects(runWorker('run', { db: async (_, options) => { writes.push(JSON.parse(options.body)); return [] }, delivery: async () => { throw new Error('private provider details') } }))
  assert.equal(writes[0].status, 'failed'); assert.equal(writes[0].last_error, 'worker_failed'); assert.doesNotMatch(JSON.stringify(writes), /private provider details/)
})
