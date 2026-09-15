import crypto from 'node:crypto'
import { supabaseFetch } from './square-api.js'
import { accountingRequest, configuration, getConnection } from './quickbooks-api.js'
import { refreshCheckout } from './quickbooks-checkout.js'
import { QuickBooksError, digest } from './quickbooks-core.js'
const id = value => /^\d{1,32}$/.test(String(value || ''))
export function validSignature(raw, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false
  const expected = crypto.createHmac('sha256', secret).update(raw).digest()
  const received = Buffer.from(signature, 'base64')
  return expected.length === received.length && crypto.timingSafeEqual(expected, received)
}
export function changedCompanies(data) {
  const companies = new Set()
  // CloudEvents v1 is Intuit's current format; retain the legacy envelope too.
  if (Array.isArray(data)) for (const event of data) {
    if (event.specversion === '1.0' && /^qbo\.(invoice|payment)\.[a-z]+\.v1$/.test(event.type || '') && id(event.intuitaccountid)) companies.add(String(event.intuitaccountid))
  }
  else for (const event of data.eventNotifications || []) {
    if (id(event.realmId) && event.dataChangeEvent?.entities?.some(entity => ['Invoice','Payment'].includes(entity.name))) companies.add(String(event.realmId))
  }
  return [...companies]
}
export async function acceptWebhook(raw, signature) {
  if (!validSignature(raw, signature, process.env.QUICKBOOKS_WEBHOOK_VERIFIER)) throw new QuickBooksError('invalid_signature', 401)
  const data = JSON.parse(raw.toString('utf8'))
  const changes = changedCompanies(data)
  const connection = await getConnection()
  if (connection?.status !== 'connected' || !changes.includes(connection.realm_id)) return false
  const events = Array.isArray(data) ? data.map(event => ({ realm: event.intuitaccountid, entity: String(event.type).split('.')[1], entityId: event.intuitentityid, eventId: event.id }))
    : (data.eventNotifications || []).flatMap(event => (event.dataChangeEvent?.entities || []).map(entity => ({ realm: event.realmId, entity: String(entity.name).toLowerCase(), entityId: entity.id, eventId: `${entity.name}:${entity.id}:${entity.lastUpdated}:${entity.operation}` })))
  const records = events.filter(event => String(event.realm) === connection.realm_id && ['invoice','payment'].includes(event.entity) && id(event.entityId)).map(event => ({ id: digest(`${event.realm}:${event.eventId || raw.toString('utf8')}`), realm_id: String(event.realm), entity: event.entity, entity_id: String(event.entityId) }))
  if (records.length) await supabaseFetch('/rest/v1/quickbooks_webhook_events?on_conflict=id', { method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: JSON.stringify(records) })
  return records.length > 0
}
export async function processWebhookEvents({ db = supabaseFetch, connection = getConnection, config = configuration, call = accountingRequest, refresh = refreshCheckout, deadline = Date.now() + 35000, limit = 3 } = {}) {
  const current = await connection()
  if (current?.status !== 'connected') return { processed: 0, retried: 0 }
  const ctx = { realmId: current.realm_id, environment: config().environment }
  const events = await db('/rest/v1/rpc/claim_quickbooks_webhooks', { method: 'POST', body: JSON.stringify({ p_realm_id: ctx.realmId, p_limit: limit }) })
  let processed = 0, retried = 0
  const boundedCall = (path, options) => {
    if (Date.now() >= deadline) throw new QuickBooksError('worker_time_budget')
    return call(path, { ...options, deadline })
  }
  for (const event of events) {
    const patch = values => db(`/rest/v1/quickbooks_webhook_events?id=eq.${event.id}&lease_id=eq.${event.lease_id}`, { method: 'PATCH', body: JSON.stringify({ ...values, lease_id: null, lease_until: null }) })
    try {
      if (Date.now() >= deadline) throw new QuickBooksError('worker_time_budget')
      let invoiceIds = [event.entity_id]
      if (event.entity === 'payment') {
        let data = {}
        try { data = await boundedCall(`/payment/${event.entity_id}`, ctx) }
        catch (error) { if (error.providerStatus !== 404) throw error }
        invoiceIds = [...new Set((data.Payment?.Line || []).flatMap(line => (line.LinkedTxn || []).filter(link => link.TxnType === 'Invoice' && id(link.TxnId)).map(link => String(link.TxnId))))]
        const previous = await db(`/rest/v1/quickbooks_checkouts?realm_id=eq.${ctx.realmId}&payment_ids=cs.${encodeURIComponent(JSON.stringify([event.entity_id]))}&select=invoice_id`)
        invoiceIds.push(...previous.map(row => row.invoice_id))
      }
      for (const invoiceId of [...new Set(invoiceIds)].filter(id)) {
        const [row] = await db(`/rest/v1/quickbooks_checkouts?environment=eq.${ctx.environment}&realm_id=eq.${ctx.realmId}&invoice_id=eq.${invoiceId}`)
        if (row) await refresh(row, { force: true, db, call: boundedCall, context: async () => ctx })
        // A notification may arrive before invoice creation saves its ID locally.
        // Polling of saved unpaid invoices is the independent recovery path.
      }
      await patch({ processed_at: new Date().toISOString(), last_error: null })
      processed++
    } catch (error) {
      const code = error instanceof QuickBooksError ? error.code : 'webhook_processing_failed'
      const delay = code === 'checkout_busy' || code === 'worker_time_budget' ? 1 : Math.min(30, 2 ** Math.min(event.attempts, 5))
      await patch({ last_error: code, next_attempt_at: new Date(Date.now() + delay * 60000).toISOString() })
      retried++
    }
  }
  return { processed, retried }
}

export async function boundedBody(req) {
  let size = 0; const chunks = []
  for await (const chunk of req) { const data = Buffer.from(chunk); size += data.length; if (size > 256000) throw new QuickBooksError('request_too_large', 413); chunks.push(data) }
  return Buffer.concat(chunks)
}
