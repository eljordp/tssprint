import test from 'node:test'
import assert from 'node:assert/strict'
import { routePreloads } from '../scripts/route-preloads.mjs'
test('route preload graph includes shared dependencies once and excludes unrelated pages', () => {
  const manifest = {
    'src/pages/Order.tsx': { file: 'assets/Order-fresh.js', imports: ['shared'] },
    shared: { file: 'assets/shared-fresh.js', imports: ['cycle'] },
    cycle: { file: 'assets/cycle.js', imports: ['shared'] },
    'src/pages/Admin.tsx': { file: 'assets/Admin.js' },
  }
  const output = routePreloads(manifest, '/stickers')
  assert.equal((output.match(/shared-fresh/g) || []).length, 1)
  assert.match(output, /Order-fresh/)
  assert.doesNotMatch(output, /Admin/)
  assert.equal(routePreloads(manifest, '/unknown'), '')
})
