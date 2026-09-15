import { useCallback, useEffect, useState } from 'react'
import QuickBooksInvoiceTests from './QuickBooksInvoiceTests'
import { supabase } from '@/lib/supabase'

type Status = {
  environment: 'sandbox' | 'production'
  configured: boolean
  missing: string[]
  databaseReady: boolean
  status: 'connected' | 'disconnected' | 'reconnect_required'
  companyName: string | null
  redirectUri: string
}
const messages: Record<string, string> = {
  sandbox_only: 'This test is available only for the sandbox company.',
  invoice_busy: 'The same invoice test is already running. Try again shortly.',
  invoice_mapping_required: 'The sandbox needs an active service item before testing.',
  invoice_service_unavailable: 'Invoice setup or storage is unavailable. Check the migration and retry the same test.',
  test_catalog_changed: 'The sample product changed. Update the sandbox test before continuing.',
  payment_review_required: 'The invoice changed in QuickBooks. Review it before recording a test payment.',
  connected: 'QuickBooks connected. Check the connection to verify the company.',
  reconnect_required: 'QuickBooks needs to be reconnected.',
  connection_declined: 'Connection was cancelled in QuickBooks.',
  invalid_oauth_state: 'The connection link expired or was opened in another browser. Start again.',
  connection_changed: 'The connection changed while this request was open. Refresh and try again.',
  connection_busy: 'Another connection update is running. Try again shortly.',
  invalid_client: 'The QuickBooks app credentials were rejected. Check the server configuration.',
  rate_limited: 'QuickBooks is limiting requests. Try again later.',
  unauthorized: 'QuickBooks still rejected access after refreshing. Reconnect the company and check its permissions.',
  different_company_connected: 'A different company is already connected. Disconnect it before switching.',
  configuration_required: 'QuickBooks server settings are still required.',
  database_setup_required: 'QuickBooks database setup is still required.',
}
export default function QuickBooksConnection() {
  const [status, setStatus] = useState<Status | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const request = useCallback(async (action: string, method = 'GET') => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Your admin session expired. Sign in again.')
    const response = await fetch(`/api/quickbooks/${action}`, { method, headers: { Authorization: `Bearer ${session.access_token}` } })
    const data = await response.json()
    if (!response.ok) throw new Error(messages[data.error] || 'QuickBooks is unavailable. Try again or contact your site administrator.')
    return data
  }, [])
  const refresh = useCallback(async () => { setStatus(await request('status')) }, [request])
  useEffect(() => {
    const url = new URL(window.location.href)
    const result = url.searchParams.get('quickbooks')
    if (result) {
      setMessage(messages[result] || 'QuickBooks could not be connected. Start again or check the server setup.')
      url.searchParams.delete('quickbooks')
      window.history.replaceState(null, '', url.toString())
    }
    refresh().catch(error => setMessage(error.message))
  }, [refresh])
  const act = async (action: 'connect' | 'check' | 'disconnect') => {
    if (action === 'disconnect' && !window.confirm('Disconnect this QuickBooks company from the website? Existing QuickBooks records will remain.')) return
    setBusy(true)
    setMessage('')
    try {
      const data = await request(action, 'POST')
      if (action === 'connect') {
        const destination = new URL(data.authorizationUrl)
        if (destination.origin !== 'https://appcenter.intuit.com' || destination.pathname !== '/connect/oauth2') throw new Error('Invalid QuickBooks connection URL.')
        window.location.assign(destination.toString())
        return
      }
      setMessage(action === 'check' ? `Verified connection to ${data.companyName} (${data.environment}).` : 'QuickBooks disconnected.')
      await refresh()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Connection failed.') }
    finally { setBusy(false) }
  }
  const ready = status?.configured && status.databaseReady
  return <div className="max-w-3xl rounded-2xl border border-border bg-card p-6 space-y-5">
    <div>
      <h2 className="text-2xl font-bold">QuickBooks connection</h2>
      <p className="text-muted-foreground mt-2">Connect The Sticker Smith’s books to prepare itemized invoice checkout.</p>
    </div>
    {message && <p role="status" className="rounded-lg bg-primary/10 p-3">{message}</p>}
    {status ? <>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <dt className="text-muted-foreground">Environment</dt><dd className="capitalize">{status.environment}</dd>
        <dt className="text-muted-foreground">Connection</dt><dd>{status.status.replaceAll('_', ' ')}</dd>
        {status.companyName && <><dt className="text-muted-foreground">Company</dt><dd>{status.companyName}</dd></>}
      </dl>
      {!ready && <div className="rounded-lg border border-border p-4 text-sm space-y-2">
        <p className="font-semibold">Setup required</p>
        {!status.databaseReady && <p>Apply the QuickBooks connection database migration.</p>}
        {status.missing.length > 0 && <p className="break-words">Server settings: {status.missing.join(', ')}</p>}
        <p className="break-all">Intuit redirect URI: {status.redirectUri}</p>
      </div>}
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary disabled:opacity-50" disabled={busy || !ready} onClick={() => act('connect')}>{busy ? 'Working…' : status.status === 'connected' ? 'Reconnect QuickBooks' : 'Connect QuickBooks'}</button>
        {status.status === 'connected' && <>
          <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy} onClick={() => act('check')}>Check connection</button>
          <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy} onClick={() => act('disconnect')}>Disconnect</button>
        </>}
        <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy} onClick={() => refresh().catch(error => setMessage(error.message))}>Refresh status</button>
      </div>
      <p className="text-sm text-muted-foreground">{status.environment === 'sandbox' ? 'Sandbox uses test company data. ' : ''}This connection does not enable customer payments yet. Invoice creation and payment confirmation still need verification.</p>
      {status.environment === 'sandbox' && status.status === 'connected' && <QuickBooksInvoiceTests request={request} />}
    </> : <p className="text-muted-foreground">Loading connection settings…</p>}
  </div>
}
