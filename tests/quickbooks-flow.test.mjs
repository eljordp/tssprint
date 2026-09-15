import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { ENDPOINTS, decryptTokens, encryptionKey } from '../server/quickbooks-core.js'

Object.assign(process.env, { SUPABASE_URL: 'https://db.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-service-key', QUICKBOOKS_ENVIRONMENT: 'sandbox', QUICKBOOKS_SANDBOX_CLIENT_ID: 'test-client', QUICKBOOKS_SANDBOX_CLIENT_SECRET: 'test-secret', QUICKBOOKS_TOKEN_ENCRYPTION_KEY: 'ab'.repeat(32) })
const { beginConnection, finishConnection, checkConnection, disconnectConnection } = await import('../server/quickbooks-api.js')
const originalFetch = globalThis.fetch
let row, states, grants, calls, oauthFailure, apiFailure, allowedAdmin
const fresh = () => ({ environment: 'sandbox', version: crypto.randomUUID(), status: 'disconnected', lock_id: null })
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { intuit_tid: 'unit-trace' } })
function matches(record, search) {
  for (const [key, expression] of search) {
    if (key === 'select') continue
    const [operator, ...rest] = expression.split('.'); const value = rest.join('.')
    if (operator === 'eq' && String(record[key]) !== value) return false
    if (operator === 'gt' && !(Date.parse(record[key]) > Date.parse(value))) return false
    if (operator === 'lt' && !(Date.parse(record[key]) < Date.parse(value))) return false
  }
  return true
}
test.beforeEach(() => {
  row = fresh(); states = []; grants = []; calls = 0; oauthFailure = false; apiFailure = false; allowedAdmin = true
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input); const method = options.method || 'GET'
    if (url.hostname === 'db.example.invalid') {
      const body = options.body ? JSON.parse(options.body) : null
      if (url.pathname.endsWith('/acquire_quickbooks_lock')) {
        if (row.lock_id) return response([])
        row.lock_id = body.p_lock_id; row.lock_expires_at = new Date(Date.now() + 60000).toISOString()
        return response([{ ...row }])
      }
      if (url.pathname.endsWith('/quickbooks_connections')) {
        if (!matches(row, url.searchParams)) return response([])
        if (method === 'PATCH') Object.assign(row, body)
        return response([{ ...row }])
      }
      if (url.pathname.endsWith('/quickbooks_oauth_states')) {
        if (method === 'POST') { states.push(body); return response([body]) }
        const found = states.filter(state => matches(state, url.searchParams))
        if (method === 'DELETE') states = states.filter(state => !found.includes(state))
        return response(found)
      }
      if (url.pathname.endsWith('/user_roles')) return response(allowedAdmin ? [{ user_id: 'admin' }] : [])
    }
    if (input.includes('.well-known')) return response(ENDPOINTS)
    if (input === ENDPOINTS.token_endpoint) {
      const form = new URLSearchParams(options.body); grants.push(form.get('grant_type'))
      if (oauthFailure) return response({ error: 'invalid_grant' }, 400)
      return response({ access_token: `access-${grants.length}`, refresh_token: `refresh-${grants.length}`, expires_in: 3600, x_refresh_token_expires_in: 86400 })
    }
    if (input === ENDPOINTS.revocation_endpoint) return response({})
    if (url.hostname === 'sandbox-quickbooks.api.intuit.com') {
      calls++
      if (apiFailure) return response({}, 401)
      return response({ CompanyInfo: { CompanyName: 'Sandbox Print Shop' } })
    }
    throw new Error('Unexpected test request')
  }
})
test.afterEach(() => { globalThis.fetch = originalFetch })
async function start(options) {
  const result = await beginConnection('admin', options)
  const state = new URL(result.authorizationUrl).searchParams.get('state')
  return { url: `/api/quickbooks/callback?state=${state}&code=test-code&realmId=123`, headers: { cookie: result.cookie.split(';')[0] } }
}
test('connect, read, disconnect and reconnect use encrypted storage and one-use state', async () => {
  const req = await start()
  await finishConnection(req)
  assert.equal(row.status, 'connected'); assert.equal(row.realm_id, '123')
  assert.ok(!row.encrypted_tokens.includes('access-1'))
  await assert.rejects(finishConnection(req), /invalid_oauth_state/)
  assert.equal((await checkConnection()).companyName, 'Sandbox Print Shop')
  assert.deepEqual(grants, ['authorization_code'])
  await disconnectConnection()
  assert.equal(row.status, 'disconnected'); assert.equal(row.encrypted_tokens, null)
  await finishConnection(await start())
  assert.equal(row.status, 'connected')
})
test('wrong browser, expired state and removed admin access cannot complete OAuth', async () => {
  const req = await start()
  await assert.rejects(finishConnection({ ...req, headers: {} }), /invalid_oauth_state/)
  states[0].expires_at = new Date(0).toISOString()
  await assert.rejects(finishConnection(req), /invalid_oauth_state/)
  const freshRequest = await start(); allowedAdmin = false
  await assert.rejects(finishConnection(freshRequest), /admin_access_required/)
  assert.equal(grants.length, 0)
})
test('expired access token rotates once and expired refresh token requires reconnection', async () => {
  await finishConnection(await start())
  row.access_expires_at = new Date(0).toISOString()
  await checkConnection()
  assert.deepEqual(grants, ['authorization_code', 'refresh_token'])
  assert.equal(decryptTokens(row.encrypted_tokens, encryptionKey('ab'.repeat(32)), 'sandbox', '123').refreshToken, 'refresh-2')
  row.access_expires_at = new Date(0).toISOString(); row.refresh_expires_at = new Date(0).toISOString()
  await assert.rejects(checkConnection(), /reconnect_required/)
  assert.equal(row.encrypted_tokens, null)
})
test('invalid grant marks reconnection required without retrying credentials', async () => {
  await finishConnection(await start()); row.access_expires_at = new Date(0).toISOString(); oauthFailure = true
  await assert.rejects(checkConnection(), /reconnect_required/)
  assert.equal(row.status, 'reconnect_required'); assert.equal(row.encrypted_tokens, null)
  assert.equal(grants.length, 2)
})
test('401 is retried only once; a refresh lock prevents concurrent token rotation', async () => {
  await finishConnection(await start()); apiFailure = true
  await assert.rejects(checkConnection(), /unauthorized/)
  assert.equal(calls, 2); assert.equal(grants.length, 2)
  row.access_expires_at = new Date(0).toISOString(); row.lock_id = crypto.randomUUID()
  await assert.rejects(checkConnection(), /connection_busy/)
  assert.equal(grants.length, 2)
})
test('an older authorization cannot overwrite a changed connection', async () => {
  const req = await start(); row.version = crypto.randomUUID()
  await assert.rejects(finishConnection(req), /connection_changed/)
  assert.equal(grants.length, 0)
})
test('Payments scope comes from consumed state and survives refresh', async () => {
  const req = await start({ payments: true })
  assert.deepEqual(states[0].requested_scopes, ['com.intuit.quickbooks.accounting', 'com.intuit.quickbooks.payment'])
  await finishConnection(req)
  const read = () => decryptTokens(row.encrypted_tokens, encryptionKey('ab'.repeat(32)), 'sandbox', '123')
  assert.ok(read().scopes.includes('com.intuit.quickbooks.payment'))
  row.access_expires_at = new Date(0).toISOString()
  await checkConnection()
  assert.ok(read().scopes.includes('com.intuit.quickbooks.payment'))
  await start()
  assert.ok(states[0].requested_scopes.includes('com.intuit.quickbooks.payment'), 'ordinary reconnect preserves Payments access')
})
test('callback query cannot promote an accounting connection to Payments', async () => {
  const req = await start()
  req.url += '&scope=com.intuit.quickbooks.payment'
  await finishConnection(req)
  assert.deepEqual(decryptTokens(row.encrypted_tokens, encryptionKey('ab'.repeat(32)), 'sandbox', '123').scopes, ['com.intuit.quickbooks.accounting'])
})
