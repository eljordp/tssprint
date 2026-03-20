import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ArrowRight } from 'lucide-react'
import heroImg from '@/assets/placeholders/custom-stickers.png'

const trustStrip = [
  'Free Shipping on Orders $50+',
  '24hr Proof Turnaround',
  'Quality Guaranteed',
]

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-background">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, hsl(0 0% 8%) 0%, hsl(0 0% 4%) 100%)' }} />

      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/8 rounded-full blur-[80px]" />

      <div className="section-container relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">4.9 out of 5</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-sm text-muted-foreground">Bay Area's Trusted Print Shop</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.08] tracking-tight"
            >
              The Sticker Smith
              <br />
              <span className="text-primary">The Bay's Trusted</span>
              <br />
              Print & Branding
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10"
            >
              Serving Bay Area businesses with custom stickers, labels, packaging, signage, and vehicle graphics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link to="/order" className="btn-primary text-lg px-8 py-4">
                Order Stickers
                <ArrowRight size={20} />
              </Link>
              <Link to="/contact" className="btn-secondary text-lg px-8 py-4">
                Start My Project
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
            >
              {trustStrip.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />}
                  <span>{item}</span>
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <img
              src={heroImg}
              alt="Custom stickers by The Sticker Smith"
              className="w-full max-w-lg lg:max-w-xl xl:max-w-2xl object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
