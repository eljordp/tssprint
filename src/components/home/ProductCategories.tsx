import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Scissors, Layers, ScrollText, Package } from 'lucide-react'

const categories = [
  {
    icon: Scissors,
    title: 'Die-Cut Stickers',
    description: 'Any shape, precision cut to your design',
    href: '/order',
  },
  {
    icon: Layers,
    title: 'Sticker Sheets',
    description: 'Multiple designs on one sheet',
    href: '/order',
  },
  {
    icon: ScrollText,
    title: 'Labels on Roll',
    description: 'Fast, pro-level product labeling',
    href: '/order',
  },
  {
    icon: Package,
    title: 'Mylar Packaging',
    description: 'Custom branded packaging bags',
    href: '/mylar-packaging',
  },
]

export default function ProductCategories() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link
                to={cat.href}
                className="group block bg-card border border-border rounded-2xl p-6 md:p-8 text-center hover:border-primary/40 hover:shadow-[0_0_40px_hsl(160_84%_44%/0.08)] transition-all duration-300"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <cat.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                </div>
                <h3 className="font-bold text-base md:text-lg mb-1">{cat.title}</h3>
                <p className="text-muted-foreground text-sm">{cat.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
