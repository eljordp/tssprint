import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { Webhook } from 'svix'
import { acceptResendDelivery, summarizeDelivery, emailDeliveryDetails } from '../server/resend-delivery.js'
import { listCheckouts } from '../server/quickbooks-checkout.js'
import handler from '../api/quickbooks/[action].js'
import { Readable } from 'node:stream'
const secret = `whsec_${randomBytes(32).toString('base64')}`
const emailId = '4be65515-9899-4c52-90c1-f9e65a37014d'
function fixture(type = 'email.delivered', date = new Date()) {
  const raw = JSON.stringify({ type, created_at: date.toISOString(), data: { email_id: emailId, to: ['private@example.com'], subject: 'private', html: 'private' } })
  const headers = { 'svix-id': 'msg_signed_test', 'svix-timestamp': String(Math.floor(date.getTime() / 1000)), 'svix-signature': new Webhook(secret).sign('msg_signed_test', date, raw) }
  return { raw: Buffer.from(raw), headers }
}
test('signed delivery is durable, minimal, and replay-idempotent even before the send job exists', async () => {
  const f = fixture(), records = new Map()
  const db = async (path, options) => {
    assert.equal(path, '/rest/v1/resend_delivery_events?on_conflict=id')
    assert.equal(options.headers.Prefer, 'resolution=ignore-duplicates,return=minimal')
    const record = JSON.parse(options.body)
    if (!records.has(record.id)) records.set(record.id, record)
  }
  await acceptResendDelivery(f.raw, f.headers, { secret, db })
  await acceptResendDelivery(f.raw, f.headers, { secret, db })
  assert.equal(records.size, 1)
  assert.equal(records.get('msg_signed_test').provider_id, emailId)
  assert.doesNotMatch(JSON.stringify([...records.values()]), /private|subject|html|@/)
})
test('unsigned, tampered, stale and unconfigured requests cannot write data', async () => {
  const f = fixture(), db = () => assert.fail('must not write')
  for (const [raw, headers] of [[f.raw, {}], [Buffer.from(f.raw + ' '), f.headers], [fixture('email.delivered', new Date(Date.now() - 600000)).raw, fixture('email.delivered', new Date(Date.now() - 600000)).headers]]) {
    await assert.rejects(acceptResendDelivery(raw, headers, { secret, db }), error => error.code === 'invalid_signature')
  }
  await assert.rejects(acceptResendDelivery(f.raw, f.headers, { secret: '', db }), error => error.code === 'email_tracking_not_configured')
})
test('unsupported signed events are ignored and bad IDs are rejected', async () => {
  const f = fixture('email.opened')
  assert.equal((await acceptResendDelivery(f.raw, f.headers, { secret, db: () => assert.fail('no write') })).ignored, true)
  const raw = Buffer.from(fixture().raw.toString().replace(emailId, 'bad'))
  const date = new Date(); const headers = { 'svix-id': 'msg_signed_test', 'svix-timestamp': String(Math.floor(date.getTime() / 1000)), 'svix-signature': new Webhook(secret).sign('msg_signed_test', date, raw.toString()) }
  await assert.rejects(acceptResendDelivery(raw, headers, { secret }), error => error.code === 'invalid_email_event')
})
test('out-of-order progress cannot hide delivery, and mixed-recipient problems remain visible', () => {
  const event = (type, occurred_at) => ({ event_type: `email.${type}`, occurred_at })
  const events = [event('delivered', '2026-09-16T01:00:00.000Z'), event('sent', '2026-09-16T02:00:00.000Z'), event('delivery_delayed', '2026-09-16T03:00:00.000Z')]
  assert.equal(summarizeDelivery(events).status, 'delivered')
  events.push(event('bounced', '2026-09-16T01:00:00.000Z'))
  assert.equal(summarizeDelivery(events).status, 'bounced')
  assert.equal(summarizeDelivery(events).deliveryReported, true)
  events.push(event('complained', '2026-09-16T04:00:00.000Z'))
  assert.equal(summarizeDelivery(events).status, 'complained')
})
test('read failures leave payment and send evidence visible with tracking unavailable', async () => {
  const jobs = [{ kind: 'customer_email', status: 'accepted', provider_id: emailId }]
  const result = await emailDeliveryDetails(jobs, { db: async () => { throw new Error('unavailable') }, env: { RESEND_WEBHOOK_SECRET: 'configured' } })
  assert.equal(result.available, false)
  assert.equal(result.jobs[0].status, 'accepted')
  assert.equal(result.jobs[0].delivery, null)
})
test('admin lists accepted receipt jobs scoped to the displayed company checkouts', async () => {
  const id = 'c8197469-4b88-428f-8fd7-114ede1a4bbe'
  const db = async path => {
    if (path.startsWith('/rest/v1/quickbooks_checkouts?')) { assert.match(path, /realm_id=eq.123/); return [{ id, checkout: { customer: {}, items: [] } }] }
    if (path.startsWith('/rest/v1/quickbooks_delivery_jobs?')) { assert.ok(path.includes(`checkout_id=in.(${id})`)); assert.doesNotMatch(path, /status=in/); return [{ checkout_id: id, kind: 'customer_email', status: 'accepted', provider_id: emailId }] }
    assert.ok(path.includes(`provider_id=in.(${emailId})`))
    return [{ provider_id: emailId, event_type: 'email.delivered', occurred_at: new Date().toISOString() }]
  }
  const rows = await listCheckouts({ db, context: async () => ({ environment: 'production', realmId: '123' }), env: {} })
  assert.equal(rows[0].jobs[0].delivery.status, 'delivered')
  assert.equal(rows[0].jobs[0].status, 'accepted')
})
test('public callback route rejects GET and unsigned POST without admin or side effects', async () => {
  const previous = process.env.RESEND_WEBHOOK_SECRET; process.env.RESEND_WEBHOOK_SECRET = secret
  try {
    for (const [method, expected] of [['GET', 405], ['POST', 401]]) {
      const req = Readable.from(['{}']); Object.assign(req, { method, url: '/api/quickbooks/email-webhook', headers: {} })
      const res = { setHeader() {}, end(body) { this.body = body } }
      await handler(req, res); assert.equal(res.statusCode, expected)
    }
  } finally { if (previous === undefined) delete process.env.RESEND_WEBHOOK_SECRET; else process.env.RESEND_WEBHOOK_SECRET = previous }
})
