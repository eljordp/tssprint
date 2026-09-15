// Use Vite's current manifest, never serialized hashes from a previous release.
const pages = {
  '/': 'Home', '/stickers': 'Order', '/services': 'Services',
  '/services/vehicle-graphics': 'VehicleGraphics', '/services/business-signage': 'BusinessSignage',
  '/services/event-displays': 'EventDisplays', '/services/business-print': 'BusinessPrint',
  '/mylar': 'MylarPackaging', '/projects': 'Projects', '/about': 'About', '/contact': 'Contact',
  '/quote': 'Contact', '/referral': 'Referral', '/order-help': 'OrderHelp', '/terms': 'Legal', '/privacy': 'Legal',
  '/cart': 'Cart', '/checkout': 'Checkout', '/account': 'Account', '/admin': 'Admin',
  '/payment-status': 'PaymentStatus', '/order-confirmation': 'OrderConfirmation', '/404': 'NotFound',
}
const stickerPages = new Set(['die-cut-stickers','sticker-sheets','roll-labels','holographic-stickers','custom-labels'])
const cities = new Set(['hayward','oakland','san-leandro','castro-valley','union-city','fremont','san-lorenzo','newark'])
export function routePreloads(manifest, route) {
  const slug = route.slice(1)
  const page = pages[route] || (route.startsWith('/case-studies/') ? 'CaseStudyDetail' : stickerPages.has(slug) ? 'StickerSupportPage' : cities.has(slug) ? 'CityPage' : null)
  const visited = new Set()
  const files = new Set()
  const visit = key => {
    if (visited.has(key)) return
    visited.add(key)
    const chunk = manifest[key]
    if (!chunk) return
    if (chunk.file.endsWith('.js')) files.add(chunk.file)
    for (const imported of chunk.imports || []) visit(imported)
  }
  if (page) visit(`src/pages/${page}.tsx`)
  return [...files].map(file => `<link rel="modulepreload" crossorigin href="/${file}">`).join('\n')
}
