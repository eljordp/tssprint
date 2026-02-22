import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

import safewayInstall from '@/assets/projects/safeway-install.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import tecEquipmentTruck from '@/assets/projects/tec-equipment-truck.jpeg'
import bhogalConstruction from '@/assets/projects/bhogal-construction.jpeg'
import eventBoothStickerSmith from '@/assets/projects/event-booth-sticker-smith.jpeg'
import elevated925Storefront from '@/assets/projects/elevated925-storefront.jpg'
import plu2oDispensary from '@/assets/projects/plu2o-dispensary.jpg'
import curatedBarbershop from '@/assets/projects/curated-barbershop.jpeg'
import atlasPizzaSignage from '@/assets/projects/atlas-pizza-signage.jpeg'
import weddingVinylFloor1 from '@/assets/projects/wedding-vinyl-floor-1.jpeg'
import weddingVinylFloor2 from '@/assets/projects/wedding-vinyl-floor-2.jpeg'
import weddingVinylFloor3 from '@/assets/projects/wedding-vinyl-floor-3.jpeg'
import culturalDanceFloor1 from '@/assets/projects/cultural-dance-floor-1.jpeg'
import culturalDanceFloor2 from '@/assets/projects/cultural-dance-floor-2.jpeg'
import weddingDisplaySignage1 from '@/assets/projects/wedding-display-signage-1.jpeg'
import featherFlags from '@/assets/projects/feather-flags.jpg'

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Stickers & Packaging', value: 'stickers' },
  { label: 'Signage & Storefronts', value: 'signage' },
  { label: 'Events & Installations', value: 'events' },
  { label: 'Vehicles & Fleet', value: 'vehicles' },
  { label: 'Business Print Essentials', value: 'biz' },
]

