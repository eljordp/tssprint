import type { ImgHTMLAttributes } from 'react'

// Build-time companions preserve the original photos and let the browser select its size.
const originals = import.meta.glob<string>('/src/assets/**/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const variants = import.meta.glob<string>('/src/assets/**/*.{jpg,jpeg,png,webp}', { eager: true, query: '?w=240;480;960;1440&format=webp&quality=80&withoutEnlargement&as=srcset', import: 'default' })
const sources = new Map(Object.entries(originals).map(([path, url]) => [url, variants[path]]))

export default function ResponsiveImage({ src, sizes = '(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const srcSet = src ? sources.get(src) : undefined
  return <img {...props} src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} />
}
