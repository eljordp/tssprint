import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { validatePromoCode, loadPromoCodes, applyPromoCode, type PromoResult, AUTO_DISCOUNT_CODE, AUTO_APPLIED_KEY } from '@/lib/promoCodes'
import { getAnalyticsIdentity, trackAddToCart, trackCartEvent, shouldSuppressAnalytics } from '@/lib/analytics'
import { cartRequest, getCartCredentials, resetCartCredentials } from '@/lib/cartSession'

import type { ProductConfiguration } from '@/lib/productCartEditing'

export interface CartItem {
  productConfiguration?: ProductConfiguration
  pieceCount?: number
  configuration?: { shape: string; material: string; size: string; pieces: number; format: 'handheld' | 'sheet' | 'roll'; rush: boolean; design: boolean }
  id: string
  name: string
  category?: string
  size: string
  option: string
  price: number
  quantity: number
  addOns?: { name: string; price: number }[]
  material?: string
  shape?: string
  dimensions?: string
  artworkIntent?: 'uploaded' | 'send_later' | 'design_help'
  artwork?: {
    bucket: string
    path: string
    fileName: string
    contentType: string
    size: number
    uploadedAt: string
  }
}

export interface SavedCartLookup {
  items: CartItem[]
  totalPrice: number
  savedAt: Date
  sourceToken?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => 'added' | 'pending'
  replaceItem: (id: string, item: CartItem) => void
  syncStatus: 'idle' | 'saving' | 'saved' | 'error'
  retrySync: () => void
  emailCart: (email: string) => Promise<void>
  restoreFromToken: (token: string) => Promise<SavedCartLookup>
  setCartStage: (stage: 'checkout' | 'payment_issue') => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  markConverted: () => Promise<void>
  total: number
  totalItems: number
  cartEmail: string | null
  setCartEmail: (email: string | null) => void
  restoreCart: (saved: SavedCartLookup, email: string) => void
  // Promo code
  promoCode: string | null
  promoDiscount: number
  promoLabel: string | null
  applyPromo: (code: string) => Promise<PromoResult>
  removePromo: () => void
  finalizePromo: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tss-cart') || '[]')
      return Array.isArray(saved) ? saved.filter(item => item && typeof item.id === 'string' && Number.isFinite(item.price) && Number.isSafeInteger(item.quantity) && item.quantity > 0) : []
    } catch { return [] }
  })
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [syncAttempt, setSyncAttempt] = useState(0)
  const [stage, setCartStage] = useState<'checkout' | 'payment_issue' | undefined>()
  const syncQueue = useRef(Promise.resolve())
  const restoreSource = useRef<string | undefined>(undefined)
  const latestItems = useRef(items)
  useEffect(() => { latestItems.current = items }, [items])
  const retrySync = () => setSyncAttempt(attempt => attempt + 1)
  const [cartEmail, setCartEmailState] = useState<string | null>(() => localStorage.getItem('tss-cart-email'))

  const setCartEmail = useCallback((email: string | null) => {
    setCartEmailState(email)
    if (email) localStorage.setItem('tss-cart-email', email)
    else localStorage.removeItem('tss-cart-email')
  }, [])
  const [autoPromoDismissed, setAutoPromoDismissed] = useState(() => { try { return sessionStorage.getItem('tss_auto_promo_dismissed') === 'true' } catch { return false } })
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLabel, setPromoLabel] = useState<string | null>(null)

  // Sync to localStorage
  useEffect(() => {
    try { localStorage.setItem('tss-cart', JSON.stringify(items)) } catch { /* memory cart remains usable */ }
  }, [items])

  const syncSession = useCallback((currentItems: CartItem[], email: string | null, currentStage?: string) => {
    const credentials = getCartCredentials()
    const payload = { ...credentials, items: currentItems, email, stage: currentStage, identity: getAnalyticsIdentity(), isTest: shouldSuppressAnalytics(), sourceToken: restoreSource.current }
    const operation = syncQueue.current.catch(() => undefined).then(async () => {
      setSyncStatus('saving')
      for (let attempt = 0; attempt < 3; attempt++) {
        try { await cartRequest('sync', payload); if (restoreSource.current === payload.sourceToken) restoreSource.current = undefined; setSyncStatus('saved'); return }
        catch (error) {
          if (attempt === 2) { setSyncStatus('error'); throw error }
          await new Promise(resolve => window.setTimeout(resolve, 500 * 2 ** attempt))
        }
      }
    })
    syncQueue.current = operation.catch(() => undefined)
    return operation
  }, [])

  useEffect(() => {
    if (!items.length && !localStorage.getItem('tss-cart-credentials-v2')) return
    const timer = window.setTimeout(() => { void syncSession(items, cartEmail, stage).catch(() => undefined) }, 400)
    return () => window.clearTimeout(timer)
  }, [items, cartEmail, stage, syncAttempt, syncSession])

  useEffect(() => {
    const retry = () => setSyncAttempt(attempt => attempt + 1)
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [])

  const emailCart = async (email: string) => {
    const normalized = email.trim().toLowerCase()
    await syncSession(latestItems.current, normalized, stage)
    setCartEmail(normalized)
    await cartRequest('email', { ...getCartCredentials(), email: normalized })
  }

  const restoreFromToken = useCallback(async (token: string): Promise<SavedCartLookup> => {
    const saved = await cartRequest('restore', { token })
    return { items: saved.items, totalPrice: saved.total_price, savedAt: new Date(saved.updated_at), sourceToken: token }
  }, [])

  const doAddItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
      }
      return [...prev, item]
    })
  }

  const addItem = (item: CartItem): 'added' | 'pending' => {
    doAddItem(item)
    trackAddToCart({ item, value: (item.price + (item.addOns?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.quantity, category: item.category, source: window.location.pathname })
    return 'added'
  }

  const removeItem = (id: string) => {
    const item = items.find(item => item.id === id)
    if (item) trackCartEvent('remove_from_cart', [item])
    setItems(prev => prev.filter(i => i.id !== id))
  }
  const replaceItem = (id: string, item: CartItem) => {
    setItems(prev => prev.map(existing => existing.id === id ? { ...item, quantity: existing.quantity } : existing))
    trackCartEvent('cart_item_updated', [item])
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity)) return
    if (quantity <= 0) { removeItem(id); return }
    const previous = items.find(item => item.id === id)
    if (previous && quantity !== previous.quantity) trackCartEvent(quantity > previous.quantity ? 'add_to_cart' : 'remove_from_cart', [{ ...previous, quantity: Math.abs(quantity - previous.quantity) }])
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => {
    setItems([])
    setPromoCode(null)
    setPromoDiscount(0)
    setPromoLabel(null)
  }

  const restoreCart = useCallback((saved: SavedCartLookup, email: string) => {
    resetCartCredentials()
    restoreSource.current = saved.sourceToken
    setItems(saved.items)
    setCartEmail(email || null)
    trackCartEvent('cart_restored', saved.items)
  }, [setCartEmail])

  const markConverted = async () => {
    // Payment endpoints own the paid state. A browser callback cannot declare it.
    resetCartCredentials()
    restoreSource.current = undefined
    setCartStage(undefined)
  }

  const [promosReady, setPromosReady] = useState(false)
  const total = items.reduce((sum, i) => {
    const addOnTotal = i.addOns?.reduce((a, b) => a + b.price, 0) || 0
    return sum + (i.price + addOnTotal) * i.quantity
  }, 0)

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  // Re-validate promo when cart changes
  useEffect(() => {
    if (!promoCode || !promosReady) return
    const timer = window.setTimeout(() => {
      const result = validatePromoCode(promoCode, total)
      if (result.valid && result.discount !== undefined) {
        setPromoDiscount(result.discount)
      } else {
        setPromoCode(null)
        setPromoDiscount(0)
        setPromoLabel(null)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [total, promoCode, promosReady])

  // Auto-apply first-order discount for first-time buyers
  useEffect(() => {
    if (!promosReady || items.length === 0 || autoPromoDismissed) return
    if (promoCode) return // user already has a code applied
    const timer = window.setTimeout(() => {
      const hasOrdered = localStorage.getItem('tss_order_completed') === 'true'
      if (hasOrdered) return
      const result = validatePromoCode(AUTO_DISCOUNT_CODE, total)
      if (result.valid && result.code && result.discount !== undefined) {
        setPromoCode(result.code.code)
        setPromoDiscount(result.discount)
        setPromoLabel(`${result.code.value}% off`)
        localStorage.setItem(AUTO_APPLIED_KEY, 'true')
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [items.length, total, promoCode, autoPromoDismissed, promosReady])

  useEffect(() => { void loadPromoCodes().then(() => setPromosReady(true)).catch(() => {}) }, [])

  const applyPromo = async (code: string): Promise<PromoResult> => {
    try { await loadPromoCodes() } catch { return { valid: false, error: 'Could not check discounts. Please retry.' } }
    const result = validatePromoCode(code, total)
    if (result.valid && result.code && result.discount !== undefined) {
      setPromoCode(result.code.code)
      setPromoDiscount(result.discount)
      setPromoLabel(
        result.code.type === 'percent'
          ? `${result.code.value}% off`
          : `$${result.code.value} off`
      )
    }
    return result
  }

  const removePromo = () => {
    setAutoPromoDismissed(true)
    try { sessionStorage.setItem('tss_auto_promo_dismissed', 'true') } catch { /* Session persistence is optional. */ }
    setPromoCode(null)
    setPromoDiscount(0)
    setPromoLabel(null)
  }

  const finalizePromo = () => {
    if (promoCode) {
      applyPromoCode(promoCode)
    }
  }

  return (
    <CartContext.Provider value={{
      items, addItem, replaceItem, removeItem, updateQuantity, clearCart, markConverted,
      total, totalItems, cartEmail, setCartEmail,
      restoreCart, restoreFromToken, emailCart, syncStatus, retrySync, setCartStage,
      promoCode, promoDiscount, promoLabel,
      applyPromo, removePromo, finalizePromo,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
