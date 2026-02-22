import { CreditCard, FileText, Printer, Gift, Layers, Truck } from 'lucide-react'
import ServicePage from '@/components/services/ServicePage'

export default function BusinessPrint() {
  return (
    <ServicePage
      title="Business Print"
      subtitle="Professional Printing"
      description="Premium business cards, marketing collateral, office printing, and promotional materials. Fast turnaround with exceptional quality."
      ctaText="Order Business Print"
      features={[
        {
          icon: CreditCard,
          title: 'Business Cards',
          description: 'Premium cardstock with matte, glossy, or soft-touch finishes. Foil stamping and spot UV available.',
        },
        {
          icon: FileText,
          title: 'Marketing Collateral',
          description: 'Brochures, flyers, postcards, and door hangers. Full color on premium paper stock.',
        },
        {
          icon: Printer,
          title: 'Office Printing',
          description: 'Letterheads, envelopes, NCR forms, and notepads. Consistent branding across all materials.',
        },
        {
          icon: Gift,
          title: 'Promotional Materials',
          description: 'Custom branded merchandise, packaging inserts, and promotional items for events.',
        },
        {
          icon: Layers,
          title: 'Large Format',
          description: 'Posters, banners, and displays. Up to 60" wide with vibrant color reproduction.',
        },
        {
          icon: Truck,
          title: 'Fast Turnaround',
          description: 'Standard 3-5 day production. Rush options available for next-day and same-day.',
        },
      ]}
      pricing={[
        {
          name: 'Business Cards',
          price: 'From $29',
          description: '250 premium cards',
          features: ['16pt cardstock', 'Full color both sides', 'Matte or glossy', 'Free design review'],
        },
        {
          name: 'Marketing Kit',
          price: 'From $199',
          description: 'Complete brand package',
          features: ['500 business cards', '250 flyers', '100 postcards', 'Consistent design', 'Premium paper'],
          popular: true,
        },
        {
          name: 'Custom Quote',
          price: 'Contact Us',
          description: 'Large or specialty orders',
          features: ['Custom quantities', 'Special finishes', 'Foil & embossing', 'Bulk discounts', 'Dedicated support'],
        },
      ]}
    />
  )
}
