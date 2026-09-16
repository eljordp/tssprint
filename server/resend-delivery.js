import { Webhook } from 'svix'
import { supabaseFetch } from './square-api.js'
import { QuickBooksError } from './quickbooks-core.js'

export const DELIVERY_EVENTS = ['email.sent', 'email.delivered', 'email.delivery_delayed', 'email.bounced', 'email.failed', 'email.complained', 'email.suppressed']
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)

export async function acceptResendDelivery(raw, headers, { db = supabaseFetch, secret = process.env.RESEND_WEBHOOK_SECRET } = {}) {
  if (!secret) throw new QuickBooksError('email_tracking_not_configured', 503)
  let event
  try { new Webhook(secret).verify(raw.toString('utf8'), headers) }
  catch { throw new QuickBooksError('invalid_signature', 401) }
  try { event = JSON.parse(raw.toString('utf8')) }
  catch { throw new QuickBooksError('invalid_email_event', 400) }
  if (!DELIVERY_EVENTS.includes(event?.type)) return { received: true, ignored: true }
  const eventId = headers['svix-id']
  if (typeof eventId !== 'string' || eventId.length > 200 || !uuid(event.data?.email_id) || !Number.isFinite(Date.parse(event.created_at))) throw new QuickBooksError('invalid_email_event', 400)
  // Store no recipient addresses, subject, body, or links. Preserve unmatched events:
  // the callback can arrive before the sender saves its provider ID.
  await db('/rest/v1/resend_delivery_events?on_conflict=id', {
    method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify({ id: eventId, provider_id: event.data.email_id, event_type: event.type, occurred_at: new Date(event.created_at).toISOString() }),
  })
  return { received: true }
}

export function summarizeDelivery(events) {
  // Never let a late/replayed "sent" or "delayed" callback downgrade delivery.
  // A problem on any recipient remains visible, including mixed staff outcomes.
  const precedence = ['email.complained', 'email.bounced', 'email.suppressed', 'email.failed', 'email.delivered', 'email.delivery_delayed', 'email.sent']
  const type = precedence.find(type => events.some(event => event.event_type === type))
  if (!type) return null
  const occurredAt = events.filter(event => event.event_type === type).map(event => event.occurred_at).sort().at(-1)
  return { status: type.slice(6), occurredAt, deliveryReported: events.some(event => event.event_type === 'email.delivered') }
}

export async function emailDeliveryDetails(jobs, { db = supabaseFetch, env = process.env } = {}) {
  const ids = [...new Set(jobs.filter(job => ['customer_email', 'staff_email'].includes(job.kind) && uuid(job.provider_id)).map(job => job.provider_id))]
  let events = [], available = true
  try {
    if (ids.length) events = await db(`/rest/v1/resend_delivery_status?provider_id=in.(${ids.join(',')})&select=provider_id,event_type,occurred_at&limit=1000`)
  } catch { available = false }
  return {
    configured: Boolean(env.RESEND_WEBHOOK_SECRET), available,
    jobs: jobs.map(job => ({ ...job, delivery: summarizeDelivery(events.filter(event => event.provider_id === job.provider_id)) })),
  }
}
