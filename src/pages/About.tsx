import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Car, Building2, Tent, Printer, Film, Package, Star, Clock, FileCheck, MapPin, Shield, Zap, CheckCircle, Heart } from 'lucide-react'

const services = [
  { icon: Car, title: 'Vehicle Graphics', description: 'Full and partial wraps, fleet branding, door and spot graphics.' },
  { icon: Building2, title: 'Business Signage', description: 'Storefront signs, wall graphics, A-frames, retractable banners.' },
  { icon: Tent, title: 'Event Displays', description: 'Custom tents, feather flags, table covers, retractable banners.' },
  { icon: Printer, title: 'Business Print', description: 'Business cards, flyers, brochures, and marketing collateral.' },
  { icon: Film, title: 'Window Film', description: 'Frosted film, solar film, security film, decorative graphics.' },
  { icon: Package, title: 'Custom Packaging', description: 'Branded mylar bags, labels, stickers, and product packaging.' },
]

const stats = [
  { value: '500+', label: 'Projects Completed', icon: CheckCircle },
  { value: '5.0', label: 'Google Rating', icon: Star },
  { value: '24hr', label: 'Digital Proofs', icon: Clock },
  { value: 'Bay Area', label: 'Local Business', icon: MapPin },
]

const values = [
  { icon: Shield, title: 'Quality Materials', description: 'We use premium vinyl, inks, and substrates on every job. Your brand deserves materials that last, not the cheapest option available.' },
  { icon: Zap, title: 'Fast Turnaround', description: 'Most projects ship within days, not weeks. Rush orders are available when you need them, and we communicate timelines upfront.' },
  { icon: FileCheck, title: 'Free Digital Proofs', description: 'Every order includes a free digital proof before production. You see exactly what you are getting and approve before we print.' },
  { icon: Heart, title: 'Local Service', description: 'We are a Bay Area business serving Bay Area businesses. Local pickup, face-to-face consultations, and real accountability.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
}

export default function About() {
  return (
    <>
      {/* Hero Banner */}
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">About Us</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">Bay Area's trusted sticker and print company since day one</p>
        </motion.div>
      </div>

      {/* Our Story */}
      <section className="py-12 md:py-20">
        <div className="section-container">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black mb-8">Our Story</h2>
            <div className="space-y-8 text-muted-foreground text-lg leading-relaxed text-left">
              <p>
                The Sticker Smith started with a simple idea: Bay Area businesses and creators deserve better print. Not the overpriced, slow-turnaround, take-it-or-leave-it experience you get from big box shops. Real print work, done right, from people who actually care about the finished product.
              </p>
              <p>
                We built our reputation one job at a time — wrapping vans for local fleets, printing stickers for independent brands, producing signage for storefronts across the East Bay. Every project taught us something new, and every client pushed us to get better. That is how you grow a print business: by showing up and delivering.
              </p>
              <p>
                Today we work with everyone from solo creators ordering their first 100 stickers to companies like Safeway and Albertsons running full fleet graphics programs. The scale changes, but the approach never does. We treat every job like our name is on it — because it is.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-12 md:py-20 bg-card">
        <div className="section-container">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black">What We Do</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.06 }}
                className="bg-background border border-border rounded-2xl p-6 md:p-8 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 md:py-16" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-white/80 mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-white/70 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-20">
        <div className="section-container">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black">Why Choose Us</h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-card">
        <div className="section-container">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-8">Ready to Start?</h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Tell us about your project and get a free quote. No commitments, no pressure — just honest pricing and a plan to make it happen.
            </p>
            <Link to="/contact" className="btn-primary">
              Get a Free Quote <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
