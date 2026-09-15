import { useRef, useState } from 'react'
import { tokenizeIntuitCard } from '@/lib/intuitCard'
import { quickBooksRequest, type InvoiceCheckout, type QuickBooksAttempt } from '@/lib/quickbooksCheckout'

export default function IntuitCardPayment({ invoice, attempt, environment, disabled, onResult, onBusy, onError }: {
  invoice: InvoiceCheckout; attempt: QuickBooksAttempt; environment: 'sandbox' | 'production'; disabled: boolean
  onResult: (result: InvoiceCheckout) => void; onBusy: (value: boolean) => void; onError: (message: string) => void
}) {
  const fields = useRef<HTMLDivElement>(null)
  const inFlight = useRef(false)
  const [submitted, setSubmitted] = useState(() => sessionStorage.getItem(`tss_qb_charge_${attempt.id}`) === 'submitted')
  const chargeStarted = submitted || !!invoice.chargeStatus
  const finish = async () => {
    if (inFlight.current || disabled || !fields.current || invoice.total === null) return
    const inputs = Array.from(fields.current.querySelectorAll('input'))
    if (!chargeStarted && inputs.some(input => !input.reportValidity())) return
    inFlight.current = true; onBusy(true); onError('')
    try {
      if (chargeStarted) {
        onResult(await quickBooksRequest('checkout-status', { id: attempt.id, token: attempt.token }))
        return
      }
      const read = (name: string) => inputs.find(input => input.name === name)?.value.trim() || ''
      const paymentToken = await tokenizeIntuitCard({ name: read('cc-name'), number: read('cc-number').replace(/\s/g,''),
        expMonth: read('cc-exp-month'), expYear: read('cc-exp-year'), cvc: read('cc-csc'), address: { postalCode: read('cc-postal'), country: 'US' } }, environment)
      inputs.forEach(input => { input.value = '' })
      // Persist the fact of submission BEFORE contacting the charge endpoint.
      // A page reload must not expose another Pay action for an unknown result.
      sessionStorage.setItem(`tss_qb_charge_${attempt.id}`, 'submitted')
      setSubmitted(true)
      onResult(await quickBooksRequest('charge', { id: attempt.id, token: attempt.token, expectedTotal: invoice.total, paymentToken, paymentAttemptId: crypto.randomUUID() }))
    } catch (error) { onError(error instanceof Error ? error.message : 'Payment is still being checked. Do not submit another payment.') }
    finally { inFlight.current = false; onBusy(false) }
  }
  const uncertain = chargeStarted
  const fieldClass = 'w-full rounded-lg border border-border bg-background px-3 py-3 text-base'
  return <div ref={fields} className="space-y-4" data-private>
    {!uncertain && <>
      <label className="block text-sm">Name on card<input className={fieldClass} name="cc-name" autoComplete="cc-name" required maxLength={100} /></label>
      <label className="block text-sm">Card number<input className={fieldClass} name="cc-number" autoComplete="cc-number" inputMode="numeric" pattern="[0-9 ]{12,23}" required /></label>
      <div className="grid grid-cols-3 gap-3">
        <label className="text-sm">Month<input className={fieldClass} name="cc-exp-month" autoComplete="cc-exp-month" inputMode="numeric" placeholder="MM" pattern="0?[1-9]|1[0-2]" required /></label>
        <label className="text-sm">Year<input className={fieldClass} name="cc-exp-year" autoComplete="cc-exp-year" inputMode="numeric" placeholder="YYYY" pattern="20[0-9]{2}" required /></label>
        <label className="text-sm">Security code<input className={fieldClass} type="password" name="cc-csc" autoComplete="cc-csc" inputMode="numeric" pattern="[0-9]{3,4}" required maxLength={4} /></label>
      </div>
      <label className="block text-sm">Billing ZIP code<input className={fieldClass} name="cc-postal" autoComplete="billing postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" required /></label>
    </>}
    {uncertain && <p role="status" className="text-sm">{['CAPTURED','SETTLED'].includes(invoice.chargeStatus || '') ? 'Payment received. We’re finishing your order.' : invoice.chargeStatus === 'DECLINED' ? 'Your card was declined. Try another card or contact the shop.' : invoice.chargeStatus === 'CANCELLED' ? 'The payment was cancelled. Contact the shop to continue this order.' : 'Checking your payment. Keep this order open; do not pay again.'}</p>}
    {invoice.chargeStatus === 'DECLINED' && <button type="button" className="text-primary underline" disabled={disabled} onClick={() => {
      sessionStorage.removeItem(`tss_qb_charge_${attempt.id}`); setSubmitted(false); onResult({ ...invoice, chargeStatus: null }); onError('')
    }}>Try another card</button>}
    <button type="button" className="btn-primary w-full disabled:opacity-50" disabled={disabled} onClick={() => void finish()}>{uncertain ? 'Check payment status' : `Pay $${invoice.total?.toFixed(2)}`}</button>
  </div>
}
