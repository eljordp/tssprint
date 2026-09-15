import { supabaseFetch, requireAdmin, readBody, sendJson } from './square-api.js'
import { requireTrustedBrowserRequest, consumeRateLimit } from './request-guards.js'
import { waitUntil } from '@vercel/functions'
import { processWebhookEvents } from './quickbooks-webhook.js'
import { reconcileCheckouts } from './quickbooks-checkout.js'
import { processQuickBooksDelivery } from './quickbooks-delivery.js'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
export function emailPayload(job, lead, env) {
  // Keep private storage paths out of notification content.
  const message = String(lead.message || '').split('\nArtwork file reference: ')[0]
  const artwork = String(lead.message || '').includes('\nArtwork file reference: ') ? '\nArtwork attached; available in Admin → Quotes.' : ''
  const details = `<p>${escape(lead.service)}</p><p style="white-space:pre-wrap">${escape(message + artwork)}</p>`
  if (job.kind === 'staff_email') return {
    from: env.FROM_EMAIL,
    to: (env.CONTACT_NOTIFICATION_EMAILS || env.CONTACT_OWNER_EMAIL || 'mrjxrdip@icloud.com,thestickersmith@gmail.com').split(',').map(s => s.trim()).filter(Boolean),
    reply_to: lead.email,
    subject: `New Quote Request from ${String(lead.name).replace(/[\r\n]/g, ' ')}`,
    html: `<h2>New quote request</h2><p>${escape(lead.name)} · ${escape(lead.email)} · ${escape(lead.phone)}</p>${details}<p><a href="https://tssprint.com/admin?tab=inquiries">Open quotes</a></p>`,
  }
  return { from: env.FROM_EMAIL, to: [lead.email], subject: 'We received your quote request!',
    html: `<h2>Thanks for reaching out, ${escape(lead.name)}!</h2><p>Your quote request is saved. The team will reply by email with availability and next steps.</p>${details}<p>The Sticker Smith</p>` }
}

export function needsSendReview(job, now = Date.now()) {
  // Leave an hour of margin inside the provider's 24-hour deduplication window.
  return !!job.first_send_at && now - Date.parse(job.first_send_at) >= 23 * 60 * 60 * 1000
}

export async function processContactJobs(leadId = null, { db = supabaseFetch, send = fetch, env = process.env, now = Date.now } = {}) {
  const jobs = await db('/rest/v1/rpc/claim_contact_delivery', { method: 'POST', body: JSON.stringify({ _lead_id: leadId }) })
  const outcomes = []
  for (const job of jobs) {
    const patch = async values => {
      const rows = await db(`/rest/v1/contact_delivery_jobs?id=eq.${job.id}&lease_id=eq.${job.lease_id}&status=eq.processing`, {
        method: 'PATCH', body: JSON.stringify({ ...values, updated_at: new Date(now()).toISOString() }),
      })
      if (!rows?.length) throw new Error('Lease lost')
    }
    try {
      if (job.kind.endsWith('_email') && needsSendReview(job, now())) {
        await patch({ status: 'needs_review', last_error: 'Send outcome is uncertain beyond the safe retry window. Check Resend before any resend.' })
        outcomes.push('needs_review'); continue
      }
      const [lead] = await db(`/rest/v1/contact_submissions?id=eq.${job.lead_id}&select=name,email,phone,service,message,source,subscribe_requested,subscription_tags`)
      if (!lead) throw new Error('Lead unavailable')
      if (job.kind === 'customer_sync') {
        const parts = String(lead.name || '').trim().split(/\s+/)
        await db('/rest/v1/rpc/get_or_create_customer', { method: 'POST', body: JSON.stringify({ _email: lead.email, _first_name: parts[0] || null, _last_name: parts.slice(1).join(' ') || null, _phone: lead.phone, _source: lead.source }) })
      } else if (job.kind === 'subscription') {
        const applied = await db('/rest/v1/rpc/apply_contact_subscription', { method: 'POST', body: JSON.stringify({ _lead_id: job.lead_id }) })
        if (!applied) {
          await patch({ status: 'skipped', last_error: 'Subscription not applied: no opt-in or an existing unsubscribe was preserved.' })
          outcomes.push('skipped'); continue
        }
      } else {
        if (!env.RESEND_API_KEY || !env.FROM_EMAIL) throw new Error('Email configuration missing')
        const payload = job.request_payload || emailPayload(job, lead, env)
        const firstSend = job.first_send_at || new Date(now()).toISOString()
        // Store the exact provider request BEFORE sending, including recipients.
        await patch({ request_payload: payload, first_send_at: firstSend })
        const response = await send('https://api.resend.com/emails', {
          method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact-${job.id}` },
          body: JSON.stringify(payload), signal: AbortSignal.timeout(5000),
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.id) throw new Error(`Email provider ${response.status}`)
        await patch({ status: 'accepted', provider_id: data.id, last_error: null })
        outcomes.push('accepted'); continue
      }
      await patch({ status: 'completed', last_error: null })
      outcomes.push('completed')
    } catch {
      // Do not store provider bodies, customer data or secrets in diagnostic messages.
      const status = job.attempts >= 8 ? 'needs_review' : 'retry'
      await patch({ status, next_attempt_at: new Date(now() + Math.min(60, 2 ** job.attempts) * 60000).toISOString(), last_error: status === 'needs_review' ? 'Repeated failure. Staff review required.' : 'Attempt failed. Pending retry; check provider logs if this persists.' }).catch(() => {})
      outcomes.push(status)
    }
  }
  return outcomes
}

export default async function contactDeliveryHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') {
      if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return sendJson(res, 401, { error: 'Unauthorized' })
      waitUntil(processWebhookEvents().then(() => reconcileCheckouts()).then(() => processQuickBooksDelivery()).catch(() => console.warn('QuickBooks backup processing requires review')))
      const started = Date.now()
      let processed = 0
      for (let batch = 0; batch < 20 && Date.now() - started < 25000; batch++) {
        const outcomes = await processContactJobs()
        processed += outcomes.length
        if (!outcomes.length) break
      }
      return sendJson(res, 200, { processed })
    }
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
    requireTrustedBrowserRequest(req)
    const rate = consumeRateLimit(req, { key: 'contact-delivery', limit: 12, windowMs: 60000 })
    if (!rate.allowed) return sendJson(res, 429, { error: 'Please try again shortly.' })
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || await readBody(req)
    if (body.admin === true) {
      try { await requireAdmin(req) } catch { return sendJson(res, 403, { error: 'Admin access required.' }) }
      return sendJson(res, 200, { processed: (await processContactJobs()).length })
    }
    if (!uuid.test(body.leadId || '')) return sendJson(res, 400, { error: 'Invalid request' })
    await processContactJobs(body.leadId)
    // Do not expose recipient details or job existence on a public endpoint.
    return sendJson(res, 200, { success: true })
  } catch (error) {
    if (error.status === 403) return sendJson(res, 403, { error: 'Start this request from tssprint.com.' })
    return sendJson(res, 503, { error: 'Delivery processing unavailable. Saved requests remain queued.' })
  }
}
