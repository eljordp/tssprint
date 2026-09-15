import crypto from 'node:crypto'
import { supabaseFetch } from './square-api.js'
import { ACCOUNTING_SCOPE, PAYMENTS_SCOPE, DISCOVERY_URL, QuickBooksError, decryptTokens, digest, encryptTokens, encryptionKey, needsRefresh, nonce, readIntuitResponse, tokenRecord, validatedDiscovery, validNonce } from './quickbooks-core.js'

const clean = name => (process.env[name] || '').trim().replace(/^(['"])(.*)\1$/, '$2').replace(/(?:\\n|\\r)+$/g, '').trim()
export function configuration() {
  const environment = clean('QUICKBOOKS_ENVIRONMENT') || 'sandbox'
  if (!['sandbox', 'production'].includes(environment)) throw new QuickBooksError('invalid_environment')
  const prefix = `QUICKBOOKS_${environment.toUpperCase()}`
  const clientId = clean(`${prefix}_CLIENT_ID`)
  const clientSecret = clean(`${prefix}_CLIENT_SECRET`)
  const key = clean('QUICKBOOKS_TOKEN_ENCRYPTION_KEY')
  const base = new URL(clean('QUICKBOOKS_SITE_URL') || 'https://tssprint.com')
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw new QuickBooksError('invalid_site_url')
  return { environment, clientId, clientSecret, key, origin: base.origin, redirectUri: `${base.origin}/api/quickbooks/callback`,
    missing: [[`${prefix}_CLIENT_ID`, clientId], [`${prefix}_CLIENT_SECRET`, clientSecret], ['QUICKBOOKS_TOKEN_ENCRYPTION_KEY', key]].filter(([, value]) => !value || value === '[SENSITIVE]').map(([name]) => name) }
}
function requireConfig() {
  const config = configuration()
  if (config.missing.length) throw new QuickBooksError('configuration_required')
  encryptionKey(config.key)
  return config
}
let discoveryCache
async function endpoints() {
  if (discoveryCache && discoveryCache.expires > Date.now()) return discoveryCache.value
  const response = await fetch(DISCOVERY_URL, { signal: AbortSignal.timeout(15_000), redirect: 'error' })
  if (!response.ok) throw new QuickBooksError('discovery_unavailable')
  const value = validatedDiscovery(await response.json())
  discoveryCache = { value, expires: Date.now() + 3_600_000 }
  return value
}
const connectionPath = environment => `/rest/v1/quickbooks_connections?environment=eq.${environment}`
export async function getConnection() {
  const { environment } = configuration()
  return (await supabaseFetch(`${connectionPath(environment)}&select=*`))?.[0] || null
}
async function withLock(work) {
  const config = requireConfig()
  const lockId = crypto.randomUUID()
  const rows = await supabaseFetch('/rest/v1/rpc/acquire_quickbooks_lock', { method: 'POST', body: JSON.stringify({ p_environment: config.environment, p_lock_id: lockId }) })
  const connection = rows?.[0]
  if (!connection) throw new QuickBooksError('connection_busy', 409)
  const save = async values => {
    const path = `${connectionPath(config.environment)}&lock_id=eq.${lockId}&lock_expires_at=gt.${encodeURIComponent(new Date().toISOString())}`
    const updated = await supabaseFetch(path, { method: 'PATCH', body: JSON.stringify({ ...values, version: crypto.randomUUID(), updated_at: new Date().toISOString() }) })
    if (!updated?.[0]) throw new QuickBooksError('connection_changed', 409)
    return updated[0]
  }
  try { return await work(connection, save, config) }
  finally {
    await supabaseFetch(`${connectionPath(config.environment)}&lock_id=eq.${lockId}`, { method: 'PATCH', body: JSON.stringify({ lock_id: null, lock_expires_at: null }) })
      .catch(() => console.warn(JSON.stringify({ provider: 'quickbooks', operation: 'release_lock', code: 'database_error' })))
  }
}
async function tokenRequest(config, parameters) {
  const urls = await endpoints()
  const response = await fetch(urls.token_endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15_000),
    headers: { Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(parameters) })
  // Do not retry a token exchange automatically: a lost response may contain a rotated token.
  return tokenRecord(await readIntuitResponse(response, parameters.grant_type))
}
const cookieName = '__Secure-tss_qbo_state'
export function stateCookie(value, maxAge = 600) {
  return `${cookieName}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/api/quickbooks/callback; Max-Age=${maxAge}`
}
export async function beginConnection(userId, { payments = false } = {}) {
  const config = requireConfig()
  const connection = await getConnection()
  if (!connection) throw new QuickBooksError('database_setup_required')
  const urls = await endpoints()
  const state = nonce()
  const browserNonce = nonce()
  const existingScopes = connection.encrypted_tokens ? decryptTokens(connection.encrypted_tokens, encryptionKey(config.key), config.environment, connection.realm_id).scopes : []
  const includePayments = payments || existingScopes?.includes(PAYMENTS_SCOPE)
  const scopes = includePayments ? [ACCOUNTING_SCOPE, PAYMENTS_SCOPE] : [ACCOUNTING_SCOPE]
  await supabaseFetch(`/rest/v1/quickbooks_oauth_states?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, { method: 'DELETE' })
  await supabaseFetch('/rest/v1/quickbooks_oauth_states', { method: 'POST', body: JSON.stringify({
    state_hash: digest(state), browser_hash: digest(browserNonce), environment: config.environment,
    connection_version: connection.version, user_id: userId, expires_at: new Date(Date.now() + 600_000).toISOString(),
    ...(includePayments ? { requested_scopes: scopes } : {}),
  }) })
  const url = new URL(urls.authorization_endpoint)
  url.search = new URLSearchParams({ client_id: config.clientId, response_type: 'code', scope: scopes.join(' '), redirect_uri: config.redirectUri, state }).toString()
  return { authorizationUrl: url.toString(), cookie: stateCookie(browserNonce) }
}
export async function finishConnection(req) {
  const config = requireConfig()
  const url = new URL(req.url, config.origin)
  const state = url.searchParams.get('state')
  const browserNonce = String(req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
  if (!validNonce(state) || !validNonce(browserNonce)) throw new QuickBooksError('invalid_oauth_state', 400)
  // DELETE ... RETURNING consumes the state exactly once; cookie binds it to this browser.
  const states = await supabaseFetch(`/rest/v1/quickbooks_oauth_states?state_hash=eq.${digest(state)}&browser_hash=eq.${digest(browserNonce)}&environment=eq.${config.environment}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`, { method: 'DELETE' })
  const stateRow = states?.[0]
  if (!stateRow) throw new QuickBooksError('invalid_oauth_state', 400)
  if (url.searchParams.has('error')) throw new QuickBooksError('connection_declined', 400)
  const realmId = url.searchParams.get('realmId')
  const code = url.searchParams.get('code')
  if (!/^\d{1,32}$/.test(realmId || '') || !code || code.length > 4096) throw new QuickBooksError('invalid_callback', 400)
  // An admin whose permission was removed while authorizing cannot complete the connection.
  const adminRoles = await supabaseFetch(`/rest/v1/user_roles?user_id=eq.${encodeURIComponent(stateRow.user_id)}&role=eq.admin&select=user_id`)
  if (!adminRoles?.length) throw new QuickBooksError('admin_access_required', 403)
  return withLock(async (connection, save) => {
    if (connection.version !== stateRow.connection_version) throw new QuickBooksError('connection_changed', 409)
    if (connection.realm_id && connection.status === 'connected' && connection.realm_id !== realmId) throw new QuickBooksError('different_company_connected', 409)
    const record = await tokenRequest(config, { grant_type: 'authorization_code', code, redirect_uri: config.redirectUri })
    // OAuth 2.0 permits scope to be omitted when it equals the requested scope.
    // Use the consumed, server-persisted state, never a callback query parameter.
    record.tokens.scopes ??= stateRow.requested_scopes || [ACCOUNTING_SCOPE]
    await save({ realm_id: realmId, company_name: null, encrypted_tokens: encryptTokens(record.tokens, encryptionKey(config.key), config.environment, realmId),
      access_expires_at: record.access_expires_at, refresh_expires_at: record.refresh_expires_at, status: 'connected', connected_by: stateRow.user_id })
  })
}
async function accessConnection(rejectedVersion) {
  const initial = await getConnection()
  if (!initial || initial.status !== 'connected') throw new QuickBooksError('reconnect_required', 409)
  if (!needsRefresh(initial) && (!rejectedVersion || initial.version !== rejectedVersion)) return initial
  return withLock(async (connection, save, config) => {
    if (connection.status !== 'connected') throw new QuickBooksError('reconnect_required', 409)
    if (!needsRefresh(connection) && (!rejectedVersion || connection.version !== rejectedVersion)) return connection
    const markDisconnected = () => save({ status: 'reconnect_required', encrypted_tokens: null, access_expires_at: null, refresh_expires_at: null })
    if (!connection.refresh_expires_at || Date.parse(connection.refresh_expires_at) <= Date.now()) {
      await markDisconnected()
      throw new QuickBooksError('reconnect_required', 409)
    }
    const tokens = decryptTokens(connection.encrypted_tokens, encryptionKey(config.key), config.environment, connection.realm_id)
    let record
    try { record = await tokenRequest(config, { grant_type: 'refresh_token', refresh_token: tokens.refreshToken }) }
    catch (error) {
      if (error.code === 'reconnect_required') await markDisconnected()
      throw error
    }
    record.tokens.scopes ??= tokens.scopes || [ACCOUNTING_SCOPE]
    return save({ encrypted_tokens: encryptTokens(record.tokens, encryptionKey(config.key), config.environment, connection.realm_id), access_expires_at: record.access_expires_at, refresh_expires_at: record.refresh_expires_at })
  })
}
async function companyRequest(connection) {
  const config = requireConfig()
  if (!/^\d{1,32}$/.test(connection.realm_id || '')) throw new QuickBooksError('invalid_company')
  const host = config.environment === 'sandbox' ? 'sandbox-quickbooks.api.intuit.com' : 'quickbooks.api.intuit.com'
  const tokens = decryptTokens(connection.encrypted_tokens, encryptionKey(config.key), config.environment, connection.realm_id)
  const response = await fetch(`https://${host}/v3/company/${connection.realm_id}/companyinfo/${connection.realm_id}`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}`, Accept: 'application/json' }, signal: AbortSignal.timeout(15_000), redirect: 'error',
  })
  return readIntuitResponse(response, 'read_company')
}
export async function checkConnection() {
  let connection = await accessConnection()
  let data
  try { data = await companyRequest(connection) }
  catch (error) {
    if (error.code !== 'unauthorized') throw error
    // One refresh and one retry for an expired/revoked access token; never an auth loop.
    connection = await accessConnection(connection.version)
    data = await companyRequest(connection)
  }
  if (!data?.CompanyInfo?.CompanyName) throw new QuickBooksError('invalid_company_response')
  const companyName = String(data.CompanyInfo.CompanyName).slice(0, 250)
  await supabaseFetch(`${connectionPath(configuration().environment)}&version=eq.${connection.version}&status=eq.connected`, { method: 'PATCH', body: JSON.stringify({ company_name: companyName }) })
  return { companyName, environment: configuration().environment, connected: true }
}

// Bind every accounting call to the company recorded with the local invoice.
// A reconnect to another company must never redirect a pending write/read.
export async function accountingRequest(path, { method = 'GET', body, requestId, realmId, environment, deadline = Infinity } = {}) {
  const config = requireConfig()
  if (!/^\/(query|estimate(?:\/\d+)?|invoice(?:\/\d+)?|payment(?:\/\d+)?|customer|item|preferences)$/.test(path)) throw new QuickBooksError('invalid_accounting_path', 400)
  if (environment !== config.environment || !/^\d{1,32}$/.test(realmId || '')) throw new QuickBooksError('connection_changed', 409)
  if (!['GET', 'POST'].includes(method) || (method === 'POST' && !/^[a-zA-Z0-9_-]{1,50}$/.test(requestId || ''))) throw new QuickBooksError('invalid_request_id', 400)
  const run = async connection => {
    if (Date.now() >= deadline) throw new QuickBooksError('worker_time_budget');
    if (connection.realm_id !== realmId) throw new QuickBooksError('different_company_connected', 409)
    const host = environment === 'sandbox' ? 'sandbox-quickbooks.api.intuit.com' : 'quickbooks.api.intuit.com'
    const url = new URL(`https://${host}/v3/company/${realmId}${path}`)
    url.searchParams.set('minorversion', '75')
    if (requestId) url.searchParams.set('requestid', requestId)
    if (path === '/query') {
      if (method !== 'GET' || typeof body?.query !== 'string') throw new QuickBooksError('invalid_query', 400)
      url.searchParams.set('query', body.query)
      url.searchParams.set('include', 'invoiceLink')
    }
    const tokens = decryptTokens(connection.encrypted_tokens, encryptionKey(config.key), environment, realmId)
    const response = await fetch(url.toString(), { method, redirect: 'error', signal: AbortSignal.timeout(Math.max(1, Math.min(15_000, deadline - Date.now()))),
      headers: { Authorization: `Bearer ${tokens.accessToken}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
    })
    return readIntuitResponse(response, `${method.toLowerCase()}_${path.split('/')[1]}`)
  }
  const connection = await accessConnection()
  try { return await run(connection) }
  catch (error) {
    if (error.code !== 'unauthorized') throw error
    return run(await accessConnection(connection.version))
  }
}
export async function paymentsAccess() {
  const config = requireConfig()
  const connection = await getConnection()
  if (connection?.status !== 'connected' || !connection.encrypted_tokens) return false
  const tokens = decryptTokens(connection.encrypted_tokens, encryptionKey(config.key), config.environment, connection.realm_id)
  return Array.isArray(tokens.scopes) && tokens.scopes.includes(PAYMENTS_SCOPE)
}

// The Payments API is separate from QBO accounting's /payment resource.
// Only a server-approved, tokenized charge can reach this adapter. No PAN/CVC.
export async function paymentsRequest(path, { method = 'GET', body, requestId, realmId, environment } = {}) {
  const config = requireConfig()
  const chargeRead = /^\/charges\/[A-Za-z0-9_-]{1,100}$/.test(path)
  const chargeWrite = path === '/charges' && method === 'POST'
  if ((!chargeRead || method !== 'GET') && !chargeWrite) throw new QuickBooksError('invalid_payments_path', 400)
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(requestId || '')) throw new QuickBooksError('invalid_request_id', 400)
  if (environment !== config.environment || !/^\d{1,32}$/.test(realmId || '')) throw new QuickBooksError('connection_changed', 409)
  if (chargeWrite) {
    const allowed = ['token', 'currency', 'amount', 'capture', 'context', 'description']
    if (!body || Object.keys(body).some(key => !allowed.includes(key)) || typeof body.token !== 'string' || !/^[A-Za-z0-9_+=/-]{10,512}$/.test(body.token) ||
        body.currency !== 'USD' || !/^\d{1,5}\.\d{2}$/.test(body.amount) || Number(body.amount) <= 0 || body.capture !== true ||
        body.context?.isEcommerce !== true || Object.keys(body.context).some(key => !['isEcommerce','mobile','tax'].includes(key)) ||
        (body.context.mobile !== undefined && typeof body.context.mobile !== 'boolean') ||
        (body.context.tax !== undefined && (typeof body.context.tax !== 'number' || !Number.isFinite(body.context.tax) || body.context.tax < 0 || body.context.tax > Number(body.amount))) ||
        (body.description !== undefined && (typeof body.description !== 'string' || body.description.length > 4000))) {
      throw new QuickBooksError('invalid_tokenized_charge', 400)
    }
  }
  const run = async connection => {
    if (connection.realm_id !== realmId) throw new QuickBooksError('different_company_connected', 409)
    const tokens = decryptTokens(connection.encrypted_tokens, encryptionKey(config.key), environment, realmId)
    if (!tokens.scopes?.includes(PAYMENTS_SCOPE)) throw new QuickBooksError('payments_reconnect_required', 409)
    const host = environment === 'sandbox' ? 'sandbox.api.intuit.com' : 'api.intuit.com'
    const response = await fetch(`https://${host}/quickbooks/v4/payments${path}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(15_000),
      headers: { Authorization: `Bearer ${tokens.accessToken}`, Accept: 'application/json', 'Content-Type': 'application/json', 'Request-Id': requestId },
      ...(chargeWrite ? { body: JSON.stringify(body) } : {}),
    })
    return readIntuitResponse(response, chargeWrite ? 'create_charge' : 'read_charge')
  }
  const connection = await accessConnection()
  try { return await run(connection) }
  catch (error) {
    if (error.code !== 'unauthorized') throw error
    // Keep exactly the same payload and Request-Id after token refresh.
    return run(await accessConnection(connection.version))
  }
}

export async function disconnectConnection() {
  return withLock(async (connection, save, config) => {
    if (connection.encrypted_tokens) {
      const tokens = decryptTokens(connection.encrypted_tokens, encryptionKey(config.key), config.environment, connection.realm_id)
      const urls = await endpoints()
      const response = await fetch(urls.revocation_endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15_000),
        headers: { Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`, Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tokens.refreshToken }) })
      await readIntuitResponse(response, 'revoke')
    }
    await save({ status: 'disconnected', encrypted_tokens: null, access_expires_at: null, refresh_expires_at: null })
  })
}
