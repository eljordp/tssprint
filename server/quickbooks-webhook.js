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
export async function processWebhookEvents() {
  const current = await getConnection()
  if (current?.status !== 'connected') return
  const ctx = { realmId: current.realm_id, environment: configuration().environment }
  const events = await supabaseFetch(`/rest/v1/quickbooks_webhook_events?realm_id=eq.${ctx.realmId}&processed_at=is.null&order=created_at.asc&limit=20`)
  for (const event of events) {
    try {
      let invoiceIds = [event.entity_id]
      if (event.entity === 'payment') {
        const data = await accountingRequest(`/payment/${event.entity_id}`, ctx)
        invoiceIds = [...new Set((data.Payment?.Line || []).flatMap(line => (line.LinkedTxn || []).filter(link => link.TxnType === 'Invoice' && id(link.TxnId)).map(link => String(link.TxnId))))]
        // A deleted/unlinked payment can still belong to a previously paid order.
        const previous = await supabaseFetch(`/rest/v1/quickbooks_checkouts?realm_id=eq.${ctx.realmId}&payment_ids=cs.${encodeURIComponent(JSON.stringify([event.entity_id]))}&select=invoice_id`)
        invoiceIds.push(...previous.map(row => row.invoice_id))
      }
      for (const invoiceId of [...new Set(invoiceIds)].filter(id)) {
        const [row] = await supabaseFetch(`/rest/v1/quickbooks_checkouts?environment=eq.${ctx.environment}&realm_id=eq.${ctx.realmId}&invoice_id=eq.${invoiceId}`)
        if (row) await refreshCheckout(row, { force: true })
      }
      await supabaseFetch(`/rest/v1/quickbooks_webhook_events?id=eq.${event.id}`, { method: 'PATCH', body: JSON.stringify({ processed_at: new Date().toISOString() }) })
    } catch { /* Durable event remains pending for a retry. */ }
  }
}

export async function boundedBody(req) {
  let size = 0; const chunks = []
  for await (const chunk of req) { const data = Buffer.from(chunk); size += data.length; if (size > 256000) throw new QuickBooksError('request_too_large', 413); chunks.push(data) }
  return Buffer.concat(chunks)
}
