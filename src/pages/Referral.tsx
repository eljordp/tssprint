import ResponsiveImage from '@/components/ResponsiveImage'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import EstimateForm from '@/components/EstimateForm'
import referralHero from '@/assets/optimized/projects/drive-magdre-die-cut-stacks.webp'

export default function Referral() {
  return <section className="py-10 md:py-16">
    <div className="section-container max-w-6xl">
      <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm font-bold text-primary mb-3">Referral Program</p>
          <h1 className="text-4xl md:text-5xl font-black mb-5">Know someone who needs print?</h1>
          <p className="text-lg text-muted-foreground">Introduce them to The Sticker Smith. Contact the shop to confirm your referral code, eligible orders and reward terms before sharing.</p>
          <a href="#referral-request" className="btn-primary mt-6">Ask about referrals <ArrowRight size={18} /></a>
        </motion.div>
        <ResponsiveImage src={referralHero} alt="Finished MagDre die-cut sticker stacks" className="rounded-2xl border border-border aspect-[4/3] object-cover w-full" />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mb-12">
        {[['1. Contact the shop', 'Tell us your name and how you plan to refer customers.'], ['2. Confirm the details', 'We reply by email with the code and terms that apply to your referral.'], ['3. Check in directly', 'For a referral already made, send us your code or order reference so we can check its status.']].map(([title, copy]) => <div key={title} className="rounded-2xl border border-border bg-card p-5"><h2 className="font-bold mb-2">{title}</h2><p className="text-sm text-muted-foreground">{copy}</p></div>)}
      </div>
      <div id="referral-request" className="scroll-mt-24">
        <EstimateForm service="Referral Program" eyebrow="Talk to the shop" title="Referral request" subtitle="Joining or checking an existing referral? We will reply by email." submitLabel="Send referral request" successMessage="We will reply by email with your referral details and next steps." fields={[{ name: 'request', label: 'How can we help?', type: 'select', required: true, options: ['I would like to refer customers', 'Check an existing referral', 'Confirm my code or reward terms'] }, { name: 'reference', label: 'Existing code or order reference (optional)', type: 'text' }]} />
      </div>
      <p className="text-sm text-muted-foreground text-center mt-6">Ready to order? <Link to="/stickers" className="text-primary underline">Choose your stickers</Link></p>
    </div>
  </section>
}
