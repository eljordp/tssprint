import { Link } from 'react-router-dom'
import { MapPin, Clock, Phone, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

export default function About() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold">About Us</h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Bay Area's trusted print and branding studio.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Who We <span className="text-primary">Are</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                The Sticker Smith is a full-service print and branding studio based in Hayward, California.
                We specialize in custom stickers, labels, vehicle graphics, business signage, event displays,
                window film, and packaging — everything your brand needs to stand out.
              </p>
              <p>
                We work with local businesses, national brands, and everyone in between. From a 50-piece
                sticker order to a 12-vehicle fleet wrap, every job gets the same attention to detail.
              </p>
              <p>
                Our process is built on trust: you see a digital proof of your order before anything goes
                to print. No surprises, no guesswork. You approve it, we produce it.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              How We <span className="text-primary">Work</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Every project starts with a conversation. Tell us what you need — sizes, quantities,
                materials, timeline — and we'll put together a quote the same day. Within 24 hours,
                you'll have a digital proof showing exactly how your order will look.
              </p>
              <p>
                Once you approve, we print, cut, and prepare your order. Bay Area customers can pick up
                locally, or we ship anywhere with free shipping on qualifying orders.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <MapPin className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="font-semibold text-sm mb-1">Located in Hayward</p>
              <p className="text-xs text-muted-foreground">23673 Connecticut St.<br />Hayward, CA 94545</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="font-semibold text-sm mb-1">Open 6 Days</p>
              <p className="text-xs text-muted-foreground">Mon – Sat: 9am – 6pm</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <Phone className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="font-semibold text-sm mb-1">Call or Text</p>
              <p className="text-xs text-muted-foreground">(510) 634-8203</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Start a Project?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Whether you have artwork ready or just an idea, we'll help bring it to life. Same-day quotes, proof within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button size="lg">
                  Get a Quote
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="secondary" size="lg">See Our Work</Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
