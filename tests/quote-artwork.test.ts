import test from 'node:test'
import assert from 'node:assert/strict'
import { appendQuoteArtwork, readQuoteArtwork } from '../src/lib/quoteArtwork.ts'

test('quote attachment survives serialization without leaking storage metadata into display text', () => {
  const artwork = { bucket: 'order-artwork', path: 'pending/2026-09-14/abc_123.pdf', fileName: 'Front & back.pdf', contentType: 'application/pdf', size: 100, uploadedAt: '2026-09-14' }
  const parsed = readQuoteArtwork(appendQuoteArtwork('500 cards', artwork))
  assert.deepEqual(parsed, { message: '500 cards', artwork: { path: artwork.path, fileName: artwork.fileName } })
})
test('malformed and foreign attachment paths never become admin download links', () => {
  for (const path of ['../../secret', 'pending/2026-09-14/../secret', 'https://example.com/file', 'other/2026-09-14/a.pdf']) {
    const message = `Request\nArtwork file reference: ${JSON.stringify({path, fileName: 'a.pdf'})}`
    assert.deepEqual(readQuoteArtwork(message), { message, artwork: null })
  }
  assert.equal(readQuoteArtwork('Request\nArtwork file reference: null').artwork, null)
  assert.equal(readQuoteArtwork('Request\nArtwork file reference: {').artwork, null)
})
