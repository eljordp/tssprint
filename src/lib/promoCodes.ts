import { supabase } from './supabase'
import { DEFAULT_PROMOS, validatePromos } from './approvedPromos'
export interface PromoCode {
  code: string
  type: 'percent' | 'fixed'
  value: number // percent (0-100) or fixed dollar amount
  label: string // e.g. "Friends & Family", "TRADE SHOW 2026"
  category: 'friends_family' | 'first_time' | 'event' | 'custom'
  minOrder?: number // minimum order in USD
  maxUses?: number // 0 = unlimited
  uses: number
  active: boolean
  expiresAt?: string // ISO date string
  createdAt: string
}

const USED_CODES_KEY = 'tss-used-codes'

let sharedCodes: PromoCode[] = []
export async function loadPromoCodes(): Promise<PromoCode[]> {
 const { data, error } = await supabase.from('pricing_configs').select('config').eq('id', 'checkout_promos').maybeSingle()
 if (error) throw error
 const approved = validatePromos(data ? data.config : DEFAULT_PROMOS)
 sharedCodes = Object.entries(approved).map(([code, p]) => ({ code, ...p, label: p.firstOrderOnly ? 'First order discount' : 'Discount', category: p.firstOrderOnly ? 'first_time' : 'custom', uses: 0, createdAt: '' }))
 return sharedCodes
}

export const AUTO_DISCOUNT_CODE = 'AUTO10'
export const FIRST_VISIT_KEY = 'tss_first_visit_seen'
export const AUTO_APPLIED_KEY = 'tss_auto_discount_applied'

export function getPromoCodes(): PromoCode[] { return sharedCodes }

export function getUsedCodes(): string[] {
  return JSON.parse(localStorage.getItem(USED_CODES_KEY) || '[]')
}

function markCodeUsed(code: string) {
  const used = getUsedCodes()
  if (!used.includes(code)) {
    used.push(code)
    localStorage.setItem(USED_CODES_KEY, JSON.stringify(used))
  }
}

export interface PromoResult {
  valid: boolean
  code?: PromoCode
  discount?: number
  error?: string
}

export function validatePromoCode(inputCode: string, subtotal: number): PromoResult {
  const codes = getPromoCodes()
  const code = codes.find(c => c.code.toUpperCase() === inputCode.toUpperCase().trim())

  if (!code) return { valid: false, error: 'Invalid promo code' }
  if (!code.active) return { valid: false, error: 'This code is no longer active' }
  if (code.expiresAt && new Date(code.expiresAt) < new Date()) return { valid: false, error: 'This code has expired' }
  if (code.maxUses && code.maxUses > 0 && code.uses >= code.maxUses) return { valid: false, error: 'This code has reached its usage limit' }
  if (code.minOrder && subtotal < code.minOrder) return { valid: false, error: `Minimum order of $${code.minOrder.toFixed(2)} required` }

  // Check if first-time codes have already been used by this browser
  if (code.category === 'first_time') {
    const used = getUsedCodes()
    if (used.includes(code.code)) return { valid: false, error: 'This code can only be used once' }
  }

  const discount = code.type === 'percent'
    ? +(subtotal * (code.value / 100)).toFixed(2)
    : Math.min(code.value, subtotal)

  return { valid: true, code, discount }
}

export function applyPromoCode(code: string) {
  const codes = getPromoCodes()
  const found = codes.find(c => c.code.toUpperCase() === code.toUpperCase().trim())
  if (found?.category === 'first_time') {
    markCodeUsed(found.code)
  }
}

export const categoryLabels: Record<PromoCode['category'], string> = {
  friends_family: 'Friends & Family',
  first_time: 'First Time Customer',
  event: 'Trade Show / Event',
  custom: 'Custom',
}

// Preserve legacy referral drafts without making them approved checkout discounts.
export function savePromoCodes(codes: PromoCode[]) { localStorage.setItem('tss-legacy-referral-promo-drafts', JSON.stringify(codes)) }
