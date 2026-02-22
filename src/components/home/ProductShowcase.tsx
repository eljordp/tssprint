import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const showcases = [
  {
    title: 'Custom Stickers That Last',
    subtitle: 'Waterproof, durable, precision cut',
    description: 'From die-cut vinyl to holographic finishes, our stickers are built to stick anywhere and withstand anything. Perfect for branding, packaging, and personal expression.',
    cta: 'Shop Stickers',
    href: '/order',
    gradient: 'from-primary/20 to-primary/5',
    icon: (
      <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        <circle cx="60" cy="60" r="50" fill="hsl(160 84% 44% / 0.1)" stroke="hsl(160 84% 44% / 0.3)" strokeWidth="2" />
        <path d="M40 55 L55 70 L80 45" stroke="hsl(160 84% 44%)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'The Perfect Fit for Products',
    subtitle: 'High-quality labels on rolls',
    description: 'Professional product labels, packaging stickers, and mylar bags. Printed with precision for a flawless finish on every product you ship.',
    cta: 'Shop Labels',
    href: '/order',
    gradient: 'from-[hsl(200,80%,50%)]/20 to-[hsl(200,80%,50%)]/5',
    icon: (
      <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        <rect x="20" y="30" width="80" height="60" rx="8" fill="hsl(200 80% 50% / 0.1)" stroke="hsl(200 80% 50% / 0.3)" strokeWidth="2" />
        <rect x="35" y="45" width="50" height="8" rx="4" fill="hsl(200 80% 50% / 0.3)" />
        <rect x="35" y="60" width="35" height="6" rx="3" fill="hsl(200 80% 50% / 0.2)" />
      </svg>
    ),
  },
]

export default function ProductShowcase() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-6">
          {showcases.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link
                to={item.href}
                className="group block relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50`} />
                <div className="relative p-8 md:p-10 flex flex-col min-h-[320px] md:min-h-[380px]">
                  <div className="flex-1">
                    <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">{item.subtitle}</p>
                    <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">{item.title}</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                    {item.cta}
                    <ArrowRight size={18} />
                  </div>
                </div>

                {/* Decorative icon */}
                <div className="absolute bottom-4 right-4 w-24 h-24 md:w-32 md:h-32 opacity-30 group-hover:opacity-50 transition-opacity">
                  {item.icon}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
