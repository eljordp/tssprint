import { supabaseFetch } from './square-api.js'
import { markCartPaid } from './cart-api.js'
const needsSendReview = job => !!job.first_send_at && Date.now() - Date.parse(job.first_send_at) >= 23 * 3600000
const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
export function orderEmailPayload(row, kind, env) {
  const c = row.checkout.customer
  const lines = row.checkout.items.map(item => `<li>${escape(item.category || item.name)} · ${escape(item.option)} · ${escape(item.size)} · ${item.quantity} batch(es)${item.addOns.length ? ` · ${escape(item.addOns.map(a => a.name).join(', '))}` : ''}</li>`).join('')
  const details = `<p>Order ${escape(row.order_id)} · QuickBooks invoice ${escape(row.invoice_number)}</p><ul>${lines}</ul><p>Subtotal: $${row.checkout.subtotal.toFixed(2)}<br>Discount: $${row.checkout.discount.toFixed(2)}<br>Tax: $${Number(row.tax).toFixed(2)}<br>Total: $${Number(row.total).toFixed(2)}</p>`
  const next = '<p>Payment is recorded in QuickBooks. Artwork review, proof approval and production are separate steps. Nothing prints until the proof is approved.</p>'
  if (kind === 'staff_email') return { from: env.FROM_EMAIL, to: (env.CONTACT_NOTIFICATION_EMAILS || env.CONTACT_OWNER_EMAIL || 'mrjxrdip@icloud.com,thestickersmith@gmail.com').split(',').map(s => s.trim()).filter(Boolean), reply_to: c.email,
    subject: `Paid website order ${row.order_id}`, html: `<h2>Website order received</h2><p>${escape(c.firstName)} ${escape(c.lastName)} · ${escape(c.email)}</p>${details}${next}<p><a href="https://tssprint.com/admin?tab=orders">Review order and production artwork</a></p>` }
  return { from: env.FROM_EMAIL, to: [c.email], reply_to: 'thestickersmith@gmail.com', subject: `Your Sticker Smith order ${row.order_id}`,
    html: `<h2>Thanks, ${escape(c.firstName)}!</h2>${details}${next}<p>${c.deliveryMethod === 'pickup' ? 'Pickup: 23673 Connecticut St, Hayward. Wait for your ready-for-pickup message.' : `Delivery: ${escape(c.address)}, ${escape(c.city)}, ${escape(c.state)} ${escape(c.zip)}`}</p><p>If you chose to send artwork later or need design help, reply to this email with your order reference.</p>` }
}
export async function processQuickBooksDelivery(checkoutId = null, { db = supabaseFetch, send = fetch, env = process.env, cart = markCartPaid } = {}) {
  const jobs = await db('/rest/v1/rpc/claim_quickbooks_delivery', { method: 'POST', body: JSON.stringify({ p_checkout_id: checkoutId }) })
  for (const job of jobs) {
    const patch = async values => {
      const rows = await db(`/rest/v1/quickbooks_delivery_jobs?id=eq.${job.id}&lease_id=eq.${job.lease_id}&status=eq.processing`, { method: 'PATCH', body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }) })
      if (!rows?.length) throw new Error('Lease lost')
    }
    try {
      const [row] = await db(`/rest/v1/quickbooks_checkouts?id=eq.${job.checkout_id}`)
      if (!row?.order_id || row.status !== 'payment_recorded') throw new Error('Order not paid')
      if (job.kind === 'cart_link') {
        await cart(row.cart_session, 'quickbooks', row.order_id, row.checkout)
        await patch({ status: 'completed', last_error: null }); continue
      }
      if (job.kind === 'analytics') {
        if (!row.checkout.ga4) { await patch({ status: 'completed', last_error: 'No eligible GA4 client identity; no analytics event sent.' }); continue }
        if (!env.GA4_API_SECRET || !/^G-[A-Z0-9]+$/.test(env.VITE_GA4_MEASUREMENT_ID || '')) throw new Error('GA4 server configuration missing')
        if (Date.now() - Date.parse(row.updated_at) > 70 * 3600000) { await patch({ status: 'needs_review', last_error: 'Payment is outside the GA4 backdating window.' }); continue }
        const payload = job.request_payload || { client_id: row.checkout.ga4.clientId, timestamp_micros: Date.parse(row.updated_at) * 1000, events: [{ name: 'purchase', params: {
          transaction_id: row.order_id, currency: 'USD', value: row.checkout.total, tax: Number(row.tax), shipping: 0,
          ...(row.checkout.ga4.sessionId ? { session_id: Number(row.checkout.ga4.sessionId) } : {}), engagement_time_msec: 1,
          ...(row.checkout.promoCode ? { coupon: row.checkout.promoCode } : {}),
          items: row.checkout.items.map(item => ({ item_id: item.id.slice(0,100), item_name: item.category || item.name, item_variant: `${item.option} | ${item.size}`, price: item.unitPrice, quantity: item.quantity })),
        } }] }
        await patch({ request_payload: payload, first_send_at: job.first_send_at || new Date().toISOString() })
        const target = new URL('https://www.google-analytics.com/mp/collect'); target.searchParams.set('measurement_id', env.VITE_GA4_MEASUREMENT_ID); target.searchParams.set('api_secret', env.GA4_API_SECRET)
        const response = await send(target, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(5000) })
        if (!response.ok) throw new Error('GA4 transport failed')
        await patch({ status: 'accepted', last_error: 'GA4 transport accepted; verify the transaction in GA4 reports.' }); continue
      }
      if (needsSendReview(job)) { await patch({ status: 'needs_review', last_error: 'Check Resend for the original send before resending.' }); continue }
      if (!env.RESEND_API_KEY || !env.FROM_EMAIL) throw new Error('Email configuration missing')
      const payload = job.request_payload || orderEmailPayload(row, job.kind, env)
      await patch({ request_payload: payload, first_send_at: job.first_send_at || new Date().toISOString() })
      const response = await send('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `qb-order-${job.id}` }, body: JSON.stringify(payload), signal: AbortSignal.timeout(5000) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.id) throw new Error('Email provider unavailable')
      await patch({ status: 'accepted', provider_id: data.id, last_error: null })
    } catch {
      await patch({ status: job.attempts >= 8 ? 'needs_review' : 'retry', last_error: 'Follow-up failed; order remains saved. Check provider logs before a manual resend.', next_attempt_at: new Date(Date.now() + Math.min(60, 2 ** job.attempts) * 60000).toISOString() }).catch(() => {})
    }
  }
  return jobs.length
}
