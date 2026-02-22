import FadeIn from '@/components/ui/FadeIn'

const brands = [
  'Tesla', 'Google', 'Meta', 'Apple', 'Stanford',
  'Uber', 'Airbnb', 'Stripe', 'Salesforce', 'Oracle',
]

export default function TrustedBy() {
  return (
    <section className="py-16 border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-center text-sm text-muted mb-8 uppercase tracking-widest">
            Trusted by leading brands
          </p>
        </FadeIn>

        <div className="relative">
          {/* Gradient edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex animate-scroll">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={`${brand}-${i}`}
                className="flex-shrink-0 mx-8 flex items-center justify-center"
              >
                <div className="px-6 py-3 rounded-lg border border-border bg-card/50 text-muted text-sm font-medium tracking-wide whitespace-nowrap">
                  {brand}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
