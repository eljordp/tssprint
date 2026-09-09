import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const tokenHash = value => createHash('sha256').update(String(value)).digest('hex')
export function validCredentials(value) {
  return /^[0-9a-f-]{36}$/i.test(value?.id || '') && /^[0-9a-f]{64}$/i.test(value?.token || '')
}
export function matchesToken(token, hash) {
  const candidate = tokenHash(token)
  return typeof hash === 'string' && hash.length === candidate.length && timingSafeEqual(Buffer.from(candidate), Buffer.from(hash))
}
export function signRecovery(id, email, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ id, emailHash: tokenHash(email), expires: now + 7 * 86400000 })).toString('base64url')
  return `${payload}.${createHmac('sha256', secret).update(`cart-recovery:${payload}`).digest('base64url')}`
}
export function readRecovery(token, secret, now = Date.now()) {
  const [payload, signature, extra] = String(token || '').split('.')
  if (!payload || !signature || extra || payload.length > 300) throw new Error('Invalid cart link.')
  const expected = createHmac('sha256', secret).update(`cart-recovery:${payload}`).digest('base64url')
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) throw new Error('Invalid cart link.')
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString())
  if (!Number.isFinite(parsed.expires) || parsed.expires <= now) throw new Error('This cart link has expired.')
  if (!/^[0-9a-f-]{36}$/i.test(parsed.id || '') || !/^[0-9a-f]{64}$/.test(parsed.emailHash || '')) throw new Error('Invalid cart link.')
  return parsed
}
export function validateCartItems(items) {
  if (!Array.isArray(items) || items.length > 100 || JSON.stringify(items).length > 200000) throw new Error('Invalid cart contents.')
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string' || item.name.length > 250 || !Number.isFinite(item.price) || item.price < 0 || item.price > 1000000 || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000) throw new Error('Invalid cart item.')
    if (item.addOns && (!Array.isArray(item.addOns) || item.addOns.length > 30 || item.addOns.some(addon => typeof addon.name !== 'string' || !Number.isFinite(addon.price) || addon.price < 0 || addon.price > 1000000))) throw new Error('Invalid cart add-on.')
  }
  return items
}
export const cartSubtotal = items => +items.reduce((sum, item) => sum + (item.price + (item.addOns?.reduce((subtotal, addon) => subtotal + addon.price, 0) || 0)) * item.quantity, 0).toFixed(2)
