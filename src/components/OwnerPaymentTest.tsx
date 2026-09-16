import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ga4CheckoutIdentity, type InvoiceCheckout, type QuickBooksAttempt } from '@/lib/quickbooksCheckout'
import ApplePayPayment from './ApplePayPayment'
import IntuitCardPayment from './IntuitCardPayment'
import { trackCartEvent } from '@/lib/analytics'

export default function OwnerPaymentTest() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [method, setMethod] = useState<'wallet' | 'direct'>(() => new URLSearchParams(window.location.search).get('owner_method') === 'direct' ? 'direct' : 'wallet')
  const [prepared, setPrepared] = useState<{ invoice: InvoiceCheckout; attempt: QuickBooksAttempt; clientId: string } | null>(null)
  const debug = new URLSearchParams(window.location.search).get('analytics_debug') === '1'
  async function prepare() {
    setBusy(true); setError('')
    try {
      const active = sessionStorage.getItem('tss_active_payment')
      if (active) { navigate(`/payment-status#${active}`); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sign in to the owner account again.')
      const ga4 = await ga4CheckoutIdentity()
      if (!ga4?.clientId) throw new Error('Tracking is not ready. Enable tracking verification and retry before paying.')
      const storageKey = method === 'direct' ? 'tss_owner_payment_test_direct' : 'tss_owner_payment_test'
      const saved = sessionStorage.getItem(storageKey)
      const attempt: QuickBooksAttempt = saved ? JSON.parse(saved) : { id: crypto.randomUUID(), token: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), request: { ownerTest: true } }
      sessionStorage.setItem(storageKey, JSON.stringify(attempt))
      const response = await fetch('/api/quickbooks/owner-payment-test', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ id: attempt.id, token: attempt.token, ga4, paymentMode: method }) })
      const invoice = await response.json()
      if (!response.ok) throw new Error(invoice.error === 'owner_test_total_mismatch' ? 'The tax quote did not produce exactly $1.00. No payment was started.' : `Could not prepare the owner test (${invoice.error || 'unavailable'}).`)
      if (invoice.orderId) { navigate(`/payment-status#${attempt.id}.${attempt.token}`); return }
      const config = await fetch('/api/quickbooks/checkout-config').then(r => r.json())
      if (method === 'wallet' && (!config.applePay?.enabled || !config.applePay.clientId)) throw new Error('Apple Pay is unavailable.')
      if (method === 'direct' && (!config.direct || config.environment !== 'production')) throw new Error('Live card payments are unavailable.')
      trackCartEvent('begin_checkout', invoice.items)
      trackCartEvent('add_shipping_info', invoice.items, { shipping_tier: 'pickup' })
      setPrepared({ invoice, attempt, clientId: config.applePay?.clientId || '' })
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not prepare test payment.') }
    finally { setBusy(false) }
  }
  return <details className="border-t border-border pt-4" open={new URLSearchParams(window.location.search).get('owner_test') === '1'}>
    <summary className="cursor-pointer font-bold">Owner-only $1 live payment test</summary>
    <div className="space-y-4 pt-4">
      <p className="text-sm text-muted-foreground">A real $1.00 payment including tax, marked as a test with no production. Uses the same payment, order, receipt and recovery pipeline. Receipt goes to your signed-in email. Analytics is marked as internal test traffic.</p>
      {!debug && <a className="text-primary underline" href={`/admin?tab=quickbooks&owner_test=1&analytics_debug=1&owner_method=${method}`}>Enable tracking verification</a>}
      {!prepared && <div className="flex gap-2" role="group" aria-label="Owner test payment method">
        <button type="button" disabled={busy} aria-pressed={method === 'wallet'} onClick={() => setMethod('wallet')} className="rounded-lg border border-border px-4 py-3 aria-pressed:border-primary">Apple Pay</button>
        <button type="button" disabled={busy} aria-pressed={method === 'direct'} onClick={() => setMethod('direct')} className="rounded-lg border border-border px-4 py-3 aria-pressed:border-primary">Credit / debit card</button>
      </div>}
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {!prepared ? <button disabled={busy || !debug} className="btn-primary disabled:opacity-50" onClick={() => void prepare()}>{busy ? 'Preparing $1 test…' : 'Prepare $1 test — no charge yet'}</button> : <>
        <p className="font-bold">$0.90 + $0.10 sales tax = $1.00</p>
        {method === 'direct' ? <IntuitCardPayment invoice={prepared.invoice} attempt={prepared.attempt} environment="production" disabled={busy} onBusy={setBusy} onError={setError}
          onResult={invoice => {
            if (invoice.chargeStatus === 'DECLINED') sessionStorage.removeItem('tss_active_payment')
            setPrepared({ ...prepared, invoice })
            if (invoice.orderId) navigate(`/payment-status#${prepared.attempt.id}.${prepared.attempt.token}`)
          }} /> : <ApplePayPayment invoice={prepared.invoice} attempt={prepared.attempt} clientId={prepared.clientId} disabled={busy} onBusy={setBusy} onError={setError}
          onLock={() => sessionStorage.setItem('tss_active_payment', `${prepared.attempt.id}.${prepared.attempt.token}`)}
          onResult={invoice => {
            setPrepared({ ...prepared, invoice })
            if (invoice.walletCanRetry && ['CREATING','CREATED','PAYER_ACTION_REQUIRED'].includes(invoice.chargeStatus || '')) sessionStorage.removeItem('tss_active_payment')
            if (invoice.orderId) navigate(`/payment-status#${prepared.attempt.id}.${prepared.attempt.token}`)
          }} />}
      </>}
    </div>
  </details>
}
