import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ga4CheckoutIdentity, getQuickBooksAttempt, quickBooksRequest, type InvoiceCheckout, type QuickBooksAttempt } from '@/lib/quickbooksCheckout'
import ApplePayPayment from './ApplePayPayment'
import IntuitCardPayment from './IntuitCardPayment'
import { trackCartEvent } from '@/lib/analytics'
export default function QuickBooksPayment({ disabled, payload, onBusy, onError, categories, checkoutKey }: {
  categories: string[]; disabled: boolean; payload: () => Record<string, unknown>; onBusy: (busy: boolean) => void; onError: (message: string) => void; checkoutKey: string
}) {
  const navigate = useNavigate()
  const [available, setAvailable] = useState(false)
  const [supported, setSupported] = useState<string[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [wallet, setWallet] = useState<{ enabled: boolean; clientId: string } | null>(null)
  const [method, setMethod] = useState<'direct' | 'wallet'>('direct')
  const [methodLocked, setMethodLocked] = useState(false)
  const [direct, setDirect] = useState(false)
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('production')
  const [prepared, setPrepared] = useState<{ invoice: InvoiceCheckout; attempt: QuickBooksAttempt; key: string } | null>(null)
  const preview = new URLSearchParams(window.location.search).get('qb_preview') === '1'
  useEffect(() => {
    const active = sessionStorage.getItem('tss_active_payment')
    if (active && /^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/.test(active)) { navigate(`/payment-status#${active}`); return }
    let cancelled = false
    fetch('/api/quickbooks/checkout-config').then(r => r.json()).then(data => { if (!cancelled) { setAvailable(data.enabled === true); setSupported(Array.isArray(data.categories) ? data.categories : []); setDirect(data.direct === true); setWallet(data.applePay?.enabled && data.applePay.clientId ? data.applePay : null); setEnvironment(data.environment === 'sandbox' ? 'sandbox' : 'production') } }).catch(() => {})
    return () => { cancelled = true }
  }, [navigate])
  if (!available && !preview) return null
  const needsQuote = supported && categories.some(category => !supported.includes(category))
  if (needsQuote) return <div className="mb-5 space-y-3 rounded-xl border border-primary/30 p-4"><h3 className="font-bold">This order needs a shop invoice</h3><p className="text-sm text-muted-foreground">We’ll confirm the product details and sales tax before payment. Your cart stays saved.</p><a className="text-primary underline" href="mailto:thestickersmith@gmail.com?subject=Invoice%20for%20my%20website%20cart">Contact the shop</a></div>
  const start = async () => {
    if (disabled || busy || !supported) return
    const active = sessionStorage.getItem('tss_active_payment')
    if (active && /^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/.test(active)) { navigate(`/payment-status#${active}`); return }
    setBusy(true); onBusy(true); onError('')
    try {
      const request = { ...payload(), ...(method === 'wallet' ? { paymentMode: 'wallet' } : direct ? { paymentMode: 'direct' } : {}) }
      // Freeze analytics with the original request so retries do not change it.
      const attempt = getQuickBooksAttempt(request)
      const ga4 = await ga4CheckoutIdentity()
      const headers: Record<string,string> = {}
      if (preview) { const { data: { session } } = await supabase.auth.getSession(); if (session) headers.Authorization = `Bearer ${session.access_token}` }
      const invoice = await quickBooksRequest('checkout', { id: attempt.id, token: attempt.token, checkout: attempt.request, ga4 }, headers)
      sessionStorage.setItem(`tss_qb_invoice_${attempt.id}`, JSON.stringify(invoice))
      trackCartEvent('add_shipping_info', invoice.items, { shipping_tier: invoice.deliveryMethod })
      if ((direct || method === 'wallet') && !invoice.orderId) setPrepared({ invoice, attempt, key: checkoutKey })
      else navigate(`/payment-status#${attempt.id}.${attempt.token}`)
    } catch (error) { onError(error instanceof Error ? error.message : 'Could not prepare your invoice.') }
    finally { setBusy(false); onBusy(false) }
  }
  if (methodLocked && prepared?.key !== checkoutKey) return <p role="status">Your earlier payment is still being checked. <a className="text-primary underline" href={`/payment-status#${sessionStorage.getItem('tss_active_payment') || ''}`}>Check that payment before changing your order.</a></p>
  const methods = wallet && <div className="grid grid-cols-2 gap-2 mb-4" role="group" aria-label="Payment method"><button type="button" disabled={disabled || busy || methodLocked} aria-pressed={method === 'direct'} className={`rounded-lg border p-3 font-bold ${method === 'direct' ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => { setMethod('direct'); setPrepared(null) }}>Credit / debit card</button><button type="button" disabled={disabled || busy || methodLocked} aria-pressed={method === 'wallet'} className={`rounded-lg border p-3 font-bold ${method === 'wallet' ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => { setMethod('wallet'); setPrepared(null) }}>Apple Pay</button></div>
  const paymentBusy = (value: boolean) => { setMethodLocked(!!sessionStorage.getItem('tss_active_payment')); onBusy(value) }
  if ((direct || method === 'wallet') && prepared?.key === checkoutKey) return <div className="space-y-4">{methods}
    <dl className="grid grid-cols-2 gap-2 text-sm"><dt>Subtotal</dt><dd className="text-right">${prepared.invoice.subtotal.toFixed(2)}</dd><dt>Discount</dt><dd className="text-right">−${prepared.invoice.discount.toFixed(2)}</dd><dt>Sales tax</dt><dd className="text-right">${prepared.invoice.tax?.toFixed(2)}</dd><dt className="font-bold">Total to pay</dt><dd className="text-right font-bold">${prepared.invoice.total?.toFixed(2)}</dd></dl>
    {method === 'wallet' && wallet ? <ApplePayPayment key={prepared.attempt.id} clientId={wallet.clientId} invoice={prepared.invoice} attempt={prepared.attempt} disabled={disabled || busy} onLock={() => { sessionStorage.setItem('tss_active_payment', `${prepared.attempt.id}.${prepared.attempt.token}`); setMethodLocked(true) }} onBusy={onBusy} onError={onError} onResult={invoice => {
      if (invoice.walletCanRetry && ['CREATING','CREATED','PAYER_ACTION_REQUIRED'].includes(invoice.chargeStatus || '')) { sessionStorage.removeItem('tss_active_payment'); setMethodLocked(false) }
      if (invoice.chargeStatus === 'DECLINED') { sessionStorage.removeItem('tss_active_payment'); setMethodLocked(false) }
      setPrepared({ ...prepared, invoice }); if (invoice.orderId) navigate(`/payment-status#${prepared.attempt.id}.${prepared.attempt.token}`)
    }} /> : <IntuitCardPayment key={prepared.attempt.id} invoice={prepared.invoice} attempt={prepared.attempt} environment={environment} disabled={disabled || busy} onBusy={paymentBusy} onError={onError} onResult={invoice => {
      if (invoice.chargeStatus === 'DECLINED') { sessionStorage.removeItem('tss_active_payment'); setMethodLocked(false) }
      setPrepared({ ...prepared, invoice }); if (invoice.orderId) navigate(`/payment-status#${prepared.attempt.id}.${prepared.attempt.token}`)
    }} />}

  </div>
  return <div className="mb-5 space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
    {methods}<h3 className="font-bold">{method === 'wallet' ? 'Apple Pay' : 'Credit or debit card'}</h3>
    <p className="text-sm text-muted-foreground">{direct ? method === 'wallet' ? 'Calculate sales tax, then approve payment with Apple Pay right here.' : 'Calculate your final total, including sales tax, then enter your card details here.' : 'Review your itemized invoice and sales tax, then pay securely with QuickBooks. Choose card or Apple Pay when available on the payment page.'}</p>
    {preview && <p className="text-sm font-semibold">Staff verification: creates a real unpaid invoice. No card is charged by this step.</p>}
    <button type="button" className="btn-primary w-full disabled:opacity-50" disabled={disabled || busy || !supported} onClick={start}>{busy ? 'Calculating your total…' : direct ? 'Calculate total with tax' : 'Review total with tax'}</button>
  </div>
}
