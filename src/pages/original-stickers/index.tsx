import type { CSSProperties } from 'react'
import Order from './Order'

// Restore the pre-September-14 page's colors without changing other routes.
const originalColors = {
  '--color-primary-foreground': 'hsl(0 0% 100%)',
  '--color-accent-foreground': 'hsl(0 0% 100%)',
} as CSSProperties

export default function OriginalStickerPage() {
  return <div style={originalColors}><Order /></div>
}
