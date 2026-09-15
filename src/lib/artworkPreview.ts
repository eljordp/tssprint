export interface ArtworkPreview { url: string; pages?: number }
const CACHE_KEY = 'tss-artwork-previews-v1'

// Small, local thumbnails only. Production artwork remains in private storage.
export function readArtworkPreview(path: string): ArtworkPreview | null {
  try {
    const entries = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') as { path: string; preview: ArtworkPreview }[]
    const preview = entries.find(entry => entry.path === path)?.preview
    return preview?.url?.startsWith('data:image/webp;base64,') ? preview : null
  } catch { return null }
}
export function saveArtworkPreview(path: string, preview: ArtworkPreview) {
  if (preview.url.length > 200_000) return
  try {
    const entries = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') as { path: string; preview: ArtworkPreview }[]
    localStorage.setItem(CACHE_KEY, JSON.stringify([{ path, preview }, ...entries.filter(entry => entry.path !== path)].slice(0, 8)))
  } catch { /* A full or disabled cache must never block an order. */ }
}

export async function createArtworkPreview(file: File, signal: AbortSignal): Promise<ArtworkPreview> {
  if (!file.size || file.size > 50 * 1024 * 1024) throw new Error('Choose a non-empty artwork file under 50 MB.')
  const pdfCompatibleAi = /\.ai$/i.test(file.name) && (await file.slice(0, 1024).text()).includes('%PDF-')
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name) || pdfCompatibleAi) {
    const { renderPdfPreview } = await import('./pdfArtworkPreview')
    signal.throwIfAborted()
    return renderPdfPreview(file, signal)
  }
  if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(file.name)) {
    throw new Error('This file can be uploaded, but cannot be previewed here. Use PDF, PNG, JPG, WebP or SVG for a preview.')
  }
  try {
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      const abort = () => reader.abort()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error || new Error('Could not read image.'))
      reader.onabort = () => reject(new DOMException('Preview cancelled', 'AbortError'))
      reader.onloadend = () => signal.removeEventListener('abort', abort)
      signal.throwIfAborted()
      signal.addEventListener('abort', abort, { once: true })
      reader.readAsDataURL(file)
    })
    const image = new Image()
    image.src = url
    await image.decode()
    signal.throwIfAborted()
    const scale = Math.min(1, 768 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Preview is unavailable in this browser.')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return { url: canvas.toDataURL('image/webp', 0.85) }
  } catch (error) {
    if (signal.aborted) throw error
    throw new Error('This image could not be previewed. Try exporting a fresh PDF, PNG or JPG; your upload is handled separately.')
  }
}
