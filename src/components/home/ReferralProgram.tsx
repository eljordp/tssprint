import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Gift, DollarSign, ArrowRight } from 'lucide-react'

export default function ReferralProgram() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 rounded-3xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <Users size={14} /> Referral Program
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Refer Friends.<br />
                <span className="text-primary">Earn Rewards.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Get your own personal referral code. When someone uses it to place an order, they save <strong className="text-foreground">10%</strong> and you get <strong className="text-foreground">$10 off</strong> your next order. No limits.
              </p>
              <Link to="/referral" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                Join the Program <ArrowRight size={18} />
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { icon: Users, title: 'Get Your Code', desc: 'Sign up in 30 seconds — free, instant, personal to you' },
                { icon: Gift, title: 'They Save 10%', desc: 'Anyone who uses your code gets 10% off their order' },
                { icon: DollarSign, title: 'You Earn $10', desc: 'Every time someone buys with your code, you get $10 off' },
              ].map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 bg-background/50 border border-border/50 rounded-2xl p-5"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
