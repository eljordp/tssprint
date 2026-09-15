import { readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

// Encoder output can differ across operating systems. Match a snapshot image to
// the same photograph and pixel dimensions, never merely the first basename.
export async function imageAssetMap(directory) {
  const entries = await Promise.all((await readdir(directory))
    .filter(file => /\.(?:webp|png|jpe?g)$/.test(file))
    .map(async file => {
      const { width, height, format } = await sharp(path.join(directory, file)).metadata()
      return [file, `${file.replace(/-[A-Za-z0-9_-]{8}\.[^.]+$/, '')}:${width}:${height}:${format}`]
    }))
  return Object.fromEntries(entries)
}

export function imageReplacements(previous, current) {
  const candidates = new Map()
  for (const [file, identity] of Object.entries(current)) {
    const files = candidates.get(identity) ?? []
    files.push(file)
    candidates.set(identity, files)
  }
  return new Map(Object.entries(previous).flatMap(([file, identity]) => {
    if (current[file]) return []
    const matches = candidates.get(identity) ?? []
    return matches.length === 1 ? [[file, matches[0]]] : []
  }))
}
