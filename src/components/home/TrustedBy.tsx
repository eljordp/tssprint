import { motion } from 'framer-motion'

const brands = [
  'Safeway', 'Albertsons', 'WHCI', "Mayar's Meat", 'The Traffic Guys',
  'Consolidated Engineering', 'HUK', 'NorCal Entertainment', 'Elevated 925', "Tee N Dee's",
]

export default function TrustedBy() {
  const duplicated = [...brands, ...brands]

  return (
    <section className="w-full pt-16 md:pt-18 pb-2 md:pb-3 overflow-hidden" style={{ backgroundColor: 'hsl(0 0% 8%)' }}>
      <div className="section-container mb-6 md:mb-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-foreground text-3xl md:text-4xl font-bold tracking-tight"
        >
          Trusted by <span className="text-primary">brands, creators, and businesses of all kinds.</span>
        </motion.p>
      </div>

      <div className="relative">
        <div className="flex gap-8 md:gap-12 animate-brand-scroll" style={{ width: 'fit-content' }}>
          {duplicated.map((brand, i) => (
            <div
              key={`${brand}-${i}`}
              className="flex items-center justify-center h-[110px] w-[260px] md:h-[130px] md:w-[300px] px-6 opacity-90 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="px-8 py-4 rounded-lg border border-border bg-card/50 text-muted-foreground text-base font-semibold tracking-wide whitespace-nowrap">
                {brand}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes brandScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-brand-scroll {
          animation: brandScroll 40s linear infinite;
        }
      `}</style>
    </section>
  )
}
