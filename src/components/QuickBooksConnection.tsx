import { useCallback, useEffect, useState } from 'react'
import QuickBooksOrders from './QuickBooksOrders'
import OwnerPaymentTest from './OwnerPaymentTest'
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
  paymentsScopeGranted?: boolean
}
type Readiness = { currency: string | null; salesTaxEnabled: boolean | null; automatedSalesTax: boolean | null; onlinePayments: boolean | null; autoEmail: boolean | null; serverPurchaseTracking: boolean; items: { id: string; name: string; type: string; taxable: boolean | null; incomeAccount: string | null }[] }
const messages: Record<string, string> = {
  website_product_conflict: 'A website product already exists with different tax or income settings. Review it in QuickBooks before retrying.',
  product_income_account_required: 'The existing Custom Card Stock product must have a product-income account before setup.',
  tax_configuration_required: 'Enable automated sales tax in QuickBooks before setting up these products.',
  invalid_product_response: 'QuickBooks did not confirm the product settings. Recheck the catalog and retry setup.',
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
  const [readiness, setReadiness] = useState<Readiness | null>(null)
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
  const act = async (action: 'connect' | 'connect-payments' | 'check' | 'disconnect') => {
    if (action === 'disconnect' && !window.confirm('Disconnect this QuickBooks company from the website? Existing QuickBooks records will remain.')) return
    setBusy(true)
    setMessage('')
    try {
      const data = await request(action, 'POST')
      if (action === 'connect' || action === 'connect-payments') {
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
          <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy} onClick={async () => {
            setBusy(true); setMessage('')
            try { setReadiness(await request('readiness')) } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not check payment settings.') } finally { setBusy(false) }
          }}>Check payment settings</button>
          <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy} onClick={() => act('disconnect')}>Disconnect</button>
        </>}
        <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy} onClick={() => refresh().catch(error => setMessage(error.message))}>Refresh status</button>
      </div>
      <p className="text-sm text-muted-foreground">{status.environment === 'sandbox' ? 'Sandbox uses test company data. ' : ''}Connection status confirms access to your books. Website invoices and payment follow-ups are shown below; an unpaid invoice is not a completed purchase.</p>
      {status.status === 'connected' && <section className="rounded-lg border border-border p-4 space-y-3">
        <h3 className="font-bold">Direct card payments</h3>
        <p className="text-sm">{status.paymentsScopeGranted ? 'Payments permission granted. Direct checkout still needs a verified charge before it is ready for customers.' : 'The current connection can access the books. Direct card checkout needs the separate Payments permission.'}</p>
        <button className="rounded-lg border border-border px-4 py-2 disabled:opacity-50" disabled={busy || !ready} onClick={() => act('connect-payments')}>Connect Payments API</button>
        <p className="text-xs text-muted-foreground">Connect the same The Sticker Smith company. This authorizes access; it does not charge a card or enable Apple Pay.</p>
      </section>}
      {readiness && <section className="space-y-3 border-t border-border pt-4">
        <h3 className="font-bold">Live invoice settings</h3>
        <p className="text-sm text-muted-foreground">Read from QuickBooks. No invoice was created or sent.</p>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt>Home currency</dt><dd>{readiness.currency || 'Not reported'}</dd>
          <dt>Sales tax enabled</dt><dd>{readiness.salesTaxEnabled === null ? 'Not reported' : readiness.salesTaxEnabled ? 'Yes' : 'No'}</dd>
          <dt>Automated sales tax</dt><dd>{readiness.automatedSalesTax === null ? 'Not reported' : readiness.automatedSalesTax ? 'Yes' : 'No'}</dd>
          <dt>Online card preference</dt><dd>{readiness.onlinePayments === null ? 'Not reported — verify on an invoice' : readiness.onlinePayments ? 'Enabled' : 'Disabled'}</dd>
          <dt>Automatic invoice email</dt><dd>{readiness.autoEmail === null ? 'Not reported' : readiness.autoEmail ? 'Enabled' : 'Disabled'}</dd>
          <dt>GA4 purchase tracking</dt><dd>{readiness.serverPurchaseTracking ? 'Server configured · verify a paid transaction in GA4' : 'Server configuration missing'}</dd>
        </dl>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h4 className="font-semibold">Website product tax setup</h4>
          <p className="text-sm text-muted-foreground">Creates any missing Website Mylar Packaging, Website Canopies and Website Table Covers items as taxable goods, using the same product-income account as Custom Card Stock. QuickBooks calculates the order’s tax from its sales-tax settings and delivery address.</p>
          <button className="btn-primary disabled:opacity-50" disabled={busy} onClick={async () => {
            setBusy(true); setMessage('')
            try {
              const result = await request('setup-products', 'POST')
              setMessage(`Verified ${result.products.length} taxable website products. Income account: ${result.incomeAccount}.`)
              setReadiness(await request('readiness'))
            } catch (error) { setMessage(error instanceof Error ? error.message : 'Product setup needs a retry.') }
            finally { setBusy(false) }
          }}>Set up taxable website products</button>
        </div>
        <h4 className="font-semibold">Available products and services</h4>
        <ul className="space-y-2 text-sm">{readiness.items.map(item => <li key={item.id} className="rounded-lg border border-border p-3"><strong>{item.name}</strong> · {item.type}<br />Income account: {item.incomeAccount || 'Not reported'} · Taxable: {item.taxable === null ? 'Not reported' : item.taxable ? 'Yes' : 'No'}</li>)}</ul>
      </section>}
      {status.status === 'connected' && <QuickBooksOrders request={request} />}
      {status.status === 'connected' && status.environment === 'production' && <OwnerPaymentTest />}
      {status.environment === 'sandbox' && status.status === 'connected' && <QuickBooksInvoiceTests request={request} />}
    </> : <p className="text-muted-foreground">Loading connection settings…</p>}
  </div>
}
