import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { quickBooksRequest, type InvoiceCheckout } from '@/lib/quickbooksCheckout'
import PaymentDisclosure from '@/components/PaymentDisclosure'
const amount = (value: number | null) => value === null ? 'Calculating…' : `$${Number(value).toFixed(2)}`
export default function PaymentStatus() {
  const credentials = useRef(window.location.hash.slice(1).split('.'))
  const [invoice, setInvoice] = useState<InvoiceCheckout | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inFlight = useRef(false)
  const { items, clearCart, markConverted } = useCart()
  const cleared = useRef(false)
  const refresh = useCallback(async () => {
    if (inFlight.current) return
    const [id, token] = credentials.current
    if (!id || !token) { setError('Open the payment-status link from the browser where you started checkout.'); return }
    inFlight.current = true; setBusy(true)
    try {
      const result = await quickBooksRequest('checkout-status', { id, token }); setInvoice(result); setError('')
      if (!result.issue && !result.orderId && (['DECLINED','CANCELLED'].includes(result.chargeStatus || '') || (!result.chargeStatus && result.paymentMode === 'direct') || (result.walletCanRetry && ['','CREATING','CREATED','PAYER_ACTION_REQUIRED'].includes(result.chargeStatus || '')))) sessionStorage.removeItem('tss_active_payment')
    }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not check payment.'); }
    finally { inFlight.current = false; setBusy(false) }
  }, [])
  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 15000)
    const visible = () => { if (document.visibilityState === 'visible') void refresh() }
    document.addEventListener('visibilitychange', visible)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visible) }
  }, [refresh])
  useEffect(() => {
    if (!invoice?.orderId || invoice.status !== 'payment_recorded' || cleared.current) return
    cleared.current = true
    // A customer may have built a different cart while this invoice was open.
    if (items.length === invoice.items.length && items.every(item => invoice.items.some(saved =>
      saved.id === item.id && saved.quantity === item.quantity && saved.price === item.price &&
      saved.option === item.option && saved.size === item.size &&
      JSON.stringify(saved.addOns) === JSON.stringify(item.addOns) &&
      JSON.stringify(saved.artwork) === JSON.stringify(item.artwork)
    ))) { clearCart(); void markConverted() }
    try { sessionStorage.removeItem('tss_active_payment'); sessionStorage.removeItem('tss_qb_attempt'); sessionStorage.removeItem('tss_checkout_draft') } catch { /* Order remains on the server. */ }
  }, [invoice, items, clearCart, markConverted])
  const paid = invoice?.status === 'payment_recorded' && !!invoice.orderId
  const review = invoice?.status === 'needs_review'
  return <section className="section-container max-w-3xl py-12 md:py-20 space-y-6">
    <h1 className="text-3xl md:text-4xl font-black">{paid ? 'Payment recorded' : review ? 'Your payment needs a review' : 'Checking your payment'}</h1>
    <p className="text-muted-foreground">{paid ? 'Your payment is confirmed and your order is saved. Artwork review and proof approval come next.' : 'Check the items, sales tax and final total before paying. Your order starts after payment is confirmed.'}</p>
    {error && <p role="alert" className="rounded-xl border border-destructive/30 p-4">{error}</p>}
    {invoice && <div className="rounded-2xl border border-border bg-card p-5 md:p-7 space-y-5">
      <p className="text-sm break-all">{invoice.orderId || invoice.paymentMode === 'wallet' ? `Order ${invoice.id}` : `Invoice ${invoice.invoiceNumber || 'being prepared'}`}</p>
      <ul className="divide-y divide-border">{invoice.items.map((item, i) => <li key={i} className="py-3"><p className="font-bold">{item.category === 'Stickers' ? item.name : item.category || item.name} · {item.option}</p><p className="text-sm text-muted-foreground">{item.size} · {item.quantity} batch(es){item.addOns.length > 0 && ` · ${item.addOns.map(a => a.name).join(', ')}`}</p></li>)}</ul>
      <dl className="grid grid-cols-2 gap-3 text-sm"><dt>Subtotal</dt><dd className="text-right">{amount(invoice.subtotal)}</dd><dt>Discount</dt><dd className="text-right">−{amount(invoice.discount)}</dd><dt>Sales tax</dt><dd className="text-right">{amount(invoice.tax)}</dd><dt>{invoice.deliveryMethod === 'pickup' ? 'Hayward pickup' : 'Shipping'}</dt><dd className="text-right">Free</dd><dt className="font-bold text-lg">Total</dt><dd className="text-right font-black text-xl text-primary">{amount(invoice.total)}</dd></dl>
      {invoice.status === 'partially_paid' && <p role="status">QuickBooks reports a partial payment. Open the invoice to see the remaining balance.</p>}
      {review && <p role="alert">Please contact the shop before paying again. We need to confirm your payment details.</p>}
      {invoice.invoiceLink && !paid && !review && <><a href={invoice.invoiceLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center">Pay securely with QuickBooks ↗</a><p className="text-sm text-muted-foreground">Opens the secure payment page. Return here after paying; we’ll check the payment automatically. Keep this page bookmarked for your invoice status.</p></>}
      {paid && <p className="text-sm">Your confirmation is queued for {invoice.email}. If it doesn’t arrive, contact the shop with your order reference. Nothing prints until you approve the proof.</p>}
      <PaymentDisclosure />
    </div>}
    <div className="flex flex-wrap gap-4 items-center"><button onClick={() => void refresh()} disabled={busy} className="rounded-lg border border-border px-4 py-3 disabled:opacity-50">{busy ? 'Checking…' : 'Check payment status'}</button><Link to="/cart" className="text-primary underline">Back to cart</Link><a href="mailto:thestickersmith@gmail.com" className="text-primary underline">Contact the shop</a></div>
  </section>
}
