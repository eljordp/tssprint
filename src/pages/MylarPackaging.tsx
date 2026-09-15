import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resolveProductEdit, type ProductConfiguration } from '@/lib/productCartEditing'
import oliveLandArtwork from '@/assets/optimized/projects/drive-olive-land-pita-artwork.webp'
import MobileOrderAction from '@/components/MobileOrderAction'
import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ShoppingCart, Check } from 'lucide-react'
import { useCart, type CartItem } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { getPricing, loadPricing, type ProductCategory, type AddOn, type PricingConfig } from '@/lib/pricing'
import EstimateForm from '@/components/EstimateForm'
import PortfolioStrip from '@/components/PortfolioStrip'
import ServicePageIntro from '@/components/ServicePageIntro'
import mylarCandyshockGreen from '@/assets/projects/mylar-candyshock-green.jpg'
import mylarCandyshockBlue from '@/assets/projects/mylar-candyshock-blue.jpg'
import mylarAtomicshock from '@/assets/projects/mylar-atomicshock.jpg'
import mylarTripleA from '@/assets/projects/mylar-tripleA-design.jpg'
import mylarElevatedSnack from '@/assets/projects/ig-elevated925-mystery-snack-pack.jpg'

interface ArtworkAttachment {
  bucket: string
  path: string
  fileName: string
  contentType: string
  size: number
  uploadedAt: string
}

function PouchMockup({ previewUrl, pouchColor, finish, scale }: { previewUrl: string | null; pouchColor: 'white' | 'black'; finish: string; scale: number }) {
  const w = 140 * scale
  const h = 200 * scale
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: `${w}px`, height: `${h}px`, background: pouchColor === 'white' ? 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 30%, #f5f5f5 50%, #e0e0e0 70%, #f0f0f0 100%)' : 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 30%, #252525 50%, #1e1e1e 70%, #222 100%)' }}>
        <div className="absolute inset-0 opacity-40" style={{ background: finish === 'foil' ? 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.6) 25%, transparent 50%, rgba(255,255,255,0.4) 75%, transparent 100%)' : finish === 'gloss' ? 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 40%, transparent 60%)' : 'none' }} />
        <div className={`absolute top-3 left-3 right-3 h-1.5 rounded-full ${pouchColor === 'white' ? 'bg-zinc-300' : 'bg-zinc-600'}`} />
        <div className={`absolute top-5 left-3 right-3 h-0.5 rounded-full ${pouchColor === 'white' ? 'bg-zinc-200' : 'bg-zinc-700'}`} />
        <div className="absolute inset-0 flex items-center justify-center p-6 pt-10">
          {previewUrl ? <img src={previewUrl} alt="Your design" className="max-w-full max-h-full object-contain drop-shadow-lg" /> : <div className={`text-center ${pouchColor === 'white' ? 'text-zinc-400' : 'text-zinc-500'}`}><span className="text-xs">Your Design</span></div>}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-2 ${pouchColor === 'white' ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-current" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-current" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-current" />
        </div>
      </div>
    </div>
  )
}

function FoilMockup({ previewUrl, scale }: { previewUrl: string | null; scale: number }) {
  const w = 140 * scale
  const h = 200 * scale
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{ width: `${w}px`, height: `${h}px`, background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 15%, #ffd3b6 30%, #ffaaa5 45%, #ff8b94 60%, #a8e6cf 75%, #88d8b0 90%, #ffd3b6 100%)' }}>
        <div className="absolute inset-0 opacity-60" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.8) 25%, transparent 50%, rgba(255,255,255,0.6) 75%, transparent 100%)' }} />
        <div className="absolute top-3 left-3 right-3 h-1.5 rounded-full bg-white/40" />
        <div className="absolute top-5 left-3 right-3 h-0.5 rounded-full bg-white/30" />
        <div className="absolute inset-0 flex items-center justify-center p-6 pt-10">
          {previewUrl ? <img src={previewUrl} alt="Your design" className="max-w-full max-h-full object-contain drop-shadow-lg" /> : <div className="text-center text-white/70"><span className="text-xs">Your Design</span></div>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/20" />
      </div>
    </div>
  )
}

