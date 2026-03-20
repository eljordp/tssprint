import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, Paintbrush, MapPin, PanelTop, Clock, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SignageSection {
  id: string
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  turnaround: string
  startingPrice: string
  ctaLabel: string
  ctaLink: string
}

const sections: SignageSection[] = [
  {
    id: 'storefront',
    icon: Building2,
    title: 'Storefront & Building Signs',
    description: 'Make your business visible from the street with professional exterior signage that commands attention day and night.',
    features: ['Channel letters', 'Cabinet & lightbox signs', 'Dimensional logos', 'Monument signs'],
    turnaround: '7-14 days',
    startingPrice: '$150',
    ctaLabel: 'Request Quote',
    ctaLink: '/contact',
  },
  {
    id: 'wall-graphics',
    icon: Paintbrush,
    title: 'Wall Graphics & Murals',
    description: 'Transform any wall into a branded experience with vibrant graphics, murals, and dimensional displays.',
    features: ['Vinyl wall graphics', 'Full-color murals', 'Acrylic signs', 'Foam board displays'],
    turnaround: '5-10 days',
    startingPrice: '$120',
    ctaLabel: 'Request Quote',
    ctaLink: '/contact',
  },
  {
    id: 'retractable-banners',
    icon: MapPin,
    title: 'Retractable Banners',
    description: 'Portable, professional banner stands for trade shows, lobbies, and events. Set up in seconds, impress for hours.',
    features: ['Economy to premium stands', 'Multiple widths', 'Replacement graphics', 'Travel cases'],
    turnaround: '3-5 days',
    startingPrice: '$89',
    ctaLabel: 'View Pricing',
    ctaLink: '/business-signage/retractable-banners',
  },
  {
    id: 'a-frames',
    icon: PanelTop,
    title: 'A-Frames & Sidewalk Signs',
    description: 'Portable signage that brings foot traffic to your door. Perfect for daily specials, promotions, and directional messaging.',
    features: ['Standard & custom sizes', 'Changeable inserts', 'Weather resistant', 'Weighted bases'],
    turnaround: '3-5 days',
    startingPrice: '$129',
    ctaLabel: 'View Pricing',
    ctaLink: '/business-signage/a-frames',
  },
]

export default function Signage() {
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
            <h1 className="mb-4">Business Signage</h1>
            <p className="text-lg text-muted-foreground">
              Professional signage solutions that elevate your storefront and guide your customers. Every quote includes a free digital proof.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Signage Cards */}
      <section className="section-padding pt-0">
        <div className="section-container space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={`${section.id}-section`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="card-elevated overflow-hidden">
                <div className="flex flex-col md:flex-row gap-0">
                  {/* Image placeholder */}
                  <div className="w-full md:w-72 lg:w-80 h-48 md:h-auto bg-muted/50 flex items-center justify-center flex-shrink-0 border-b md:border-b-0 md:border-r border-border">
                    <section.icon size={48} className="text-muted-foreground/30" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <section.icon size={20} className="text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg md:text-xl font-bold">{section.title}</h2>
                          <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features + Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {section.features.map((f) => (
                          <span key={f} className="text-xs text-muted-foreground">• {f}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground leading-none">
                            From {section.startingPrice}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock size={11} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{section.turnaround}</span>
                          </div>
                        </div>
                        <Link to={section.ctaLink} className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap">
                          {section.ctaLabel}
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

      {/* Bottom CTA */}
      <section className="section-padding bg-surface-overlay">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="mb-4">Ready to Upgrade Your Signage?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              From storefront signs to portable displays, we'll help your business stand out. Every quote includes a free digital proof.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">
                Start My Project
                <ArrowRight size={20} />
              </Link>
              <Link to="/services" className="btn-secondary text-lg px-8 py-4">
                View All Services
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
