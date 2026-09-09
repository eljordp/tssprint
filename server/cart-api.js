import { createClient } from '@supabase/supabase-js'
import { tokenHash, matchesToken, validCredentials, signRecovery, readRecovery, validateCartItems, cartSubtotal } from './cart-core.js'
import { consumeRateLimit, requireTrustedBrowserRequest } from './request-guards.js'

function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  if (!url || !key || key === '[SENSITIVE]') throw new Error('Cart service is not configured.')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
const signingKey = () => process.env.CART_RECOVERY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
const checked = result => { if (result.error) throw result.error; return result.data }
const reply = (res, code, body) => { res.setHeader('Cache-Control', 'no-store'); return res.status(code).json(body) }
const emailValid = email => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

async function ownedCart(db, credentials) {
  if (!validCredentials(credentials)) throw new Error('Invalid cart access.')
  const row = checked(await db.from('cart_sessions').select('*').eq('id', credentials.id).maybeSingle())
  if (row && !matchesToken(credentials.token, row.access_token_hash)) throw new Error('Invalid cart access.')
  return row
}

export async function markCartPaid(credentials, provider, paymentId, checkout) {
  if (!validCredentials(credentials)) return
  const db = adminClient()
  let cart = await ownedCart(db, credentials)
  if (!cart && checkout) {
    const inserted = await db.from('cart_sessions').insert({ id: credentials.id, access_token_hash: tokenHash(credentials.token), items: checkout.items, total_price: checkout.subtotal, email: checkout.customer.email, converted: true, paid_order_id: `${provider}:${paymentId}`, updated_at: new Date().toISOString() })
    if (inserted.error?.code !== '23505') checked(inserted)
    cart = await ownedCart(db, credentials)
  }
  if (!cart) throw new Error('Cart was not saved before payment.')
  const changes = { converted: true, paid_order_id: `${provider}:${paymentId}`, updated_at: new Date().toISOString() }
  checked(await db.from('cart_sessions').update(changes).eq('id', cart.id).eq('access_token_hash', tokenHash(credentials.token)))
  if (cart.recovery_source_id) checked(await db.from('cart_sessions').update(changes).eq('id', cart.recovery_source_id))
}

