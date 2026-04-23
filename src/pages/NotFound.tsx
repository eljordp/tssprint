import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Home } from 'lucide-react'
import tornVinyl from '@/assets/pages/404-torn.jpg'

export default function NotFound() {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-16 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        <img src={tornVinyl} alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="section-container max-w-2xl text-center relative">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary font-bold text-xs uppercase tracking-widest mb-4"
        >
          Misprint
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
          className="text-7xl md:text-9xl font-black text-primary mb-4 tracking-tight"
        >
          404
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl md:text-3xl font-black mb-3"
        >
          This page didn't make it through the press.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-muted-foreground mb-10"
        >
          The route <span className="font-mono text-foreground bg-card border border-border rounded px-2 py-0.5 text-sm">{location.pathname}</span> doesn't exist. Let's get you back.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/" className="btn-primary">
            <Home size={16} /> Back to home
          </Link>
          <Link to="/stickers" className="btn-secondary">
            Order stickers <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
