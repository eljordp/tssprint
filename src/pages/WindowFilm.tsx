import { Eye, Sun, Shield, Paintbrush, Building, Wrench } from 'lucide-react'
import ServicePage from '@/components/services/ServicePage'

export default function WindowFilm() {
  return (
    <ServicePage
      title="Window Film"
      subtitle="Privacy & Protection"
      description="Professional window film installation for offices, storefronts, and vehicles. Frosted privacy film, solar heat rejection, and security film solutions."
      ctaText="Get a Window Film Quote"
      features={[
        {
          icon: Eye,
          title: 'Frosted Film',
          description: 'Elegant privacy solutions for offices and storefronts. Custom patterns and logos available.',
        },
        {
          icon: Sun,
          title: 'Solar Film',
          description: 'Block up to 99% of UV rays and reduce heat by 80%. Lower energy costs year-round.',
        },
        {
          icon: Shield,
          title: 'Security Film',
          description: 'Shatter-resistant film holds glass together on impact. Deters break-ins and protects from storms.',
        },
        {
          icon: Paintbrush,
          title: 'Decorative Film',
          description: 'Custom printed designs, colored films, and textured options for unique aesthetics.',
        },
        {
          icon: Building,
          title: 'Commercial Solutions',
          description: 'Full building tinting and branding. We handle multi-story installations.',
        },
        {
          icon: Wrench,
          title: 'Professional Install',
          description: 'Bubble-free installation with clean edges. Backed by manufacturer warranty.',
        },
      ]}
      pricing={[
        {
          name: 'Frosted Privacy',
          price: 'From $8/sqft',
          description: 'Elegant privacy solution',
          features: ['Standard frosted film', 'Custom cut patterns', 'Logo integration', 'Professional install'],
        },
        {
          name: 'Solar Protection',
          price: 'From $12/sqft',
          description: 'Heat & UV rejection',
          features: ['Premium ceramic film', '99% UV rejection', 'Heat reduction', 'Energy savings', 'Warranty included'],
          popular: true,
        },
        {
          name: 'Security Film',
          price: 'From $15/sqft',
          description: 'Impact & break-in protection',
          features: ['8mil+ thickness', 'Shatter resistance', 'Storm protection', 'Break-in deterrent', 'Warranty included'],
        },
      ]}
    />
  )
}
