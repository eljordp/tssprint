import { motion } from 'framer-motion'

import safewayLogo from '@/assets/brands/safeway.png'
import albertsonsLogo from '@/assets/brands/albertsons.png'
import whciLogo from '@/assets/brands/whci.png'
import mayarsMeatLogo from '@/assets/brands/mayars-meat.png'
import trafficGuysLogo from '@/assets/brands/traffic-guys.png'
import consolidatedLogo from '@/assets/brands/consolidated.png'
import hukLogo from '@/assets/brands/huk.png'
import norcalLogo from '@/assets/brands/norcal.png'
import elevated925Logo from '@/assets/brands/elevated925.png'
import teeNDeesLogo from '@/assets/brands/tee-n-dees.png'

const brandLogos = [
  { name: 'Safeway', logo: safewayLogo, id: 1 },
  { name: 'Albertsons', logo: albertsonsLogo, id: 2 },
  { name: 'WHCI', logo: whciLogo, id: 3 },
  { name: "Mayar's Meat", logo: mayarsMeatLogo, id: 4 },
  { name: 'The Traffic Guys', logo: trafficGuysLogo, id: 5 },
  { name: 'Consolidated Engineering', logo: consolidatedLogo, id: 6 },
  { name: 'HUK', logo: hukLogo, id: 7 },
  { name: 'NorCal Entertainment', logo: norcalLogo, id: 8 },
  { name: 'Elevated 925', logo: elevated925Logo, id: 9 },
  { name: "Tee N Dee's", logo: teeNDeesLogo, id: 10 },
]

export default function TrustedBy() {
  const duplicated = [...brandLogos, ...brandLogos]

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
              key={`${brand.id}-${i}`}
              className="flex items-center justify-center h-[110px] w-[260px] md:h-[130px] md:w-[300px] px-6 opacity-90 hover:opacity-100 transition-opacity duration-300 cursor-default"
            >
              <img src={brand.logo} alt={`${brand.name} logo`} className="max-h-[110px] md:max-h-[120px] max-w-[260px] object-contain" />
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
