export { getBasePrice } from './stickerPricing'

const STORAGE_KEY = 'tss-pricing'
const STORE_PRICING_ID = 'storefront'

export { defaultPricing } from './pricingCatalog'
export type { AddOn, ProductTier, ProductCategory, SizeMultiplier, PricingConfig } from './pricingCatalog'
import { defaultPricing, normalizePricingConfig, type PricingConfig } from './pricingCatalog'

function pricingForStorage(config: PricingConfig) {
  return JSON.parse(JSON.stringify(config))
}

function cachePricing(config: PricingConfig) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pricingForStorage(config)))
}

export function getPricing(): PricingConfig {
  if (typeof window === 'undefined') return defaultPricing
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return normalizePricingConfig(JSON.parse(saved))
    }
  } catch { /* use defaults */ }
  return defaultPricing
}

export async function loadPricing(strict = false): Promise<PricingConfig> {
  try {
    const { supabase } = await import('./supabase')
    const { data, error } = await supabase
      .from('pricing_configs')
      .select('config')
      .eq('id', STORE_PRICING_ID)
      .maybeSingle()

    if (error) throw error
    if (!error && data?.config) {
      const config = normalizePricingConfig(data.config)
      cachePricing(config)
      return config
    }
  } catch (error) { if (strict) throw error }

  return getPricing()
}

export async function savePricing(config: PricingConfig) {
  const { supabase } = await import('./supabase')
  const normalized = normalizePricingConfig(config)

  const { error } = await supabase
    .from('pricing_configs')
    .upsert({
      id: STORE_PRICING_ID,
      config: pricingForStorage(normalized),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

  if (error) throw error
  cachePricing(normalized)
}

export function getMaterialMultiplier(material: string, config: PricingConfig): number {
  const found = config.materialMultipliers.find(m => m.name === material)
  return found ? found.multiplier : 1.0
}

export function getSizeMultiplier(size: string, config: PricingConfig): number {
  const found = config.sizeMultipliers.find(s => s.name === size)
  return found ? found.multiplier : 1.0
}
