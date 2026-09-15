import type { CartItem } from '../context/CartContext'
import type { ProductCategory } from './pricingCatalog'

export interface ProductConfiguration {
  version: 1
  kind: 'catalog' | 'packaging'
  category: string
  variant: string
  pieces: number
  addOns: string[]
  finish?: 'matte' | 'gloss'
  pouchColor?: 'white' | 'black'
}

const routes: Record<string, string> = {
  'Business Cards': '/services/business-print',
  'Flyers & Door Hangers': '/services/business-print',
  Postcards: '/services/business-print',
  'Vehicle Magnets': '/services/business-print',
  'Mylar Packaging': '/mylar',
}

export function cartEditHref(item: CartItem, from: 'cart' | 'checkout' = 'cart') {
  const route = item.configuration ? '/stickers' : routes[item.category || '']
  if (!route) return null
  return `${route}?edit=${encodeURIComponent(item.id)}&returnTo=${from}#${route === '/services/business-print' ? 'shop' : 'configure'}`
}

// Catalog category and size are the catalog's existing business keys. Never use
// numeric array positions or the amount charged to reconstruct an old item.
export function resolveProductEdit(item: CartItem, categories: ProductCategory[]): ProductConfiguration | null {
  let config = item.productConfiguration
  if (!config) {
    const match = /^(\d+)(?: pcs)?(?: · (matte|gloss|foil) · (white|black) · (Holo|Standard))?$/.exec(item.option)
    const jar = /^(\d+) jars with custom labels$/.exec(item.option)
    const pieces = Number(match?.[1] || jar?.[1])
    if (!item.category || !routes[item.category] || !pieces) return null
    const packaging = item.category === 'Mylar Packaging'
    if (packaging && !item.size.toLowerCase().includes('jar') && !match?.[2]) return null
    config = { version: 1, kind: packaging ? 'packaging' : 'catalog', category: item.category, variant: item.size, pieces,
      addOns: (item.addOns || []).map(a => a.name),
      ...(packaging ? { finish: match?.[2] === 'gloss' ? 'gloss' : 'matte', pouchColor: match?.[3] === 'black' ? 'black' : 'white' } : {}) }
  }
  if (config.version !== 1 || !['catalog', 'packaging'].includes(config.kind) || config.category !== item.category || config.variant !== item.size || !Number.isSafeInteger(config.pieces) || config.pieces < 1 || config.pieces > 100000 || !Array.isArray(config.addOns)) return null
  const category = categories.find(c => c.name === config.category)
  const variant = category?.items.find(v => v.size === config.variant)
  if (!category || !variant || new Set(config.addOns).size !== config.addOns.length || config.addOns.some(name => !category.addOns.some(a => a.name === name))) return null
  const fixed = ['Business Cards', 'Flyers & Door Hangers', 'Postcards'].includes(category.name) || !category.items.some(v => v.quantities.some(q => q.qty >= 50))
  if (fixed ? !variant.quantities.some(q => q.qty === config.pieces) : config.pieces < Math.min(...variant.quantities.map(q => q.qty))) return null
  if (config.kind === 'packaging' && (category.name !== 'Mylar Packaging' || !['matte', 'gloss'].includes(config.finish || '') || !['white', 'black'].includes(config.pouchColor || ''))) return null
  return config
}
