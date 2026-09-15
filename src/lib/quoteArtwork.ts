import type { CartItem } from '@/context/CartContext'

const MARKER = '\nArtwork file reference: '
export function appendQuoteArtwork(message: string, artwork?: CartItem['artwork']) {
  return artwork ? `${message}${MARKER}${JSON.stringify({ path: artwork.path, fileName: artwork.fileName })}` : message
}
export function readQuoteArtwork(message: string) {
  const start = message.lastIndexOf(MARKER)
  if (start < 0) return { message, artwork: null }
  try {
    const file = JSON.parse(message.slice(start + MARKER.length))
    if (typeof file.path !== 'string' || !/^pending\/\d{4}-\d{2}-\d{2}\/[a-zA-Z0-9_.-]+$/.test(file.path) || typeof file.fileName !== 'string') return { message, artwork: null }
    return { message: message.slice(0, start), artwork: { path: file.path as string, fileName: file.fileName as string } }
  } catch { return { message, artwork: null } }
}