export default async function cartHandler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Method not allowed.' })
  try {
    requireTrustedBrowserRequest(req)
    const action = String(req.query?.action || '')
    const rate = consumeRateLimit(req, { key: `cart-${action}`, limit: action === 'email' ? 5 : 120, windowMs: 60000 })
    if (!rate.allowed) { res.setHeader('Retry-After', String(rate.retryAfter)); return reply(res, 429, { error: 'Please wait a moment before trying again.' }) }
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!body || JSON.stringify(body).length > 220000) return reply(res, 400, { error: 'Invalid cart request.' })
    const db = adminClient()
    if (action === 'restore') {
      const link = readRecovery(body.token, signingKey())
      const cart = checked(await db.from('cart_sessions').select('*').eq('id', link.id).maybeSingle())
      if (!cart || tokenHash(cart.email) !== link.emailHash || cart.converted || !cart.items?.length || Date.parse(cart.expires_at) < Date.now()) return reply(res, 410, { error: 'This cart is no longer available. You can start a new order or contact the shop.' })
      return reply(res, 200, { id: cart.id, items: cart.items, total_price: cart.total_price, updated_at: cart.updated_at })
    }
    const cart = await ownedCart(db, body)
    if (cart?.converted) return reply(res, 409, { error: 'This order is already paid. Start a new cart to keep shopping.' })
    if (action === 'sync') {
      const items = validateCartItems(body.items)
      const now = new Date().toISOString()
      const email = body.email == null ? null : String(body.email).trim().toLowerCase()
      if (email !== null && !emailValid(email)) return reply(res, 400, { error: 'Enter a valid email address.' })
      let sourceId = null
      if (body.sourceToken) {
        const sourceLink = readRecovery(body.sourceToken, signingKey())
        const source = checked(await db.from('cart_sessions').select('id,email,converted,expires_at').eq('id', sourceLink.id).maybeSingle())
        if (!source || source.converted || tokenHash(source.email) !== sourceLink.emailHash || Date.parse(source.expires_at) < Date.now()) throw new Error('Invalid cart link.')
        sourceId = source.id
      }
      const changes = {
        items, email, total_price: cartSubtotal(items), updated_at: now, last_activity_at: now,
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        visitor_id: String(body.identity?.visitorId || '').slice(0, 120) || null,
        session_id: String(body.identity?.sessionId || '').slice(0, 120) || null,
        attribution: body.identity?.attribution || null, is_test: body.isTest === true,
        ...(body.stage === 'checkout' ? { checkout_started_at: cart?.checkout_started_at || now } : {}),
        ...(body.stage === 'payment_issue' ? { payment_issue_at: now } : {}),
        ...(sourceId ? { recovery_source_id: sourceId } : {}),
      }
      if (cart) checked(await db.from('cart_sessions').update(changes).eq('id', body.id).eq('access_token_hash', tokenHash(body.token)))
      else {
        const inserted = await db.from('cart_sessions').insert({ id: body.id, access_token_hash: tokenHash(body.token), ...changes })
        if (inserted.error?.code === '23505') {
          await ownedCart(db, body)
          checked(await db.from('cart_sessions').update(changes).eq('id', body.id).eq('access_token_hash', tokenHash(body.token)))
        } else checked(inserted)
      }
      if (sourceId) checked(await db.from('cart_sessions').update({ recovered_at: now }).eq('id', sourceId))
      return reply(res, 200, { saved: true })
    }
    if (action === 'email') {
      if (!cart?.items?.length) return reply(res, 400, { error: 'Add items before emailing your cart.' })
      const email = String(body.email || '').trim().toLowerCase()
      if (!emailValid(email) || cart.email !== email) return reply(res, 400, { error: 'Save your cart with this email first.' })
      if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) return reply(res, 503, { error: 'Cart emails are temporarily unavailable. Your cart is still saved in this browser.' })
      const bucket = Math.floor(Date.now() / (5 * 60000))
      const token = signRecovery(cart.id, email, signingKey(), bucket * 5 * 60000)
      const url = new URL('/cart', process.env.SITE_URL || 'https://tssprint.com')
      url.hash = `restore=${token}`
      const delivery = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `cart-${cart.id}-${tokenHash(email).slice(0, 16)}-${bucket}` },
        body: JSON.stringify({ from: process.env.FROM_EMAIL, to: email, subject: 'Your Sticker Smith cart', text: `Here is the cart link you requested:\n\n${url}\n\nThe link expires in 7 days. Review your saved items and total before paying. This link does not reserve stock or production time.\n\nQuestions? Reply to thestickersmith@gmail.com.`, reply_to: 'thestickersmith@gmail.com' }), signal: AbortSignal.timeout(10000),
      })
      const result = await delivery.json().catch(() => ({}))
      checked(await db.from('cart_sessions').update({ email_status: delivery.ok ? 'accepted' : 'failed', email_sent_at: delivery.ok ? new Date().toISOString() : cart.email_sent_at, email_provider_id: result.id || null }).eq('id', cart.id))
      if (!delivery.ok) return reply(res, 502, { error: 'Your cart was saved, but the email could not be sent. Please try again.' })
      return reply(res, 200, { accepted: true })
    }
    return reply(res, 404, { error: 'Unknown cart action.' })
  } catch (error) {
    console.error('[cart-service]', { code: error.code, message: error.message })
    const invalid = /Invalid|expired/.test(error.message || '')
    return reply(res, error.status === 403 ? 403 : invalid ? 400 : 503, { error: invalid ? error.message : 'Cart saving is temporarily unavailable. Your items remain in this browser.' })
  }
}
