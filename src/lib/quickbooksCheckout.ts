import type { CartItem } from '@/context/CartContext'
export type QuickBooksAttempt = { id: string; token: string; request: unknown }
export type InvoiceCheckout = {
  id: string; status: string; invoiceNumber: string | null; orderId: string | null
  subtotal: number; discount: number; tax: number | null; total: number | null
  items: { id: string; name: string; category?: string; option: string; size: string; quantity: number; price: number; artwork?: CartItem['artwork']; addOns: { name: string; price: number }[] }[]
  email: string; customerName: string; deliveryMethod: string; invoiceLink: string | null; issue: string | null; lastChecked: string | null
}
const errors: Record<string, string> = {
  product_mapping_required: 'This product needs an item setup in QuickBooks. Contact the shop for an invoice.',
  tax_configuration_required: 'Tax calculation is unavailable. Contact the shop before paying.',
  checkout_busy: 'This invoice is already being prepared. Please wait a moment and retry.',
  checkout_changed: 'This saved invoice belongs to your previous order details. Review it before starting another payment.',
  rate_limited: 'Please wait before trying again. Your saved invoice is still available.',
  checkout_not_found: 'This payment link is unavailable. Use the same browser or contact the shop with your invoice reference.',
  invoice_link_unavailable: 'QuickBooks has not supplied a payment link yet. Check again shortly.',
  invoice_total_mismatch: 'The invoice total needs a shop review. Please do not pay it yet.',
  invoice_total_changed: 'The invoice changed. Contact the shop to confirm its total before paying.',
}
export async function quickBooksRequest(action: string, body: unknown, headers: Record<string,string> = {}) {
  const response = await fetch(`/api/quickbooks/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(errors[data.error] || 'We could not check your QuickBooks invoice. Retry the same invoice; contact us if you have already paid.')
  return data as InvoiceCheckout
}
export function getQuickBooksAttempt(request: unknown): QuickBooksAttempt {
  const existing = sessionStorage.getItem('tss_qb_attempt')
  if (existing) {
    const saved = JSON.parse(existing) as QuickBooksAttempt
    if (JSON.stringify(saved.request) === JSON.stringify(request)) return saved
  }
  const token = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const attempt = { id: crypto.randomUUID(), token, request }
  // A write failure stops invoice creation rather than losing retry credentials.
  sessionStorage.setItem('tss_qb_attempt', JSON.stringify(attempt))
  return attempt
}
export async function ga4CheckoutIdentity() {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID
  const { shouldSuppressAnalytics } = await import('./analytics')
  if (shouldSuppressAnalytics() || !measurementId || !window.gtag) return null
  const read = (field: string) => new Promise<string | null>(resolve => {
    const timer = window.setTimeout(() => resolve(null), 700)
    window.gtag?.('get', measurementId, field, (value: unknown) => { window.clearTimeout(timer); resolve(typeof value === 'string' || typeof value === 'number' ? String(value) : null) })
  })
  const [clientId, sessionId] = await Promise.all([read('client_id'), read('session_id')])
  return clientId ? { clientId, sessionId } : null
}
