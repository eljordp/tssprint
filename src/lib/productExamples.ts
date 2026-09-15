import assamBackdrop from '@/assets/optimized/projects/instagram-assam-convention-backdrop.webp'
import storefront from '@/assets/projects/curated-barbershop.jpeg'
import aFrame from '@/assets/optimized/projects/atlas-pizza-signage-800.webp'
import booth from '@/assets/projects/event-booth-sticker-smith.jpeg'
import interior from '@/assets/projects/plu2o-dispensary.jpg'
import cards from '@/assets/optimized/projects/bp-cleopatra-discount-cards-800.webp'
import flyer from '@/assets/optimized/projects/bp-empire-automotive-flyer-1000.jpg'
import eventDesign from '@/assets/optimized/projects/drive-otai-event-mockup.webp'

export type Example = { image?: string; format?: string; caption: string; description: string; details: string; position?: string; contain?: boolean }

export const productExamples: Record<string, Example> = {
  'Storefront Graphics': { image: storefront, caption: 'Curated Barbershop · window lettering', description: 'Logos, hours and full-color graphics for windows and doors.', details: 'Lettering leaves the glass around your design clear. Printed graphics cover an area with artwork. Perforated window film uses small holes to let light through. Send the window dimensions and a photo.', position: 'center 30%' },
  'A-Frame Signs': { image: aFrame, caption: 'Atlas Pizza · sidewalk A-frame', description: 'A freestanding sign for menus, offers and directions.', details: 'Choose the panel size, then tell us if you need a complete frame or replacement prints. We confirm the frame, printed sides and inserts in your estimate.', position: 'center 80%' },
  'Retractable Banners': { image: booth, caption: 'Printed retractable banners at the shop', description: 'A portable upright banner that rolls into its base.', details: 'Compare the printed width and height. Your estimate confirms the base, number of printed sides and any travel case. Tell us if it will be used outdoors.' },
  'Wall Graphics': { image: interior, caption: 'PLU2O · interior vinyl graphics on glass', description: 'Cut logos or a full-color mural for an interior surface.', details: 'This shop project shows interior vinyl on glass. For a wall, send a photo, dimensions and surface type so we can confirm the appropriate adhesive and preparation.' },
  'Event Displays': { image: booth, caption: 'The Sticker Smith · canopy and banner setup', description: 'A branded canopy for markets, pop-ups and events.', details: 'Sizes describe the canopy footprint. Choose a steel or aluminum frame; sidewalls are separate options. The exact estimate lists the printed canopy, frame and accessories included.' },
  'Backdrops & Displays': { image: assamBackdrop, caption: 'Assam Convention · installed 8×10 ft backdrop', description: 'A wide printed background for a booth or photo area.', details: 'Shown: a finished shop installation at DoubleTree San Jose. Graphic Only is the print without a frame. With Frame includes a supporting frame. Your estimate confirms the dimensions and hardware for your order.' },
  'Table Covers': { image: eventDesign, caption: 'OTAI · table-cover design mockup', description: 'A branded cover fitted to your event table.', details: 'Choose the table size and shape. The table itself is not included. Send its dimensions and tell us whether you need access to storage underneath.', contain: true },
  'Business Cards': { image: cards, caption: 'Cleopatra Ink · printed discount cards', description: 'Pocket-sized cards for your business, offers or appointments.', details: 'The price covers the selected print run. Soft-touch adds a velvety feel, spot UV adds glossy accents, and foil adds metallic accents. These and rounded corners are separate upgrades. For front and back artwork, upload one two-page PDF. Request a quote for a specific paper weight.' },
  'Flyers & Door Hangers': { image: flyer, caption: 'Empire Automotive · flyer artwork', description: 'Promotional handouts or door hangers for your next offer.', details: 'Choose the finished size and quantity. Upload front and back together in a two-page PDF when needed. For a custom fold or paper weight, request a quote.', contain: true },
  'Postcards': { format: 'Postcard', caption: 'Format illustration · choose dimensions below', description: 'Larger cards for promotions, inserts and mail campaigns.', details: 'Choose the finished postcard dimensions. Printing does not include mailing, postage or address-list services. Tell us about any postal layout requirements before proof approval.' },
  'Vehicle Magnets': { format: 'Removable panel', caption: 'Format illustration · choose dimensions below', description: 'Removable printed panels for suitable vehicle doors.', details: 'Choose a size that fits a flat panel without trim or deep curves. Magnets need a compatible steel surface; ask us to check your vehicle before ordering. Remove and clean as advised by the shop.' },
}

export function getProductExample(category: string) { return productExamples[category] }

