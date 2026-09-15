import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const code = ts.transpileModule(readFileSync(new URL('../src/lib/contactSubmit.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
const request = { name: 'QA Test', email: 'qa@example.com', message: 'Test quote', subject: 'Quote', subscribe: true }
function setup({ insertFails = false, dispatchFails = false, trackingFails = false } = {}) {
  const calls = [], storage = new Map(), exports = {}, payloads = []
  const deps = {
    './supabase': { supabase: { from: () => ({ insert: async payload => { calls.push('save'); payloads.push(payload); return { error: insertFails ? new Error('save failed') : null } } }) } },
    './analytics': { getAnalyticsIdentity: () => ({ visitorId: 'qa', sessionId: 'qa', attribution: {} }), trackLeadSubmission: () => { calls.push('track'); if (trackingFails) throw new Error('unavailable') } },
    './quoteArtwork': { appendQuoteArtwork: message => message },
  }
  vm.runInNewContext(code, { exports, crypto, AbortSignal, require: name => deps[name], console: { warn() {} }, fetch: async () => { calls.push('dispatch'); if (dispatchFails) throw new Error('offline'); return { ok: true } }, window: { sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } } })
  return { submit: exports.submitContactRequest, calls, payloads }
}
test('quote and queue opt-in instructions are inserted together before tracking/dispatch', async () => {
  const { submit, calls, payloads } = setup()
  assert.equal((await submit(request)).leadSaved, true)
  assert.deepEqual(calls, ['save', 'track', 'dispatch'])
  assert.equal(payloads[0].delivery_workflow_version, 1)
  assert.equal(payloads[0].subscribe_requested, true)
  assert.match(payloads[0].id, /^[a-f0-9-]{36}$/)
})
test('closing/offline dispatch does not fail or duplicate a saved quote', async () => {
  const { submit, calls } = setup({ dispatchFails: true })
  assert.equal((await submit(request)).success, true)
  await submit(request)
  assert.equal(calls.filter(x => x === 'save').length, 1)
})
test('failed atomic insert performs no downstream work and can retry', async () => {
  const { submit, calls } = setup({ insertFails: true })
  await assert.rejects(submit(request), /save failed/)
  await assert.rejects(submit(request), /save failed/)
  assert.deepEqual(calls, ['save', 'save'])
})
test('analytics failure cannot block queued work dispatch', async () => {
  const { submit, calls } = setup({ trackingFails: true })
  assert.equal((await submit(request)).success, true)
  assert.ok(calls.includes('dispatch'))
})
test('no opt-in is recorded without explicit consent', async () => {
  const { submit, payloads } = setup()
  await submit({ ...request, subscribe: false })
  assert.equal(payloads[0].subscribe_requested, false)
})
