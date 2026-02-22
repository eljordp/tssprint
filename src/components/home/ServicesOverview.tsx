import { Link } from 'react-router-dom'
import { ArrowRight, Sticker, Car, Store, Tent, Package, Film } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'

const services = [
  {
    icon: Sticker,
    title: 'Custom Stickers',
    description: 'Die-cut, kiss-cut, vinyl & holographic stickers in any shape or size.',
    href: '/order',
  },
  {
    icon: Car,
    title: 'Vehicle Graphics',
    description: 'Full wraps, partial wraps, and fleet branding that turns heads.',
    href: '/vehicle-graphics',
  },
  {
    icon: Store,
    title: 'Business Signage',
    description: 'Storefront signs, A-frames, wall graphics, and window displays.',
    href: '/signage',
  },
  {
    icon: Tent,
    title: 'Event Canopies',
    description: 'Custom canopies, table covers, banners, and backdrops for events.',
    href: '/canopies',
  },
  {
    icon: Package,
    title: 'Mylar Packaging',
    description: 'Custom mylar bags with your branding. Multiple sizes available.',
    href: '/mylar-packaging',
  },
  {
    icon: Film,
    title: 'Window Film',
    description: 'Frosted, solar, and security window films for any space.',
    href: '/window-film',
  },
]

export default function ServicesOverview() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">What We Do</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Full-service print shop serving the Bay Area with premium quality and fast turnaround.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, i) => (
            <FadeIn key={service.title} delay={i * 0.1}>
              <Link
                to={service.href}
                className="group block bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_var(--color-primary-glow)] h-full"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {service.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
