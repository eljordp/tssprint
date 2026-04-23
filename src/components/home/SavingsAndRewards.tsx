import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowRight, Gift, Sparkles, Tag } from 'lucide-react'
import { getPromoCodes } from '@/lib/promoCodes'
import { isReferralCode } from '@/lib/referralRewards'

export default function SavingsAndRewards() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const codes = getPromoCodes()
    .filter(
      (c) =>
        c.active &&
        (!c.expiresAt || new Date(c.expiresAt) > new Date()) &&
        !isReferralCode(c.code) &&
        !c.code.startsWith('THANKS') &&
        c.code !== 'AUTO10', // silent auto-apply — don't advertise
    )
    .slice(0, 2)

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'first_time':
        return Gift
      case 'event':
        return Sparkles
      default:
        return Tag
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-3">Save + Earn</h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Promo codes on us. And a cut when you send us someone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Promo codes card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/5 to-transparent border border-border rounded-3xl p-6 md:p-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Promo Codes
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-4">Save on your first order</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Copy a code and paste it at checkout.
            </p>
            <div className="space-y-3">
              {codes.map((code) => {
                const Icon = categoryIcon(code.category)
                const isCopied = copiedCode === code.code
                return (
                  <div
                    key={code.code}
                    className="flex items-center justify-between gap-3 bg-background/60 border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-lg leading-none">
                          {code.type === 'percent' ? `${code.value}% OFF` : `$${code.value} OFF`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">{code.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(code.code)}
                      className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg font-black text-xs tracking-widest transition-all ${
                        isCopied
                          ? 'bg-green-600 text-white'
                          : 'bg-background border border-border hover:border-primary/50'
                      }`}
                    >
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? 'COPIED' : code.code}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Referral card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 rounded-3xl p-6 md:p-8 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <Gift size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Refer & Earn
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-4">
              Know someone who needs stickers?
            </h3>
            <p className="text-muted-foreground text-sm mb-5">
              They get <strong className="text-foreground">10% off</strong>, you earn{' '}
              <strong className="text-foreground">5% commission</strong> on every order they place.
              No limits.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-background/60 border border-border rounded-xl p-4 text-center">
                <p className="text-3xl md:text-4xl font-black text-primary leading-none">10%</p>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">
                  they save
                </p>
              </div>
              <div className="bg-background/60 border border-border rounded-xl p-4 text-center">
                <p className="text-3xl md:text-4xl font-black text-primary leading-none">5%</p>
                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">
                  you earn
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/account" className="btn-primary inline-flex items-center gap-2 text-sm">
                Get your code <ArrowRight size={14} />
              </Link>
              <Link
                to="/referral"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                How it works
              </Link>
            </div>
            <div className="absolute -right-6 -bottom-6 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
