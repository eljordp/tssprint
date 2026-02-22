import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const services = [
  { label: 'Custom Stickers', href: '/order' },
  { label: 'Vehicle Graphics', href: '/vehicle-graphics' },
  { label: 'Business Signage', href: '/signage' },
  { label: 'Event Canopies', href: '/canopies' },
  { label: 'Mylar Packaging', href: '/mylar-packaging' },
  { label: 'Window Film', href: '/window-film' },
]

const quickLinks = [
  { label: 'Order Stickers', href: '/order' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src="/logo.png" alt="The Sticker Smith" className="h-12 w-auto brightness-90" />
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              Bay Area's trusted print shop for custom stickers, signage, vehicle graphics, and more.
              Quality craftsmanship with fast turnaround.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.href}>
                  <Link to={s.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>23673 Connecticut St.<br />Hayward, CA 94545</span>
              </li>
              <li>
                <a href="tel:+15101234567" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                  (510) 123-4567
                </a>
              </li>
              <li>
                <a href="mailto:thestickersmith@gmail.com" className="flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                  thestickersmith@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted">
                <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>Mon–Sat: 9am – 6pm<br />Proof within 24hrs</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} The Sticker Smith. All rights reserved.</p>
          <p>Quotes same day &middot; Proof within 24 hours</p>
        </div>
      </div>
    </footer>
  )
}
