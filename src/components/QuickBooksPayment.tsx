import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ga4CheckoutIdentity, getQuickBooksAttempt, quickBooksRequest } from '@/lib/quickbooksCheckout'
import { trackEvent } from '@/lib/analytics'
export default function QuickBooksPayment({ disabled, payload, onBusy, onError, categories }: {
  categories: string[]; disabled: boolean; payload: () => Record<string, unknown>; onBusy: (busy: boolean) => void; onError: (message: string) => void
}) {
  const navigate = useNavigate()
  const [available, setAvailable] = useState(false)
  const [supported, setSupported] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const preview = new URLSearchParams(window.location.search).get('qb_preview') === '1'
  useEffect(() => {
    let cancelled = false
    fetch('/api/quickbooks/checkout-config').then(r => r.json()).then(data => { if (!cancelled) { setAvailable(data.enabled === true); setSupported(Array.isArray(data.categories) ? data.categories : []) } }).catch(() => {})
    return () => { cancelled = true }
  }, [])
  if (!available && !preview) return null
  const needsQuote = supported && categories.some(category => !supported.includes(category))
  if (needsQuote) return <div className="mb-5 space-y-3 rounded-xl border border-primary/30 p-4"><h3 className="font-bold">This order needs a shop invoice</h3><p className="text-sm text-muted-foreground">We’ll confirm the product details and sales tax before payment. Your cart stays saved.</p><a className="text-primary underline" href="mailto:thestickersmith@gmail.com?subject=Invoice%20for%20my%20website%20cart">Contact the shop</a></div>
  const start = async () => {
    if (disabled || busy || !supported) return
    setBusy(true); onBusy(true); onError('')
    try {
      const request = payload()
      // Freeze analytics with the original request so retries do not change it.
      const attempt = getQuickBooksAttempt(request)
      const ga4 = await ga4CheckoutIdentity()
      const headers: Record<string,string> = {}
      if (preview) { const { data: { session } } = await supabase.auth.getSession(); if (session) headers.Authorization = `Bearer ${session.access_token}` }
      const invoice = await quickBooksRequest('checkout', { id: attempt.id, token: attempt.token, checkout: attempt.request, ga4 }, headers)
      sessionStorage.setItem(`tss_qb_invoice_${attempt.id}`, JSON.stringify(invoice))
      trackEvent('payment_method_selected', { provider: 'quickbooks' })
      navigate(`/payment-status#${attempt.id}.${attempt.token}`)
    } catch (error) { onError(error instanceof Error ? error.message : 'Could not prepare your invoice.') }
    finally { setBusy(false); onBusy(false) }
  }
  return <div className="mb-5 space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
    <h3 className="font-bold">Credit or debit card</h3>
    <p className="text-sm text-muted-foreground">Review your itemized invoice and sales tax, then pay securely with QuickBooks. Choose card or Apple Pay when available on the payment page.</p>
    {preview && <p className="text-sm font-semibold">Staff verification: creates a real unpaid invoice. No card is charged by this step.</p>}
    <button type="button" className="btn-primary w-full disabled:opacity-50" disabled={disabled || busy || !supported} onClick={start}>{busy ? 'Preparing your invoice…' : 'Review total with tax'}</button>
  </div>
}
