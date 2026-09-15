import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
import bhogalTruck from '@/assets/projects/bhogal-construction.jpeg'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'

export type CaseStudyStat = { label: string; value: string }

export type CaseStudy = {
  slug: string
  client: string
  title: string
  category: string
  heroImage: string
  thumbnail: string
  galleryImages: string[]
  tagline: string
  stats: CaseStudyStat[]
  brief: string
  approach: string[]
  process: string
  result: string
  testimonial?: { quote: string; name: string; role?: string }
  cta: {
    eyebrow: string
    headline: string
    body: string
    service: string
    linkHref: string
  }
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'safeway-fleet-graphics', client: 'Safeway', title: 'Safeway delivery vehicle graphics', category: 'Vehicle Graphics',
    heroImage: safewayTruck, thumbnail: safewayTruck, galleryImages: [safewayTruck, safewayInstall],
    tagline: 'A look at branded delivery vehicles and the installation details behind the finished graphics.',
    stats: [{ label: 'Project', value: 'Vehicle branding' }, { label: 'Examples', value: 'Truck + door graphics' }],
    brief: 'The project photographs show Safeway branding on a delivery truck and the application of door graphics. They are useful references for the different coverage areas in a vehicle project.',
    approach: ['Large panels give the brand a clear presence on the truck.', 'Door graphics place the identity on a smaller surface.', 'For a similar job, we review each vehicle model, photographs and coverage before quoting.'],
    process: 'The installation photo shows the graphic being positioned on a vehicle door. For your order, the proof and estimate confirm placement, material, preparation and installation scope.',
    result: 'The finished truck shows how a delivery vehicle can carry a consistent brand identity. Browse these photographs when deciding between smaller decals and larger coverage.',
    cta: { eyebrow: 'Fleet Graphics', headline: 'Plan your vehicle graphics.', body: 'Send the vehicle year, make, model, photos and number of vehicles for a tailored estimate.', service: 'Vehicle Graphics', linkHref: '/services/vehicle-graphics' },
  },
  {
    slug: 'bhogal-construction-truck-wrap', client: 'Bhogal Construction', title: 'Bhogal Construction truck graphics', category: 'Vehicle Graphics',
    heroImage: bhogalTruck, thumbnail: bhogalTruck, galleryImages: [bhogalTruck],
    tagline: 'Business lettering on a construction truck cab, shown in the finished project photograph.',
    stats: [{ label: 'Project', value: 'Truck graphics' }, { label: 'Business', value: 'Construction' }],
    brief: 'A work vehicle offers space for a business name, services and contact details. This Bhogal Construction project shows business lettering on the truck’s sleeper panel.',
    approach: ['A prominent business name establishes the identity.', 'The lettering sits on the sleeper panel behind the cab door.', 'For a similar project, start with a photo of your vehicle and the information customers need to see.'],
    process: 'Your vehicle measurements and chosen coverage guide the artwork. We send a proof before printing and confirm the installation schedule in your estimate.',
    result: 'The photographed vehicle provides a real example of business branding at vehicle scale. Choose the coverage that suits your vehicle and budget; ask us to compare partial and fuller coverage.',
    cta: { eyebrow: 'Truck & Van Graphics', headline: 'Put your business on the road.', body: 'Compare door graphics, partial coverage and full-wrap options with a project-specific estimate.', service: 'Vehicle Graphics', linkHref: '/services/vehicle-graphics' },
  },
  {
    slug: 'atlas-pizza-storefront', client: 'Atlas Pizza', title: 'Atlas Pizza storefront signage', category: 'Business Signage',
    heroImage: atlasPizza, thumbnail: atlasPizza, galleryImages: [atlasPizza],
    tagline: 'Storefront branding and a sidewalk sign shown together at Atlas Pizza.',
    stats: [{ label: 'Project', value: 'Storefront signage' }, { label: 'Also shown', value: 'Sidewalk A-frame' }],
    brief: 'The project photograph shows signage above the storefront and an A-frame at sidewalk level. Together they show how a business can communicate at more than one viewing height.',
    approach: ['The main sign identifies the business above the entrance.', 'The A-frame adds a message closer to passing customers.', 'For your shop, we compare sign location, available space and viewing distance before quoting.'],
    process: 'Send photos of your storefront, rough dimensions and any landlord requirements. We confirm the sign type, design, mounting and installation scope before production.',
    result: 'The finished photograph is a reference for coordinating a storefront sign with a portable sidewalk display. Your estimate can cover a single sign or a combination of products.',
    cta: { eyebrow: 'Storefront & Signage', headline: 'Plan the signs for your shop.', body: 'Compare storefront graphics, window lettering and A-frame signs, then send your dimensions for an estimate.', service: 'Business Signage', linkHref: '/services/business-signage' },
  },
]

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug)
}