function JarMockup({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative">
        <div className="relative w-24 h-28 rounded-lg overflow-hidden shadow-xl" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0.1) 100%)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 rounded-t-lg" style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)', border: '1px solid #444' }} />
          <div className="absolute top-6 left-0 right-0 bottom-3 flex items-center justify-center p-2">
            {previewUrl ? <img src={previewUrl} alt="Your label" className="max-w-full max-h-full object-contain" /> : <div className="text-center text-zinc-400"><span className="text-[10px]">Label Here</span></div>}
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)' }} />
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-zinc-700/50 flex items-center justify-center">
          <span className="text-[8px] text-zinc-400">Top Label</span>
        </div>
      </div>
    </div>
  )
}

// Scale factors for mockup sizing
const mockupScales: Record<string, number> = {
  'Eighths (3"×5")': 0.6,
  'Quarters (4"×6")': 0.75,
  'Ounce Bags (5"×8")': 0.85,
  'Half Pound (10"×12")': 1.0,
  'Pound Bags (14"×16")': 1.15,
  '2oz Jar + Custom Label': 0.7,
}

const mylarFaqs = [
  {
    q: 'Where can I print custom mylar bags in Hayward CA?',
    a: 'The Sticker Smith prints custom mylar bags in Hayward CA for Bay Area brands, including pouch packaging, eighth bags, quarter bags, ounce bags, pound bags, jar labels, and product labels.',
  },
  {
    q: 'Do you print custom mylar bags in Hayward?',
    a: 'Yes. The Sticker Smith prints custom mylar bags, pouch packaging, jar labels, and product labels from Hayward for Bay Area brands and product launches.',
  },
  {
    q: 'Can you help with packaging artwork?',
    a: 'Yes. You can upload print-ready artwork, send a logo and product details, or request design help. Every order gets a digital proof before anything prints.',
  },
  {
    q: 'What should I include for a quote?',
    a: 'Send the bag size, quantity, product type, finish preference, artwork status, and any compliance notes so we can price the run correctly.',
  },
]

function isAcceptedArtwork(file: File) {
  const name = file.name.toLowerCase()
  return file.type.startsWith('image/') || ['.ai', '.eps', '.heic', '.pdf', '.psd', '.svg', '.tif', '.tiff', '.webp'].some(ext => name.endsWith(ext))
}

function canPreviewArtwork(file: File) {
  return file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg')
}

function createMylarCartItemId(size: string) {
  return `mylar-${size}-${Date.now()}`
}

export default function MylarPackaging() {
  const { items } = useCart()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const editingItem = items.find(item => item.id === editId)
  const returnTo = searchParams.get('returnTo') === 'checkout' ? '/checkout' : '/cart'
  const [pricing, setPricing] = useState(() => getPricing())
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let active = true
    loadPricing().then(config => { if (active) { setPricing(config); setLoaded(true) } })
    return () => { active = false }
  }, [])
  if (editId && !loaded) return <p role="status" className="section-container py-16">Loading your saved packaging…</p>
  const editConfig = editingItem && resolveProductEdit(editingItem, pricing.products)
  if (editId && (!editConfig || editConfig.kind !== 'packaging')) return <div role="alert" className="section-container py-16"><p>{editingItem ? 'We could not restore these packaging options. Your original item is still in the cart. Contact the shop or remove it only when you are ready to replace it.' : 'This item is no longer in your cart.'}</p><Link to="/cart" className="btn-primary mt-4">Back to cart</Link></div>
  return <MylarOrderForm key={editId || 'new'} pricing={pricing} editingItem={editingItem} editConfig={editConfig || undefined} returnTo={returnTo} />
}

