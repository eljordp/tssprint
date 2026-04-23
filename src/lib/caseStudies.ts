import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
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
    slug: 'safeway-fleet-graphics',
    client: 'Safeway',
    title: 'Rolling out fleet graphics on Safeway delivery trucks',
    category: 'Vehicle Graphics',
    heroImage: safewayTruck,
    thumbnail: safewayTruck,
    galleryImages: [safewayTruck, safewayInstall, albertsonsVan],
    tagline:
      'A national grocery brand needed consistent, crisp graphics across a multi-vehicle Bay Area delivery fleet — printed, installed, and turned around fast.',
    stats: [
      { label: 'Vehicles wrapped', value: '20+' },
      { label: 'Materials', value: '3M cast vinyl + laminate' },
      { label: 'Install window', value: 'Under 2 weeks' },
      { label: 'Rating', value: '5.0' },
    ],
    brief:
      "Safeway's operations team needed new graphics deployed across their Bay Area delivery trucks with tight color accuracy to brand standards, and they needed it done without pulling trucks from service for long. Consistency across every vehicle — same logo placement, same size, same colors — was non-negotiable.",
    approach: [
      'Pulled exact brand colors from their style guide and test-printed on our vinyl to confirm a Pantone match before any real production.',
      'Built a vehicle template so every truck got the same graphic placement, same proportions. No eyeballing. Every truck looks identical at 20 feet.',
      'Scheduled installs in rolling batches so no more than 2 trucks were off the road at a time — delivery ops kept running through the whole rollout.',
      'Laminated every panel for UV and wash-cycle durability. These graphics are still crisp years later.',
    ],
    process:
      "We print on 3M IJ180Cv3 cast vinyl with matching overlaminate — the industry standard for vehicle graphics that have to survive weather, road debris, and commercial car washes. Every panel is inspected twice before it leaves the shop, then installed on a climate-controlled surface with proper squeegee technique. No bubbles, no lifted edges.",
    result:
      "Safeway got a uniform fleet presence across the East Bay on schedule. Their delivery trucks now read as a coordinated brand unit at every grocery location and every highway mile. Color match held through multiple seasons. They've come back for additional vehicle deployments since.",
    cta: {
      eyebrow: 'Fleet Graphics',
      headline: 'Got a fleet? Let us quote it.',
      body: "Single vehicle or a whole rollout — we handle the design, print, and install with the same consistency we bring to national brand work.",
      service: 'Vehicle Graphics',
      linkHref: '/services/vehicle-graphics',
    },
  },
  {
    slug: 'bhogal-construction-truck-wrap',
    client: 'Bhogal Construction',
    title: 'A rolling billboard for a growing Bay Area construction crew',
    category: 'Vehicle Graphics',
    heroImage: bhogalTruck,
    thumbnail: bhogalTruck,
    galleryImages: [bhogalTruck],
    tagline:
      "Bhogal Construction wanted a work truck that doubled as a lead generator on every jobsite it parked at. We wrapped it to be seen.",
    stats: [
      { label: 'Wrap type', value: 'Full wrap' },
      { label: 'Vehicle', value: 'Box truck' },
      { label: 'Turnaround', value: '10 business days' },
      { label: 'Install', value: 'In-house, 2 days' },
    ],
    brief:
      "Bhogal Construction wanted their main work truck to stand out at jobsites, on the freeway, and in neighborhoods. Every day the truck is parked at a site is a marketing opportunity — but a generic or cheap wrap would have done the opposite. They needed something that read as a legitimate, professional operation the moment anyone saw it.",
    approach: [
      'Designed the wrap as a rolling billboard — the company name, phone, and core services readable from 50+ feet, not buried in visual noise.',
      'Used high-contrast brand colors (red/black) so the vehicle punches visually against gray concrete and construction backgrounds — exactly where it lives.',
      'Kept the layout clean: one dominant brand mark on each side panel, a bold phone number on the rear, contact on the back doors.',
      'Full wrap with premium 3M cast vinyl so it reads as a company with standards — not a budget decal job.',
    ],
    process:
      "Every flat and curved surface of the truck got custom-printed vinyl. We wrapped the body panels, the hood, the back roll-up door, and added reflective elements so the truck is visible in low light on a jobsite. Two-day install in our Bay Area shop, delivered back to them ready to earn.",
    result:
      "The truck now functions as mobile advertising on every job. Bhogal's crew has fielded multiple inbound calls from drivers and neighbors who spotted the truck on site — wrap pays for itself in a handful of lead generations. The look also elevates how they're perceived at bid walkthroughs.",
    cta: {
      eyebrow: 'Truck & Van Wraps',
      headline: 'Turn your work vehicle into a lead gen machine.',
      body: "Full wraps for contractors, trades, and service businesses. Premium materials, clean install, designed to be seen at 50 feet.",
      service: 'Vehicle Graphics',
      linkHref: '/services/vehicle-graphics',
    },
  },
  {
    slug: 'atlas-pizza-storefront',
    client: 'Atlas Pizza',
    title: 'Branding a neighborhood pizza spot from sidewalk to counter',
    category: 'Business Signage',
    heroImage: atlasPizza,
    thumbnail: atlasPizza,
    galleryImages: [atlasPizza],
    tagline:
      'Atlas Pizza wanted walk-in traffic from the second someone turned onto the block. We made the storefront impossible to miss.',
    stats: [
      { label: 'Scope', value: 'Storefront + interior' },
      { label: 'Install', value: 'Professional, on-location' },
      { label: 'Turnaround', value: '12 business days' },
      { label: 'Sq ft', value: '~30 sq ft signage' },
    ],
    brief:
      'Atlas Pizza was opening a new Bay Area location and needed storefront signage that would punch above its weight against the larger chains nearby. The storefront had to read as established, crafted, and inviting — not a generic vinyl shop job slapped up the day before opening. Budget was smart, not limitless.',
    approach: [
      'Designed the primary sign for maximum sidewalk visibility at both daytime and evening foot traffic — readable from the corner, bold enough to pull eyes from across the street.',
      'Used a material mix that reads "real restaurant" — not vinyl cutouts that peel after a season. Premium substrate, weatherproofed, UV-stable.',
      'Tied in secondary window signage and menu board so the whole storefront feels intentionally designed rather than patched together.',
      'Coordinated the install outside of business hours so the opening was the first time customers saw it — clean reveal, no half-installed state.',
    ],
    process:
      "Signage was produced in our Bay Area shop on premium substrates, then installed on location by our team. The job covered the main exterior sign, window graphics, and interior accent signage. Every surface was prepped and measured twice — no surprises on install day.",
    result:
      "Atlas Pizza opened with a storefront that immediately read as a neighborhood staple, not a new spot. The owner has mentioned that the signage gets complimented by customers. Walk-in traffic has held steady since opening — signage is earning its spot every day.",
    cta: {
      eyebrow: 'Storefront & Signage',
      headline: 'Making your storefront impossible to miss.',
      body: "From single exterior signs to full storefront + window + interior packages. We design, produce, and install in the Bay Area.",
      service: 'Business Signage',
      linkHref: '/services/business-signage',
    },
  },
]

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug)
}
