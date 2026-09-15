import assert from 'node:assert/strict'
import test from 'node:test'
import { cartRequest, CartRequestError } from '../src/lib/cartSession.ts'

test('cart requests preserve actionable errors and distinguish unavailable links from temporary failures', async () => {
  const originalFetch = globalThis.fetch
  try {
    for (const status of [400, 410, 429, 503]) {
      globalThis.fetch = async () => Response.json({ error: 'Recovery test message' }, { status })
      await assert.rejects(cartRequest('restore', { token: 'fixture' }), error => error instanceof CartRequestError && error.status === status && error.message === 'Recovery test message')
    }
    globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
    await assert.rejects(cartRequest('restore', {}), error => error instanceof CartRequestError && error.status === 503 && /remain in this browser/.test(error.message))
    globalThis.fetch = async () => { throw new TypeError('Network unavailable') }
    await assert.rejects(cartRequest('restore', {}), /Network unavailable/)
  } finally { globalThis.fetch = originalFetch }
})
