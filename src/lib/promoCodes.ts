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

const STORAGE_KEY = 'tss-promo-codes'
const USED_CODES_KEY = 'tss-used-codes'

const defaultCodes: PromoCode[] = [
  {
    code: 'AUTO10',
    type: 'percent',
    value: 10,
    label: 'First Order Discount — Auto-Applied',
    category: 'first_time',
    minOrder: 35,
    maxUses: 0,
    uses: 0,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    code: 'WELCOME15',
    type: 'percent',
    value: 15,
    label: 'New Customer — 15% Off Your First Order',
    category: 'first_time',
    minOrder: 50,
    maxUses: 0,
    uses: 0,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    code: 'FIRST10',
    type: 'fixed',
    value: 10,
    label: 'First Order — $10 Off',
    category: 'first_time',
    minOrder: 50,
    maxUses: 0,
    uses: 0,
    active: true,
    createdAt: new Date().toISOString(),
  },
]

export const AUTO_DISCOUNT_CODE = 'AUTO10'
export const FIRST_VISIT_KEY = 'tss_first_visit_seen'
export const AUTO_APPLIED_KEY = 'tss_auto_discount_applied'

export function getPromoCodes(): PromoCode[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    let codes: PromoCode[] = JSON.parse(saved)
    let dirty = false
    // Clean up: remove deprecated FAMILY20, fix old $25 minimums
    if (codes.some(c => c.code === 'FAMILY20')) {
      codes = codes.filter(c => c.code !== 'FAMILY20')
      codes = codes.map(c => c.code === 'WELCOME15' && c.minOrder === 25 ? { ...c, minOrder: 50 } : c)
      dirty = true
    }
    // Inject AUTO10 if missing (migration for existing users)
    if (!codes.some(c => c.code === 'AUTO10')) {
      const auto = defaultCodes.find(c => c.code === 'AUTO10')
      if (auto) {
        codes = [auto, ...codes]
        dirty = true
      }
    }
    if (dirty) localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
    return codes
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCodes))
  return defaultCodes
}

export function savePromoCodes(codes: PromoCode[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(codes))
}

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
  const updated = codes.map(c => {
    if (c.code.toUpperCase() === code.toUpperCase().trim()) {
      return { ...c, uses: c.uses + 1 }
    }
    return c
  })
  savePromoCodes(updated)

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
