import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { caseStudies } from '@/lib/caseStudies'

export default function CaseStudies() {
  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-2">Case Studies</p>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Real Projects. Real Results.</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Deep dives on the work we've done for Bay Area brands — briefs, process, and outcomes.
          </p>
        </motion.div>
      </div>

      <section className="py-12 md:py-20">
        <div className="section-container max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study, i) => (
              <motion.div
                key={study.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/case-studies/${study.slug}`}
                  className="group block bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-300 h-full"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={study.thumbnail}
                      alt={study.client}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80">
                      {study.category}
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <p className="text-xs font-mono uppercase tracking-widest text-white/60 mb-1">
                        {study.client}
                      </p>
                      <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                        {study.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {study.tagline}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
                      Read the case study <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-card/30 border-t border-border/50">
        <div className="section-container max-w-3xl text-center">
          <h2 className="text-2xl md:text-4xl font-black mb-4">Your project could be next.</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Fleet wraps, signage, packaging — we treat every job like it's the one we'd want in a case study.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="btn-primary">
              Request a Quote <ArrowRight size={16} />
            </Link>
            <Link to="/services" className="btn-secondary">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
