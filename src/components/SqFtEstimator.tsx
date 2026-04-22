import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ArrowRight } from 'lucide-react'

type Tier = { maxSqFt: number; price: number; label: string }

type Props = {
  service: string
  title?: string
  subtitle?: string
  tiers: Tier[]
}

export default function SqFtEstimator({
  service,
  title = 'Quick Estimate',
  subtitle = 'Enter your approximate square footage for a ballpark price. Final quote in 24 hours.',
  tiers,
}: Props) {
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [directSqft, setDirectSqft] = useState('')

  const w = parseFloat(width) || 0
  const h = parseFloat(height) || 0
  const manual = parseFloat(directSqft) || 0
  const sqft = manual > 0 ? manual : w * h

  const tier = sqft > 0 ? tiers.find((t) => sqft <= t.maxSqFt) : null
  const overLargest = sqft > 0 && !tier

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-2">
        <Calculator size={16} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">{title}</span>
      </div>
      <p className="text-muted-foreground text-sm mb-6">{subtitle}</p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Width (ft)</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={width}
            onChange={(e) => { setWidth(e.target.value); setDirectSqft('') }}
            className="input-base"
            placeholder="e.g. 8"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Height (ft)</span>
          <input
            type="number"
            min="0"
            step="0.5"
            value={height}
            onChange={(e) => { setHeight(e.target.value); setDirectSqft('') }}
            className="input-base"
            placeholder="e.g. 4"
          />
        </label>
      </div>
      <div className="relative flex items-center justify-center my-3">
        <div className="absolute inset-x-0 h-px bg-border" />
        <span className="relative bg-card px-3 text-[10px] text-muted-foreground uppercase tracking-widest">or</span>
      </div>
      <label className="block mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Enter sq ft directly</span>
        <input
          type="number"
          min="0"
          value={directSqft}
          onChange={(e) => { setDirectSqft(e.target.value); setWidth(''); setHeight('') }}
          className="input-base"
          placeholder="e.g. 32"
        />
      </label>

      <div className="bg-background/60 border border-border rounded-xl p-4 mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Approximate area</span>
          <span className="text-xs text-muted-foreground font-mono">
            {sqft > 0 ? `${sqft.toFixed(1)} sq ft` : '—'}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Starting from</span>
          <motion.span
            key={tier?.label ?? (overLargest ? 'custom' : 'idle')}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-primary tabular-nums"
          >
            {tier ? `$${tier.price.toLocaleString()}` : overLargest ? 'Custom' : '—'}
          </motion.span>
        </div>
        {tier && (
          <p className="text-[11px] text-muted-foreground mt-2">{tier.label}</p>
        )}
        {overLargest && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Over {tiers[tiers.length - 1].maxSqFt} sq ft — needs a custom quote.
          </p>
        )}
      </div>

      <a
        href={`/contact?service=${encodeURIComponent(service)}${sqft > 0 ? `&size=${sqft.toFixed(0)}+sq+ft` : ''}`}
        className="btn-primary w-full justify-center"
      >
        Request Exact Quote <ArrowRight size={14} />
      </a>
      <p className="text-[11px] text-muted-foreground text-center mt-3">
        Price depends on install access, artwork complexity, and material. Final in writing.
      </p>
    </div>
  )
}
