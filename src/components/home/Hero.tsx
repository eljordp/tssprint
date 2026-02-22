import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Package, Shield } from 'lucide-react'

const trustItems = [
  { icon: Clock, label: '24hr Proof Turnaround' },
  { icon: Package, label: 'Free Shipping Available' },
  { icon: Shield, label: 'Quality Guaranteed' },
]

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, hsl(0 0% 8%) 0%, hsl(0 0% 4%) 100%)' }} />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 98%) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(0 0% 98%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="section-container relative z-10">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]"
          >
            The Sticker Smith
            <br />
            <span className="text-primary">The Bay's Trusted </span>
            <br />
            Print & Branding
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            Serving Bay Area businesses with custom stickers, labels, packaging, signage, and vehicle graphics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <Link to="/order" className="btn-primary text-lg px-8 py-4">
              Order Stickers
              <ArrowRight size={20} />
            </Link>
            <Link to="/contact" className="btn-secondary text-lg px-8 py-4">
              Start My Project
            </Link>
          </motion.div>

          {/* Trust Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            {trustItems.map((item, index) => (
              <div key={index} className="trust-badge">
                <item.icon size={16} className="text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
    </section>
  )
}
