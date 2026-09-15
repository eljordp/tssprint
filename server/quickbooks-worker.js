import { supabaseFetch } from './square-api.js'
import { QuickBooksError, digest } from './quickbooks-core.js'
import { processWebhookEvents } from './quickbooks-webhook.js'
import { reconcileCheckouts } from './quickbooks-checkout.js'
import { processQuickBooksDelivery } from './quickbooks-delivery.js'

// The database issues a fresh, short-lived, single-use token for each run.
// No customer token, provider credential or permanent scheduler secret is exposed.
export async function claimWorker(body, db = supabaseFetch) {
  if (!/^[0-9a-f-]{36}$/.test(body?.id || '') || !/^[0-9a-f]{64}$/.test(body?.token || '')) throw new QuickBooksError('invalid_worker_token', 401)
  const claimed = await db('/rest/v1/rpc/claim_quickbooks_worker', { method: 'POST', body: JSON.stringify({ p_id: body.id, p_token_hash: digest(body.token) }) })
  if (!claimed) throw new QuickBooksError('invalid_worker_token', 401)
  return body.id
}
export async function runWorker(id, { db = supabaseFetch, events = processWebhookEvents, reconcile = reconcileCheckouts, delivery = processQuickBooksDelivery } = {}) {
  const deadline = Date.now() + 35000
  try {
    // Deliver earlier paid orders first; a faulty invoice must not starve emails.
    const delivered = await delivery(null, { deadline })
    const webhook = await events({ deadline, limit: 3 })
    const checked = Date.now() < deadline ? await reconcile({ deadline, limit: 2 }) : 0
    const stats = { delivered, webhook, checked }
    await db(`/rest/v1/quickbooks_worker_runs?id=eq.${id}&status=eq.running`, { method: 'PATCH', body: JSON.stringify({ status: 'completed', finished_at: new Date().toISOString(), stats }) })
    return stats
  } catch (error) {
    await db(`/rest/v1/quickbooks_worker_runs?id=eq.${id}&status=eq.running`, { method: 'PATCH', body: JSON.stringify({ status: 'failed', finished_at: new Date().toISOString(), last_error: error instanceof QuickBooksError ? error.code : 'worker_failed' }) }).catch(() => {})
    throw error
  }
}
export async function workerHealth(db = supabaseFetch) {
  return db('/rest/v1/rpc/quickbooks_worker_health', { method: 'POST', body: '{}' })
}
