import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function ReferralProgram() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-3xl overflow-hidden p-8 md:p-12"
        >
          <div className="max-w-2xl">
            <p className="text-primary font-bold text-sm uppercase tracking-wider mb-3">Referral Program</p>
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Know Someone Who<br />
              <span className="text-primary">Needs Stickers?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-3">
              Introduce them to the shop. Contact us to confirm your referral code and reward terms before sharing.
            </p>
            <p className="text-muted-foreground mb-8">
              Already referred someone? Ask us to check your code or order reference.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/referral" className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg">
                Ask About Referrals <ArrowRight size={18} />
              </Link>
              <Link to="/referral" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-muted-foreground hover:text-foreground transition-colors">
                Learn More
              </Link>
            </div>
          </div>

          {/* Decorative */}
          <div className="absolute -right-8 -bottom-8 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        </motion.div>
      </div>
    </section>
  )
}
