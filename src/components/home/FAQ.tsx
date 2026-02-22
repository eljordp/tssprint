import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How fast can I get my stickers?',
    answer: 'Standard delivery takes 5-7 business days. Express delivery is available in 2-4 business days. Local Bay Area customers can arrange pickup for even faster turnaround.',
  },
  {
    question: 'What materials do you offer?',
    answer: 'We offer matte vinyl, glossy vinyl, clear/transparent, holographic, paper, and specialty finishes like embossed and UV spot. All our vinyl stickers are waterproof and durable.',
  },
  {
    question: 'Do I need to have a design ready?',
    answer: 'Not necessarily! While we accept print-ready files (PNG, JPG, PDF, AI, SVG), we also offer design assistance. Just share your idea and our team can help bring it to life.',
  },
  {
    question: 'What is your proof process?',
    answer: 'Every order includes a free digital proof within 24 hours. You\'ll see exactly how your stickers will look before we print. We won\'t produce anything until you approve.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. For large orders, we can also arrange invoicing.',
  },
  {
    question: 'Is there a minimum order quantity?',
    answer: 'Our minimum order starts at just 50 stickers. We offer price breaks at 100, 200, 300, 500, and 1000+ quantities. The more you order, the lower the per-sticker price.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24">
      <div className="section-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about ordering custom stickers
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="border border-border rounded-xl overflow-hidden bg-card/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-semibold text-base pr-4">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
