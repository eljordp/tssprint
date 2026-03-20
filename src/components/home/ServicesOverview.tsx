import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sticker, Car, Tent, Printer, Store, Film, Package } from 'lucide-react'

const services = [
  { icon: Sticker, title: 'Stickers', desc: 'Die-cut, kiss-cut & vinyl', link: '/order' },
  { icon: Package, title: 'Packaging', desc: 'Mylar bags & pouches', link: '/mylar-packaging' },
  { icon: Tent, title: 'Events', desc: 'Canopies, flags & banners', link: '/canopies' },
  { icon: Printer, title: 'Print', desc: 'Cards, flyers & marketing', link: '/business-print' },
  { icon: Car, title: 'Vehicles', desc: 'Wraps & fleet graphics', link: '/vehicle-graphics' },
  { icon: Store, title: 'Signage', desc: 'Storefront & wall graphics', link: '/signage' },
  { icon: Film, title: 'Film', desc: 'Privacy, solar & security', link: '/window-film' },
]

export default function ServicesOverview() {
  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            What We <span className="text-primary">Do</span>
          </h2>
          <p className="text-muted-foreground text-sm">Full-service print and branding for Bay Area businesses</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 md:gap-4 mb-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                to={service.link}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group text-center h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </span>
                <span className="text-[11px] text-muted-foreground leading-tight">{service.desc}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/services" className="btn-primary">
            View All Services
            <ArrowRight size={18} />
          </Link>
          <Link to="/projects" className="btn-secondary">
            See Our Work
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
