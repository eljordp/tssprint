import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8')
  .replaceAll('import.meta.env.VITE_GA4_MEASUREMENT_ID', "'G-4B9FXT1HQ9'")
  .replaceAll('import.meta.env.DEV', 'false')
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
function setup({ staff = false, debug = false, prerender = false, serializedScript = false } = {}) {
  const exports = {}, scripts = [], storage = new Map(staff ? [['tss_analytics_optout', '1']] : [])
  const store = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
  const window = { __prerender: prerender, location: { origin: 'https://tssprint.com', pathname: '/stickers', search: debug ? '?utm_source=codex&utm_medium=verification&analytics_debug=1' : '', href: 'https://tssprint.com/stickers' } }
  const context = { exports, window, URLSearchParams, URL, console, crypto, localStorage: store, sessionStorage: store, navigator: { userAgent: 'test' }, document: { title: 'Stickers', referrer: '', getElementById: () => serializedScript || scripts[0], createElement: () => ({}), head: { appendChild: script => scripts.push(script) } }, require: name => name === '@vercel/analytics' ? { track() {} } : { supabase: { from: () => ({ insert: async () => ({}) }) } } }
  vm.runInNewContext(code, context)
  return { api: exports, window, scripts }
}

test('GA4 receives native Arguments commands and one manual page_view per route', () => {
  const { api, window, scripts } = setup()
  api.trackPageView('/stickers')
  api.trackPageView('/services')
  const commands = Array.from(window.dataLayer, entry => Array.from(entry))
  assert.equal(scripts.length, 1)
  assert.equal(Array.isArray(window.dataLayer[0]), false)
  assert.equal(Object.prototype.toString.call(window.dataLayer[0]), '[object Arguments]')
  assert.equal(commands.filter(c => c[0] === 'config').length, 1)
  assert.equal(commands.find(c => c[0] === 'config')[2].send_page_view, false)
  assert.deepEqual(commands.filter(c => c[1] === 'page_view').map(c => c[2].page_path), ['/stickers', '/services'])
})

test('a prerender-serialized loader does not skip GA4 configuration', () => {
  const { api, window, scripts } = setup({ serializedScript: true })
  api.trackPageView('/stickers')
  assert.equal(scripts.length, 0)
  assert.equal(window.dataLayer[1][0], 'config')
  assert.equal(window.dataLayer[2][1], 'page_view')
})

test('staff and prerender sessions suppress commerce events as well as page views', () => {
  for (const options of [{ staff: true }, { prerender: true }, { prerender: true, debug: true }]) {
    const { api, window } = setup(options)
    api.trackPageView('/stickers')
    api.trackAddToCart({ item: { name: 'Test', quantity: 1, price: 65 }, value: 65 })
    assert.equal(window.dataLayer, undefined)
  }
})

test('explicit debug session marks events as internal and includes commerce data', () => {
  const { api, window } = setup({ staff: true, debug: true })
  api.trackAddToCart({ item: { name: 'Business Cards', quantity: 1, price: 65 }, value: 65 })
  const event = window.dataLayer.find(c => c[1] === 'add_to_cart')
  assert.equal(event[2].debug_mode, true)
  assert.equal(event[2].traffic_type, 'internal')
  assert.equal(event[2].send_to, 'G-4B9FXT1HQ9')
  assert.equal(event[2].items[0].price, 65)
})


test('the app has one GA initializer; no earlier bootstrap can shadow its queue', () => {
  const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
  assert.doesNotMatch(main, /ga-bootstrap/)
})

test('GA4 preserves UTM attribution without sending unrelated URL parameters', () => {
  const { api, window } = setup()
  window.location.search = '?utm_source=google&utm_medium=organic&utm_campaign=gbp&utm_content=website&email=private%40example.com&restore=secret-token'
  api.trackPageView('/stickers')
  const config = window.dataLayer.find(c => c[0] === 'config')[2]
  const event = window.dataLayer.find(c => c[1] === 'page_view')[2]
  for (const params of [config, event]) {
    assert.equal(params.campaign_source, 'google')
    assert.equal(params.campaign_medium, 'organic')
    assert.equal(params.campaign_name, 'gbp')
    assert.equal(params.campaign_content, 'website')
    assert.equal(params.page_location, 'https://tssprint.com/stickers')
    assert.doesNotMatch(JSON.stringify(params), /private|secret-token/)
  }
})

test('campaign values reject email addresses and excessive lengths', () => {
  const { api, window } = setup()
  window.location.search = '?utm_source=private%40example.com&utm_campaign=' + 'x'.repeat(201)
  api.trackEvent('view_item')
  const event = window.dataLayer.find(c => c[1] === 'view_item')[2]
  assert.equal(event.campaign_source, undefined)
  assert.equal(event.campaign_name, undefined)
})

test('preview and local builds suppress customer analytics unless GA4 debug is explicit', () => {
  for (const origin of ['https://tssprint-stage.vercel.app', 'http://127.0.0.1:5179']) {
    const { api, window } = setup()
    window.location.origin = origin
    assert.equal(api.shouldSuppressAnalytics(), true)
    api.trackPageView('/stickers')
    assert.equal(window.dataLayer, undefined)
  }
  const { api, window } = setup({ debug: true })
  window.location.origin = 'https://tssprint-stage.vercel.app'
  assert.equal(api.shouldSuppressAnalytics(), true)
  api.trackPageView('/stickers')
  const event = window.dataLayer.find(c => c[1] === 'page_view')[2]
  assert.equal(event.debug_mode, true)
  assert.equal(event.traffic_type, 'internal')
})
