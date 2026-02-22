import { Car, Palette, Shield, Users, Ruler, Clock } from 'lucide-react'
import ServicePage from '@/components/services/ServicePage'

export default function VehicleGraphics() {
  return (
    <ServicePage
      title="Vehicle Graphics"
      subtitle="Mobile Advertising"
      description="Transform any vehicle into a mobile billboard. From full wraps to partial graphics and fleet branding, we deliver head-turning results with premium 3M and Avery materials."
      ctaText="Get a Vehicle Quote"
      features={[
        {
          icon: Car,
          title: 'Full Vehicle Wraps',
          description: 'Complete color change and custom designs. Premium cast vinyl with 7+ year durability.',
        },
        {
          icon: Palette,
          title: 'Partial Wraps',
          description: 'Strategic placement for maximum impact. Perfect for logos, contact info, and key messaging.',
        },
        {
          icon: Users,
          title: 'Fleet Branding',
          description: 'Consistent branding across your entire fleet. Volume discounts available for 3+ vehicles.',
        },
        {
          icon: Shield,
          title: 'Paint Protection Film',
          description: 'Protect your investment with clear PPF. Guards against chips, scratches, and UV damage.',
        },
        {
          icon: Ruler,
          title: 'Custom Design',
          description: 'Our designers create eye-catching concepts. We provide full mockups before production.',
        },
        {
          icon: Clock,
          title: 'Fast Turnaround',
          description: 'Most wraps completed in 3-5 business days. Rush options available for tight deadlines.',
        },
      ]}
      pricing={[
        {
          name: 'Partial Wrap',
          price: 'From $800',
          description: 'Strategic branding on key panels',
          features: ['Logo & contact info', 'Door panels or tailgate', '5-year vinyl', 'Design included'],
        },
        {
          name: 'Full Wrap',
          price: 'From $2,500',
          description: 'Complete vehicle transformation',
          features: ['Full color change', 'Custom design', '3M or Avery vinyl', '7+ year durability', 'Professional install'],
          popular: true,
        },
        {
          name: 'Fleet Package',
          price: 'Custom',
          description: 'Consistent branding at scale',
          features: ['Volume discounts', 'Fleet management', 'Consistent branding', 'Priority scheduling', 'Dedicated account manager'],
        },
      ]}
    />
  )
}
