import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CreditCard, FileText, Briefcase, Clock, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface PrintSection {
  id: string
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  turnaround: string
  startingPrice: string
  link: string
}

const sections: PrintSection[] = [
  {
    id: 'business-cards',
    icon: CreditCard,
    title: 'Business Cards & Identity Kits',
    description:
      'Make a lasting first impression with premium business cards. Available in standard, thick, and ultra-thick stocks with professional finishing options.',
    features: ['Standard & custom sizes', 'Matte/gloss/soft-touch finishes', 'Foil stamping & spot UV', 'Rounded corners'],
    turnaround: '3-5 days',
    startingPrice: '$39',
    link: '/business-print/business-cards',
  },
  {
    id: 'print-marketing',
    icon: FileText,
    title: 'Print Marketing',
    description:
      'Eye-catching promotional materials to showcase your products, services, and events. From single-page flyers to direct mail campaigns.',
    features: ['Flyers & brochures', 'Postcards & mailers', 'Door hangers & rack cards', 'Magnets & vehicle magnets'],
    turnaround: '3-5 days',
    startingPrice: '$59',
    link: '/business-print/marketing-collateral',
  },
  {
    id: 'office-printing',
    icon: Briefcase,
    title: 'Office & Operations Printing',
    description:
      'Professional stationery and operational documents that reinforce your brand across all business communications.',
    features: ['Letterheads & envelopes', 'Notepads & memo pads', 'Presentation folders', 'Invoice & receipt books'],
    turnaround: '5-7 days',
    startingPrice: '$79',
    link: '/business-print/office-printing',
  },
]

export default function BusinessPrint() {
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
            <h1 className="mb-4">Business Print Essentials</h1>
            <p className="text-lg text-muted-foreground">
              Professional everyday print assets built for durability, clarity, and a strong first impression.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section Cards */}
      <section className="section-padding pt-0">
        <div className="section-container space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
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
                        <Link to={section.link} className="btn-primary text-sm px-5 py-2.5 whitespace-nowrap group">
                          View Pricing
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
            <h2 className="mb-4">Ready to Elevate Your Brand?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              From business cards to complete branding kits, we'll help you make the right impression. Every quote includes a free digital proof.
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
