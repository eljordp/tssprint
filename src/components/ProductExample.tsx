import { motion, useReducedMotion } from 'framer-motion'
import ProductExampleMedia from './ProductExampleMedia'
import { productExamples } from '@/lib/productExamples'

export default function ProductExample({ category }: { category: string }) {
  const reduceMotion = useReducedMotion()
  const example = productExamples[category]
  if (!example) return null
  return <motion.figure key={category} initial={reduceMotion ? false : { opacity: 0.5, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden rounded-2xl border border-border bg-card">
    <div className="hidden md:block"><ProductExampleMedia example={example} /></div>
    <figcaption className="p-4 md:p-5">
      <p className="text-xs text-muted-foreground mb-2">{example.caption}</p>
      <h3 className="text-lg font-bold mb-2">{category}</h3>
      <p className="text-sm mb-3">{example.description}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{example.details}</p>
    </figcaption>
  </motion.figure>
}
