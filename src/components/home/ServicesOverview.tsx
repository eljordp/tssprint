import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sticker, Car, Tent, Printer, Store, Film, Package } from 'lucide-react'

const services = [
  { icon: Sticker, title: 'Stickers', link: '/order' },
  { icon: Package, title: 'Packaging', link: '/mylar-packaging' },
  { icon: Tent, title: 'Events', link: '/canopies' },
  { icon: Printer, title: 'Print', link: '/business-print' },
  { icon: Car, title: 'Vehicles', link: '/vehicle-graphics' },
  { icon: Store, title: 'Signage', link: '/signage' },
  { icon: Film, title: 'Film', link: '/window-film' },
]

export default function ServicesOverview() {
  return (
    <section className="py-8 bg-background">
      <div className="section-container">
        <div className="flex items-center justify-center gap-2 md:gap-6 flex-wrap">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                to={service.link}
                className="flex flex-col items-center gap-1.5 px-3 py-2 md:px-5 md:py-3 rounded-xl hover:bg-card hover:border-primary/30 border border-transparent transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {service.title}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
