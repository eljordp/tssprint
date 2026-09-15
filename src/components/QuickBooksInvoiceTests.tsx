import { useCallback, useEffect, useState } from 'react'

type InvoiceTest = {
  id: string; invoiceId: string | null; invoiceNumber: string | null; status: string; total: number; subtotal: number; discount: number
  invoiceLink: string | null; lastChecked: string | null; issue: string | null
  items: { name: string; option: string; size: string; quantity: number; price: number; addOns: { name: string; price: number }[] }[]
}
export default function QuickBooksInvoiceTests({ request }: { request: (action: string, method?: string) => Promise<unknown> }) {
  const [invoices, setInvoices] = useState<InvoiceTest[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    const result = await request('invoice-tests') as { invoices: InvoiceTest[] }
    setInvoices(result.invoices)
  }, [request])
  useEffect(() => { load().catch(error => setMessage(error.message)) }, [load])
  const run = async (recordPayment = false) => {
    setBusy(true); setMessage('')
    try {
      const result = await request(recordPayment ? 'test-payment' : 'test-invoice', 'POST') as InvoiceTest
      setInvoices([result])
      setMessage(result.status === 'payment_recorded' ? 'The sandbox invoice has a matching payment entry. This was a simulation; no card was charged.' : result.status === 'needs_review' ? 'Invoice totals or payment records need review. Customer payments remain disabled.' : 'Itemized sandbox invoice verified. It is still awaiting payment.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Invoice test failed. Retry to resume the same invoice.') }
    finally { setBusy(false) }
  }
  return <section className="space-y-4 border-t border-border pt-5">
    <h3 className="text-xl font-bold">Test an itemized invoice</h3>
    <p className="text-sm text-muted-foreground">Creates one reusable sandbox invoice for 250 business cards with soft-touch and an approved discount. Uses a reserved test email address. Repeating the test resumes the same invoice.</p>
    {message && <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm">{message}</p>}
    <div className="flex flex-wrap gap-3">
      <button className="btn-primary disabled:opacity-50" disabled={busy} onClick={() => run()}>{busy ? 'Checking QuickBooks…' : invoices.length ? 'Recheck the same test invoice' : 'Create sandbox test invoice'}</button>
      {invoices.some(invoice => invoice.status === 'awaiting_payment') && <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy} onClick={() => run(true)}>Simulate a sandbox payment</button>}
    </div>
    {invoices.map(invoice => <div key={invoice.id} className="rounded-xl border border-border p-4 space-y-3 text-sm">
      <div className="flex flex-wrap justify-between gap-2"><h4 className="font-bold">Invoice {invoice.invoiceNumber || 'pending'}</h4><span className="capitalize">{invoice.status.replaceAll('_', ' ')}</span></div>
      {invoice.items.map((item, index) => <div key={index}><p className="font-semibold">{item.name} · {item.option}</p><p className="text-muted-foreground">{item.size} · {item.quantity} print batch</p><p>${item.price.toFixed(2)}{item.addOns.map(addOn => ` + ${addOn.name} $${addOn.price.toFixed(2)}`)}</p></div>)}
      <dl className="grid grid-cols-2 gap-1 border-t border-border pt-3"><dt>Subtotal</dt><dd className="text-right">${invoice.subtotal.toFixed(2)}</dd><dt>Discount</dt><dd className="text-right">−${invoice.discount.toFixed(2)}</dd><dt className="font-bold">Total</dt><dd className="text-right font-bold text-primary">${invoice.total.toFixed(2)}</dd></dl>
      {invoice.lastChecked && <p className="text-muted-foreground">Last checked {new Date(invoice.lastChecked).toLocaleString()}</p>}
      <p>{invoice.invoiceLink ? 'QuickBooks returned a hosted invoice link.' : 'QuickBooks has not returned a hosted payment link for this sandbox invoice.'}</p>
      {invoice.issue && <p className="text-destructive">Review needed: {invoice.issue.replaceAll('_', ' ')}</p>}
    </div>)}
    <p className="text-xs text-muted-foreground">Sandbox payment entries test the accounting flow. They do not verify real cards, Apple Pay, deposits, email delivery or live order fulfillment.</p>
  </section>
}
