import { motion } from 'framer-motion'
import { CheckCircle, Clock, Shield, Layers, Zap } from 'lucide-react'
import ProductOrder from '@/components/ProductOrder'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import bizCardsFoil from '@/assets/optimized/projects/bp-cleopatra-discount-cards-800.webp'
import postcards from '@/assets/optimized/projects/bp-empire-automotive-flyer-1000.jpg'
import pressroom from '@/assets/optimized/projects/bp-cleopatra-tattoo-flyer-1000.jpg'

const features = [
  'Business Cards',
  'Flyers & Door Hangers',
  'Postcards & Mailers',
  'Vehicle Magnets',
  'Premium Finishes',
  'Fast Turnaround',
]

const specs = [
  { icon: Shield, label: 'Paper Stock', value: '14pt & 16pt premium cardstock' },
  { icon: Clock, label: 'Turnaround', value: '3-5 business days standard' },
  { icon: Layers, label: 'Finishes', value: 'Matte, gloss, soft-touch, spot UV' },
  { icon: Zap, label: 'Printing', value: 'Full color, double-sided, bleed' },
]

const process = [
  { step: '1', title: 'Choose Product', desc: 'Pick from business cards, flyers, postcards, door hangers, or vehicle magnets. Select size and quantity.' },
  { step: '2', title: 'Upload Design', desc: 'Upload your print-ready file or let us help with design. We accept AI, PDF, PNG, JPG at 300 DPI.' },
  { step: '3', title: 'Proof & Approve', desc: 'We send a free digital proof within 24 hours. Check layout, colors, and text before we print.' },
  { step: '4', title: 'Print & Ship', desc: 'Printed on premium stock with your chosen finish. Ships free to anywhere in the US.' },
]

export default function BusinessPrint() {
  return (
    <>
      <section className="pt-6 md:pt-10 pb-8 md:pb-16">
        <div className="section-container">
          <div className="max-w-6xl mx-auto mb-5 text-center">
            <h1 className="text-2xl md:text-3xl font-black">Custom Printing in Hayward</h1>
            <p className="mt-2 text-sm text-muted-foreground">Choose your product, upload your artwork, and review your price. Proof approval before printing.</p>
          </div>
          <div id="shop" className="scroll-mt-24 mb-12">
            <ProductOrder
              categoryNames={['Business Cards', 'Flyers & Door Hangers', 'Postcards', 'Vehicle Magnets']}
              artworkFirst
            />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-8">
            <h2 className="text-2xl font-black mb-6">What We Offer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {specs.map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-sm font-semibold">{s.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10 mb-12">
            <h2 className="text-2xl font-black mb-6">How It Works</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map(p => (
                <div key={p.step}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black mb-3">{p.step}</div>
                  <h3 className="font-bold mb-1">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <PortfolioStrip
            title="Print Work We're Proud Of"
            subtitle="Printed cards and promotional artwork from the shop portfolio."
            projects={[
              { src: bizCardsFoil, alt: 'Printed discount cards for Cleopatra Ink', caption: 'Cleopatra Ink · discount cards' },
              { src: postcards, alt: 'Empire Automotive promotional flyer artwork', caption: 'Empire Automotive · flyer artwork' },
              { src: pressroom, alt: 'Cleopatra Ink promotional flyer artwork', caption: 'Cleopatra Ink · flyer artwork' },
            ]}
          />
        </div>
      </section>
      <section id="quote" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <EstimateForm
            service="Business Print"
            title="Bulk or Custom Print Quote"
            subtitle="Ordering 2,500+ cards, custom shapes, specialty finishes? Tell us the job and we'll send a sharper price."
            fields={[
              {
                name: 'printType',
                label: 'What are you printing?',
                type: 'select',
                required: true,
                options: ['Business Cards', 'Flyers / Brochures', 'Postcards', 'Door Hangers', 'Letterhead / Envelopes', 'Vehicle Magnets', 'Multiple / Not sure'],
              },
              { name: 'quantity', label: 'Approximate quantity', type: 'text', required: true, placeholder: 'e.g. 2,500 cards · 1,000 flyers' },
              {
                name: 'finish',
                label: 'Finish preference (if any)',
                type: 'select',
                options: ['Standard (matte or gloss)', 'Soft-touch', 'Spot UV', 'Foil stamping', 'Embossed', 'Not sure'],
              },
              {
                name: 'turnaround',
                label: 'Turnaround',
                type: 'select',
                options: ['Standard (5–7 days)', 'Rush (2–3 days)', 'Flexible'],
              },
            ]}
          />
        </div>
      </section>
    </>
  )
}
