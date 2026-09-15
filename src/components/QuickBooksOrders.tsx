import { useState } from 'react'
import type { InvoiceCheckout } from '@/lib/quickbooksCheckout'
type WorkerHealth = { scheduled: boolean; lastRun: { status: string; createdAt: string; finishedAt: string | null; error: string | null } | null; pendingWebhooks: number; pendingFollowUps: number; reviewFollowUps: number }
type Row = InvoiceCheckout & { createdAt: string; jobs: { kind: string; status: string; last_error: string | null }[] }
export default function QuickBooksOrders({ request }: { request: (action: string, method?: string) => Promise<{ checkouts?: Row[]; checked?: number; worker?: WorkerHealth }> }) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [worker, setWorker] = useState<WorkerHealth | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function load(reconcile = false) {
    setBusy(true); setMessage('')
    try {
      if (reconcile) { const result = await request('reconcile', 'POST'); setMessage(`Checked ${result.checked || 0} due invoices. Notification retries run separately.`) }
      const result = await request('checkouts')
      setRows(result.checkouts || [])
      setWorker(result.worker || null)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load invoice checkouts.') }
    finally { setBusy(false) }
  }
  return <section className="space-y-3 border-t border-border pt-4">
    <h3 className="font-bold">Website invoices & follow-ups</h3>
    <p className="text-sm text-muted-foreground">Unpaid invoices stay here until a matching payment is recorded. Email “accepted” means the email provider accepted it, not that it reached the inbox.</p>
    <div className="flex flex-wrap gap-3"><button disabled={busy} onClick={() => void load()} className="rounded-lg border border-border px-4 py-2">Load invoices</button><button disabled={busy} onClick={() => void load(true)} className="rounded-lg border border-border px-4 py-2">Check due payments & retry follow-ups</button></div>
    {worker && <div className="rounded-lg border border-border p-3 text-sm space-y-1"><p className="font-semibold">Automatic payment recovery: {worker.scheduled ? 'scheduled every 2 minutes when work is pending' : 'not scheduled'}</p><p>Last run: {worker.lastRun ? `${worker.lastRun.status.replaceAll('_', ' ')} · ${new Date(worker.lastRun.finishedAt || worker.lastRun.createdAt).toLocaleString()}` : 'No run yet'}</p><p>{worker.pendingWebhooks} payment notifications pending · {worker.pendingFollowUps} follow-ups pending · {worker.reviewFollowUps} follow-ups need review</p>{worker.lastRun?.error && <p className="text-amber-500">{worker.lastRun.error.replaceAll('_', ' ')}</p>}</div>}
    {message && <p role="status" className="text-sm">{message}</p>}
    {rows?.length === 0 && <p className="text-sm">No website QuickBooks invoices yet.</p>}
    {rows?.map(row => <article key={row.id} className="rounded-xl border border-border p-4 space-y-2 text-sm">
      <h4 className="font-bold">Invoice {row.invoiceNumber || 'being prepared'} · {row.status.replaceAll('_', ' ')}</h4>
      <p>{row.email} · {row.total === null ? 'Total pending' : `$${Number(row.total).toFixed(2)} including $${Number(row.tax).toFixed(2)} tax`}</p>
      <p className="break-all">{row.orderId || row.id}</p>
      {row.issue && <p className="text-amber-500">Needs attention: {row.issue.replaceAll('_', ' ')}</p>}
      {row.jobs.map(job => <p key={job.kind}>{job.kind.replaceAll('_', ' ')}: {job.status}{job.last_error ? ` — ${job.last_error}` : ''}</p>)}
    </article>)}
  </section>
}
