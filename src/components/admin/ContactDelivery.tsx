import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Job = { id: string; lead_id: string; kind: string; status: string; attempts: number; provider_id: string | null; last_error: string | null; created_at: string }
export default function ContactDelivery() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [openCount, setOpenCount] = useState(0)
  const load = async () => {
    setLoading(true)
    const fields = 'id,lead_id,kind,status,attempts,provider_id,last_error,created_at'
    const [open, recent] = await Promise.all([
      supabase.from('contact_delivery_jobs').select(fields, { count: 'exact' }).in('status', ['pending','retry','processing','needs_review']).order('created_at').limit(100),
      supabase.from('contact_delivery_jobs').select(fields).in('status', ['accepted','completed','skipped']).order('created_at', { ascending: false }).limit(50),
    ])
    if (open.error || recent.error) setError('Could not load quote delivery statuses. Retry.')
    else { setJobs([...(open.data || []), ...(recent.data || [])]); setOpenCount(open.count || 0); setError('') }
    setLoading(false)
  }
  useEffect(() => { void load() }, [])
  const retry = async () => {
    setBusy(true); setError('')
    try {
      const { data } = await supabase.auth.getSession()
      const response = await fetch('/api/admin/contact-delivery', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` }, body: JSON.stringify({ admin: true }) })
      if (!response.ok) throw new Error('Retry failed')
      await load()
    } catch { setError('Could not process pending work. Saved quotes remain available.') }
    finally { setBusy(false) }
  }
  return <section className="rounded-xl border border-border p-4 space-y-3">
    <h3 className="font-bold">Quote delivery & retries</h3>
    <p className="text-sm text-muted-foreground">Each new quote saves its notification and subscription jobs together. Sends start immediately; a daily backup checks pending work. Accepted means Resend accepted the email, not inbox delivery. Older quotes have no job history.</p>
    <div className="flex gap-3"><button className="btn-primary text-sm" disabled={busy} onClick={() => void retry()}>{busy ? 'Processing…' : 'Process due jobs'}</button><button className="text-sm underline" disabled={busy} onClick={() => void load()}>Refresh statuses</button></div>
    {error && <p role="alert">{error}</p>}
    <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr><th className="p-2">Quote / created</th><th className="p-2">Task</th><th className="p-2">Status</th><th className="p-2">Attempts</th><th className="p-2">Details</th></tr></thead><tbody>{jobs.map(job => <tr key={job.id} className="border-t border-border"><td className="p-2"><a className="underline" href="/admin?tab=inquiries">{job.lead_id.slice(0, 8)}</a><br />{new Date(job.created_at).toLocaleString()}</td><td className="p-2">{job.kind.replaceAll('_', ' ')}</td><td className="p-2">{job.status.replaceAll('_', ' ')}</td><td className="p-2">{job.attempts}</td><td className="p-2">{job.last_error}{job.provider_id && <a className="underline" href={`https://resend.com/emails/${encodeURIComponent(job.provider_id)}`} target="_blank" rel="noopener noreferrer">Provider receipt ↗</a>}</td></tr>)}</tbody></table></div>
    {loading ? <p className="text-sm">Loading delivery statuses…</p> : !error && !jobs.length && <p className="text-sm">No queued quote deliveries yet.</p>}
    <p className="text-xs text-muted-foreground">{openCount} unfinished jobs. Shows the oldest 100 unfinished jobs first, then 50 recent outcomes. The button processes four due jobs at a time. “Needs review” jobs stop automatic sending; check Resend before resending an uncertain email.</p>
  </section>
}
