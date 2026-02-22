import { Tent, RectangleHorizontal, Flag, Theater, Palette } from 'lucide-react'
import ServicePage from '@/components/services/ServicePage'

export default function Canopies() {
  return (
    <ServicePage
      title="Event Canopies"
      subtitle="Trade Shows & Events"
      description="Stand out at any event with custom-printed canopies, table covers, banners, and backdrops. Durable materials with vibrant full-color printing."
      ctaText="Get an Event Quote"
      features={[
        {
          icon: Tent,
          title: 'Custom Canopies',
          description: '10x10, 10x15, and 10x20 pop-up canopies with full dye-sublimation printing.',
        },
        {
          icon: RectangleHorizontal,
          title: 'Table Covers',
          description: 'Fitted and throw-style table covers. 4ft, 6ft, and 8ft sizes available.',
        },
        {
          icon: Flag,
          title: 'Retractable Banners',
          description: 'Pull-up banner stands in various sizes. Easy setup, lightweight, and portable.',
        },
        {
          icon: Flag,
          title: 'Feather Flags',
          description: 'Eye-catching feather and teardrop flags. Indoor and outdoor options with bases.',
        },
        {
          icon: Theater,
          title: 'Backdrops',
          description: 'Step-and-repeat, media walls, and fabric backdrops. Perfect for photo ops and branding.',
        },
        {
          icon: Palette,
          title: 'Custom Design',
          description: 'Full design services included. We create layouts that maximize visual impact.',
        },
      ]}
      pricing={[
        {
          name: 'Starter Kit',
          price: 'From $399',
          description: 'Perfect for small events',
          features: ['Retractable banner', 'Table cover (6ft)', 'Custom design', 'Carry bag included'],
        },
        {
          name: 'Event Package',
          price: 'From $1,299',
          description: 'Complete event presence',
          features: ['10x10 canopy', 'Table cover', 'Retractable banner', 'Feather flag', 'Full design'],
          popular: true,
        },
        {
          name: 'Premium Setup',
          price: 'From $2,499',
          description: 'Maximum impact',
          features: ['10x10 canopy with walls', 'Table cover', '2 retractable banners', '2 feather flags', 'Backdrop', 'Priority production'],
        },
      ]}
    />
  )
}
