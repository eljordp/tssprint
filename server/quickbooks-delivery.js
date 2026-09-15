import { brandedEmail } from './email-layout.js'
import { supabaseFetch } from './square-api.js'
import { markCartPaid } from './cart-api.js'
const needsSendReview = job => !!job.first_send_at && Date.now() - Date.parse(job.first_send_at) >= 23 * 3600000
const escape = value => String(value || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
export function orderEmailPayload(row, kind, env) {
  const c = row.checkout.customer
  const wallet = row.payment_mode === 'wallet'
  const reference = wallet ? row.order_id : row.invoice_number
  const cash = value => `$${Number(value).toFixed(2)}`
  const lines = row.checkout.items.map(item => `<tr><td style="padding:14px 0;border-bottom:1px solid #e8ecef;font-size:14px;line-height:22px"><strong style="color:#15191d">${escape(item.category === 'Stickers' ? item.name : item.category || item.name)}</strong><br>${escape(item.option)} · ${escape(item.size)}${item.quantity > 1 ? ` · ${item.quantity} batches` : ''}${item.addOns.length ? `<br>${escape(item.addOns.map(a => a.name).join(', '))}` : ''}</td><td valign="top" align="right" style="padding:14px 0 14px 12px;border-bottom:1px solid #e8ecef;white-space:nowrap;font-size:14px;font-weight:bold">${cash(item.unitPrice * item.quantity)}</td></tr>`).join('')
  const details = `<p style="margin:0 0 20px;font-size:13px;color:#68747d;overflow-wrap:anywhere">${wallet ? 'Apple Pay payment received' : `Invoice ${escape(row.invoice_number)}`}<br>Order ${escape(row.order_id)}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${lines}</table><p style="margin:20px 0;font-size:14px;line-height:24px">Subtotal: ${cash(row.checkout.subtotal)}<br>Discount: −${cash(row.checkout.discount)}<br>Tax: ${cash(row.tax)}</p><p style="margin:0 0 28px;padding:16px;background:#edf8fc;border-radius:8px;font-size:20px;color:#101418"><strong>Total: ${cash(row.total)}</strong></p>`
  const next = '<h2 style="margin:24px 0 8px;font-size:18px;line-height:24px;color:#101418">What happens next</h2><p style="margin:0 0 16px">We review your artwork and send a proof for approval. Production starts after you approve it.</p>'
  const staff = kind === 'staff_email'
  const body = staff
    ? `<p style="margin:0 0 20px">${escape(c.firstName)} ${escape(c.lastName)} · ${escape(c.email)}</p>${details}${next}`
    : `<p style="margin:0 0 20px">Thanks, ${escape(c.firstName)}. Your payment is confirmed and your order is saved.</p>${details}${next}<p style="margin:0 0 16px">${c.deliveryMethod === 'pickup' ? 'Pickup is at 23673 Connecticut St, Hayward. Wait for your ready-for-pickup message.' : `Delivery: ${escape(c.address)}, ${escape(c.city)}, ${escape(c.state)} ${escape(c.zip)}`}</p><p style="margin:0">Sending artwork later or need design help? Reply with your order reference and we’ll help.</p>`
  return { from: env.FROM_EMAIL,
    to: staff ? (env.CONTACT_NOTIFICATION_EMAILS || env.CONTACT_OWNER_EMAIL || 'mrjxrdip@icloud.com,thestickersmith@gmail.com').split(',').map(s => s.trim()).filter(Boolean) : [c.email],
    reply_to: staff ? c.email : 'thestickersmith@gmail.com',
    subject: staff ? `Website order received · ${reference}` : `Order received · The Sticker Smith · ${reference}`,
    html: brandedEmail({ preview: `Payment recorded. Artwork review and proof approval come next. Reference ${reference}.`, eyebrow: 'Payment recorded', title: staff ? 'New website order.' : 'Your print project is in.', body,
      actionUrl: staff ? 'https://tssprint.com/admin?tab=orders' : `mailto:thestickersmith@gmail.com?subject=${encodeURIComponent(`Order ${row.order_id}`)}`,
      actionLabel: staff ? 'Review order & artwork' : 'Contact us about this order' }),
  }
}
export async function processQuickBooksDelivery(checkoutId = null, { db = supabaseFetch, send = fetch, env = process.env, cart = markCartPaid, deadline = Infinity } = {}) {
  const jobs = await db('/rest/v1/rpc/claim_quickbooks_delivery', { method: 'POST', body: JSON.stringify({ p_checkout_id: checkoutId }) })
  for (const job of jobs) {
    const patch = async values => {
      const rows = await db(`/rest/v1/quickbooks_delivery_jobs?id=eq.${job.id}&lease_id=eq.${job.lease_id}&status=eq.processing`, { method: 'PATCH', body: JSON.stringify({ ...values, updated_at: new Date().toISOString() }) })
      if (!rows?.length) throw new Error('Lease lost')
    }
    if (Date.now() + 6000 >= deadline) {
      await patch({ status: 'retry', attempts: Math.max(0, job.attempts - 1), lease_id: null, lease_until: null }).catch(() => {})
      continue
    }
    try {
      const [row] = await db(`/rest/v1/quickbooks_checkouts?id=eq.${job.checkout_id}`)
      if (!row?.order_id || row.status !== 'payment_recorded') throw new Error('Order not paid')
      if (job.kind === 'cart_link') {
        await cart(row.cart_session, row.payment_mode === 'wallet' ? 'paypal' : 'quickbooks', row.order_id, row.checkout)
        await patch({ status: 'completed', last_error: null }); continue
      }
      if (job.kind === 'analytics') {
        if (!row.checkout.ga4) { await patch({ status: 'completed', last_error: 'No eligible GA4 client identity; no analytics event sent.' }); continue }
        if (Date.now() - Date.parse(job.created_at) > 70 * 3600000) { await patch({ status: 'needs_review', last_error: 'Payment is outside the GA4 backdating window.' }); continue }
        if (!env.GA4_API_SECRET || !/^G-[A-Z0-9]+$/.test(env.VITE_GA4_MEASUREMENT_ID || '')) {
          await patch({ status: 'retry', last_error: 'GA4 server configuration missing; purchase remains queued.', next_attempt_at: new Date(Date.now() + 30 * 60000).toISOString() }); continue
        }
        const payload = job.request_payload || purchaseAnalyticsPayload(row, job.created_at)
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

export function purchaseAnalyticsPayload(row, createdAt) {
  return { client_id: row.checkout.ga4.clientId, timestamp_micros: Date.parse(createdAt) * 1000, events: [{ name: 'purchase', params: {
          transaction_id: row.order_id, payment_type: row.payment_mode === 'wallet' ? 'apple_pay' : 'card', payment_provider: row.payment_mode === 'wallet' ? 'paypal' : 'quickbooks', currency: 'USD', value: row.checkout.total, tax: Number(row.tax), shipping: 0,
          ...(row.checkout.ga4.sessionId ? { session_id: Number(row.checkout.ga4.sessionId) } : {}), engagement_time_msec: 1,
          ...(row.checkout.ga4.debugMode === true ? { debug_mode: true, traffic_type: 'internal' } : {}),
          ...(row.checkout.promoCode ? { coupon: row.checkout.promoCode } : {}),
          items: row.checkout.items.map(item => ({ item_id: item.id.slice(0,100), item_name: item.category || item.name, item_variant: `${item.option} | ${item.size}`, price: item.unitPrice, quantity: item.quantity })),
        } }] }
}
