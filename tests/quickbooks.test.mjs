import test from 'node:test'
import assert from 'node:assert/strict'
import { ENDPOINTS, decryptTokens, digest, encryptTokens, encryptionKey, needsRefresh, nonce, readIntuitResponse, tokenRecord, validatedDiscovery, validNonce } from '../server/quickbooks-core.js'

const key = encryptionKey('ab'.repeat(32))
test('encrypted token storage authenticates company, environment, key and content', () => {
  const tokens = { accessToken: 'private-access', refreshToken: 'private-refresh' }
  const sealed = encryptTokens(tokens, key, 'sandbox', '123')
  assert.ok(!sealed.includes('private'))
  assert.deepEqual(decryptTokens(sealed, key, 'sandbox', '123'), tokens)
  assert.throws(() => decryptTokens(sealed, key, 'production', '123'), /token_storage_error/)
  assert.throws(() => decryptTokens(sealed, key, 'sandbox', '456'), /token_storage_error/)
  assert.throws(() => decryptTokens(sealed, encryptionKey('cd'.repeat(32)), 'sandbox', '123'), /token_storage_error/)
  const parts = sealed.split('.'); parts[3] = (parts[3][0] === 'A' ? 'B' : 'A') + parts[3].slice(1)
  assert.throws(() => decryptTokens(parts.join('.'), key, 'sandbox', '123'), /token_storage_error/)
})
test('invalid encryption keys and malformed token responses fail closed', () => {
  assert.throws(() => encryptionKey('[SENSITIVE]'), /encryption_not_configured/)
  for (const data of [{}, { access_token: 'a', refresh_token: 'r', expires_in: 0, x_refresh_token_expires_in: 100 }, { access_token: 'a', refresh_token: 'r', expires_in: 3600 }]) assert.throws(() => tokenRecord(data), /invalid_token_response/)
  const record = tokenRecord({ access_token: 'a', refresh_token: 'r', expires_in: 3600, x_refresh_token_expires_in: 86400 }, 0)
  assert.equal(record.access_expires_at, '1970-01-01T01:00:00.000Z')
  assert.equal(record.refresh_expires_at, '1970-01-02T00:00:00.000Z')
})
test('access token reuse and expiry buffer', () => {
  assert.equal(needsRefresh({ access_expires_at: new Date(3600000).toISOString() }, 0), false)
  assert.equal(needsRefresh({ access_expires_at: new Date(60000).toISOString() }, 0), true)
  assert.equal(needsRefresh({ access_expires_at: null }, 0), true)
})
test('state is unpredictable and validates before being used in database filters', () => {
  const one = nonce(); const two = nonce()
  assert.ok(validNonce(one)); assert.notEqual(one, two)
  assert.match(digest(one), /^[0-9a-f]{64}$/)
  for (const value of [null, '', 'x&or=(state.eq.foo)', 'a'.repeat(44)]) assert.equal(validNonce(value), false)
})
test('discovery changes fail closed rather than sending credentials to new hosts', () => {
  assert.deepEqual(validatedDiscovery(ENDPOINTS), ENDPOINTS)
  assert.throws(() => validatedDiscovery({ ...ENDPOINTS, token_endpoint: 'https://attacker.invalid' }), /discovery_endpoint_changed/)
})
test('Intuit errors capture transaction ID without logging secrets or response details', async () => {
  const logs = []
  const response = new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'sensitive-token-value' }), { status: 400, headers: { intuit_tid: 'trace-123' } })
  await assert.rejects(readIntuitResponse(response, 'refresh_token', value => logs.push(value)), error => error.code === 'reconnect_required' && error.tid === 'trace-123')
  assert.match(logs[0], /trace-123/); assert.ok(!logs[0].includes('sensitive-token-value'))
})
test('validation, unauthorized, throttling and provider failures are distinct', async () => {
  for (const [status, code] of [[400, 'provider_request_failed'], [401, 'unauthorized'], [429, 'rate_limited'], [500, 'provider_unavailable']]) {
    await assert.rejects(readIntuitResponse(new Response('{}', { status }), 'test', () => {}), error => error.code === code)
  }
  assert.deepEqual(await readIntuitResponse(new Response('{"ok":true}'), 'test', () => {}), { ok: true })
})
