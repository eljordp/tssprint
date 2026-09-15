import test from 'node:test'
import assert from 'node:assert/strict'
import { processContactJobs, emailPayload, needsSendReview } from '../server/contact-delivery.js'
const now = Date.parse('2026-09-15T05:00:00Z')
const lead = { name: '<QA>', email: 'qa@example.com', message: 'Quote\nArtwork file reference: {"path":"secret"}', phone: null, source: 'contact', service: 'Cards', subscribe_requested: true }
const env = { RESEND_API_KEY: 'test', FROM_EMAIL: 'Shop <shop@example.com>', CONTACT_NOTIFICATION_EMAILS: 'staff@example.com' }
const job = (kind, extra = {}) => ({ id: kind, lead_id: 'lead', lease_id: 'lease', kind, status: 'processing', attempts: 1, ...extra })
function setup(jobs, options = {}) {
  const sends = [], patches = []
  const db = async (path, init) => {
    if (path.includes('claim_contact_delivery')) return jobs
    if (path.includes('contact_submissions?')) return [lead]
    if (path.includes('contact_delivery_jobs?')) {
      const data = JSON.parse(init.body); patches.push(data)
      if (options.loseLease) return []
      return [data]
    }
    if (path.includes('apply_contact_subscription')) return !options.unsubscribed
    if (options.crmFails) throw new Error('CRM unavailable')
    return true
  }
  const send = async (url, init) => {
    sends.push({ body: JSON.parse(init.body), key: init.headers['Idempotency-Key'] })
    if (options.sendFails && sends.length === 1) throw new Error('timeout')
    return { ok: true, status: 200, json: async () => ({ id: 'provider-id' }) }
  }
  return { sends, patches, run: () => processContactJobs(null, { db, send, env, now: () => now }) }
}
test('staff failure does not prevent customer email acceptance', async () => {
  const t = setup([job('staff_email'), job('customer_email')], { sendFails: true })
  assert.deepEqual(await t.run(), ['retry', 'accepted'])
  assert.equal(t.sends.length, 2)
  assert.equal(t.patches.at(-1).provider_id, 'provider-id')
})
test('provider request is saved before send and reused exactly after a crash', async () => {
  const frozen = { from: 'old@example.com', to: ['original@example.com'], subject: 'Original', html: 'Original' }
  const t = setup([job('customer_email', { request_payload: frozen, first_send_at: new Date(now - 10000).toISOString() })])
  await t.run()
  assert.deepEqual(t.sends[0].body, frozen)
  assert.equal(t.sends[0].key, 'contact-customer_email')
  assert.deepEqual(t.patches[0].request_payload, frozen)
})
test('uncertain sends beyond the safe retry window stop for review without sending', async () => {
  const t = setup([job('customer_email', { first_send_at: new Date(now - 24 * 3600000).toISOString() })])
  assert.deepEqual(await t.run(), ['needs_review'])
  assert.equal(t.sends.length, 0)
  assert.equal(needsSendReview({ first_send_at: null }, now), false)
})
test('lost lease prevents email submission', async () => {
  const t = setup([job('customer_email')], { loseLease: true })
  await t.run()
  assert.equal(t.sends.length, 0)
})
test('unsubscribe is preserved as skipped while other jobs proceed', async () => {
  const t = setup([job('subscription'), job('customer_sync')], { unsubscribed: true })
  assert.deepEqual(await t.run(), ['skipped', 'completed'])
})
test('CRM failure is isolated from notifications', async () => {
  const t = setup([job('customer_sync'), job('customer_email')], { crmFails: true })
  assert.deepEqual(await t.run(), ['retry', 'accepted'])
})
test('email escapes customer HTML and omits storage paths', () => {
  const p = emailPayload(job('staff_email'), lead, env)
  assert.match(p.html, /&lt;QA&gt;/)
  assert.doesNotMatch(p.html, /secret|Artwork file reference/)
  assert.deepEqual(p.to, ['staff@example.com'])
})

test('worker endpoint rejects unauthenticated cron, admin and cross-site requests', async () => {
  const { default: handler } = await import('../server/contact-delivery.js')
  const cases = [
    [{ method: 'GET', headers: {} }, 401],
    [{ method: 'POST', headers: { origin: 'https://elsewhere.example', host: 'tssprint.com' }, body: {} }, 403],
    [{ method: 'POST', headers: { origin: 'https://tssprint.com', host: 'tssprint.com' }, body: { admin: true } }, 403],
    [{ method: 'POST', headers: { origin: 'https://tssprint.com', host: 'tssprint.com' }, body: { leadId: 'not-a-uuid' } }, 400],
  ]
  for (const [req, status] of cases) {
    const res = { setHeader() {}, end(body) { this.body = JSON.parse(body) } }
    await handler(req, res)
    assert.equal(res.statusCode, status)
  }
})
