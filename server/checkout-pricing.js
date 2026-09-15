import { defaultPricing, normalizePricingConfig } from '../src/lib/pricingCatalog.js'
import { getStickerPrice, isValidStickerQuantity } from '../src/lib/stickerPricing.js'

const CART_CATEGORIES = new Set(['Mylar Packaging', 'Event Displays', 'Backdrops & Displays', 'Table Covers', 'Retractable Banners', 'Business Cards', 'A-Frame Signs', 'Flyers & Door Hangers', 'Postcards', 'Vehicle Magnets'])
const TOTAL_TIERS = new Set(['Business Cards', 'Flyers & Door Hangers', 'Postcards'])
const MATERIAL_LABELS = { 'Matte Vinyl': 'Matte', 'Glossy Vinyl': 'Gloss', Clear: 'Clear', Holographic: 'Holographic', Paper: 'Paper', 'Embossed/UV': 'Embossed/UV' }
const SHAPES = new Set(['Die-Cut', 'Kiss-Cut', 'Square', 'Circle', 'Rectangle'])
export const APPROVED_PROMOS = Object.freeze({
  AUTO10: { type: 'percent', value: 10, minOrder: 35 },
  WELCOME15: { type: 'percent', value: 15, minOrder: 50 },
  FIRST10: { type: 'fixed', value: 10, minOrder: 50 },
})
const money = value => Math.round(value * 100) / 100
export function checkoutError(message, status = 400) {
  return Object.assign(new Error(message), { status })
}

