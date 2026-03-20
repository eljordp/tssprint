import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import elevated925Storefront from '@/assets/projects/elevated925-storefront.jpg'
import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'

const projects = [
  {
    image: safewayTruck,
    title: 'Fleet Graphics',
    description:
      'Full fleet branding for Safeway — vehicle wraps that turn every truck into a mobile billboard.',
    linkText: 'View Vehicle Graphics',
    linkTo: '/vehicle-graphics',
  },
  {
    image: elevated925Storefront,
    title: 'Storefront Signage',
    description:
      'Complete storefront transformation for Elevated 925 — channel letters, window graphics, and wall branding.',
    linkText: 'View Signage',
    linkTo: '/signage',
  },
  {
    image: eventBooth,
    title: 'Event Branding',
    description:
      'Custom canopy, table cover, and banner setup for The Sticker Smith booth — everything you need to stand out.',
    linkText: 'View Event Products',
    linkTo: '/canopies',
  },
]

export default function ProjectShowcase() {
  return (
    <section className="section-padding bg-background">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-primary">Work</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real projects for real businesses
          </p>
        </motion.div>

        <div className="flex flex-col gap-16 md:gap-24">
          {projects.map((project, index) => {
            const isReversed = index % 2 !== 0

            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${
                  isReversed ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Image */}
                <div className="w-full md:w-[60%] rounded-xl overflow-hidden border border-border">
                  <motion.img
                    src={project.image}
                    alt={project.title}
                    className="w-full aspect-video object-cover"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Text */}
                <div className="w-full md:w-[40%] flex flex-col gap-4">
                  <h3 className="text-2xl font-bold">{project.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                  <Link
                    to={project.linkTo}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  >
                    {project.linkText} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link to="/projects" className="btn-primary">
            View All Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
