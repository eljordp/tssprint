import { Star } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'

const reviews = [
  {
    name: 'Maria G.',
    text: 'The Sticker Smith did an amazing job on our company vehicle wrap. The quality is outstanding and it was done ahead of schedule!',
    rating: 5,
  },
  {
    name: 'James T.',
    text: 'Best sticker quality I\'ve found in the Bay Area. Fast turnaround and the proofing process was seamless. Highly recommend.',
    rating: 5,
  },
  {
    name: 'Sarah K.',
    text: 'They designed and installed our storefront signage. It looks incredible and we\'ve gotten so many compliments from customers.',
    rating: 5,
  },
  {
    name: 'David L.',
    text: 'Ordered custom mylar bags for our brand. The print quality is perfect and they helped us nail the design. Will reorder.',
    rating: 5,
  },
  {
    name: 'Angela R.',
    text: 'Our event canopy and banners turned out perfect. They were patient with revisions and delivered right on time.',
    rating: 5,
  },
]

export default function Reviews() {
  return (
    <section className="py-20 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">5-Star Google Reviews</h2>
            <p className="mt-3 text-muted-foreground">See what our customers have to say.</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review, i) => (
            <FadeIn key={review.name} delay={i * 0.1}>
              <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-foreground-dim leading-relaxed flex-1">
                  "{review.text}"
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground">{review.name}</p>
                  <p className="text-xs text-muted">Google Review</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
