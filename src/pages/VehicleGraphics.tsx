import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Shield, Wrench, Zap } from 'lucide-react'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ProductionArtwork, { type ArtworkSelection } from '@/components/ProductionArtwork'
import ServicePageIntro from '@/components/ServicePageIntro'
import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import bhogalTruck from '@/assets/projects/bhogal-construction.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'

const features = [
  'Full Vehicle Wraps',
  'Partial Wraps & Accents',
  'Fleet Branding & Graphics',
  'Door & Spot Graphics',
  'Perforated Window Graphics',
  'Vinyl Lettering & Decals',
]

const specs = [
  { icon: Shield, label: 'Material', value: 'Vinyl selected for the vehicle and coverage' },
  { icon: Clock, label: 'Turnaround', value: '5-10 business days (design + print + install)' },
  { icon: Wrench, label: 'Installation', value: 'Installation scope included in your estimate' },
  { icon: Zap, label: 'Durability', value: 'Depends on film, finish and care' },
]

const process = [
  { step: '1', title: 'Consultation', desc: 'Tell us about your vehicle, branding goals, and budget. We\'ll recommend the right solution.' },
  { step: '2', title: 'Design & Proof', desc: 'Our team creates a digital mockup on your exact vehicle model. Review the layout and request changes before approval.' },
  { step: '3', title: 'Production', desc: 'Printed on premium vinyl with protective laminate. Quality checked before install.' },
  { step: '4', title: 'Installation', desc: 'Professional installation at our Bay Area shop. Most wraps completed in 1-2 days.' },
]

const localAnswers = [
  {
    title: 'Vehicle graphics in Hayward CA',
    copy: 'We produce door logos, spot graphics, vinyl lettering, decals, partial wraps, full wraps, and fleet graphics for Hayward and Bay Area businesses.',
  },
  {
    title: 'For single vehicles or fleets',
    copy: 'Bring one work truck, a van, a box truck, or a multi-vehicle fleet. We can design around the vehicle model and brand guidelines.',
  },
  {
    title: 'Proofed before install',
    copy: 'Artwork is mocked up before production so sizing, placement, color, and legibility can be checked before the vinyl is printed.',
  },
]

const vehicleFaqs = [
  {
    q: 'Where can I get vehicle graphics in Hayward CA?',
    a: 'The Sticker Smith produces vehicle graphics in Hayward CA for Bay Area businesses, including door decals, vinyl lettering, partial wraps, full wraps, box truck graphics, van graphics, and fleet branding.',
  },
  {
    q: 'Do you handle vehicle wrap design and installation?',
    a: 'Yes. We can help with design, digital proofing, premium vinyl production, laminate, and professional installation for most vehicle graphic projects.',
  },
  {
    q: 'What should I send for a vehicle graphics quote?',
    a: 'Send the year, make, model, vehicle photos, logo files, the graphics you want, and whether you need decals, lettering, a partial wrap, full wrap, or fleet rollout.',
  },
]

export default function VehicleGraphics() {
  const [artwork, setArtwork] = useState<ArtworkSelection>({ status: 'idle' })
  return (
    <>
      <section id="quote" className="pt-6 md:pt-10 pb-8 md:pb-16 scroll-mt-24">
        <div className="section-container">
          <ServicePageIntro
            eyebrow="Vehicle Graphics"
            title="Vehicle Graphics in Hayward & the Bay Area"
            description="Compare vehicle lettering, partial coverage and full wraps. Send your vehicle details for a tailored estimate."
          />
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 items-start">
          <div className="md:sticky md:top-24 space-y-4">
            <figure className="rounded-2xl border border-border bg-card overflow-hidden"><img src={bhogalTruck} alt="Bhogal Construction wrapped box truck" width={900} height={675} className="w-full aspect-[4/3] object-cover" /><figcaption className="p-4"><h2 className="font-bold text-lg">Choose how much of the vehicle to cover</h2><p className="text-sm text-muted-foreground mt-2">Door graphics keep most of the original paint visible. Partial wraps cover selected panels. Full wraps cover the vehicle body. Your estimate confirms the surfaces and installation included.</p></figcaption></figure>
            <div className="grid grid-cols-2 gap-3"><figure><img src={safewayInstall} alt="Applying Safeway door lettering" className="w-full aspect-[4/3] object-cover rounded-xl" /><figcaption className="text-sm mt-2">Door lettering · install detail</figcaption></figure><figure><img src={albertsonsVan} alt="Albertsons branded vehicle" className="w-full aspect-[4/3] object-cover rounded-xl" /><figcaption className="text-sm mt-2">Fleet graphics · Albertsons</figcaption></figure></div>
            <details className="rounded-xl border border-border p-4"><summary className="font-bold text-sm cursor-pointer">Add artwork (optional)</summary><div className="mt-4"><ProductionArtwork size="Vehicle artwork · placement confirmed in your proof" purpose="quote" onChange={setArtwork} /></div></details>
          </div>
          <EstimateForm
            artworkSelection={artwork}
            service="Vehicle Graphics"
            title="Get a Vehicle Graphics Estimate"
            subtitle="Tell us the vehicle, the coverage you want and your deadline. We will reply by email with pricing and next steps."
            fields={[
              { name: 'vehicle', label: 'Vehicle (year, make, model)', type: 'text', required: true, placeholder: '2023 Ford Transit 250' },
              {
                name: 'wrapType',
                label: 'Wrap type',
                type: 'select',
                required: true,
                options: ['Full Wrap', 'Partial Wrap (half, quarter)', 'Decals / Lettering / Door Graphics', 'Fleet (multiple vehicles)', 'Not sure yet'],
              },
              {
                name: 'timeline',
                label: 'Timeline',
                type: 'select',
                options: ['ASAP / Within 2 weeks', '2–4 weeks', '1–2 months', 'Flexible'],
              },
              { name: 'inspiration', label: 'Reference links (Dropbox, Google Drive, Instagram)', type: 'text', placeholder: 'Paste a link' },
            ]}
          />
          </div>
        </div>
      </section>
      <section className="py-8 md:py-16 border-t border-border/50">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mb-8">
            <div className="mb-5">
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Hayward Vehicle Graphics</p>
              <h2 className="text-2xl md:text-3xl font-black mb-3">Vehicle decals, wraps, and fleet branding made for local business traffic.</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are searching for vehicle graphics in Hayward CA, The Sticker Smith can help turn work vans, trucks, service vehicles, and fleet vehicles into readable brand exposure around the Bay Area.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {localAnswers.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.copy}</p>
                </div>
              ))}
            </div>
          </motion.div>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-5xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-10">
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
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Vehicle Wraps We've Done"
            subtitle="Real jobs, real clients. Bay Area fleets and single vehicles."
            projects={[
              { src: albertsonsVan, alt: 'Albertsons fleet van wrap', caption: 'Albertsons fleet' },
              { src: bhogalTruck, alt: 'Bhogal Construction truck wrap', caption: 'Bhogal Construction' },
              { src: procareFleet, alt: 'ProCare fleet branding', caption: 'ProCare fleet' },
              { src: safewayTruck, alt: 'Safeway truck wrap', caption: 'Safeway' },
              { src: safewayInstall, alt: 'Safeway installation', caption: 'Install day' },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Vehicle Graphics FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black">Wraps, decals, and fleet branding questions</h2>
          </div>
          <div className="grid gap-4">
            {vehicleFaqs.map((faq) => (
              <div key={faq.q} className="bg-card/70 border border-border rounded-xl p-5">
                <h3 className="font-bold text-base md:text-lg mb-2">{faq.q}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
