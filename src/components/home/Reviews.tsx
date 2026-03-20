import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const reviews = [
  {
    name: 'Marcus T.',
    rating: 5,
    text: 'Best print shop in the Bay. Got my fleet wrapped and the quality is insane. Proof was ready same day.',
    service: 'Vehicle Graphics',
  },
  {
    name: 'Sarah K.',
    rating: 5,
    text: 'Ordered 500 die-cut stickers for my brand launch. Colors are perfect, shipped fast. Will be back.',
    service: 'Custom Stickers',
  },
  {
    name: 'David L.',
    rating: 5,
    text: 'They did our entire storefront — window graphics, wall murals, A-frame sign. Completely transformed the space.',
    service: 'Business Signage',
  },
  {
    name: 'Jessica M.',
    rating: 5,
    text: 'Canopy and table cover for our farmers market booth. Professional quality, great price. Setup looks amazing.',
    service: 'Event Branding',
  },
  {
    name: 'Tony R.',
    rating: 5,
    text: 'Quick turnaround on business cards and flyers. The soft-touch finish is premium. Highly recommend.',
    service: 'Business Print',
  },
  {
    name: 'Anika P.',
    rating: 5,
    text: 'Custom mylar bags for our brand. Print quality is sharp, bags are sturdy. Exactly what we needed.',
    service: 'Mylar Packaging',
  },
]

export default function Reviews() {
  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg font-semibold">4.9 out of 5</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">What Our Customers Say</h2>
          <p className="text-muted-foreground">Real reviews from real businesses</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(review.rating)].map((_, j) => (
                  <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">"{review.text}"</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{review.name}</span>
                <span className="text-xs text-primary">{review.service}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://www.google.com/search?q=the+sticker+smith+hayward"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            See all reviews on Google →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
