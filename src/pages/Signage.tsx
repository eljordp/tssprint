import { Store, PanelTop, Frame, Layers, Lightbulb, Wrench } from 'lucide-react'
import ServicePage from '@/components/services/ServicePage'

export default function Signage() {
  return (
    <ServicePage
      title="Business Signage"
      subtitle="Storefront & Commercial"
      description="Make a lasting first impression with professional business signage. From illuminated channel letters to vinyl window graphics, we build signs that attract customers."
      ctaText="Get a Signage Quote"
      features={[
        {
          icon: Store,
          title: 'Storefront Signs',
          description: 'Channel letters, dimensional signs, and illuminated displays. ADA compliant options available.',
        },
        {
          icon: Frame,
          title: 'A-Frame Signs',
          description: 'Portable sidewalk signs perfect for daily specials, promotions, and directional signage.',
        },
        {
          icon: Layers,
          title: 'Wall Graphics',
          description: 'Transform interior walls with branded graphics, murals, and motivational displays.',
        },
        {
          icon: PanelTop,
          title: 'Window Graphics',
          description: 'Perforated vinyl, frosted graphics, and full window wraps. See-through from inside.',
        },
        {
          icon: Lightbulb,
          title: 'Illuminated Signs',
          description: 'LED and backlit signs for 24/7 visibility. Energy efficient with long-lasting LEDs.',
        },
        {
          icon: Wrench,
          title: 'Professional Installation',
          description: 'Our team handles permitting, fabrication, and installation. Fully insured.',
        },
      ]}
      pricing={[
        {
          name: 'Window Graphics',
          price: 'From $150',
          description: 'Vinyl window displays',
          features: ['Custom design', 'Perforated or solid vinyl', 'Professional install', 'Easy removal'],
        },
        {
          name: 'Storefront Package',
          price: 'From $1,200',
          description: 'Complete storefront branding',
          features: ['Main sign', 'Window graphics', 'Door decals', 'Hours of operation', 'Design included'],
          popular: true,
        },
        {
          name: 'Channel Letters',
          price: 'From $2,000',
          description: 'Illuminated dimensional signs',
          features: ['LED illumination', 'Custom fabrication', 'Permit assistance', 'Professional install', 'Warranty included'],
        },
      ]}
    />
  )
}
