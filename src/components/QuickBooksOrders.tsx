import { useState } from 'react'
import type { InvoiceCheckout } from '@/lib/quickbooksCheckout'
type WorkerHealth = { scheduled: boolean; lastRun: { status: string; createdAt: string; finishedAt: string | null; error: string | null } | null; pendingWebhooks: number; pendingFollowUps: number; reviewFollowUps: number }
type Delivery = { status: string; occurredAt: string; deliveryReported: boolean }
type Job = { kind: string; status: string; last_error: string | null; attempts: number; delivery: Delivery | null }
type Row = InvoiceCheckout & { createdAt: string; emailTracking: { configured: boolean; available: boolean }; jobs: Job[] }
const deliveryLabels: Record<string, string> = { sent: 'Accepted by email provider', delivered: 'Delivery to mail server reported', delivery_delayed: 'Delivery delayed', bounced: 'Bounced — recipient server rejected email', failed: 'Email failed', complained: 'Spam complaint reported', suppressed: 'Email suppressed by provider' }
function followUpLabel(job: Job) {
  if (job.kind.endsWith('_email')) return job.delivery ? (deliveryLabels[job.delivery.status] || job.delivery.status) : job.status === 'accepted' ? 'Accepted by email provider · delivery not confirmed' : job.status.replaceAll('_', ' ')
  if (job.kind === 'analytics' && job.status === 'accepted') return 'Accepted by GA4 endpoint · check Analytics for reporting'
  return job.status.replaceAll('_', ' ')
}
const jobLabels: Record<string, string> = { customer_email: 'Customer receipt', staff_email: 'Staff notification', analytics: 'Purchase tracking', cart_link: 'Order/cart linking' }
export default function QuickBooksOrders({ request }: { request: (action: string, method?: string) => Promise<{ checkouts?: Row[]; checked?: number; worker?: WorkerHealth }> }) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [worker, setWorker] = useState<WorkerHealth | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function load(reconcile = false) {
    setBusy(true); setMessage('')
    try {
      if (reconcile) { const result = await request('reconcile', 'POST'); setMessage(`Checked ${result.checked || 0} due payments. Notification retries run separately.`) }
      const result = await request('checkouts')
      setRows(result.checkouts || [])
      setWorker(result.worker || null)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load payment checkouts.') }
    finally { setBusy(false) }
  }
  return <section className="space-y-3 border-t border-border pt-4">
    <h3 className="font-bold">Website payments & follow-ups</h3>
    <p className="text-sm text-muted-foreground">Card and Apple Pay checkouts stay here with their payment and recovery status. PayPal accounting imports run through the existing connector. Email delivery means the receiving mail server accepted the message; it does not confirm inbox placement or reading. A staff notification with multiple recipients can have mixed outcomes.</p>
    <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => void load()} className="rounded-lg border border-border px-4 py-2">Load payments</button><button disabled={busy} onClick={() => void load(true)} className="rounded-lg border border-border px-4 py-2">Check due payments & retry follow-ups</button></div>
    {worker && <div className="rounded-lg border border-border p-3 text-sm space-y-1"><p className="font-semibold">Automatic payment recovery: {worker.scheduled ? 'scheduled every 2 minutes when work is pending' : 'not scheduled'}</p><p>Last run: {worker.lastRun ? `${worker.lastRun.status.replaceAll('_', ' ')} · ${new Date(worker.lastRun.finishedAt || worker.lastRun.createdAt).toLocaleString()}` : 'No run yet'}</p><p>{worker.pendingWebhooks} payment notifications pending · {worker.pendingFollowUps} follow-ups pending · {worker.reviewFollowUps} follow-ups need review</p>{worker.lastRun?.error && <p className="text-amber-500">{worker.lastRun.error.replaceAll('_', ' ')}</p>}</div>}
    {rows?.[0]?.emailTracking && <p className="text-sm text-muted-foreground">{!rows[0].emailTracking.available ? 'Email delivery tracking is temporarily unavailable; payment records are still shown.' : !rows[0].emailTracking.configured ? 'Email delivery tracking setup is pending. Accepted receipts are shown below, but delivery has not been confirmed.' : 'Signed email delivery callbacks are configured. Receipts remain unconfirmed until a delivery event arrives.'}</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {rows?.length === 0 && <p className="text-sm">No website payment checkouts yet.</p>}
    {rows?.map(row => <article key={row.id} className="rounded-xl border border-border p-4 space-y-2 text-sm">
      <h4 className="font-bold">{row.paymentMode === 'wallet' ? 'Apple Pay order' : `Invoice ${row.invoiceNumber || 'being prepared'}`} · {row.status.replaceAll('_', ' ')}</h4>
      <p>{row.email} · {row.total === null ? 'Total pending' : `$${Number(row.total).toFixed(2)} including $${Number(row.tax).toFixed(2)} tax`}</p>
      <p className="break-all">{row.orderId || row.id}</p>
      {row.issue && <p className="text-amber-500">Needs attention: {row.issue.replaceAll('_', ' ')}</p>}
      {row.jobs.map(job => <div key={job.kind} className={job.delivery && ['bounced', 'failed', 'complained', 'suppressed', 'delivery_delayed'].includes(job.delivery.status) ? 'text-amber-500' : ''}>
        <p><span className="font-medium">{jobLabels[job.kind] || job.kind.replaceAll('_', ' ')}:</span> {followUpLabel(job)}{job.last_error ? ` — ${job.last_error}` : ''}</p>
        {job.delivery && <p className="text-xs">Provider event: {new Date(job.delivery.occurredAt).toLocaleString()}{job.delivery.status !== 'delivered' && job.delivery.deliveryReported ? ' · Delivery was also reported; check recipient outcomes in Resend.' : ''}</p>}
      </div>)}
    </article>)}
  </section>
}
