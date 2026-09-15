import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { readQuoteArtwork } from '@/lib/quoteArtwork'

export default function QuoteArtworkDownload({ message }: { message: string }) {
  const { artwork } = readQuoteArtwork(message)
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  if (!artwork) return null
  const prepare = async () => {
    setBusy(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sign in as an admin to download artwork.')
      const response = await fetch(`/api/uploads/artwork-download?path=${encodeURIComponent(artwork.path)}&name=${encodeURIComponent(artwork.fileName)}`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not prepare download.')
      setUrl(data.url)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Download failed.') }
    finally { setBusy(false) }
  }
  return <div className="mt-3 text-sm">
    {url ? <a className="text-primary underline" href={url} target="_blank" rel="noopener noreferrer">Download {artwork.fileName}</a> : <button type="button" disabled={busy} onClick={prepare} className="text-primary underline">{busy ? 'Preparing download…' : `Get artwork: ${artwork.fileName}`}</button>}
    {error && <p role="alert" className="text-red-400">{error}</p>}
  </div>
}
