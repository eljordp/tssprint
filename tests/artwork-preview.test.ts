import { afterEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { createArtworkPreview, readArtworkPreview, saveArtworkPreview } from '../src/lib/artworkPreview.ts'

const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
afterEach(() => {
  if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor)
  else Reflect.deleteProperty(globalThis, 'localStorage')
})
function mockStorage() {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => values.set(key, value),
  } })
  return values
}
const preview = { url: 'data:image/webp;base64,QUFB', pages: 2 }
test('restores thumbnail and PDF page count by exact private artwork path', () => {
  mockStorage()
  saveArtworkPreview('pending/one/file.pdf', preview)
  assert.deepEqual(readArtworkPreview('pending/one/file.pdf'), preview)
  assert.equal(readArtworkPreview('pending/two/file.pdf'), null)
})
test('bounds preview storage and replaces a thumbnail without duplicates', () => {
  mockStorage()
  for (let i = 0; i < 10; i++) saveArtworkPreview(String(i), preview)
  assert.equal(readArtworkPreview('0'), null)
  assert.deepEqual(readArtworkPreview('9'), preview)
  saveArtworkPreview('9', { ...preview, pages: 1 })
  assert.equal(readArtworkPreview('9')?.pages, 1)
  assert.ok(readArtworkPreview('2'))
  saveArtworkPreview('oversize', { url: 'data:image/webp;base64,' + 'A'.repeat(200_000) })
  assert.equal(readArtworkPreview('oversize'), null)
})
test('corrupt or disabled local storage cannot block uploading or cart editing', () => {
  const values = mockStorage()
  values.set('tss-artwork-previews-v1', '{bad json')
  assert.equal(readArtworkPreview('test'), null)
  assert.doesNotThrow(() => saveArtworkPreview('test', preview))
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked') } })
  assert.equal(readArtworkPreview('test'), null)
  assert.doesNotThrow(() => saveArtworkPreview('test', preview))
})
test('only locally generated image data is accepted from the cache', () => {
  const values = mockStorage()
  values.set('tss-artwork-previews-v1', JSON.stringify([{ path: 'test', preview: { url: 'https://unexpected.example/image' } }]))
  assert.equal(readArtworkPreview('test'), null)
})
test('empty and oversized files fail clearly before decoding', async () => {
  await assert.rejects(createArtworkPreview(new File([], 'empty.pdf'), new AbortController().signal), /non-empty/)
  await assert.rejects(createArtworkPreview({ size: 51 * 1024 * 1024 } as File, new AbortController().signal), /50 MB/)
})
test('unsupported production formats explain the preview limitation', async () => {
  for (const ext of ['eps', 'psd', 'tif', 'tiff', 'heic', 'ai']) {
    await assert.rejects(createArtworkPreview(new File(['production fixture'], `test.${ext}`), new AbortController().signal), /can be uploaded, but cannot be previewed/)
  }
})
