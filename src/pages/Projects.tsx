import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FadeIn from '@/components/ui/FadeIn'

const categories = ['All', 'Vehicle Wraps', 'Signage', 'Events', 'Stickers', 'Packaging']

const projects = [
  { title: 'Tesla Model 3 Full Wrap', category: 'Vehicle Wraps', color: 'from-teal-900/40 to-emerald-900/40' },
  { title: 'Bay Street Coffee Storefront', category: 'Signage', color: 'from-amber-900/40 to-orange-900/40' },
  { title: 'TechCrunch Disrupt Booth', category: 'Events', color: 'from-blue-900/40 to-indigo-900/40' },
  { title: 'Craft Brewery Label Set', category: 'Stickers', color: 'from-purple-900/40 to-pink-900/40' },
  { title: 'Food Delivery Fleet – 12 Vans', category: 'Vehicle Wraps', color: 'from-green-900/40 to-teal-900/40' },
  { title: 'Downtown Salon Window Graphics', category: 'Signage', color: 'from-rose-900/40 to-red-900/40' },
  { title: 'Wedding Vinyl Dance Floor', category: 'Events', color: 'from-pink-900/40 to-rose-900/40' },
  { title: 'Cannabis Brand Mylar Bags', category: 'Packaging', color: 'from-lime-900/40 to-green-900/40' },
  { title: 'Die-Cut Logo Stickers – 5000pc', category: 'Stickers', color: 'from-cyan-900/40 to-blue-900/40' },
  { title: 'Real Estate A-Frame Signs', category: 'Signage', color: 'from-yellow-900/40 to-amber-900/40' },
  { title: 'Music Festival Backdrop', category: 'Events', color: 'from-violet-900/40 to-purple-900/40' },
  { title: 'Sprinter Van Partial Wrap', category: 'Vehicle Wraps', color: 'from-sky-900/40 to-cyan-900/40' },
]

export default function Projects() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? projects : projects.filter((p) => p.category === active)

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold">Our Projects</h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse our portfolio of vehicle wraps, storefront signage, event setups, and custom print work.
            </p>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                  active === cat
                    ? 'bg-primary text-white shadow-[0_0_15px_var(--color-primary-glow)]'
                    : 'bg-card border border-border text-muted hover:text-foreground hover:border-border-hover'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => {
              // Vary heights for masonry effect
              const heights = ['h-56', 'h-72', 'h-64', 'h-80', 'h-60', 'h-68']
              const height = heights[i % heights.length]

              return (
                <motion.div
                  key={project.title}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="break-inside-avoid"
                >
                  <div
                    className={`group relative ${height} rounded-xl overflow-hidden bg-gradient-to-br ${project.color} border border-border cursor-pointer`}
                  >
                    {/* Placeholder pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                        backgroundSize: '20px 20px',
                      }} />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end">
                      <div className="p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-xs text-primary uppercase tracking-wider mb-1">{project.category}</p>
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
