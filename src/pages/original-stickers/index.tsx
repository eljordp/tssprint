import type { CSSProperties } from 'react'
import Order from './Order'

// Keep the original layout with readable text on its cyan buttons.
const originalColors = {
  '--color-primary-foreground': 'hsl(220 15% 8%)',
  '--color-accent-foreground': 'hsl(220 15% 8%)',
} as CSSProperties

export default function OriginalStickerPage() {
  return <div style={originalColors}><Order /></div>
}