function MylarOrderForm({ pricing, editingItem, editConfig, returnTo }: { pricing: PricingConfig; editingItem?: CartItem; editConfig?: ProductConfiguration; returnTo: string }) {
  const { addItem, replaceItem } = useCart()
  const navigate = useNavigate()
  const category = pricing.products.find(p => p.name === 'Mylar Packaging') as ProductCategory | undefined
  const [selectedItem, setSelectedItem] = useState(Math.max(0, category?.items.findIndex(v => v.size === editConfig?.variant) ?? 0))
  const [quantity, setQuantity] = useState(editConfig?.pieces || 250)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(() => new Set(editConfig?.addOns || []))
  const [finish, setFinish] = useState<'matte' | 'gloss'>(editConfig?.finish || 'matte')
  const [pouchColor, setPouchColor] = useState<'white' | 'black'>(editConfig?.pouchColor || 'white')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [artworkUpload, setArtworkUpload] = useState<ArtworkAttachment | null>(editingItem?.artwork || null)
  const artworkGeneration = useRef(0)
  useEffect(() => () => { artworkGeneration.current += 1 }, [])
  const [artworkStatus, setArtworkStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>(editingItem?.artwork ? 'uploaded' : 'idle')
  const [artworkError, setArtworkError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [added, setAdded] = useState(false)
  const [optionNotice, setOptionNotice] = useState('')

  const items = category?.items ?? []
  const addOns = category?.addOns ?? []
  const item = items[selectedItem]

  // Find the right quantity tier
  const qtyTier = (() => {
    if (!item) return null
    // Find the tier where qty fits (use the closest lower tier)
    const sorted = [...item.quantities].sort((a, b) => a.qty - b.qty)
    let tier = sorted[0]
    for (const t of sorted) {
      if (quantity >= t.qty) tier = t
    }
    return tier
  })()

  const unitPrice = qtyTier?.price ?? 0
  const addOnTotal = addOns.filter(a => selectedAddOns.has(a.name)).reduce((s, a) => s + a.value, 0)
  const totalPrice = +((unitPrice + addOnTotal) * quantity).toFixed(2)

  const scale = item ? (mockupScales[item.size] ?? 0.75) : 0.75
  const isJar = item?.size.toLowerCase().includes('jar')
  const activeMockup = isJar ? 'jar' : selectedAddOns.has('Holographic Upgrade') ? 'foil' : 'pouch'
  const minimumQty = item ? Math.min(...item.quantities.map(q => q.qty)) : 1
  const quantityInvalid = !Number.isSafeInteger(quantity) || quantity < minimumQty || quantity > 100000
  const displaySize = (size: string) => size.includes('(') ? `${size.slice(size.indexOf('(') + 1, -1)} pouch` : size

  const uploadArtwork = useCallback(async (file: File) => {
    const generation = ++artworkGeneration.current
    setArtworkStatus('uploading')
    setArtworkError('')
    setArtworkUpload(null)

    try {
      const response = await fetch('/api/uploads/create-artwork-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not prepare artwork upload.')
      if (generation !== artworkGeneration.current) return

      const { error } = await supabase.storage
        .from(data.bucket)
        .uploadToSignedUrl(data.path, data.token, file, {
          contentType: file.type || data.contentType || 'application/octet-stream',
        })
      if (error) throw error
      if (generation !== artworkGeneration.current) return

      setArtworkUpload({
        bucket: data.bucket,
        path: data.path,
        fileName: data.fileName || file.name,
        contentType: file.type || data.contentType || 'application/octet-stream',
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })
      setArtworkStatus('uploaded')
    } catch (error) {
      if (generation !== artworkGeneration.current) return
      setArtworkStatus('error')
      setArtworkError(error instanceof Error ? error.message : 'Artwork upload failed.')
    }
  }, [])

  const receiveArtworkFile = useCallback((file: File) => {
    setUploadedFile(file)
    setPreviewUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return canPreviewArtwork(file) ? URL.createObjectURL(file) : null
    })
    void uploadArtwork(file)
  }, [uploadArtwork])

  const clearArtworkFile = useCallback(() => {
    artworkGeneration.current += 1
    setUploadedFile(null)
    setArtworkUpload(null)
    setArtworkStatus('idle')
    setArtworkError('')
    setPreviewUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && isAcceptedArtwork(file)) {
      receiveArtworkFile(file)
    }
  }, [receiveArtworkFile])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (isAcceptedArtwork(file)) receiveArtworkFile(file)
  }

  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) } }, [previewUrl])

  const toggleAddOn = (name: string) => {
    setSelectedAddOns(prev => { const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next })
  }

  const handleAddToCart = () => {
    if (!item || !qtyTier || quantityInvalid) return
    if (uploadedFile && artworkStatus !== 'uploaded') return
    const cartAddOns = addOns
      .filter(a => selectedAddOns.has(a.name))
      .map(a => ({ name: a.name, price: +(a.value * quantity).toFixed(2) }))
    const cartBasePrice = +(unitPrice * quantity).toFixed(2)
    const nextItem = {
      id: editingItem?.id || createMylarCartItemId(item.size),
      productConfiguration: { version: 1 as const, kind: 'packaging' as const, category: 'Mylar Packaging', variant: item.size, pieces: quantity, addOns: [...selectedAddOns], finish, pouchColor },
      name: `Mylar Packaging — ${item.size}`,
      category: 'Mylar Packaging',
      pieceCount: quantity,
      size: item.size,
      option: isJar ? `${quantity} pcs` : `${quantity} pcs · ${selectedAddOns.has('Foil Finish') ? 'foil' : finish} · ${pouchColor} · ${selectedAddOns.has('Holographic Upgrade') ? 'Holo' : 'Standard'}`,
      price: cartBasePrice,
      quantity: 1,
      addOns: cartAddOns.length > 0 ? cartAddOns : undefined,
      artworkIntent: artworkUpload ? 'uploaded' as const : 'send_later' as const,
      artwork: artworkUpload || undefined,
    }
    if (editingItem) { replaceItem(editingItem.id, nextItem); navigate(returnTo); return }
    addItem(nextItem)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!category) return <div className="section-container py-20 text-center text-muted-foreground">Mylar Packaging pricing not configured.</div>


  return (
    <>
      <section id="configure" className="pt-6 md:pt-10 pb-24 md:pb-16 scroll-mt-24">
        <div className="section-container max-w-6xl mx-auto">
          <ServicePageIntro
            eyebrow="Custom Mylar"
            title="Custom Mylar & Packaging"
            description="Choose your pouch size, finish and print run. Send artwork now or after ordering."
          />
          {editingItem && <div className="mb-5 rounded-xl border border-primary/40 bg-primary/5 p-4"><p className="font-bold">Edit {editingItem.name}</p><p className="text-sm text-muted-foreground">Keeping {editingItem.quantity} {editingItem.quantity === 1 ? 'batch' : 'batches'}. Prices below are for one batch. Changes are applied when you save.</p><p className="text-sm mt-2" role="status">Updated subtotal: ${(totalPrice * editingItem.quantity).toFixed(2)} for all batches, before cart discounts.</p><Link to={returnTo} className="inline-block mt-3 text-primary font-semibold underline">Cancel editing</Link></div>}
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3 md:sticky md:top-24">
            <figure className="overflow-hidden rounded-2xl border border-border bg-card">
              <img src={oliveLandArtwork} alt="Olive Land pita-chip packaging artwork" className="aspect-[4/3] max-h-80 md:max-h-none w-full object-contain bg-white" />
              <figcaption className="p-4 text-sm"><p className="font-bold">Your brand, on the pack</p><p className="text-muted-foreground mt-1">Olive Land packaging artwork from a shop project. This is a design example; your proof confirms the layout for your selected packaging.</p></figcaption>
            </figure>
            <details className="rounded-2xl border border-border bg-card p-4">
            <summary className="cursor-pointer font-semibold text-sm">{artworkUpload ? 'Artwork attached · view or change' : 'Add artwork (optional)'}</summary>
            {/* Upload Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`flex flex-col justify-center rounded-2xl border bg-card p-4 text-center transition-colors ${isDragging ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-3">
                <div>
                  <p className="text-base font-medium text-foreground">Upload artwork for proof</p>
                  <p className="mt-1 text-sm text-muted-foreground">Optional now. PNG, JPG, SVG, PDF, AI, EPS, PSD, TIFF, HEIC, and WebP accepted.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <span>Upload file</span>
                    <input type="file" accept="image/*,.pdf,.ai,.eps,.svg,.psd,.tif,.tiff,.heic,.webp" className="hidden" onChange={handleFileChange} />
                  </label>
                  {(uploadedFile || artworkUpload) && (
                    <button onClick={clearArtworkFile} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors">
                      <X className="h-3.5 w-3.5" /> Clear
                    </button>
                  )}
                </div>
                {(uploadedFile || artworkUpload) && <p className="text-xs text-muted-foreground break-words">Selected: <span className="font-medium text-foreground">{uploadedFile?.name || artworkUpload?.fileName}</span></p>}
                {!uploadedFile && artworkUpload && <p className="text-xs text-muted-foreground">Saved production file retained. Upload again only to replace it. Your emailed proof confirms placement.</p>}
                {artworkStatus === 'uploading' && <p className="text-xs text-primary">Uploading artwork for proof...</p>}
                {artworkStatus === 'uploaded' && <p className="text-xs text-green-400">Artwork attached to this order.</p>}
                {artworkStatus === 'error' && <p className="text-xs text-red-400">{artworkError}</p>}
              </div>
            </motion.div>

            {/* Artwork placement only; product choices control this preview. */}
            {previewUrl && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-6">
              <div className="rounded-xl bg-muted/50 border border-border">
                {activeMockup === 'pouch' && <PouchMockup previewUrl={previewUrl} pouchColor={pouchColor} finish={selectedAddOns.has('Foil Finish') ? 'foil' : finish} scale={scale} />}
                {activeMockup === 'foil' && <FoilMockup previewUrl={previewUrl} scale={scale} />}
                {activeMockup === 'jar' && <JarMockup previewUrl={previewUrl} />}
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {previewUrl ? 'Your design preview' : uploadedFile ? 'File selected. Image and SVG files can preview live' : 'Upload artwork to see it mocked up'} — {item?.size ?? 'Select a size'}
              </p>
            </motion.div>}
<p className="text-xs text-muted-foreground mt-3">Placement preview only, not a material sample. Your emailed proof confirms the final layout.</p></details></div>
            <div className="space-y-4">            {/* LEFT: Controls */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6 rounded-2xl border border-border bg-card p-5 md:p-6">
              {/* Pouch Size */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size / product</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((p, i) => (
                    <button key={displaySize(p.size)} aria-pressed={selectedItem === i} onClick={() => { if (i === selectedItem) return; setSelectedItem(i); if (selectedAddOns.size) setOptionNotice('Product changed. Previous upgrades were removed; choose the options for this product below.'); setSelectedAddOns(new Set()) }} className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${selectedItem === i ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}>
                      {displaySize(p.size)}
                    </button>
                  ))}
                </div>
              </div>

              {optionNotice && <p role="status" className="text-sm text-primary">{optionNotice}</p>}
              {/* Finish */}
              {!isJar && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finish</p>
                  <div className="flex flex-wrap gap-2">
                    {(['matte', 'gloss'] as const).map(f => (
                      <button key={f} aria-pressed={finish === f && !selectedAddOns.has('Foil Finish')} onClick={() => { setFinish(f); setSelectedAddOns(prev => new Set([...prev].filter(name => name !== 'Foil Finish'))) }} className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors capitalize ${finish === f && !selectedAddOns.has('Foil Finish') ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pouch Color */}
              {!isJar && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pouch Color</p>
                  <div className="flex gap-3">
                    {(['white', 'black'] as const).map(c => (
                      <button key={c} onClick={() => setPouchColor(c)} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors capitalize ${pouchColor === c ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground'}`}>
                        <span className={`inline-flex h-4 w-4 rounded-full border border-border ${c === 'white' ? 'bg-white' : 'bg-black'}`} />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground">{isJar ? 'The listed jar option includes a 2oz jar and custom label. Your proof confirms the label layout. Tell us about any required packaging specifications before ordering.' : <>Matte has a low-shine surface; gloss reflects more light. Holographic adds a rainbow effect; foil adds metallic accents. These are separate paid upgrades below. For a specific barrier, food-contact or child-resistant requirement, request a quote before ordering.</>}</p>
              {/* Quantity */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantity</p>
                <input
                  type="number"
                  aria-label="Packaging quantity"
                  step={1}
                  min={minimumQty}
                  max={100000}
                  aria-invalid={quantityInvalid}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value) || 0)}
                  placeholder="Enter quantity (pcs)"
                />
              </div>

              {quantityInvalid && <p role="alert" className="text-sm text-red-400">Enter a whole quantity from {minimumQty} to 100,000.</p>}
              {/* Add-Ons */}
              {addOns.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optional upgrades · priced per piece</p>
                  <div className="flex flex-wrap gap-2">
                    {addOns.filter(addon => !isJar || addon.name === 'Foil Finish').map((addon: AddOn) => (
                      <button key={addon.name} aria-pressed={selectedAddOns.has(addon.name)} onClick={() => toggleAddOn(addon.name)} className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${selectedAddOns.has(addon.name) ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:text-foreground'}`}>
                        {addon.name} (+${addon.value.toFixed(2)}/ea)
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT: Price Calculator + CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4">
              {/* Calculator Results */}
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h2 className="text-lg font-semibold mb-3 text-center">Order Summary</h2>
                <p className="text-xs text-muted-foreground mb-4 text-center">Your selected print batch and add-ons.</p>

                {qtyTier && quantity > 0 && (
                  <div className="rounded-xl bg-muted px-4 py-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product</span>
                      <span className="font-medium text-right text-xs">{item ? displaySize(item.size) : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="font-medium">{quantity.toLocaleString()} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unit price</span>
                      <span className="font-semibold text-primary">${unitPrice.toFixed(2)}</span>
                    </div>
                    {selectedAddOns.size > 0 && addOns.filter(a => selectedAddOns.has(a.name)).map(a => (
                      <div key={a.name} className="flex justify-between">
                        <span className="text-muted-foreground">{a.name}</span>
                        <span>+${a.value.toFixed(2)}/ea</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-border pt-2 mt-2">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                  Discounts and any applicable tax are shown at checkout. For custom stock, print method or packaging requirements, request a quote first.
                </p>
              </div>

              {/* Add to Cart */}
              {quantity > 0 && qtyTier && (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                  <button
                    onClick={handleAddToCart}
                    disabled={quantityInvalid || (Boolean(uploadedFile) && artworkStatus !== 'uploaded')}
                    className={`btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed ${added ? 'bg-green-600' : ''}`}
                  >
                    {added ? (
                      <><Check size={18} /> Added to Cart!</>
                    ) : uploadedFile && artworkStatus === 'uploading' ? (
                      <>Uploading artwork...</>
                    ) : uploadedFile && artworkStatus === 'error' ? (
                      <>Fix artwork upload first</>
                    ) : (
                      <><ShoppingCart size={18} /> {editingItem ? 'Save changes' : 'Add to Cart'} — ${totalPrice.toFixed(2)}</>
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">You'll receive a proof before anything prints.</p>
                </div>
              )}

              {/* Help CTA */}
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
                <p className="font-medium text-foreground mb-2">Need custom artwork help?</p>
                <p className="text-sm text-muted-foreground mb-4">Send your logo, product details, dimensions and any required label text.</p>
                <a href="/contact" className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Fill out project form
                </a>
              </div>
            </motion.div>
</div>
          </div>
          <MobileOrderAction regionId="configure" price={`$${totalPrice.toFixed(2)}`} detail={`${quantity} pieces`} label={added ? 'Added!' : editingItem ? 'Save changes' : 'Add to Cart'} disabled={!qtyTier || quantityInvalid || (Boolean(uploadedFile) && artworkStatus !== 'uploaded')} onClick={handleAddToCart} />
        </div>
      </section>
      <section id="quote" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <EstimateForm
            service="Mylar Packaging"
            title="Custom Mylar Quote"
            subtitle="Bulk, custom sizes, or complex artwork? Send the bag size and quantity."
            fields={[
              {
                name: 'productType',
                label: 'What are you packaging?',
                type: 'select',
                required: true,
                options: ['Food / Snacks', 'Coffee / Tea', 'Cannabis / CBD', 'Retail / Consumer Goods', 'Supplements / Health', 'Other'],
              },
              {
                name: 'bagSize',
                label: 'Bag size',
                type: 'select',
                required: true,
                options: ['3"×5" pouch', '4"×6" pouch', '5"×8" pouch', '10"×12" pouch', '14"×16" pouch', 'Custom size', 'Jar labels instead'],
              },
              { name: 'quantity', label: 'Estimated quantity', type: 'text', required: true, placeholder: 'e.g. 1,000 · 5,000 · 10,000+' },
              {
                name: 'artwork',
                label: 'Do you have artwork ready?',
                type: 'select',
                options: ['Yes — print-ready file', 'Have logo but need design help', 'Need full custom design'],
              },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-20 border-t border-border/50">
        <div className="section-container">
          <PortfolioStrip
            title="Packaging projects & artwork"
            subtitle="Explore pouch projects and flat artwork for food and retail packaging."
            projects={[
              { src: oliveLandArtwork, alt: 'Flat Olive Land garlic pita-chip packaging artwork', caption: 'Olive Land · food packaging artwork', fit: 'contain', href: '/projects?project=olive-land-pita-packaging-artwork' },
              { src: mylarCandyshockGreen, alt: 'Candy Shock green custom mylar pouch', caption: 'Candy Shock — Green · design mockup' },
              { src: mylarCandyshockBlue, alt: 'Candy Shock blue custom mylar pouch', caption: 'Candy Shock — Blue · design mockup' },
              { src: mylarAtomicshock, alt: 'Atomic Shock custom mylar pouch', caption: 'Atomic Shock · design mockup' },
              { src: mylarTripleA, alt: 'Triple A cannabis flower mylar packaging', caption: 'Triple A · packaging artwork' },
              { src: mylarElevatedSnack, alt: 'Elevated 925 mystery exotic snack pack mylar packaging', caption: 'Elevated 925 · promotional artwork' },
            ]}
          />
        </div>
      </section>
      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Mylar FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black">Custom mylar bag questions</h2>
          </div>
          <div className="grid gap-4">
            {mylarFaqs.map((faq) => (
              <div key={faq.q} className="bg-card/70 border border-border rounded-xl p-5">
                <h3 className="font-bold text-base md:text-lg mb-2">{faq.q}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
