import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, MapPin, FileCheck } from 'lucide-react'
import shop from '@/assets/optimized/projects/sticker-smith-storefront.webp'

export default function Reviews() {
  return <section className="py-12 md:py-20 bg-card/30">
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-container max-w-6xl grid md:grid-cols-2 gap-8 items-center">
      <img src={shop} alt="The Sticker Smith shop in Hayward" loading="lazy" className="aspect-[4/3] object-cover rounded-2xl w-full border border-border" />
      <div>
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">Meet your print shop</p>
        <h2 className="text-3xl md:text-4xl font-black mb-4">Local people. Work you can see.</h2>
        <p className="text-muted-foreground mb-5">Browse our finished projects and read customer reviews on Google before choosing your printer.</p>
        <p className="flex gap-2 text-sm mb-3"><MapPin size={18} className="text-primary shrink-0" />23673 Connecticut St, Hayward · pickup by appointment</p>
        <p className="flex gap-2 text-sm mb-6"><FileCheck size={18} className="text-primary shrink-0" />Review your proof by email before production</p>
        <div className="flex flex-wrap gap-3"><a href="https://share.google/N0wDi6Y8eFK5EaR5v" target="_blank" rel="noopener noreferrer" className="btn-primary">Read Google reviews <ExternalLink size={16} /></a><Link to="/projects" className="btn-secondary">See our work</Link></div>
      </div>
    </motion.div>
  </section>
}
