import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Copy, Check, Gift, Users, Sparkles } from 'lucide-react'
import { getPromoCodes } from '@/lib/promoCodes'

export default function PromoSection() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const codes = getPromoCodes().filter(c => c.active && (!c.expiresAt || new Date(c.expiresAt) > new Date()))

  if (codes.length === 0) return null

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const categoryIcon = (cat: string) => {
    switch (cat) {
      case 'friends_family': return Users
      case 'first_time': return Gift
      case 'event': return Sparkles
      default: return Tag
    }
  }

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'friends_family': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
      case 'first_time': return 'from-green-500/20 to-green-600/10 border-green-500/30'
      case 'event': return 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
      default: return 'from-primary/20 to-primary/10 border-primary/30'
    }
  }

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black mb-4">Save on Your Order</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Use a promo code at checkout. Share with friends and family — everyone saves.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {codes.slice(0, 6).map((code, i) => {
            const Icon = categoryIcon(code.category)
            const isCopied = copiedCode === code.code
            return (
              <motion.div
                key={code.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative bg-gradient-to-br ${categoryColor(code.category)} border rounded-2xl p-6 overflow-hidden`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon size={16} className="text-foreground" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {code.category === 'friends_family' ? 'Friends & Family'
                      : code.category === 'first_time' ? 'New Customer'
                      : code.category === 'event' ? 'Event Special'
                      : 'Special Offer'}
                  </span>
                </div>

                <p className="text-2xl font-black mb-1">
                  {code.type === 'percent' ? `${code.value}% OFF` : `$${code.value} OFF`}
                </p>
                <p className="text-sm text-muted-foreground mb-4">{code.label}</p>

                {code.minOrder ? (
                  <p className="text-xs text-muted-foreground mb-3">Min order: ${code.minOrder}</p>
                ) : null}

                <button
                  onClick={() => handleCopy(code.code)}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black tracking-widest text-sm transition-all ${
                    isCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-background/80 border border-border hover:border-primary/50 text-foreground'
                  }`}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  {isCopied ? 'COPIED!' : code.code}
                </button>

                {code.expiresAt && (
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Expires {new Date(code.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground text-sm mt-8"
        >
          Enter your code at checkout. One promo per order.
        </motion.p>
      </div>
    </section>
  )
}
