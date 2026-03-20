import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import customStickersImg from '@/assets/placeholders/custom-stickers.png';
import mylarPackagingImg from '@/assets/placeholders/heavy-duty.jpg';
import eventBrandingImg from '@/assets/placeholders/heat-transfer.png';
import businessPrintImg from '@/assets/placeholders/sticker-sheets.png';
import vehicleGraphicsImg from '@/assets/projects/safeway-truck.jpeg';
import businessSignageImg from '@/assets/projects/atlas-pizza-signage.jpeg';
import windowFilmImg from '@/assets/placeholders/wall-sticker.png';

const categories = [
  {
    title: 'Custom Stickers',
    description: 'Die-cut, kiss-cut, vinyl & more',
    href: '/order',
    image: customStickersImg,
  },
  {
    title: 'Mylar Packaging',
    description: 'Custom bags & pouches',
    href: '/mylar-packaging',
    image: mylarPackagingImg,
  },
  {
    title: 'Event Branding',
    description: 'Canopies, flags & displays',
    href: '/canopies',
    image: eventBrandingImg,
  },
  {
    title: 'Business Print',
    description: 'Cards, flyers & marketing',
    href: '/business-print',
    image: businessPrintImg,
  },
  {
    title: 'Vehicle Graphics',
    description: 'Wraps & fleet branding',
    href: '/vehicle-graphics',
    image: vehicleGraphicsImg,
  },
  {
    title: 'Business Signage',
    description: 'Storefront & wall graphics',
    href: '/signage',
    image: businessSignageImg,
  },
  {
    title: 'Window Film',
    description: 'Privacy, solar & security',
    href: '/window-film',
    image: windowFilmImg,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

export default function ServiceCategories() {
  return (
    <section className="section-padding">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            What We <span className="text-gradient">Do</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Full-service print and branding for Bay Area businesses
          </motion.p>
        </div>

        {/* Category Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat.title} variants={cardVariants}>
              <Link
                to={cat.href}
                className="group block bg-card border border-border rounded-xl overflow-hidden transition-all duration-250 hover:scale-[1.03] hover:border-primary/50 hover:shadow-glow"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Text */}
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-sm md:text-base leading-tight">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-xs md:text-sm leading-snug">
                    {cat.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 md:mt-16"
        >
          <Link to="/services" className="btn-primary">
            View All Services
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/projects" className="btn-secondary">
            See Our Work
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
