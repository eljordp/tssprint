import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const showcases = [
  {
    title: 'Custom Stickers That Last',
    subtitle: 'Waterproof, durable, precision cut',
    description: 'From die-cut vinyl to holographic finishes, our stickers are built to stick anywhere and withstand anything.',
    cta: 'Shop Stickers',
    href: '/order',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    title: 'The Perfect Fit for Products',
    subtitle: 'High-quality labels on rolls',
    description: 'Professional product labels and packaging stickers. Printed with precision for a flawless finish.',
    cta: 'Shop Labels',
    href: '/order',
    gradient: 'from-[hsl(200,80%,50%)]/20 to-[hsl(200,80%,50%)]/5',
  },
]

export default function ProductShowcase() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-6">
          {showcases.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }}>
              <Link to={item.href} className="group block relative overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50`} />
                <div className="relative p-8 md:p-10 flex flex-col min-h-[320px] md:min-h-[380px]">
                  <div className="flex-1">
                    <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">{item.subtitle}</p>
                    <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">{item.title}</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                    {item.cta}<ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
