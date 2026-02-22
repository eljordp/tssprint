import { Link } from 'react-router-dom'
import { ArrowRight, Sticker, Car, Store, Tent, Package, Film, Printer } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'

const services = [
  {
    icon: Sticker,
    title: 'Custom Stickers',
    description: 'Die-cut, kiss-cut, vinyl, holographic, and clear stickers. Any shape, any size, any quantity.',
    href: '/order',
    features: ['Die-cut & Kiss-cut', 'Vinyl & Holographic', 'Weatherproof options', 'No minimums'],
  },
  {
    icon: Car,
    title: 'Vehicle Graphics',
    description: 'Full wraps, partial wraps, and fleet branding. Transform any vehicle into a mobile billboard.',
    href: '/vehicle-graphics',
    features: ['Full vehicle wraps', 'Partial wraps', 'Fleet branding', 'Professional install'],
  },
  {
    icon: Store,
    title: 'Business Signage',
    description: 'Storefront signs, A-frame signs, wall graphics, and window graphics to attract customers.',
    href: '/signage',
    features: ['Storefront signs', 'A-frame signs', 'Wall graphics', 'Window graphics'],
  },
  {
    icon: Tent,
    title: 'Event Canopies',
    description: 'Custom canopies, table covers, retractable banners, feather flags, and backdrops.',
    href: '/canopies',
    features: ['Custom canopies', 'Table covers', 'Retractable banners', 'Feather flags'],
  },
  {
    icon: Package,
    title: 'Mylar Packaging',
    description: 'Custom mylar bags with your branding. Size and quantity calculator available.',
    href: '/mylar-packaging',
    features: ['Custom printed bags', 'Multiple sizes', 'Resealable options', 'Bulk pricing'],
  },
  {
    icon: Film,
    title: 'Window Film',
    description: 'Frosted, solar, and security window films for offices, storefronts, and vehicles.',
    href: '/window-film',
    features: ['Frosted film', 'Solar film', 'Security film', 'Professional install'],
  },
  {
    icon: Printer,
    title: 'Business Print',
    description: 'Business cards, marketing collateral, office printing, and promotional materials.',
    href: '/business-print',
    features: ['Business cards', 'Marketing collateral', 'Office printing', 'Promo materials'],
  },
]

export default function Services() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold">Our Services</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
              Full-service print shop serving the Bay Area. From stickers to vehicle wraps,
              we handle it all with premium quality and fast turnaround.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 0.08}>
              <Link
                to={service.href}
                className="group block bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_var(--color-primary-glow)] h-full"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {service.title}
                    </h2>
                    <p className="text-sm text-muted leading-relaxed mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.map((f) => (
                        <span key={f} className="px-2.5 py-1 text-xs rounded-md bg-background border border-border text-muted">
                          {f}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                      Learn more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