function env(name) { return (process.env[name] || '').trim().replace(/^(['"])(.*)\1$/, '$2') }
async function storeRead(query, { privateRead = false } = {}) {
  const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL')
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY') || env('SUPABASE_SECRET_KEY') || env('SUPABASE_SERVICE_KEY')
  const key = privateRead ? serviceKey : (env('VITE_SUPABASE_ANON_KEY') || serviceKey)
  if (!url || !key) throw checkoutError('Checkout validation is temporarily unavailable. Please try again shortly.', 503)
  const response = await fetch(`${url}/rest/v1/${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw checkoutError('Checkout validation is temporarily unavailable. Please try again shortly.', 503)
  return response.json()
}

export async function loadServerPricing() {
  // Only the admin-controlled database or shipped catalog is authoritative.
  // A failed database read must not silently revert a published price change.
  const rows = await storeRead('pricing_configs?id=eq.storefront&select=config')
  return rows[0]?.config ? normalizePricingConfig(rows[0].config) : defaultPricing
}

export async function hasPaidOrder(email, excludeOrderId) {
  const query = new URLSearchParams({ select: 'id', customer_email: `ilike.${email}`, payment_status: 'eq.captured', limit: '1' })
  if (excludeOrderId) query.set('id', `neq.${excludeOrderId}`)
  const rows = await storeRead(`orders?${query}`, { privateRead: true })
  return rows.length > 0
}

function positive(value) {
  if (!Number.isFinite(value) || value <= 0) throw checkoutError('This product needs a confirmed quote before checkout.')
  return value
}

export function priceItem(item, config) {
  if (!item || typeof item !== 'object') throw checkoutError('Invalid cart item.')
  if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000) throw checkoutError('Invalid item quantity.')
  const match = /^(\d+)(?: pcs)?(?: · (.+))?$/.exec(String(item.option || ''))
  const pieces = match ? Number(match[1]) : 0
  if (!Number.isSafeInteger(pieces) || pieces < 1 || pieces > 100000) throw checkoutError('Invalid product quantity.')
  let price, allowedAddOns, addOnFactor = 1, name, category

  if (item.material || item.shape || item.category === 'Stickers') {
    category = 'Stickers'
    if (!SHAPES.has(item.shape) || !Object.hasOwn(MATERIAL_LABELS, item.material) || !isValidStickerQuantity(pieces)) throw checkoutError('Invalid sticker configuration.')
    const size = config.sizeMultipliers.find(s => s.name === item.size)
    const material = config.materialMultipliers.find(m => m.name === item.material)
    if (!size || !material) throw checkoutError('Invalid sticker size or material.')
    const format = match[2]
    if (!['Individual stickers', 'Sticker sheets', 'Roll labels'].includes(format)) throw checkoutError('Invalid sticker format.')
    name = format === 'Sticker sheets' ? `${MATERIAL_LABELS[item.material]} Sticker Sheets`
      : format === 'Roll labels' ? `${MATERIAL_LABELS[item.material]} Roll Labels`
        : `${item.shape} ${MATERIAL_LABELS[item.material]} Stickers`
    price = getStickerPrice(pieces, config, positive(size.multiplier), positive(material.multiplier)).subtotal
    allowedAddOns = config.stickerAddOns.filter(a => ['Rush (2-day)', 'Design Assist'].includes(a.name))
  } else {
    const matches = config.products.filter(c => CART_CATEGORIES.has(c.name) && (!item.category || item.category === c.name) && c.items.some(p => p.size === item.size))
    if (matches.length !== 1) throw checkoutError('Unknown product. Please add it again from the product page.')
    const product = matches[0]
    category = product.name
    const variant = product.items.find(p => p.size === item.size)
    const tiers = [...variant.quantities].sort((a, b) => a.qty - b.qty)
    const bulk = !TOTAL_TIERS.has(category) && product.items.some(p => p.quantities.some(t => t.qty >= 50))
    const tier = bulk ? tiers.filter(t => t.qty <= pieces).at(-1) : tiers.find(t => t.qty === pieces)
    if (!tier) throw checkoutError('This quantity is not available. Please choose a listed quantity.')
    const perUnit = !TOTAL_TIERS.has(category) && (bulk || tiers.length > 1)
    addOnFactor = perUnit ? pieces : 1
    price = money(positive(tier.price) * addOnFactor)
    allowedAddOns = product.addOns
    name = category === 'Mylar Packaging' && match[2] ? `Custom ${variant.size}` : variant.size
    if (match[2] && (category !== 'Mylar Packaging' || !/^(matte|gloss|foil) · (white|black) · (Holo|Standard)$/.test(match[2]))) throw checkoutError('Invalid product options.')
    if (category === 'Mylar Packaging' && match[2]?.endsWith(' · Holo') && !item.addOns?.some(a => a.name === 'Holographic Upgrade')) throw checkoutError('Holographic upgrade is missing from the order.')
  }
  positive(price)
  const approvedDisplayLabel = category !== 'Stickers' && item.name === `${category} — ${item.size}`
  if ((!approvedDisplayLabel && item.name !== name) || (item.category && item.category !== category)) throw checkoutError('Product details changed. Please add this product again.')
  const requestedAddOns = item.addOns ?? []
  if (!Array.isArray(requestedAddOns) || requestedAddOns.length > 10 || new Set(requestedAddOns.map(a => a?.name)).size !== requestedAddOns.length) throw checkoutError('Invalid item add-ons.')
  const addOns = requestedAddOns.map(a => {
    const approved = allowedAddOns.find(option => option.name === a?.name && option.type === 'flat')
    if (!approved) throw checkoutError('Unknown product add-on.')
    const expected = money(positive(approved.value) * addOnFactor)
    if (typeof a.price !== 'number' || !Number.isFinite(a.price) || Math.round(a.price * 100) !== Math.round(expected * 100)) throw checkoutError('Add-on price changed. Please add this product again.')
    return { name: approved.name, price: expected }
  })
  if (typeof item.price !== 'number' || !Number.isFinite(item.price) || Math.round(item.price * 100) !== Math.round(price * 100)) throw checkoutError('Product price changed. Please add this product again.')
  return { ...item, name, category, price, addOns }
}

export async function approvedDiscount(code, subtotal, email, checkPaid = hasPaidOrder) {
  if (!code) return 0
  if (typeof code !== 'string' || !Object.hasOwn(APPROVED_PROMOS, code.trim().toUpperCase())) throw checkoutError('This promo code is not approved for online checkout.')
  const promo = APPROVED_PROMOS[code.trim().toUpperCase()]
  if (subtotal < promo.minOrder) throw checkoutError(`This promo requires an order of at least $${promo.minOrder}.`)
  if (await checkPaid(email)) throw checkoutError('This promo is for first orders only. Remove it to continue.')
  return promo.type === 'percent' ? money(subtotal * promo.value / 100) : Math.min(subtotal, promo.value)
}
