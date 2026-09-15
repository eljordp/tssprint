export interface SearchItem {
  name: string
  category: string
  href: string
  keywords: string[]
}

export const searchItems: SearchItem[] = [
  // Stickers
  { name: 'Custom Stickers', category: 'Stickers', href: '/stickers', keywords: ['sticker', 'die-cut', 'kiss-cut', 'vinyl', 'matte', 'glossy', 'clear', 'holographic', 'paper', 'circle', 'square', 'rectangle', 'decal', 'label'] },
  { name: 'Gloss Finish Stickers', category: 'Stickers', href: '/stickers', keywords: ['gloss', 'glossy', 'shiny', 'finish'] },
  { name: 'Holographic Stickers', category: 'Stickers', href: '/stickers', keywords: ['holo', 'holographic', 'rainbow', 'iridescent'] },
  { name: 'UV Coating Stickers', category: 'Stickers', href: '/stickers', keywords: ['uv', 'coating', 'protection', 'spot uv'] },
  { name: 'Embossed Stickers', category: 'Stickers', href: '/stickers', keywords: ['emboss', 'embossed', 'raised', 'textured', '3d'] },
  { name: 'Paper Stickers', category: 'Stickers', href: '/stickers', keywords: ['paper', 'eco', 'recyclable'] },
  { name: 'Custom Labels in Hayward', category: 'Labels', href: '/custom-labels', keywords: ['custom labels', 'product labels', 'bottle label', 'jar label', 'mylar label', 'hayward', 'bay area'] },
  { name: 'Roll Labels in Hayward', category: 'Labels', href: '/roll-labels', keywords: ['roll labels', 'labels on rolls', 'product roll labels', 'bottle labels', 'jar labels', 'hayward', 'bay area'] },

  { name: 'Sticker Sheets', category: 'Stickers', href: '/sticker-sheets', keywords: ['sticker sheets', 'kiss cut sheets', 'multiple designs', 'backing sheet'] },

  // Mylar Packaging
  { name: 'Mylar Bags – Eighths', category: 'Mylar Packaging', href: '/mylar#configure', keywords: ['mylar', 'bag', 'eighth', '8th', '3x5', 'packaging', 'pouch', 'hayward', 'bay area'] },
  { name: 'Mylar Bags – Quarters', category: 'Mylar Packaging', href: '/mylar#configure', keywords: ['mylar', 'bag', 'quarter', 'qtr', '4x6', 'packaging', 'hayward'] },
  { name: 'Mylar Bags – Ounce', category: 'Mylar Packaging', href: '/mylar#configure', keywords: ['mylar', 'bag', 'ounce', 'oz', '5x8', 'packaging', 'hayward'] },
  { name: 'Mylar Bags – Half Pound', category: 'Mylar Packaging', href: '/mylar#configure', keywords: ['mylar', 'bag', 'half pound', 'hp', '10x12', 'packaging', 'hayward'] },
  { name: 'Mylar Bags – Pound', category: 'Mylar Packaging', href: '/mylar#configure', keywords: ['mylar', 'bag', 'pound', 'lb', '14x16', 'packaging', 'hayward'] },
  { name: '2oz Jar + Custom Label', category: 'Mylar Packaging', href: '/mylar#configure', keywords: ['jar', 'label', '2oz', 'container', 'cannabis', 'bottle'] },

  // Event Displays
  { name: 'Custom Canopy Tents', category: 'Event Displays', href: '/services/event-displays#shop', keywords: ['canopy', 'tent', 'popup', 'pop-up', 'event', 'booth', 'trade show', 'steel', 'aluminum', '5x5', '10x10', '10x15', '10x20', 'hayward', 'bay area'] },
  { name: 'Sidewalls & Half Walls', category: 'Event Displays', href: '/services/event-displays#shop', keywords: ['sidewall', 'half wall', 'wall', 'tent wall', 'enclosure'] },

  // Backdrops
  { name: 'Backdrop Displays', category: 'Backdrops & Displays', href: '/services/event-displays#shop', keywords: ['backdrop', 'display', 'banner', 'step and repeat', 'photo', 'background', 'fabric', 'vinyl', 'pop-up', 'tension'] },

  // Table Covers
  { name: 'Table Covers & Throws', category: 'Table Covers', href: '/services/event-displays#shop', keywords: ['table', 'cover', 'throw', 'tablecloth', 'fitted', 'draped', '6ft', '8ft', 'round', 'rectangular'] },

  // Retractable Banners
  { name: 'Retractable Banners', category: 'Banners', href: '/services/business-signage#shop', keywords: ['retractable', 'banner', 'roll up', 'pull up', 'stand', 'portable', 'display', 'economy', 'standard', 'premium', 'wide'] },

  // Business Print
  { name: 'Business Cards', category: 'Business Print', href: '/services/business-print#shop', keywords: ['business card', 'card', 'standard', 'square', 'mini', 'soft-touch', 'spot uv', 'foil', 'rounded'] },
  { name: 'Flyers', category: 'Business Print', href: '/services/business-print#shop', keywords: ['flyer', 'flier', 'handout', 'leaflet', '8.5x11', '5.5x8.5'] },
  { name: 'Door Hangers', category: 'Business Print', href: '/services/business-print#shop', keywords: ['door hanger', 'hanger', 'door', 'marketing'] },
  { name: 'Postcards', category: 'Business Print', href: '/services/business-print#shop', keywords: ['postcard', 'mailer', 'mailing', '4x6', '5x7'] },
  { name: 'Vehicle Magnets', category: 'Business Print', href: '/services/business-print#shop', keywords: ['magnet', 'vehicle magnet', 'car magnet', 'truck magnet', 'magnetic', '12x18', '18x24', '24x36'] },

  // Other Services
  { name: 'Vehicle Graphics & Wraps', category: 'Vehicle Graphics', href: '/services/vehicle-graphics#quote', keywords: ['vehicle', 'wrap', 'car wrap', 'truck', 'fleet', 'vinyl', 'lettering', 'decal', 'door graphic', 'perforated', 'window', 'hayward', 'bay area'] },
  { name: 'Business Signage', category: 'Business Signage', href: '/services/business-signage#shop', keywords: ['sign', 'signage', 'storefront', 'wall graphic', 'mural', 'a-frame', 'sidewalk', 'acrylic', 'metal', 'led', 'illuminated'] },
]


function terms(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(/\s+/).filter(Boolean)
    .map(word => word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word)
}
// Adjacent transpositions count as one typo ("stikcers", "lables").
function typoDistance(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) rows[0][j] = j
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + Number(a[i - 1] !== b[j - 1]))
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
      rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1)
    }
  }
  return rows[a.length][b.length]
}
export function searchStorefront(query: string): SearchItem[] {
  if (query.trim().length < 2) return []
  const queryTerms = terms(query)
  if (!queryTerms.length) return []
  return searchItems.map(item => {
    const indexed = terms([item.name, item.category, ...item.keywords].join(' '))
    let score = 0
    for (const term of queryTerms) {
      if (indexed.some(word => word.includes(term))) continue
      // Do not approximate dimensions or very short words.
      if (term.length < 4 || /[0-9]/.test(term)) return { item, score: Infinity }
      const allowance = term.length >= 7 ? 2 : 1
      const distance = Math.min(...indexed.filter(word => Math.abs(word.length - term.length) <= allowance)
        .map(word => typoDistance(term, word)))
      if (distance > allowance) return { item, score: Infinity }
      score += distance
    }
    return { item, score }
  }).filter(result => Number.isFinite(result.score))
    .sort((a, b) => a.score - b.score).map(result => result.item)
}
