import { trackEvent } from '@/lib/analytics'
import { useEffect, useRef, useState } from 'react'
import { Upload, FileCheck, LoaderCircle, ImagePlus } from 'lucide-react'
import type { CartItem } from '@/context/CartContext'

export type ArtworkSelection = {
  status: 'idle' | 'uploading' | 'uploaded' | 'error'
  artwork?: CartItem['artwork']
}

export default function ProductionArtwork({ size, onChange, purpose = 'order', initialArtwork }: {
  size: string
  initialArtwork?: CartItem['artwork']
  purpose?: 'order' | 'quote'
  onChange: (value: ArtworkSelection) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const generation = useRef(0)
  const [retained, setRetained] = useState(initialArtwork)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [status, setStatus] = useState<ArtworkSelection['status']>(initialArtwork ? 'uploaded' : 'idle')
  const [error, setError] = useState('')
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (!file || !/\.(png|jpe?g|gif|webp|svg)$/i.test(file.name)) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => () => { generation.current += 1 }, [])

  const upload = async (next: File) => {
    const request = ++generation.current
    setRetained(undefined)
    setFile(next)
    setPreview('')
    setImageFailed(false)
    setError('')
    trackEvent('artwork_upload_started', { purpose })
    setStatus('uploading')
    onChange({ status: 'uploading' })
    try {
      if (!next.size || next.size > 50 * 1024 * 1024) throw new Error('Choose a non-empty artwork file under 50 MB.')
      const response = await fetch('/api/uploads/create-artwork-upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: next.name, contentType: next.type, size: next.size }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not prepare your upload. Please retry.')
      if (request !== generation.current) return
      const { supabase } = await import('@/lib/supabase')
      const contentType = next.type || data.contentType || 'application/octet-stream'
      const result = await supabase.storage.from(data.bucket).uploadToSignedUrl(data.path, data.token, next, { contentType })
      if (result.error) throw result.error
      if (request !== generation.current) return
      trackEvent('artwork_upload_succeeded', { purpose })
      setStatus('uploaded')
      onChange({ status: 'uploaded', artwork: {
        bucket: data.bucket, path: data.path, fileName: next.name,
        contentType, size: next.size, uploadedAt: new Date().toISOString(),
      } })
    } catch (cause) {
      if (request !== generation.current) return
      trackEvent('artwork_upload_failed', { purpose })
      setStatus('error')
      setError(cause instanceof Error ? cause.message : 'Upload failed. Please retry.')
      onChange({ status: 'error' })
    }
  }

  const sendLater = () => {
    generation.current += 1
    setRetained(undefined)
    setFile(null)
    setPreview('')
    setError('')
    setStatus('idle')
    onChange({ status: 'idle' })
    if (input.current) input.current.value = ''
  }

  return (
    <section aria-label="Artwork upload and preview" className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 md:p-5 flex items-center justify-between gap-3">
        <h2 className="font-bold text-lg">Your artwork</h2>
        <span className="text-xs text-muted-foreground">Preview · proof before print</span>
      </div>
      <input ref={input} type="file" className="sr-only" aria-label="Choose production artwork" accept=".ai,.eps,.gif,.heic,.jpeg,.jpg,.pdf,.png,.psd,.svg,.tif,.tiff,.webp"
        onChange={event => { const next = event.target.files?.[0]; if (next) void upload(next) }} />
      <div className="mx-4 md:mx-5 rounded-xl border border-dashed border-primary/40 bg-background flex items-center justify-center min-h-48 h-[28vh] md:h-[340px] p-6"
        onDragOver={event => event.preventDefault()}
        onDrop={event => { event.preventDefault(); const next = event.dataTransfer.files[0]; if (next) void upload(next) }}>
        {preview && !imageFailed ? (
          <img src={preview} alt={`Your uploaded artwork: ${file?.name}`} onError={() => setImageFailed(true)} className="max-h-full max-w-full object-contain" />
        ) : file || retained ? (
          <div className="text-center min-w-0"><FileCheck className="mx-auto mb-3 text-primary" size={36} /><p className="font-semibold break-words">{file?.name || retained?.fileName}</p><p className="text-xs text-muted-foreground mt-2">{retained ? 'Saved production file retained. Choose a file again only if you want to replace it. Your proof confirms placement.' : 'This file has no browser preview. We’ll prepare a digital proof.'}</p></div>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-primary">
            <ImagePlus size={40} className="text-primary" /><span className="font-bold text-lg">Upload & preview</span><span className="text-sm text-muted-foreground">Drop your design here or choose a file</span>
          </button>
        )}
      </div>
      <div className="p-4 md:p-5 space-y-3">
        <p className="text-sm font-medium">{size}</p>
        <button type="button" onClick={() => input.current?.click()} className="btn-primary w-full justify-center"><Upload size={16} />{file || retained ? 'Change artwork' : 'Choose artwork'}</button>
        <div aria-live="polite" className="text-xs">
          {status === 'uploading' && <p className="flex items-center gap-2"><LoaderCircle size={14} className="animate-spin" />Uploading production file…</p>}
          {status === 'uploaded' && <p className="text-green-400 break-words">✓ {file?.name || retained?.fileName} attached — ready to attach to your {purpose === 'quote' ? 'request' : 'cart'}.</p>}
          {status === 'error' && <p role="alert" className="text-red-400">{error} <button type="button" className="underline" onClick={() => file && void upload(file)}>Retry upload</button></p>}
          {status === 'idle' && <p className="text-muted-foreground">No file yet. You can send artwork {purpose === 'quote' ? 'with your project follow-up' : 'after ordering'}.</p>}
        </div>
        <details className="text-xs text-muted-foreground"><summary className="cursor-pointer">File types & proof details · up to 50 MB</summary><p className="mt-2">PNG, JPG, SVG and WebP preview. PDF, AI and other production files accepted. For front and back, upload one PDF containing both pages.</p><p className="mt-2">Preview shows your file, without cropping. Final size, bleed, placement and finishes are checked in your proof.</p></details>
        {(file || retained) && <button type="button" onClick={sendLater} className="text-sm text-muted-foreground underline underline-offset-4">Remove file / send artwork later</button>}
      </div>
    </section>
  )
}
