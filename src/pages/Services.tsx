import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Tag, Truck, Tent, Printer, Store, Film, Package, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ServiceSection {
  id: string
  icon: LucideIcon
  title: string
  description: string
  bestFor: string[]
  commonRequests: string[]
  turnaround: string
  ctaLabel: string
  ctaLink: string
}

const services: ServiceSection[] = [
  {
    id: 'stickers',
    icon: Tag,
    title: 'Custom Stickers & Labels',
    description: 'High quality custom stickers and labels built for real-world use — durable, vibrant, and made to elevate your brand.',
    bestFor: ['Product Labeling & Retail', 'Business Branding', 'Promotional Giveaways', 'Event Marketing', 'Laptop & Device Stickers'],
    commonRequests: ['Die-cut Stickers', 'Kiss-cut Stickers', 'Roll Labels', 'Clear Stickers'],
    turnaround: '3-5 business days',
    ctaLabel: 'Order Stickers',
    ctaLink: '/order',
  },
  {
    id: 'vehicles',
    icon: Truck,
    title: 'Vehicle & Fleet Graphics',
    description: 'Turn your vehicles into mobile billboards with partial wraps, full wraps, and magnetic signs.',
    bestFor: ['Service Vehicles', 'Delivery Fleets', 'Food Trucks', 'Personal Branding'],
    commonRequests: ['Partial Wraps', 'Full Vehicle Wraps', 'Magnetic Signs', 'Window Perf'],
    turnaround: '7-14 business days',
    ctaLabel: 'Preview Vehicle',
    ctaLink: '/vehicle-graphics',
  },
  {
    id: 'canopies',
    icon: Tent,
    title: 'Event Branding & Displays',
    description: 'Custom canopies, banners, table covers, and event signage to make your brand stand out at any event.',
    bestFor: ["Farmer's Markets", 'Trade Shows', 'Outdoor Events', 'Pop-Up Shops'],
    commonRequests: ['10x10 Canopies', 'Table Covers', 'Retractable Banners', 'Backdrops'],
    turnaround: '7-10 business days',
    ctaLabel: 'Explore Events',
    ctaLink: '/canopies',
  },
  {
    id: 'business-print',
    icon: Printer,
    title: 'Business Print Essentials',
    description: 'Professional business cards, marketing collateral, office printing, and promotional materials.',
    bestFor: ['Local Businesses', 'Offices', 'Retail & Services', 'Startups'],
    commonRequests: ['Business Cards', 'Flyers & Brochures', 'Letterheads', 'Promotional Materials'],
    turnaround: '3-7 business days',
    ctaLabel: 'Order Print',
    ctaLink: '/business-print',
  },
  {
    id: 'signage',
    icon: Store,
    title: 'Business Signage',
    description: 'Professional signage solutions for storefronts, offices, and commercial spaces.',
    bestFor: ['Retail Storefronts', 'Office Branding', 'Trade Shows', 'Directional Signage'],
    commonRequests: ['Window Graphics', 'Wall Murals', 'A-Frame Signs', 'Outdoor Banners'],
    turnaround: '5-10 business days',
    ctaLabel: 'Explore Signage',
    ctaLink: '/signage',
  },
  {
    id: 'window-film',
    icon: Film,
    title: 'Window Film Solutions',
    description: 'Professional window film for privacy, solar protection, security, and decorative applications.',
    bestFor: ['Medical Offices & Clinics', 'Office Spaces', 'Retail Storefronts', 'Conference Rooms'],
    commonRequests: ['Window Decals', 'Perforated Film', 'Frosted Vinyl', 'Privacy Film'],
    turnaround: '5-10 business days',
    ctaLabel: 'Explore Film',
    ctaLink: '/window-film',
  },
  {
    id: 'packaging',
    icon: Package,
    title: 'Mylar & Custom Packaging',
    description: 'Custom-printed mylar bags and packaging with vibrant full-color printing and premium barrier protection.',
    bestFor: ['Wellness Brands', 'Retail Packaging', 'Promotional Kits', 'Food & Beverage'],
    commonRequests: ['Custom Mylar Bags', 'Stand-Up Pouches', 'Child Resistant Packaging', 'Custom Boxes'],
    turnaround: '5-7 business days',
    ctaLabel: 'Order Packaging',
    ctaLink: '/mylar-packaging',
  },
]

export default function Services() {
  return (
    <div>
      {/* Hero */}
      <section className="section-padding pb-12">
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

      {/* Service Sections */}
      {services.map((service) => (
        <motion.section
          key={service.id}
          id={`${service.id}-section`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pb-8"
        >
          <div className="section-container">
            <div className="card-elevated">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left - Title & Description */}
                <div className="md:col-span-2">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <service.icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold mb-2">{service.title}</h2>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h4 className="text-sm font-medium text-primary mb-2">Best For</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {service.bestFor.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-primary mb-2">Common Requests</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {service.commonRequests.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle size={12} className="text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right - Turnaround & CTA */}
                <div className="flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-sm mb-4 md:mb-0">
                    <Clock size={16} className="text-primary" />
                    <span className="text-muted-foreground">Typical turnaround:</span>
                    <span className="font-medium">{service.turnaround}</span>
                  </div>

                  <Link to={service.ctaLink} className="btn-primary mt-auto">
                    {service.ctaLabel}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      ))}

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
