import { createElement, useEffect, useRef, useState } from 'react'
import { quickBooksRequest, type InvoiceCheckout, type QuickBooksAttempt } from '@/lib/quickbooksCheckout'
import { trackCartEvent, trackEvent } from '@/lib/analytics'

type WalletConfig = { isEligible: boolean; countryCode: string; merchantCapabilities: string[]; supportedNetworks: string[] }
type AppleClient = { config(): Promise<WalletConfig>; validateMerchant(data: { validationUrl: string; displayName: string }): Promise<{ merchantSession: unknown }>; confirmOrder(data: { orderId: string; token: unknown; billingContact?: unknown }): Promise<unknown> }
type WalletSession = { onvalidatemerchant: (event: { validationURL: string }) => void; onpaymentauthorized: (event: { payment: { token: unknown; billingContact?: unknown } }) => void; oncancel: () => void; begin(): void; abort(): void; completeMerchantValidation(value: unknown): void; completePayment(value: number): void }
type WalletWindow = Window & { tssPaypalApple?: { Applepay(): AppleClient }; ApplePaySession?: { new(version: number, request: unknown): WalletSession; canMakePayments(): boolean; STATUS_SUCCESS: number; STATUS_FAILURE: number } }
const walletWindow = window as WalletWindow
let loading: Promise<AppleClient> | undefined
function script(src: string, namespace?: string) {
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement('script'); el.src = src; el.async = true
    if (namespace) el.dataset.namespace = namespace
    el.onload = () => resolve(); el.onerror = () => { el.remove(); reject(new Error('Apple Pay could not load. You can still pay by card.')) }
    document.head.appendChild(el)
  })
}
function loadApplePay(clientId: string): Promise<AppleClient> {
  if (walletWindow.tssPaypalApple && walletWindow.ApplePaySession) return Promise.resolve(walletWindow.tssPaypalApple.Applepay())
  if (!loading) loading = (async () => {
    await Promise.all([
      script('https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js'),
      script(`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&components=applepay&currency=USD&intent=capture`, 'tssPaypalApple'),
    ])
    if (!walletWindow.tssPaypalApple || !walletWindow.ApplePaySession) throw new Error('Apple Pay is unavailable in this browser. You can still pay by card.')
    return walletWindow.tssPaypalApple.Applepay()
  })().catch(error => { loading = undefined; throw error })
  return loading
}
export default function ApplePayPayment({ clientId, invoice, attempt, disabled, onBusy, onError, onResult, onLock }: {
  clientId: string; invoice: InvoiceCheckout; attempt: QuickBooksAttempt; disabled: boolean
  onLock: () => void; onBusy: (busy: boolean) => void; onError: (message: string) => void; onResult: (invoice: InvoiceCheckout) => void
}) {
  const [ready, setReady] = useState<{ client: AppleClient; config: WalletConfig } | null>(null)
  const [unavailable, setUnavailable] = useState('')
  const [checking, setChecking] = useState(false)
  const started = useRef(false)
  useEffect(() => {
    let cancelled = false
    loadApplePay(clientId).then(async client => {
      const config = await client.config()
      if (!config.isEligible || !walletWindow.ApplePaySession?.canMakePayments()) throw new Error('Apple Pay is unavailable here. Try Safari on your iPhone or Mac, or pay by card.')
      if (!cancelled) setReady({ client, config })
    }).catch(error => { if (!cancelled) setUnavailable(error.message) })
    return () => { cancelled = true }
  }, [clientId])
  const status = async () => {
    setChecking(true); onBusy(true)
    try {
      let result = await quickBooksRequest('checkout-status', { id: attempt.id, token: attempt.token })
      if (result.chargeStatus === 'APPROVED' && result.walletOrderId && result.walletCanRetry) result = await quickBooksRequest('wallet-capture', { id: attempt.id, token: attempt.token, orderId: result.walletOrderId, expectedTotal: invoice.total })
      if (result.walletCanRetry && ['CREATING','CREATED','PAYER_ACTION_REQUIRED',null].includes(result.chargeStatus || null)) started.current = false
      onResult(result)
    }
    catch (error) { onError(error instanceof Error ? error.message : 'We are still checking your payment. Do not pay again.') }
    finally { setChecking(false); onBusy(false) }
  }
  const start = () => {
    const Session = walletWindow.ApplePaySession
    if (!ready || !Session || disabled || started.current || invoice.total === null) return
    // Construction and begin stay inside the click gesture for Safari/Chrome.
    let session: WalletSession
    try { session = new Session(4, {
      countryCode: ready.config.countryCode, currencyCode: 'USD', merchantCapabilities: ready.config.merchantCapabilities,
      supportedNetworks: ready.config.supportedNetworks,
      total: { label: 'The Sticker Smith', amount: invoice.total.toFixed(2), type: 'final' },
      lineItems: [{ label: 'Print order', amount: invoice.subtotal.toFixed(2) }, { label: 'Discount', amount: (-invoice.discount).toFixed(2) }, { label: 'Sales tax', amount: (invoice.tax || 0).toFixed(2) }],
      requiredBillingContactFields: ['postalAddress'],
    }) } catch { onError('Apple Pay could not open in this browser. Please try Safari or pay by card.'); return }
    started.current = true; onBusy(true); onError('')
    let authorized = false
    trackEvent('payment_method_selected', { provider: 'paypal', payment_method: 'apple_pay' })
    session.onvalidatemerchant = async event => {
      try { const { merchantSession } = await ready.client.validateMerchant({ validationUrl: event.validationURL, displayName: 'The Sticker Smith' }); session.completeMerchantValidation(merchantSession) }
      catch { session.abort(); started.current = false; onBusy(false); onError('Apple Pay could not connect. Please try again or pay by card.') }
    }
    session.oncancel = () => { if (!authorized) { started.current = false; onBusy(false); trackEvent('payment_cancelled', { provider: 'paypal', payment_method: 'apple_pay' }) } }
    session.onpaymentauthorized = async event => {
      authorized = true
      // Once approval starts, retain a recovery link even if the browser loses
      // its response. Never encourage another payment before checking this one.
      setChecking(true)
      try {
        onLock()
        trackCartEvent('add_payment_info', invoice.items, { payment_type: 'apple_pay', payment_provider: 'paypal' })
        const created = await quickBooksRequest('wallet-create', { id: attempt.id, token: attempt.token, expectedTotal: invoice.total })
        if (created.orderId) { session.completePayment(Session.STATUS_SUCCESS); onResult(created); return }
        if (!created.walletOrderId) throw new Error('Payment reference unavailable.')
        await ready.client.confirmOrder({ orderId: created.walletOrderId, token: event.payment.token, billingContact: event.payment.billingContact })
        const captured = await quickBooksRequest('wallet-capture', { id: attempt.id, token: attempt.token, orderId: created.walletOrderId, expectedTotal: invoice.total })
        session.completePayment(captured.orderId ? Session.STATUS_SUCCESS : Session.STATUS_FAILURE)
        onResult(captured)
        if (!captured.orderId) onError('We are checking your payment. Do not pay again; use Check payment status below.')
      } catch {
        session.completePayment(Session.STATUS_FAILURE)
        onError('We could not finish confirming payment. Check this payment before trying again.')
        trackEvent('payment_verification_pending', { provider: 'paypal', payment_method: 'apple_pay' })
      } finally { setChecking(false); onBusy(false) }
    }
    try { session.begin() } catch { started.current = false; onBusy(false); onError('Apple Pay could not open. Please try again or pay by card.') }
  }
  return <div className="space-y-3">
    {unavailable ? <p role="status" className="text-sm text-muted-foreground">{unavailable}</p> : <div style={{ opacity: disabled || !ready || started.current ? 0.5 : 1, pointerEvents: disabled || !ready || started.current ? 'none' : 'auto' }}>{ready ? createElement('apple-pay-button', { buttonstyle: 'black', type: 'pay', locale: 'en-US', 'aria-label': 'Pay with Apple Pay', role: 'button', 'aria-disabled': disabled || started.current, tabIndex: disabled || started.current ? -1 : 0, ref: (element: HTMLElement | null) => { if (!element) return; element.addEventListener('click', start); return () => element.removeEventListener('click', start) }, onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); start() } }, style: { display: 'block', width: '100%', height: '48px', '--apple-pay-button-width': '100%', '--apple-pay-button-height': '48px', '--apple-pay-button-border-radius': '8px' } }) : <p role="status">Loading Apple Pay…</p>}</div>}
    {started.current && <div className="space-y-2"><button type="button" className="btn-primary w-full" disabled={checking} onClick={() => void status()}>{checking ? 'Checking payment…' : 'Check payment status'}</button><a className="text-sm text-primary underline" href={`/payment-status#${attempt.id}.${attempt.token}`}>Keep this payment status link</a></div>}
    <p className="text-xs text-muted-foreground">Apple Pay is processed securely by PayPal. No PayPal account is needed. Your delivery address stays as entered at checkout.</p>
  </div>
}
