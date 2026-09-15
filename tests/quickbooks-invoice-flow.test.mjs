import { DEFAULT_PROMOS } from '../src/lib/approvedPromos.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultPricing } from '../src/lib/pricingCatalog.js'
import { encryptTokens, encryptionKey } from '../server/quickbooks-core.js'
Object.assign(process.env, { SUPABASE_URL: 'https://invoice-db.example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only', QUICKBOOKS_ENVIRONMENT: 'sandbox', QUICKBOOKS_SANDBOX_CLIENT_ID: 'test', QUICKBOOKS_SANDBOX_CLIENT_SECRET: 'test', QUICKBOOKS_TOKEN_ENCRYPTION_KEY: 'ab'.repeat(32) })
const { runInvoiceTest } = await import('../server/quickbooks-invoices.js')
const { accountingRequest } = await import('../server/quickbooks-api.js')
const realFetch = globalThis.fetch
const response = (body, status = 200) => new Response(JSON.stringify(body), { status })
let row, remoteInvoice, remotePayment, invoiceWrites, paymentWrites, lostResponse, writes
function matches(record, search) {
  for (const [key, expression] of search) {
    const [op, ...rest] = expression.split('.'); const value = rest.join('.')
    if (op === 'eq' && String(record?.[key]) !== value) return false
    if (op === 'gt' && !(Date.parse(record?.[key]) > Date.parse(value))) return false
  }
  return true
}
test.beforeEach(() => {
  row = null; remoteInvoice = null; remotePayment = null; invoiceWrites = 0; paymentWrites = 0; lostResponse = false; writes = []
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input); const body = options.body ? JSON.parse(options.body) : null; const method = options.method || 'GET'
    if (url.hostname === 'invoice-db.example.invalid') {
      if (url.pathname.endsWith('/pricing_configs')) return response([{ config: url.searchParams.get('id') === 'eq.checkout_promos' ? DEFAULT_PROMOS : defaultPricing }])
      if (url.pathname.endsWith('/quickbooks_connections')) return response([{ environment: 'sandbox', realm_id: '123', version: 'test', status: 'connected', access_expires_at: new Date(Date.now() + 3600000).toISOString(), encrypted_tokens: encryptTokens({ accessToken: 'unit-access', refreshToken: 'unit-refresh' }, encryptionKey('ab'.repeat(32)), 'sandbox', '123') }])
      if (url.pathname.endsWith('/acquire_quickbooks_invoice_test_lock')) {
        if (row.lock_id) return response([])
        row.lock_id = body.p_lock_id; row.lock_expires_at = new Date(Date.now() + 180000).toISOString()
        return response([{ ...row }])
      }
      if (url.pathname.endsWith('/quickbooks_invoice_tests')) {
        if (method === 'POST') row ||= { id: 'd12ccfca-1a2b-4248-833b-dab58a4cc0e4', status: 'creating', ...body }
        else if (!row || !matches(row, url.searchParams)) return response([])
        if (method === 'PATCH') Object.assign(row, body)
        return response([{ ...row }])
      }
    }
    assert.equal(url.hostname, 'sandbox-quickbooks.api.intuit.com')
    assert.match(url.pathname, /^\/v3\/company\/123\//)
    assert.equal(options.redirect, 'error')
    if (method === 'POST') {
      assert.ok(url.searchParams.get('requestid'))
      writes.push({ path: url.pathname, requestid: url.searchParams.get('requestid'), body })
    }
    if (url.pathname.endsWith('/query')) {
      const query = url.searchParams.get('query')
      if (query.includes('from Customer')) return response({ QueryResponse: {} })
      if (query.includes('from Item')) return response({ QueryResponse: { Item: [{ Id: '10' }] } })
      if (query.includes('from Invoice')) return response({ QueryResponse: { Invoice: [remoteInvoice] } })
    }
    if (url.pathname.endsWith('/customer')) return response({ Customer: { Id: '200', PrimaryEmailAddr: { Address: 'tss-quickbooks-test@example.com' } } })
    if (url.pathname.endsWith('/invoice')) {
      if (!remoteInvoice) {
        invoiceWrites++
        remoteInvoice = { ...body, Id: '100', DocNumber: 'QA-100', TotalAmt: row.checkout.total, Balance: row.checkout.total, LinkedTxn: [] }
        if (lostResponse) throw new Error('Response lost after provider accepted the write')
      }
      return response({ Invoice: remoteInvoice })
    }
    if (url.pathname.endsWith('/payment')) {
      assert.equal(body.ProcessPayment, false)
      if (!remotePayment) { paymentWrites++; remotePayment = { ...body, Id: '300' }; remoteInvoice.Balance = 0; remoteInvoice.LinkedTxn = [{ TxnId: '300', TxnType: 'Payment' }] }
      return response({ Payment: remotePayment })
    }
    if (url.pathname.endsWith('/invoice/100')) return response({ Invoice: remoteInvoice })
    if (url.pathname.endsWith('/payment/300')) return response({ Payment: remotePayment })
    throw new Error('Unexpected request in test')
  }
})
test.afterEach(() => { globalThis.fetch = realFetch })
test('sandbox invoice survives a lost response and repeated payment checks without duplicate writes', async () => {
  lostResponse = true
  await assert.rejects(runInvoiceTest(), /Response lost/)
  assert.equal(invoiceWrites, 1); assert.equal(row.invoice_id, undefined); assert.equal(row.lock_id, null)
  const firstPayload = structuredClone(row.invoice_payload)
  lostResponse = false
  let result = await runInvoiceTest()
  assert.equal(result.status, 'awaiting_payment'); assert.equal(result.total, 76.5)
  assert.equal(invoiceWrites, 1); assert.deepEqual(row.invoice_payload, firstPayload)
  const attempts = writes.filter(w => w.path.endsWith('/invoice'))
  assert.equal(attempts[0].requestid, attempts[1].requestid); assert.deepEqual(attempts[0].body, attempts[1].body)
  result = await runInvoiceTest({ recordPayment: true })
  assert.equal(result.status, 'payment_recorded')
  await runInvoiceTest({ recordPayment: true }); await runInvoiceTest()
  assert.equal(invoiceWrites, 1); assert.equal(paymentWrites, 1)
  assert.ok(!writes.some(w => /\/send/.test(w.path)))
})
test('accounting calls reject cross-company, cross-environment and arbitrary paths before writing', async () => {
  for (const settings of [{ realmId: '999', environment: 'sandbox' }, { realmId: '123', environment: 'production' }]) {
    await assert.rejects(accountingRequest('/invoice', { ...settings, method: 'POST', requestId: 'test', body: {} }), /company|connection_changed/)
  }
  await assert.rejects(accountingRequest('/invoice/100/send', { realmId: '123', environment: 'sandbox' }), /invalid_accounting_path/)
  await assert.rejects(accountingRequest('/invoice', { realmId: '123', environment: 'sandbox', method: 'POST', body: {} }), /invalid_request_id/)
  assert.equal(writes.length, 0)
})
