import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { ArtworkPreview } from './artworkPreview'

GlobalWorkerOptions.workerSrc = workerUrl

export async function renderPdfPreview(file: File, signal: AbortSignal): Promise<ArtworkPreview> {
  const data = new Uint8Array(await file.arrayBuffer())
  signal.throwIfAborted()
  const task = getDocument({
    data,
    cMapUrl: `/pdfjs/${version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `/pdfjs/${version}/standard_fonts/`,
    iccUrl: `/pdfjs/${version}/iccs/`,
    wasmUrl: `/pdfjs/${version}/wasm/`,
  })
  const cancel = () => { void task.destroy() }
  signal.addEventListener('abort', cancel, { once: true })
  try {
    const pdf = await task.promise
    const page = await pdf.getPage(1)
    signal.throwIfAborted()
    const original = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: 768 / Math.max(original.width, original.height) })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await page.render({ canvas, viewport, background: 'rgb(255,255,255)' }).promise
    signal.throwIfAborted()
    return { url: canvas.toDataURL('image/webp', 0.85), pages: pdf.numPages }
  } catch (error) {
    if (signal.aborted) throw error
    if (error instanceof Error && error.name === 'PasswordException') {
      throw new Error('This PDF is password protected. Export an unlocked copy to see a preview.')
    }
    throw new Error('This PDF could not be previewed. Try exporting a fresh PDF or a PNG; your upload is handled separately.')
  } finally {
    signal.removeEventListener('abort', cancel)
    await task.destroy()
  }
}
