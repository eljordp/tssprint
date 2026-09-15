import assamBackdrop from '@/assets/optimized/projects/instagram-assam-convention-backdrop.webp'
import magdreStacks from '@/assets/optimized/projects/drive-magdre-die-cut-stacks.webp'
import otaiMockup from '@/assets/optimized/projects/drive-otai-event-mockup.webp'
import oliveLandArtwork from '@/assets/optimized/projects/drive-olive-land-pita-artwork.webp'
import albertsonsVan from '@/assets/projects/albertsons-van.jpeg'
import atlasPizza from '@/assets/projects/atlas-pizza-signage.jpeg'
import bhogal from '@/assets/projects/bhogal-construction.jpeg'
import curatedBarbershop from '@/assets/projects/curated-barbershop.jpeg'
import procareFleet from '@/assets/projects/procare-fleet.jpeg'
import safewayTruck from '@/assets/projects/safeway-truck.jpeg'
import tecEquipment from '@/assets/projects/tec-equipment-truck.jpeg'
import elevated from '@/assets/projects/elevated925-storefront.jpg'
import eventBooth from '@/assets/projects/event-booth-sticker-smith.jpeg'
import featherFlags from '@/assets/projects/feather-flags.jpg'
import plu2oDispensary from '@/assets/projects/plu2o-dispensary.jpg'
import weddingFloor1 from '@/assets/projects/wedding-vinyl-floor-1.jpeg'
import weddingFloor2 from '@/assets/projects/wedding-vinyl-floor-2.jpeg'
import weddingFloor3 from '@/assets/projects/wedding-vinyl-floor-3.jpeg'
import culturalDanceFloor1 from '@/assets/projects/cultural-dance-floor-1.jpeg'
import culturalDanceFloor2 from '@/assets/projects/cultural-dance-floor-2.jpeg'
import weddingDisplay from '@/assets/projects/wedding-display-signage-1.jpeg'
import safewayInstall from '@/assets/projects/safeway-install.jpeg'
// Stickers
import stkDieCut from '@/assets/optimized/projects/stickers-die-cut-stack-1000.webp'
import stkHolo from '@/assets/optimized/projects/stickers-holographic-1000.webp'
import stkLaptop from '@/assets/optimized/projects/stickers-on-laptop-1000.webp'
import stkSheet from '@/assets/projects/stickers-sheet.jpg'
import stkRoll from '@/assets/optimized/projects/stickers-roll-1000.webp'
// Mylar + packaging
import mylarCandyshockGreen from '@/assets/projects/mylar-candyshock-green.jpg'
import mylarCandyshockBlue from '@/assets/projects/mylar-candyshock-blue.jpg'
import mylarAtomicshock from '@/assets/projects/mylar-atomicshock.jpg'
import mylarTripleA from '@/assets/projects/mylar-tripleA-design.jpg'
import stkFloodline from '@/assets/projects/sticker-floodline-design.jpg'
// Instagram-sourced real client work
import igLakeLife from '@/assets/projects/ig-lake-life-storage-sign.jpg'
import igBrothersCarwash from '@/assets/projects/ig-brothers-carwash-fleet.jpg'
import igTesla from '@/assets/projects/ig-tesla-custom-wrap.jpg'
import igFremontGear from '@/assets/projects/ig-fremontgear-stickers.jpg'
import igBrothersBroadleaf from '@/assets/projects/ig-brothersbroadleaf-halloween.jpg'
import igElevated925Backwoods from '@/assets/projects/ig-elevated925-backwoods.jpg'
import igElevated925Snack from '@/assets/projects/ig-elevated925-mystery-snack-pack.jpg'
import igFundraisers from '@/assets/projects/ig-fundraisers-castle-f.jpg'
import igElevated925Smoke from '@/assets/projects/ig-elevated925-smoke-with-pleasure.jpg'
import igTasteDeezStiiizy from '@/assets/projects/ig-tastedeeztreatz-stiiizy.jpg'
import igTasteDeezTresLeches from '@/assets/projects/ig-tastedeeztreatz-tresleches.jpg'
import igDuckTape from '@/assets/projects/ig-ducktape-ducksace.jpg'
import igBotanas from '@/assets/projects/ig-botanas-sinaloa.jpg'
import igCaliBull from '@/assets/projects/ig-calibullconnect-bulldog.jpg'
import igFuego from '@/assets/projects/ig-fuegofamilyfarms-circle.jpg'
// Business Print real client work
import bpCleopatraCards from '@/assets/projects/bp-cleopatra-discount-cards.jpg'
import bpCleopatraFlyer from '@/assets/projects/bp-cleopatra-tattoo-flyer.jpg'
import bpCleopatraPoster from '@/assets/projects/bp-cleopatra-poster.jpg'
import bpEmpireAuto from '@/assets/projects/bp-empire-automotive-flyer.jpg'
import homeBrothersCarwash from '@/assets/optimized/projects/ig-brothers-carwash-fleet-800.webp'
import homeAtlasPizza from '@/assets/optimized/projects/atlas-pizza-signage-800.webp'
import homeTasteDeezStiiizy from '@/assets/optimized/projects/ig-tastedeeztreatz-stiiizy-800.webp'
import homeMylarAtomicshock from '@/assets/optimized/projects/mylar-atomicshock-800.webp'
import homeElevatedSnack from '@/assets/optimized/projects/ig-elevated925-mystery-snack-pack-800.webp'
import homeCleopatraCards from '@/assets/optimized/projects/bp-cleopatra-discount-cards-800.webp'

