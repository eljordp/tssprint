import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
const source = readFileSync(new URL('../src/lib/cartPromo.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const exports = {}
vm.runInNewContext(code, { exports })
const resolve = exports.resolveCartPromo
const base = { ready: true, subtotal: 47.5, requestedCode: null, automaticCode: 'AUTO10', allowAutomatic: true,
  validate: (code, subtotal) => code === 'AUTO10' ? { valid: true, code: { code, type: 'percent', value: 10 }, discount: +(subtotal * .1).toFixed(2) } : { valid: false } }
test('unresolved discounts never validate or advertise an initial discount', () => {
  const result = resolve({ ...base, ready: false, validate() { throw new Error('Not loaded') } })
  assert.equal(result.code, null)
  assert.equal(result.discount, 0)
})
test('readiness and automatic discount resolve together, including later subtotal changes', () => {
  const initial = resolve(base)
  assert.equal(initial.code, 'AUTO10')
  assert.equal(base.subtotal - initial.discount, 42.75)
  const changed = resolve({ ...base, subtotal: 123.5 })
  assert.equal(changed.discount, 12.35)
})
test('a valid requested fixed discount wins over the automatic discount', () => {
  const result = resolve({ ...base, requestedCode: 'SHOP', validate: (code) => ({valid: true, code: {code, type: 'fixed', value: 5}, discount: 5}) })
  assert.equal(result.code, 'SHOP')
  assert.equal(result.discount, 5)
})
test('dismissed/returning-customer auto discount stays off; invalid manual codes can fall back to approved auto', () => {
  assert.equal(resolve({ ...base, allowAutomatic: false }).discount, 0)
  assert.equal(resolve({ ...base, requestedCode: 'INVALID' }).code, 'AUTO10')
  assert.equal(resolve({ ...base, validate: () => ({valid: false}) }).discount, 0)
})
