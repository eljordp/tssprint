import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/contactSubmit.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const request = { name: 'QA Test', email: 'qa@example.com', message: 'Test quote', subject: 'Quote', subscribe: true }

function setup({ insertFails = false, subscriptionFails = false, customerFails = false, notificationFails = false, trackingFails = false } = {}) {
  const calls = [], storage = new Map(), exports = {}
  const dependencies = {
    './supabase': { supabase: {
      from: () => ({ insert: async () => { calls.push('save'); return { error: insertFails ? new Error('save failed') : null } } }),
      rpc: async name => {
        calls.push(name)
        return { error: (name === 'upsert_email_subscriber' ? subscriptionFails : customerFails) ? new Error('RPC failed') : null }
      },
    } },
    './email': { sendContactEmail: async () => { calls.push('notify'); if (notificationFails) throw new Error('provider failed') } },
    './analytics': {
      getAnalyticsIdentity: () => ({ visitorId: 'qa', sessionId: 'qa', attribution: {} }),
      trackLeadSubmission: () => { calls.push('track'); if (trackingFails) throw new Error('analytics unavailable') },
    },
    './quoteArtwork': { appendQuoteArtwork: message => message },
  }
  vm.runInNewContext(code, {
    exports, require: name => dependencies[name], console: { warn() {} },
    window: { sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } },
  })
  return { submit: exports.submitContactRequest, calls }
}

test('a saved lead survives subscription failure and still requests notification and tracking', async () => {
  const { submit, calls } = setup({ subscriptionFails: true })
  const result = await submit(request)
  assert.equal(result.leadSaved, true)
  assert.equal(result.success, true)
  assert.equal(result.subscription, 'failed')
  assert.equal(result.notification, 'accepted')
  assert.ok(calls.indexOf('track') > calls.indexOf('save'))
  assert.ok(calls.includes('notify'))
})

test('returned RPC errors and email errors have independent outcomes', async () => {
  const { submit } = setup({ customerFails: true, notificationFails: true })
  const result = await submit(request)
  assert.equal(result.customerSync, 'failed')
  assert.equal(result.notification, 'failed')
  assert.equal(result.subscription, 'saved')
  assert.equal(result.success, true)
})

test('failed lead insert performs no downstream work and can be retried', async () => {
  const { submit, calls } = setup({ insertFails: true })
  await assert.rejects(submit(request), /save failed/)
  await assert.rejects(submit(request), /save failed/)
  assert.deepEqual(calls, ['save', 'save'])
})

test('analytics failure does not block notification; no subscription is requested without opt-in', async () => {
  const { submit, calls } = setup({ trackingFails: true })
  const result = await submit({ ...request, subscribe: false })
  assert.equal(result.notification, 'accepted')
  assert.equal(result.subscription, 'not_requested')
  assert.equal(calls.includes('upsert_email_subscriber'), false)
})

test('repeat submission does not create another lead or send another email', async () => {
  const { submit, calls } = setup()
  await submit(request)
  await submit(request)
  assert.equal(calls.filter(call => call === 'save').length, 1)
  assert.equal(calls.filter(call => call === 'notify').length, 1)
  assert.equal(calls.filter(call => call === 'track').length, 1)
})