const projects = [
  {
    id: 1,
    category: 'stickers',
    title: 'Product Labels & Packaging Suite',
    description: 'Crisp, vibrant, premium-feel stickers that make your brand pop. Built to last, made to be noticed.',
    details: 'Applications: Products, Retail Branding, Merch | Materials: Premium Vinyl | Finish Options: Matte / Gloss / Holographic | Durability: Weather & Fade Resistant',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 2,
    category: 'stickers',
    title: 'Mylar & Specialty Packaging',
    description: 'High quality custom Mylar and product pouches with standout color, strong material, and retail ready presentation.',
    details: 'Applications: Consumer Packaging, Cannabis, Retail Packs | Materials: Mylar & Specialty Films | Finish Options: Matte / Gloss / Metallic | Features: Strong Seal, Premium Color, Retail-Ready',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop'],
  },
  {
    id: 3,
    category: 'signage',
    title: 'PLU2O Dispensary Grand Opening – Santana Row',
    description: 'Full interior window graphics and branded environmental visuals produced for the grand opening of PLU2O Dispensary at Santana Row.',
    details: 'Application: Interior Window & Wall Graphics | Material: Premium Printed Vinyl | Finish: Matte | Location: Santana Row, San Jose',
    images: [plu2oDispensary],
  },
  {
    id: 4,
    category: 'signage',
    title: 'Dental Office Frosted Window Film',
    description: 'Frosted window film installed to provide privacy and a clean, professional aesthetic for a dental office interior.',
    details: 'Application: Interior Glass Privacy Film | Material: Frosted Vinyl | Finish: Matte | Environment: Medical Office',
    images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop',
    ],
  },
  {
    id: 5,
    category: 'vehicles',
    title: 'National Grocery Fleet (Safeway / Albertsons)',
    description: 'Consistent branding across a 12-vehicle fleet for regional visibility.',
    details: 'Vehicles: 6 Vans | Coverage: Decals | Material: Cast Vinyl | Timeline: 3 Weeks',
    images: [safewayInstall, safewayTruck, albertsonsVan],
  },
  {
    id: 6,
    category: 'vehicles',
    title: 'Restoration Services Fleet',
    description: 'Branded vehicle graphics produced and installed across a multi-vehicle restoration fleet to improve on-road recognition.',
    details: 'Vehicles: Trucks, Vans & Box Trucks | Coverage: Partial Wrap | Material: Cast Vinyl | Fleet Size: 8+ Vehicles',
    images: [procareFleet],
  },
  {
    id: 7,
    category: 'vehicles',
    title: 'Industrial / Construction Fleet',
    description: 'Durable fleet graphics designed for heavy-duty construction vehicles to support brand presence in industrial environments.',
    details: 'Vehicles: Heavy-Duty Trucks | Coverage: Partial Wrap | Material: Premium Cast Vinyl | Finish: Gloss',
    images: [tecEquipmentTruck, bhogalConstruction],
  },
  {
    id: 8,
    category: 'events',
    title: 'Custom Branded Event Booth & Display System',
    description: 'Fully branded pop-up booth setup including canopy, retractable banners, and event signage for trade shows and conventions.',
    details: 'Components: Custom Tent + Retractable Banners | Material: Fabric & Printed Vinyl | Use Case: Trade Shows / Pop-Ups',
    images: [eventBoothStickerSmith],
  },
  {
    id: 9,
    category: 'stickers',
    title: 'Labels & Full Packaging Suites',
    description: 'Clean, professional labels and packaging that make your product look premium, legit, and shelf-ready.',
    details: 'Applications: Bottles, Coffee Bags, Food Packaging, Boxes | Materials: Vinyl & Paper Label Stock | Finish Options: Matte / Gloss / Metallic',
    images: ['https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&auto=format&fit=crop'],
  },
  {
    id: 10,
    category: 'signage',
    title: 'Elevated925 Smoke Shop – San Ramon',
    description: 'Custom storefront signage and window graphics produced to establish a bold retail presence within a high-traffic shopping center.',
    details: 'Application: Exterior Signage & Window Graphics | Material: Printed Vinyl & Rigid Signage | Finish: Gloss | Location: San Ramon, CA',
    images: [elevated925Storefront],
  },
  {
    id: 11,
    category: 'signage',
    title: 'Curated Barbershop – Hayward',
    description: 'Minimal storefront window graphics installed to clearly communicate brand identity and contact information.',
    details: 'Application: Storefront Window Decals | Material: Cut Vinyl | Finish: Matte | Location: Hayward, CA',
    images: [curatedBarbershop],
  },
  {
    id: 12,
    category: 'signage',
    title: 'Restaurant Exterior Signage & Menu Displays',
    description: 'Exterior storefront signage and sidewalk menu displays produced to attract foot traffic and enhance street-level visibility.',
    details: 'Application: Exterior Signage & A-Frame Menu Displays | Material: Printed Vinyl & Rigid Panels | Use Case: Hospitality Retail',
    images: [atlasPizzaSignage],
  },
  {
    id: 13,
    category: 'events',
    title: 'Luxury Wedding Dance Floor Vinyl Install',
    description: 'Premium full-cover vinyl dance floor installation with custom monogram design, produced to match the event theme.',
    details: 'Application: Full Dance Floor Wrap | Material: Printed Adhesive Vinyl | Finish: Gloss | Event: Wedding',
    images: [weddingVinylFloor1, weddingVinylFloor2, weddingVinylFloor3],
  },
  {
    id: 14,
    category: 'events',
    title: 'Cultural Event Custom Printed Dance Floor',
    description: 'Large format printed dance floor graphic designed and installed for a South Asian event, delivering a bold centerpiece.',
    details: 'Application: Large Dance Floor Graphic | Material: Printed Vinyl | Finish: Gloss | Event Type: Cultural Celebration',
    images: [culturalDanceFloor1, culturalDanceFloor2],
  },
  {
    id: 15,
    category: 'events',
    title: 'Wedding & Event Display Signage',
    description: 'Custom printed display boards designed for weddings and special events, including seating charts, welcome signs, and feature boards.',
    details: 'Application: Event Display Signage | Material: Rigid Panels & Printed Vinyl | Use Case: Weddings & Private Events',
    images: [weddingDisplaySignage1],
  },
  {
    id: 16,
    category: 'events',
    title: 'Promotional Feather Flags & Outdoor Event Signage',
    description: 'High-visibility feather flags and outdoor signage designed to attract attention, promote offers, and drive traffic.',
    details: 'Application: Outdoor Promotional Flags | Material: Fabric Print | Use Case: Events & Promotions',
    images: [featherFlags],
  },
  {
    id: 17,
    category: 'biz',
    title: 'Business Cards & Professional Identity Kits',
    description: 'Premium business cards and identity print assets designed for durability, detail, and a strong first impression.',
    details: 'Products: Business Cards, Appointment Cards, Identity Sets | Finishes: Matte, Gloss, Raised Ink, Foil',
    images: ['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop'],
  },
  {
    id: 18,
    category: 'biz',
    title: 'Flyers, Brochures & Marketing Collateral',
    description: 'High-quality printed marketing materials to support sales, promotions, and brand communication.',
    details: 'Products: Flyers, Brochures, Rack Cards | Sizes: Standard & Custom | Use Case: Retail, Corporate, Events',
    images: ['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop'],
  },
  {
    id: 19,
    category: 'biz',
    title: 'Office & Operations Print',
    description: 'Everyday business essentials including labels, inserts, compliance prints, and in-house operational materials.',
    details: 'Products: Labels, Forms, Instructional Prints, Internal Materials | Volume: Small to Bulk Runs',
    images: ['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop'],
  },
]

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[0] | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const filteredProjects = activeCategory === 'all' ? projects : projects.filter((p) => p.category === activeCategory)

  const openLightbox = (project: (typeof projects)[0]) => {
    setSelectedProject(project)
    setCurrentImageIndex(0)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedProject(null)
    document.body.style.overflow = 'unset'
  }

  return (
    <div>
      {/* Hero */}
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="mb-4">Our Work</h1>
            <p className="text-lg text-muted-foreground">
              Browse our portfolio of completed projects across stickers, signage, vehicle graphics, and event installations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="pb-8">
        <div className="section-container">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-16 md:pb-24">
        <div className="section-container">
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card-interactive overflow-hidden group cursor-pointer"
                  onClick={() => openLightbox(project)}
                >
                  <div className="aspect-[4/3] overflow-hidden -m-6 mb-4">
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {categories.find((c) => c.value === project.category)?.label}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-muted transition-colors"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-[16/10] rounded-lg overflow-hidden mb-6">
                <img
                  src={selectedProject.images[currentImageIndex]}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {selectedProject.images.length > 1 && (
                <div className="flex gap-2 justify-center mb-6">
                  {selectedProject.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-16 h-12 rounded overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${selectedProject.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="text-center">
                <span className="text-sm font-medium text-primary uppercase tracking-wide">
                  {categories.find((c) => c.value === selectedProject.category)?.label}
                </span>
                <h2 className="text-2xl font-bold mt-1 mb-2">{selectedProject.title}</h2>
                <p className="text-muted-foreground mb-2">{selectedProject.description}</p>
                <p className="text-sm text-muted-foreground">{selectedProject.details}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
