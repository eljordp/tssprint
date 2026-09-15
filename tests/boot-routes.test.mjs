import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import { renderToString } from 'react-dom/server'

const require = createRequire(import.meta.url)
const code = ts.transpileModule(readFileSync(new URL('../src/lib/bootRoutes.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText
const setup = () => { const exports = {}; vm.runInNewContext(code, { exports, require }); return exports }

test('the first route renders its content without committing the lazy fallback', async () => {
  const api = setup(); let unrelatedLoads = 0
  const Order = api.bootRoute('Order', async () => ({default: ({ label }) => React.createElement('h1', null, label)}))
  api.bootRoute('Admin', async () => { unrelatedLoads++; return {default: () => null} })
  await api.prepareInitialRoute('/stickers/')
  const html = renderToString(React.createElement(React.Suspense, {fallback: React.createElement('p', null, 'Blank loading fallback')}, React.createElement(Order, {label:'Choose your stickers'})))
  assert.match(html, /<h1>Choose your stickers<\/h1>/)
  assert.doesNotMatch(html, /Blank loading fallback/)
  assert.equal(unrelatedLoads, 0)
})

test('support routes resolve their actual page and failed downloads are surfaced', async () => {
  const api=setup(); let calls=0
  api.bootRoute('StickerSupportPage',async()=>{calls++;return {default:()=>null}})
  await api.prepareInitialRoute('/roll-labels')
  assert.equal(calls,1)
  api.bootRoute('Checkout',async()=>{throw new Error('network unavailable')})
  await assert.rejects(api.prepareInitialRoute('/checkout'), /network unavailable/)
})
