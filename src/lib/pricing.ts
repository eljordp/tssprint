const STORAGE_KEY = 'tss-pricing'

export interface PricingConfig {
  basePrices: { maxQty: number; price: number }[]
  materialMultipliers: { name: string; multiplier: number }[]
}

export const defaultPricing: PricingConfig = {
  basePrices: [
    { maxQty: 50, price: 0.45 },
    { maxQty: 100, price: 0.35 },
    { maxQty: 200, price: 0.28 },
    { maxQty: 500, price: 0.22 },
    { maxQty: Infinity, price: 0.18 },
  ],
  materialMultipliers: [
    { name: 'Matte Vinyl', multiplier: 1.0 },
    { name: 'Glossy Vinyl', multiplier: 1.0 },
    { name: 'Clear', multiplier: 1.2 },
    { name: 'Holographic', multiplier: 1.4 },
    { name: 'Paper', multiplier: 1.0 },
  ],
}

export function getPricing(): PricingConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Restore Infinity for the last tier
      parsed.basePrices = parsed.basePrices.map((t: { maxQty: number | null; price: number }) => ({
        ...t,
        maxQty: t.maxQty === null ? Infinity : t.maxQty,
      }))
      return parsed
    }
  } catch { /* use defaults */ }
  return defaultPricing
}

export function savePricing(config: PricingConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function getBasePrice(quantity: number, config: PricingConfig): number {
  for (const tier of config.basePrices) {
    if (quantity <= tier.maxQty) return tier.price
  }
  return config.basePrices[config.basePrices.length - 1].price
}

export function getMaterialMultiplier(material: string, config: PricingConfig): number {
  const found = config.materialMultipliers.find(m => m.name === material)
  return found ? found.multiplier : 1.0
}
