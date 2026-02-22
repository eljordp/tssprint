import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
}

interface ServicePageProps {
  title: string
  subtitle: string
  description: string
  features: Feature[]
  pricing?: PricingTier[]
  ctaText?: string
  ctaLink?: string
}

export default function ServicePage({
  title,
  subtitle,
  description,
  features,
  pricing,
  ctaText = 'Get a Quote',
  ctaLink = '/contact',
}: ServicePageProps) {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-sm text-primary uppercase tracking-widest mb-3">{subtitle}</p>
            <h1 className="text-4xl sm:text-5xl font-bold">{title}</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              {description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ctaLink}>
                <Button size="lg">
                  {ctaText}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">Request a Free Quote</Button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.1}>
              <div className="bg-card border border-border rounded-xl p-6 h-full hover:border-primary/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Pricing */}
        {pricing && pricing.length > 0 && (
          <>
            <FadeIn>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold">Pricing</h2>
                <p className="mt-3 text-muted-foreground">Transparent pricing. No hidden fees.</p>
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
              {pricing.map((tier, i) => (
                <FadeIn key={tier.name} delay={i * 0.1}>
                  <div
                    className={`bg-card border rounded-xl p-6 h-full flex flex-col ${
                      tier.popular
                        ? 'border-primary shadow-[0_0_30px_var(--color-primary-glow)]'
                        : 'border-border'
                    }`}
                  >
                    {tier.popular && (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-primary text-white rounded-full mb-3 self-start">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-semibold text-foreground text-lg">{tier.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">{tier.price}</p>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">{tier.description}</p>
                    <ul className="space-y-2 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/contact" className="mt-6">
                      <Button variant={tier.popular ? 'primary' : 'secondary'} className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </FadeIn>
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <FadeIn>
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Contact us today for a free quote. Proof within 24 hours, quotes same day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button size="lg">
                  Contact Us
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="tel:+15101234567">
                <Button variant="outline" size="lg">Call Now</Button>
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