export type ProjectCategory =
  | 'Vehicle Graphics'
  | 'Business Signage'
  | 'Stickers'
  | 'Business Print'
  | 'Mylar Packaging'
  | 'Events'
  | 'Graphic Design'

export type Project = {
  slug: string
  image: string
  title: string
  client?: string
  category: ProjectCategory
  description: string
  scope?: string
  materials?: string
  year?: string
  caseStudySlug?: string
  hideOnMobile?: boolean
  imageKind?: 'Artwork' | 'Illustration' | 'Design mockup'
  imageFit?: 'contain'
}

export const projects: Project[] = [
  {
    slug: 'assam-convention-backdrop', image: assamBackdrop, imageFit: 'contain', title: 'Assam Convention — Event Backdrop',
    client: '47th Assam Convention', category: 'Events', scope: '8×10 ft backdrop printing and installation', year: '2026',
    description: 'A finished backdrop printed and installed by The Sticker Smith at DoubleTree San Jose for the 47th Assam Convention. The photograph shows the printed graphic and supporting frame in the event space. Your estimate confirms the size, frame and installation scope for your own event.',
  },
  {
    slug: 'magdre-die-cut-stacks', image: magdreStacks, title: 'MagDre — Die-Cut Sticker Stacks',
    client: 'MagDre', category: 'Stickers', scope: 'Illustrated die-cut stickers',
    description: 'Finished stacks of custom-shaped MagDre stickers, photographed for the shop’s marketing portfolio. A close look at the artwork, cut outlines and individual pieces.',
  },
  {
    slug: 'otai-event-design-mockup', image: otaiMockup, title: 'OTAI — Banner & Table Cover Design',
    category: 'Events', imageKind: 'Design mockup', scope: 'Coordinated event graphics',
    description: 'A shop marketing mockup showing coordinated banner and table-cover artwork. This is a design presentation, not a photograph of a finished installation.',
  },
  {
    slug: 'olive-land-pita-packaging-artwork',
    image: oliveLandArtwork,
    title: 'Olive Land — Pita Chips Packaging Artwork',
    client: 'Olive Land',
    category: 'Mylar Packaging',
    imageKind: 'Artwork',
    description: 'Garlic pita-chip packaging artwork from the shop’s marketing portfolio. The flat layout shows the brand, product photography and information panels before production.',
    scope: 'Food packaging artwork',
  },
  // ── Vehicle Graphics ──────────────────────────────────────────
  {
    slug: 'albertsons-fleet-graphics',
    image: albertsonsVan,
    title: 'Albertsons Fleet Graphics',
    client: 'Albertsons',
    category: 'Vehicle Graphics',
    description: 'Albertsons branding on a delivery van. The photograph shows the placement of the logo and graphics across the vehicle.',
    scope: 'Delivery van graphics',
  },
  {
    slug: 'safeway-fleet-graphics',
    image: safewayTruck,
    title: 'Safeway Truck Wrap',
    client: 'Safeway',
    category: 'Vehicle Graphics',
    description: 'Safeway branding on a delivery truck. A real project reference for vehicle coverage and logo placement.',
    scope: 'Delivery truck graphics',
    caseStudySlug: 'safeway-fleet-graphics',
  },
  {
    slug: 'bhogal-construction-truck-wrap',
    image: bhogal,
    title: 'Bhogal Construction',
    client: 'Bhogal Construction',
    category: 'Vehicle Graphics',
    description: 'Bhogal Brothers Construction lettering on a truck cab. The project photograph shows the business identity on the sleeper panel.',
    scope: 'Truck cab lettering',
    caseStudySlug: 'bhogal-construction-truck-wrap',
  },
  {
    slug: 'procare-fleet-branding',
    image: procareFleet,
    title: 'ProCare Fleet Branding',
    client: 'ProCare',
    category: 'Vehicle Graphics',
    description:
      'Service-fleet vinyl branding deployed across multiple vehicles. Consistent identity at every customer driveway.',
    scope: 'Multi-vehicle',
    materials: 'Cast vinyl + laminate',
  },
  {
    slug: 'tec-equipment',
    image: tecEquipment,
    title: 'TEC Equipment',
    client: 'TEC Equipment',
    category: 'Vehicle Graphics',
    description:
      'Heavy-duty truck graphics built to survive commercial wash cycles and fleet wear. Production-grade install.',
    scope: 'Commercial truck',
    materials: 'Premium vinyl + laminate',
  },
  {
    slug: 'brothers-carwash-fleet',
    image: igBrothersCarwash,
    title: 'Brothers Carwash Fleet Wrap',
    client: 'Brothers Carwash',
    category: 'Vehicle Graphics',
    description:
      'Design, print, and install of a clean fleet wrap for Brothers Carwash. Every truck on the road becomes a 24/7 mobile billboard.',
    scope: 'Fleet wrap — design + print + install',
  },
  {
    slug: 'tesla-custom-wrap',
    image: igTesla,
    title: 'Custom Tesla Wrap',
    category: 'Vehicle Graphics',
    description:
      'Full color-shift wrap on a Tesla Model S — any color, any finish. Show your true colors.',
    scope: 'Full vehicle wrap',
    materials: 'Color-shift cast vinyl',
  },

  // ── Business Signage ──────────────────────────────────────────
  {
    slug: 'atlas-pizza-storefront',
    image: atlasPizza,
    title: 'Atlas Pizza Signage',
    client: 'Atlas Pizza',
    category: 'Business Signage',
    description: 'Atlas Pizza storefront signage and a sidewalk A-frame, photographed together at the business.',
    scope: 'Storefront + A-frame',
    caseStudySlug: 'atlas-pizza-storefront',
  },
  {
    slug: 'curated-barbershop',
    image: curatedBarbershop,
    title: 'Curated Barbershop',
    client: 'Curated',
    category: 'Business Signage',
    description:
      'Storefront identity for an independent Bay Area barbershop. Clean type, high-contrast install, designed to read from across the street.',
    scope: 'Storefront signage',
    materials: 'Cut vinyl on glass',
  },
  {
    slug: 'elevated-925-storefront',
    image: elevated,
    title: 'Elevated 925 Storefront',
    client: 'Elevated 925',
    category: 'Business Signage',
    description:
      'Full storefront branding install — sign, window vinyl, and exterior identity coordinated as one package.',
    scope: 'Storefront package',
    materials: 'Vinyl + rigid substrate',
  },
  {
    slug: 'plu2o-dispensary',
    image: plu2oDispensary,
    title: 'Plu2o Dispensary Signage',
    client: 'Plu2o',
    category: 'Business Signage',
    description: 'Branded graphics on interior glass at PLU2O. The photograph shows logos and full-color artwork across the glass panels.',
    scope: 'Interior glass graphics',
    materials: 'Rigid + vinyl',
  },
  {
    slug: 'safeway-in-store',
    image: safewayInstall,
    title: 'Safeway Door Graphics Install',
    client: 'Safeway',
    category: 'Vehicle Graphics',
    description: 'Applying Safeway branding to a vehicle door. This is a vehicle installation photograph.',
    scope: 'Vehicle door lettering',
    hideOnMobile: true,
  },
  {
    slug: 'lake-life-storage-sign',
    image: igLakeLife,
    title: 'Lake Life Storage Sign',
    client: 'Lake Life Storage',
    category: 'Business Signage',
    description:
      'Roadside post-mounted signage for a local outdoor boat & RV storage business. Built to read clean from drive-by traffic and survive the elements.',
    scope: 'Post-mounted roadside sign',
    materials: 'Outdoor-grade rigid substrate',
  },

  // ── Events ────────────────────────────────────────────────────
  {
    slug: 'wedding-vinyl-floor-1',
    image: weddingFloor1,
    title: 'Wedding Floor Vinyl',
    category: 'Events',
    description:
      'Custom dance-floor vinyl printed and installed for a Bay Area wedding. Designed to monogram, removed clean post-event.',
    scope: 'Event vinyl',
    materials: 'Removable dance-floor vinyl',
  },
  {
    slug: 'wedding-vinyl-floor-2',
    image: weddingFloor2,
    title: 'Wedding Floor Graphics',
    category: 'Events',
    description:
      'Bride/groom monogram floor decal, full-color print, installed day-of and lifted clean before venue close.',
    scope: 'Event vinyl',
    materials: 'Removable dance-floor vinyl',
  },
  {
    slug: 'wedding-vinyl-floor-3',
    image: weddingFloor3,
    title: 'Custom Floor Decal',
    category: 'Events',
    description:
      'Centerpiece vinyl floor graphic for a private event. Scaled to room, walk-tested for grip and seam tolerance.',
    scope: 'Event vinyl',
    materials: 'Removable floor vinyl',
  },
  {
    slug: 'cultural-dance-floor-1',
    image: culturalDanceFloor1,
    title: 'Cultural Dance Floor Vinyl',
    category: 'Events',
    description:
      'Large-scale custom floor vinyl for a cultural celebration. Pattern-matched seams, no visible joins on the dance area.',
    scope: 'Event vinyl',
    materials: 'Removable floor vinyl',
  },
  {
    slug: 'cultural-dance-floor-2',
    image: culturalDanceFloor2,
    title: 'Cultural Event Floor Vinyl',
    category: 'Events',
    description:
      'Full-coverage cultural event flooring with intricate pattern work. Installed and removed within the event window.',
    scope: 'Event vinyl',
    materials: 'Removable floor vinyl',
  },
  {
    slug: 'wedding-display-signage',
    image: weddingDisplay,
    title: 'Wedding Display Signage',
    category: 'Events',
    description:
      'Event-day signage package — welcome boards, seating chart, table numbers — printed and finished to display quality.',
    scope: 'Event signage suite',
    materials: 'Rigid display board',
  },
  {
    slug: 'event-booth',
    image: eventBooth,
    title: 'Event Booth Setup',
    client: 'The Sticker Smith',
    category: 'Events',
    description:
      'In-house booth design and build for live events. Backdrop, signage, and giveaway sticker setup ready in a single haul.',
    scope: 'Tradeshow booth',
    materials: 'Tension fabric + rigid graphics',
  },
  {
    slug: 'feather-flags',
    image: featherFlags,
    title: 'Custom Feather Flags',
    category: 'Events',
    description:
      'Outdoor feather flags printed dye-sub on knit polyester. Pole-and-base included, packs down small for transport.',
    scope: 'Outdoor signage',
    materials: 'Knit polyester, dye-sub print',
  },

  // ── Stickers ──────────────────────────────────────────────────
  {
    slug: 'stickers-die-cut',
    image: stkDieCut,
    title: 'Die-Cut Vinyl Stickers',
    category: 'Stickers',
    description:
      'Contour-cut vinyl stickers with white ink underbase. Outdoor-grade — 3 to 5 year UV-stable adhesive.',
    scope: 'Die-cut singles',
    materials: 'Premium vinyl + laminate',
  },
  {
    slug: 'stickers-holographic',
    image: stkHolo,
    title: 'Holographic Stickers',
    category: 'Stickers',
    description:
      'Holographic vinyl with rainbow refraction. Durable laminate keeps the shift effect even after wear.',
    scope: 'Specialty finish',
    materials: 'Holographic vinyl',
  },
  {
    slug: 'stickers-laptop',
    image: stkLaptop,
    title: 'Sticker Printing — Behind the Scenes',
    category: 'Stickers',
    description:
      'A shop production photo showing colorful sticker graphics and EPIC RANE artwork on the printer.',
    scope: 'Print production',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'stickers-sheet',
    image: stkSheet,
    title: 'Kiss-Cut Sticker Sheets — Format Example',
    imageKind: 'Illustration',
    category: 'Stickers',
    description:
      'Kiss-cut sheets — multiple designs on one peel-back backer. Great for merch packs and giveaway drops.',
    scope: 'Multi-design sheets',
    materials: 'Choose stock when ordering',
  },
  {
    slug: 'stickers-roll',
    image: stkRoll,
    title: 'Roll-Fed Sticker Printing',
    category: 'Stickers',
    description:
      'Sticker artwork running through roll-fed print production. Finished label roll size, winding and applicator requirements are confirmed separately.',
    scope: 'Print production',
    materials: 'Confirm stock for your application',
  },
  {
    slug: 'floodline-sticker',
    imageKind: 'Artwork',
    image: stkFloodline,
    title: 'Flood Line — Sticker Design',
    client: 'Flood Line',
    category: 'Stickers',
    description:
      'Custom illustrated sticker for Flood Line — neighborhood flood scene with brand wordmark, integrated QR. End-to-end graphic design before print.',
    scope: 'Illustration + die-cut sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'fremontgear-stickers',
    image: igFremontGear,
    title: 'Fremont Gear',
    client: 'Fremont Gear',
    category: 'Stickers',
    description:
      'Rectangular die-cut stickers for Fremont Gear — bold mountain mark over a deep blue/orange palette. 24-hour turnaround.',
    scope: 'Die-cut stickers',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'brothersbroadleaf-halloween',
    image: igBrothersBroadleaf,
    title: 'Brothers Broadleaf — Halloween Drop',
    client: 'Brothers Broadleaf',
    category: 'Stickers',
    description:
      'Custom Halloween-themed die-cut stickers for Brothers Broadleaf — Jack-o-lantern character with smoke trails. Printed and shipped in 24 hours.',
    scope: 'Seasonal die-cut sticker drop',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'elevated925-backwoods',
    image: igElevated925Backwoods,
    title: 'Elevated 925 — Backwoods Whiskey',
    client: 'Elevated 925',
    category: 'Stickers',
    description:
      'Cartoon-illustrated die-cut sticker for Elevated 925\'s Backwoods Whiskey Cigars line. Strong character work, full-bleed color.',
    scope: 'Die-cut illustration sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'elevated925-smoke-with-pleasure',
    image: igElevated925Smoke,
    title: 'Elevated 925 — Smoke With Pleasure',
    client: 'Elevated 925',
    category: 'Stickers',
    description:
      'Photo-based die-cut sticker design — vintage celebrity portrait framed in a green-bordered "Smoke With Pleasure" lockup. Full-color print on vinyl.',
    scope: 'Die-cut photo sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'fundraisers-castle-f',
    image: igFundraisers,
    title: 'The Fundraisers — Castle F',
    client: 'The Fundraisers',
    category: 'Stickers',
    description:
      'Die-cut "Castle F" mark for The Fundraisers. Crisp black-and-white contour cut, clean white border.',
    scope: 'Die-cut sticker run',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'tastedeeztreatz-stiiizy',
    image: igTasteDeezStiiizy,
    title: 'Taste Deez Treatz × STIIIZY',
    client: 'Taste Deez Treatz × STIIIZY',
    category: 'Stickers',
    description:
      'Collab die-cut stickers for Taste Deez Treatz and STIIIZY. Pink/yellow color stack, layered logo design — built for retail drop visibility.',
    scope: 'Collab die-cut sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'tastedeeztreatz-tresleches',
    image: igTasteDeezTresLeches,
    title: 'Taste Deez Treatz — Tres Leches',
    client: 'Taste Deez Treatz',
    category: 'Stickers',
    description:
      'Die-cut tres leches cake stickers for Taste Deez Treatz — illustrated whipped cream and strawberry detail. Dropped with the Helado launch at Lemonnade Sacramento.',
    scope: 'Product launch sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'ducktape-ducksace',
    image: igDuckTape,
    title: 'Duck Tape — Ducksace',
    client: 'Duck Tape Graphics',
    category: 'Stickers',
    description:
      'Versace-style "Ducksace" die-cut for Duck Tape Graphics — intricate baroque pattern with duck character mark, screaming yellow accent.',
    scope: 'Detailed die-cut sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'botanas-sinaloa',
    image: igBotanas,
    title: 'Botanas Sinaloa',
    client: 'Botanas 100',
    category: 'Stickers',
    description:
      'Mexican license-plate-style die-cut stickers for Botanas 100 — Sinaloa branding, full-bleed color, repeat-print volume.',
    scope: 'Bulk die-cut sticker run',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'calibullconnect-bulldog',
    image: igCaliBull,
    title: 'The Cali Bull Connect',
    client: 'The Cali Bull Connect',
    category: 'Stickers',
    description:
      'Die-cut sticker for The Cali Bull Connect — illustrated bulldog + lowrider scene with palm trees. Color-rich, full-bleed.',
    scope: 'Die-cut illustration sticker',
    materials: 'Vinyl + laminate',
  },
  {
    slug: 'fuegofamilyfarms-circle',
    image: igFuego,
    title: 'Fuego Family Farms',
    client: 'Fuego Family Farms',
    category: 'Stickers',
    description:
      '3-inch circular stickers for Fuego Family Farms — soil-grown Santa Cruz cannabis branding. 500 stickers for $100 spec pack.',
    scope: '500x 3in circle stickers',
    materials: 'Vinyl + laminate',
  },

  // ── Mylar Packaging ───────────────────────────────────────────
  {
    slug: 'shockco-candyshock-green',
    image: mylarCandyshockGreen,
    title: 'Candy Shock — Green',
    client: 'Shock Co.',
    category: 'Mylar Packaging',
    description: 'Candy Shock packaging design presentation with illustrated artwork and a pouch mockup. This shows the design, not a verified material or certification.',
    scope: 'Brand + packaging design',
    materials: 'CR mylar pouch, full-color print',
    imageKind: 'Design mockup',
  },
  {
    slug: 'shockco-candyshock-blue',
    image: mylarCandyshockBlue,
    title: 'Candy Shock — Blue',
    client: 'Shock Co.',
    category: 'Mylar Packaging',
    description: 'A blue colorway of the Candy Shock packaging design, shown as a pouch mockup.',
    scope: 'Brand + packaging design',
    materials: 'CR mylar pouch, full-color print',
    imageKind: 'Design mockup',
  },
  {
    slug: 'shockco-atomicshock',
    image: mylarAtomicshock,
    title: 'Atomic Shock',
    client: 'Shock Co.',
    category: 'Mylar Packaging',
    description: 'Atomic Shock packaging design with illustrated artwork, shown as a pouch mockup.',
    scope: 'Brand + packaging design',
    materials: 'CR mylar pouch, full-color print',
    imageKind: 'Design mockup',
  },
  {
    slug: 'triple-a-cannabis',
    imageKind: 'Artwork',
    image: mylarTripleA,
    title: 'Triple A — Cannabis Flower',
    client: 'Triple A',
    category: 'Mylar Packaging',
    description:
      'High-end black marble + gold foil treatment for a 3.5g cannabis flower pouch. Custom monogram crown mark, front and back information panels shown in the artwork.',
    scope: 'Front + back panel design',
    materials: 'Premium mylar, metallic finish',
  },
  {
    slug: 'elevated925-mystery-snack-pack',
    image: igElevated925Snack,
    title: 'Elevated 925 — Mystery Exotic Snack Pack',
    client: 'Elevated 925',
    category: 'Mylar Packaging',
    description: 'Promotional composite artwork for the Elevated 925 Mystery Exotic Snack Pack. A design example rather than a photograph of finished packaging.',
    scope: 'Promotional packaging artwork',
    materials: 'Custom-print mylar pouch',
    imageKind: 'Artwork',
  },

  // ── Business Print ────────────────────────────────────────────
  {
    slug: 'cleopatra-ink-discount-cards',
    image: bpCleopatraCards,
    title: 'Cleopatra Ink — Card Suite',
    client: 'Cleopatra Ink Tattoo & Piercing',
    category: 'Business Print',
    description:
      'Full card suite for Cleopatra Ink Berkeley — premium business card with brand mark + 10/20/30% discount cards. Black/white/orange print on heavy stock.',
    scope: 'Business cards + discount cards',
    materials: 'Heavy matte stock',
  },
  {
    slug: 'cleopatra-ink-tattoo-flyer',
    imageKind: 'Artwork',
    image: bpCleopatraFlyer,
    title: 'Cleopatra Ink — Tattoo Flyer',
    client: 'Cleopatra Ink Tattoo & Piercing',
    category: 'Business Print',
    description:
      '"We Make Extraordinary Tattoos For Extraordinary People" — full-color portrait flyer with real artist work shown. Brand-consistent with the rest of the Cleopatra suite.',
    scope: 'Marketing flyer',
    materials: 'Premium gloss',
  },
  {
    slug: 'empire-automotive-flyer',
    imageKind: 'Artwork',
    image: bpEmpireAuto,
    title: 'Empire Automotive — Flyer + Coupon Pack',
    client: 'Empire Automotive Services',
    category: 'Business Print',
    description:
      'Service flyer + 4-up coupon sheet for Empire Automotive (Hayward, CA). Oil change, brake inspection, smog check, and 15% service offers — shown together in the promotional artwork.',
    scope: 'Flyer + coupon sheet',
    materials: 'Full-color print',
  },
  {
    slug: 'cleopatra-ink-wall-poster',
    imageKind: 'Artwork',
    image: bpCleopatraPoster,
    title: 'Cleopatra Ink — Wall Poster',
    client: 'Cleopatra Ink Tattoo & Piercing',
    category: 'Business Print',
    description:
      'Large-format wall poster for Cleopatra Ink Sacramento — "The Largest & Most Awarded Tattoo Company Worldwide." Awards, country flags, and shop contact info in one piece.',
    scope: 'Large-format poster',
    materials: 'Premium photo paper',
  },
]

export const projectCategories = [
  'All',
  'Vehicle Graphics',
  'Business Signage',
  'Stickers',
  'Business Print',
  'Mylar Packaging',
  'Events',
] as const

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}

// Homepage gallery — curated subset (mix of categories)
export const homepageGallerySlugs = [
  'brothers-carwash-fleet',
  'atlas-pizza-storefront',
  'tastedeeztreatz-stiiizy',
  'shockco-atomicshock',
  'elevated925-mystery-snack-pack',
  'cleopatra-ink-discount-cards',
]

const homepageGalleryImages: Partial<Record<string, string>> = {
  'brothers-carwash-fleet': homeBrothersCarwash,
  'atlas-pizza-storefront': homeAtlasPizza,
  'tastedeeztreatz-stiiizy': homeTasteDeezStiiizy,
  'shockco-atomicshock': homeMylarAtomicshock,
  'elevated925-mystery-snack-pack': homeElevatedSnack,
  'cleopatra-ink-discount-cards': homeCleopatraCards,
}

export const homepageGallery = homepageGallerySlugs
  .map((slug) => projects.find((p) => p.slug === slug))
  .map((project) => project && { ...project, image: homepageGalleryImages[project.slug] ?? project.image })
  .filter((p): p is Project => Boolean(p))
