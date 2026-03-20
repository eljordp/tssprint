import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Tag, Truck, Tent, Printer, Store, Film, Package, Clock, ArrowRight, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ServiceSection {
  id: string
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  turnaround: string
  startingPrice: string
  ctaLabel: string
  ctaLink: string
  popular?: boolean
}

const services: ServiceSection[] = [
  {
    id: 'stickers',
    icon: Tag,
    title: 'Custom Stickers & Labels',
    description: 'High quality custom stickers and labels built for real-world use — durable, vibrant, and made to elevate your brand.',
    features: ['Die-cut & kiss-cut', 'Roll labels', 'Clear & holographic', 'Matte, gloss, embossed'],
    turnaround: '3-5 days',
    startingPrice: '$51',
    ctaLabel: 'Order Stickers',
    ctaLink: '/order',
    popular: true,
  },
  {
    id: 'packaging',
    icon: Package,
    title: 'Mylar & Custom Packaging',
    description: 'Custom-printed mylar bags and packaging with vibrant full-color printing and premium barrier protection.',
    features: ['Stand-up pouches', 'Child-resistant options', 'Foil & holographic', 'Direct print available'],
    turnaround: '5-7 days',
    startingPrice: '$89',
    ctaLabel: 'Order Packaging',
    ctaLink: '/mylar-packaging',
    popular: true,
  },
  {
    id: 'canopies',
    icon: Tent,
    title: 'Event Branding & Displays',
    description: 'Custom canopies, banners, table covers, and event signage to make your brand stand out at any event.',
    features: ['10x10 canopies', 'Table covers & throws', 'Feather flags', 'Backdrops & displays'],
    turnaround: '7-10 days',
    startingPrice: '$89',
    ctaLabel: 'Explore Events',
    ctaLink: '/canopies',
  },
  {
    id: 'business-print',
    icon: Printer,
    title: 'Business Print Essentials',
    description: 'Professional business cards, marketing collateral, office printing, and promotional materials.',
    features: ['Business cards', 'Flyers & brochures', 'Letterheads & envelopes', 'Postcards & magnets'],
    turnaround: '3-7 days',
    startingPrice: '$39',
    ctaLabel: 'Order Print',
    ctaLink: '/business-print',
  },
  {
    id: 'vehicles',
    icon: Truck,
    title: 'Vehicle & Fleet Graphics',
    description: 'Turn your vehicles into mobile billboards with partial wraps, full wraps, and magnetic signs.',
    features: ['Door & spot graphics', 'Partial & full wraps', 'Fleet branding programs', 'Professional installation'],
    turnaround: '7-14 days',
    startingPrice: '$75',
    ctaLabel: 'Get a Quote',
    ctaLink: '/vehicle-graphics',
  },
  {
    id: 'signage',
    icon: Store,
    title: 'Business Signage',
    description: 'Professional signage solutions for storefronts, offices, and commercial spaces.',
    features: ['Storefront signs', 'Wall graphics & murals', 'A-frame signs', 'Retractable banners'],
    turnaround: '5-10 days',
    startingPrice: '$45',
    ctaLabel: 'Explore Signage',
    ctaLink: '/signage',
  },
  {
    id: 'window-film',
    icon: Film,
    title: 'Window Film Solutions',
    description: 'Professional window film for privacy, solar protection, security, and decorative applications.',
    features: ['Frosted privacy film', 'Solar & UV protection', 'Security film', 'Custom designs & logos'],
    turnaround: '5-10 days',
    startingPrice: '$8/sqft',
    ctaLabel: 'Configure Film',
    ctaLink: '/window-film',
  },
]

export default function Services() {
  return (
    <div>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="mb-4">Our Services</h1>
            <p className="text-lg text-muted-foreground">
              From small sticker orders to full fleet graphics, we deliver premium print solutions with proof-based production.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="section-padding pt-0">
        <div className="section-container space-y-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              id={`${service.id}-section`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`card-elevated overflow-hidden ${service.popular ? 'border-primary/30' : ''}`}>
                <div className="flex flex-col md:flex-row gap-0">
                  {/* Image placeholder */}
                  <div className="w-full md:w-72 lg:w-80 h-48 md:h-auto bg-muted/50 flex items-center justify-center flex-shrink-0 border-b md:border-b-0 md:border-r border-border">
                    <service.icon size={48} className="text-muted-foreground/30" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <service.icon size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg md:text-xl font-bold">{service.title}</h2>
                            {service.popular && (
                              <span className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                <Star size={10} className="fill-primary" /> Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{service.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features + Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {service.features.map((f) => (
                          <span key={f} className="text-xs text-muted-foreground">• {f}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground leading-none">
                            From {service.startingPrice}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock size={11} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{service.turnaround}</span>
                          </div>
                        </div>
                        <Link to={service.ctaLink} className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap">
                          {service.ctaLabel}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-surface-overlay">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="mb-4">Not Sure What You Need?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Tell us about your project and we'll help you find the right solution. Every quote includes a free digital proof.
            </p>
            <Link to="/contact" className="btn-primary text-lg px-8 py-4">
              Start My Project
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
