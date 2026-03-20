import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How long does it take to get my order?',
    answer:
      'Most sticker and label orders ship within 3-5 business days. Vehicle wraps, signage, and event products typically take 7-14 business days depending on complexity. Every order includes a digital proof within 24 hours.',
  },
  {
    question: 'Do I get a proof before you print?',
    answer:
      "Yes! Every single order includes a free digital proof. We never print until you approve. You'll see exactly what your finished product will look like.",
  },
  {
    question: 'What file types do you accept?',
    answer:
      "We accept PNG, JPG, PDF, SVG, and AI files. If you don't have print-ready artwork, our team can help with design for an additional fee.",
  },
  {
    question: 'Do you offer installation?',
    answer:
      'Yes — we provide professional installation for vehicle wraps, window film, wall graphics, and storefront signage throughout the Bay Area.',
  },
  {
    question: "What's your service area?",
    answer:
      "We're based in the Bay Area and serve businesses throughout Northern California. We ship stickers, labels, and print products nationwide.",
  },
  {
    question: 'Do you offer bulk discounts?',
    answer:
      'Yes! Most products have tiered pricing — the more you order, the lower the per-unit cost. Check individual product pages for quantity pricing, or contact us for a custom quote.',
  },
  {
    question: 'Can you match my brand colors?',
    answer:
      'Absolutely. We print in full CMYK color and can work with your brand guidelines, Pantone colors, or existing artwork to ensure consistency.',
  },
  {
    question: "What's your return policy?",
    answer:
      "Since all products are custom-made, we can't accept returns. However, if there's a printing error or quality issue on our end, we'll reprint your order at no cost.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-border">
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
              >
                <span className="font-medium text-foreground pr-4">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-muted-foreground"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
