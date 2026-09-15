import test from 'node:test'
import assert from 'node:assert/strict'
import { encryptTokens, encryptionKey, PAYMENTS_SCOPE } from '../server/quickbooks-core.js'

Object.assign(process.env, { SUPABASE_URL: 'https://db.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-service-key', QUICKBOOKS_ENVIRONMENT: 'sandbox', QUICKBOOKS_SANDBOX_CLIENT_ID: 'test-client', QUICKBOOKS_SANDBOX_CLIENT_SECRET: 'test-secret', QUICKBOOKS_TOKEN_ENCRYPTION_KEY: 'ab'.repeat(32) })
const { paymentsRequest } = await import('../server/quickbooks-api.js')
const originalFetch = globalThis.fetch
const ctx = { environment: 'sandbox', realmId: '123', requestId: 'tss-charge-test' }
const payload = { token: 'opaque-test-token', currency: 'USD', amount: '105.50', capture: true, context: { isEcommerce: true, tax: 5.50 } }
let scopes, merchant, requests
test.beforeEach(() => {
  scopes = [PAYMENTS_SCOPE]; merchant = '123'; requests = []
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input)
    if (url.hostname === 'db.example.invalid') return Response.json([{
      status: 'connected', realm_id: merchant, version: 'v1', access_expires_at: new Date(Date.now() + 3600000).toISOString(),
      encrypted_tokens: encryptTokens({ accessToken: 'test-access', refreshToken: 'test-refresh', scopes }, encryptionKey('ab'.repeat(32)), 'sandbox', merchant),
    }])
    requests.push({ url: url.toString(), ...options })
    return Response.json({ id: 'TEST123', amount: '105.50', currency: 'USD', status: 'CAPTURED' })
  }
})
test.afterEach(() => { globalThis.fetch = originalFetch })
test('tokenized charge uses Payments host and exact idempotency key', async () => {
  await paymentsRequest('/charges', { ...ctx, method: 'POST', body: payload })
  assert.equal(requests.length, 1)
  assert.equal(requests[0].url, 'https://sandbox.api.intuit.com/quickbooks/v4/payments/charges')
  assert.equal(requests[0].headers['Request-Id'], ctx.requestId)
  assert.deepEqual(JSON.parse(requests[0].body), payload)
  assert.equal(requests[0].redirect, 'error')
})
test('accounting access cannot charge; company and environment cannot be switched', async () => {
  scopes = ['com.intuit.quickbooks.accounting']
  await assert.rejects(paymentsRequest('/charges', { ...ctx, method: 'POST', body: payload }), /payments_reconnect_required/)
  scopes = [PAYMENTS_SCOPE]; merchant = '999'
  await assert.rejects(paymentsRequest('/charges', { ...ctx, method: 'POST', body: payload }), /different_company_connected/)
  await assert.rejects(paymentsRequest('/charges', { ...ctx, environment: 'production', method: 'POST', body: payload }), /connection_changed/)
  assert.equal(requests.length, 0)
})
test('raw card data, invalid totals and unsupported wallet objects are rejected before network', async () => {
  for (const body of [
    { ...payload, card: { number: '4111111111111111', cvc: '123' } },
    { ...payload, token: { paymentData: 'apple-token' } },
    { ...payload, amount: '-1.00' }, { ...payload, amount: '0.00' },
    { ...payload, currency: 'CAD' }, { ...payload, capture: false },
    { ...payload, context: { ...payload.context, mobile: { number: '4111111111111111' } } },
    { ...payload, context: { ...payload.context, tax: Infinity } },
  ]) await assert.rejects(paymentsRequest('/charges', { ...ctx, method: 'POST', body }), /invalid_tokenized_charge/)
  assert.equal(requests.length, 0)
})
test('read-only recovery cannot mutate or address arbitrary endpoints', async () => {
  await paymentsRequest('/charges/TEST123', ctx)
  assert.equal(requests[0].method, 'GET')
  assert.equal(requests[0].body, undefined)
  for (const path of ['/tokens','/charges/../tokens','/charges/TEST123/refunds']) {
    await assert.rejects(paymentsRequest(path, ctx), /invalid_payments_path/)
  }
  await assert.rejects(paymentsRequest('/charges', { ...ctx, requestId: '', method: 'POST', body: payload }), /invalid_request_id/)
  assert.equal(requests.length, 1)
})
