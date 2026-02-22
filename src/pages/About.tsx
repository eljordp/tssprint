import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function About() {
  return (
    <section className="py-8 md:py-16">
      <div className="section-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4">About The Sticker Smith</h1>
          <p className="text-muted-foreground text-lg">Bay Area's trusted sticker and print company for creators, brands, and dreamers.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="prose prose-invert max-w-none">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">The Sticker Smith is a Bay Area sticker and print company built for creators, brands, and dreamers. We specialize in custom stickers, labels, packaging, signage, vehicle graphics, and everything in between.</p>
            <p>Every order includes a free digital proof — you approve before we produce. We believe in quality, transparency, and making the ordering process as easy as possible.</p>
            <p>Whether you need 50 stickers or 10,000, we've got you covered with competitive pricing, premium materials, and fast turnaround times.</p>
            <div className="pt-4">
              <Link to="/contact" className="btn-primary">Get a Free Quote<ArrowRight size={18} /></Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
