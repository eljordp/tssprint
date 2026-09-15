import crypto from 'node:crypto'

export const DISCOVERY_URL = 'https://developer.intuit.com/.well-known/openid_configuration'
export const ENDPOINTS = Object.freeze({
  authorization_endpoint: 'https://appcenter.intuit.com/connect/oauth2',
  token_endpoint: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
  revocation_endpoint: 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
})
export const ACCOUNTING_SCOPE = 'com.intuit.quickbooks.accounting'

export class QuickBooksError extends Error {
  constructor(code, status = 503, tid) {
    super(code)
    this.code = code
    this.status = status
    this.tid = tid
  }
}
export const nonce = () => crypto.randomBytes(32).toString('base64url')
export const digest = value => crypto.createHash('sha256').update(value).digest('hex')
export const validNonce = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value)
export function encryptionKey(value) {
  if (!/^[0-9a-f]{64}$/i.test(value || '')) throw new QuickBooksError('encryption_not_configured')
  return Buffer.from(value, 'hex')
}
export function encryptTokens(tokens, key, environment, realmId) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  cipher.setAAD(Buffer.from(`${environment}:${realmId}`))
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokens), 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}
export function decryptTokens(value, key, environment, realmId) {
  try {
    const [version, iv, tag, ciphertext, extra] = String(value).split('.')
    if (version !== 'v1' || extra || !ciphertext) throw new Error('format')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'))
    decipher.setAAD(Buffer.from(`${environment}:${realmId}`))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return JSON.parse(Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8'))
  } catch { throw new QuickBooksError('token_storage_error') }
}
export function tokenRecord(data, now = Date.now()) {
  if (typeof data?.access_token !== 'string' || !data.access_token || typeof data?.refresh_token !== 'string' || !data.refresh_token ||
    !Number.isFinite(data.expires_in) || data.expires_in <= 0 ||
    !Number.isFinite(data.x_refresh_token_expires_in) || data.x_refresh_token_expires_in <= 0) {
    throw new QuickBooksError('invalid_token_response')
  }
  return {
    tokens: { accessToken: data.access_token, refreshToken: data.refresh_token },
    access_expires_at: new Date(now + data.expires_in * 1000).toISOString(),
    refresh_expires_at: new Date(now + data.x_refresh_token_expires_in * 1000).toISOString(),
  }
}
export function needsRefresh(connection, now = Date.now()) {
  const expires = Date.parse(connection.access_expires_at)
  return !Number.isFinite(expires) || expires <= now + 60_000
}
export async function readIntuitResponse(response, operation, logger = console.info) {
  const tid = response.headers.get('intuit_tid')?.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 120)
  // Do not log URLs, request bodies, response bodies, personal data or credentials.
  logger(JSON.stringify({ provider: 'quickbooks', operation, status: response.status, ...(tid ? { intuit_tid: tid } : {}) }))
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const code = data?.error === 'invalid_grant' ? 'reconnect_required'
      : data?.error === 'invalid_client' ? 'invalid_client'
      : response.status === 401 ? 'unauthorized'
      : response.status === 429 ? 'rate_limited'
      : response.status >= 500 ? 'provider_unavailable' : 'provider_request_failed'
    throw new QuickBooksError(code, response.status === 429 ? 429 : 502, tid)
  }
  return data
}
export function validatedDiscovery(data) {
  for (const [name, expected] of Object.entries(ENDPOINTS)) {
    if (data?.[name] !== expected) throw new QuickBooksError('discovery_endpoint_changed')
  }
  return ENDPOINTS
}
