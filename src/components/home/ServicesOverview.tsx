import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sticker, Car, Tent, Printer, Store, Film } from 'lucide-react'

const services = [
  { icon: Sticker, title: 'Custom Stickers', description: 'Die-cut, kiss-cut, and vinyl stickers' },
  { icon: Car, title: 'Vehicle Graphics', description: 'Wraps, fleet branding & door graphics' },
  { icon: Tent, title: 'Event Canopies', description: 'Tents, flags, banners & displays' },
  { icon: Printer, title: 'Business Print', description: 'Cards, flyers & marketing materials' },
  { icon: Store, title: 'Business Signage', description: 'Storefront, wall graphics & A-frames' },
  { icon: Film, title: 'Window Film', description: 'Frosted, solar, security & graphics' },
]

export default function ServicesOverview() {
  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What We <span className="text-primary">Do</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Full-service print and branding for Bay Area businesses
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="card-elevated text-center p-4 md:p-6"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <service.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm md:text-base mb-1">{service.title}</h3>
              <p className="text-muted-foreground text-xs md:text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
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
