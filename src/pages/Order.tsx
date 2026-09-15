import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Sparkles, FileUp, Check, Clock, MapPin, Shield, Zap, Palette, Droplets, Sticker as StickerIcon, Hand, PanelsTopLeft, ScrollText, ArrowRight, Send } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { supabase } from '@/lib/supabase'
import { getPricing, loadPricing, getBasePrice, getMaterialMultiplier, getSizeMultiplier } from '@/lib/pricing'
import { STICKER_QUANTITIES, MIN_STICKER_QUANTITY, MIN_ORDER_SUBTOTAL, isValidStickerQuantity, getStickerPrice, formatPriceAdjustment } from '@/lib/stickerPricing'
import MaterialGuide from '@/components/MaterialGuide'
import PrintTrust from '@/components/PrintTrust'
import { trackEvent } from '@/lib/analytics'
import { cities } from '@/lib/cities'
import { projects } from '@/lib/projects'
import ServicePageIntro from '@/components/ServicePageIntro'
import MobileOrderAction from '@/components/MobileOrderAction'
import PortfolioStrip from '@/components/PortfolioStrip'
import stkDieCut from '@/assets/optimized/projects/stickers-die-cut-stack-1000.webp'
import stkHolo from '@/assets/optimized/projects/stickers-holographic-1000.webp'
import stkLaptop from '@/assets/optimized/projects/stickers-on-laptop-1000.webp'
import stkSheet from '@/assets/projects/stickers-sheet.jpg'
import stkRoll from '@/assets/optimized/projects/stickers-roll-1000.webp'
import stkMatte from '@/assets/optimized/projects/drive-bottle-labels-1000.webp'

const stickerSpecs = [
  { icon: Droplets, label: 'Material', value: 'Chosen for your application' },
  { icon: Clock, label: 'Turnaround', value: 'Production after proof approval' },
  { icon: Shield, label: 'Durability', value: 'Ask about stock and exposure' },
  { icon: MapPin, label: 'Shipping', value: 'Free US shipping · Bay pickup' },
]

const shapeData = [
  { name: 'Die-Cut', value: 'Die-Cut' },
  { name: 'Kiss-Cut', value: 'Kiss-Cut' },
  { name: 'Square', value: 'Square' },
  { name: 'Circle', value: 'Circle' },
  { name: 'Rectangle', value: 'Rectangle' },
]

// Order-level add-ons (per-piece material upgrades are handled by Material column)
const ADDON_RUSH = { id: 'rush', label: 'Rush (2-day)', description: 'Skip the line — 2-day production', icon: Zap, price: 65 }
const ADDON_DESIGN = { id: 'design', label: 'Design Assist', description: 'Our designer helps shape your artwork', icon: Palette, price: 75 }

interface ArtworkAttachment {
  bucket: string
  path: string
  fileName: string
  contentType: string
  size: number
  uploadedAt: string
}

type ArtworkIntent = 'upload' | 'send_later' | 'design_help'

const materialData = [
  { value: 'Matte Vinyl', label: 'Matte', description: 'Low-shine finish' },
  { value: 'Glossy Vinyl', label: 'Gloss', description: 'Reflective finish' },
  { value: 'Clear', label: 'Clear', description: 'Transparent base' },
  { value: 'Holographic', label: 'Holographic', description: 'Rainbow reflection' },
  { value: 'Paper', label: 'Paper', description: 'Paper label stock' },
  { value: 'Embossed/UV', label: 'Embossed/UV', description: 'Specialty finish' },
]

// Square-presets — used for Die-Cut, Kiss-Cut, Square (these shapes have equal W and H)
const SQUARE_SIZES = ['2" x 2"', '3" x 3"', '4" x 4"', '5" x 5"', '6" x 6"', '7" x 7"']
// Circle uses the same square presets internally (diameter = W = H), but the
// label is rendered as a single diameter ('2"', '3"', etc.) since "2" x 2"" is
// nonsensical for a circle.
const CIRCLE_LABELS: Record<string, string> = {
  '2" x 2"': '2" diameter',
  '3" x 3"': '3" diameter',
  '4" x 4"': '4" diameter',
  '5" x 5"': '5" diameter',
  '6" x 6"': '6" diameter',
  '7" x 7"': '7" diameter',
}
// Rectangle gets its own set of W×H presets
const RECT_SIZES = ['3" x 2"', '4" x 2"', '4" x 3"', '5" x 3"', '6" x 3"', '6" x 4"', '8" x 4"']

function getSizesForShape(shape: string): string[] {
  if (shape === 'Rectangle') return RECT_SIZES
  return SQUARE_SIZES
}

function formatSizeForShape(size: string, shape: string): string {
  if (shape === 'Circle') return CIRCLE_LABELS[size] ?? size
  return size
}

const qtyOptions = STICKER_QUANTITIES
const MIN_QTY = MIN_STICKER_QUANTITY
const stickerFormats = [
  { value: 'handheld', label: 'Individual stickers', description: 'Separate stickers for handouts and merch.', cartLabel: 'Individual stickers', icon: Hand },
  { value: 'sheet', label: 'Sticker sheets', description: 'Stickers together on a backing sheet.', cartLabel: 'Stickers on backing sheets', icon: PanelsTopLeft },
  { value: 'roll', label: 'Roll labels', description: 'Labels for bottles, bags and packaging.', cartLabel: 'Roll labels', icon: ScrollText },
] as const

const localStickerTypes = [
  { label: 'Die-cut vinyl stickers', href: '/die-cut-stickers' },
  { label: 'Kiss-cut stickers', href: '/stickers#configure' },
  { label: 'Sticker sheets', href: '/sticker-sheets' },
  { label: 'Roll labels', href: '/roll-labels' },
  { label: 'Holographic stickers', href: '/holographic-stickers' },
  { label: 'Custom product labels', href: '/custom-labels' },
]

const stickerFaqs = [
  {
    q: 'Do you print custom stickers in the Bay Area?',
    a: 'Yes. The Sticker Smith prints custom stickers and labels in Hayward for Bay Area brands, artists, shops, events, and packaging projects, with local pickup available.',
  },
  {
    q: 'What sticker types can I order?',
    a: 'You can order die-cut stickers, kiss-cut stickers, sticker sheets, roll labels, holographic stickers, clear decals, matte stickers, and waterproof vinyl stickers.',
  },
  {
    q: 'Do I get a proof before printing?',
    a: 'Yes. Every custom sticker order includes a digital proof before production so cut lines, bleed, sizing, material, and artwork quality can be checked before anything prints.',
  },
]

const cityLinks = cities.slice(0, 8)
const stickerProofSlugs = [
  'fremontgear-stickers',
  'tastedeeztreatz-stiiizy',
  'fuegofamilyfarms-circle',
  'floodline-sticker',
  'brothersbroadleaf-halloween',
  'calibullconnect-bulldog',
]
const stickerProofProjects = stickerProofSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is (typeof projects)[number] => Boolean(project))

type StickerFormat = (typeof stickerFormats)[number]['value']

function canPreviewArtwork(file: File) {
  return file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg')
}

// Render a single sticker (as placeholder or real artwork)
function Sticker({ shape, artworkUrl, size = 96, dashed = false }: { shape: string; artworkUrl: string; size?: number; dashed?: boolean }) {
  const isCircle = shape === 'Circle'
  const isRect = shape === 'Rectangle'
  const w = isRect ? size * 1.4 : size
  const h = isRect ? size * 0.85 : size
  const radius = isCircle ? '50%' : shape === 'Die-Cut' ? '24%' : shape === 'Kiss-Cut' ? '18%' : '8%'
  return (
    <div
      className={`relative flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.45)] overflow-hidden ${dashed ? 'border-2 border-dashed border-white/30' : ''}`}
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: artworkUrl ? undefined : 'linear-gradient(135deg, hsl(199 89% 64% / 0.18), hsl(199 89% 40% / 0.08))',
      }}
    >
      {artworkUrl ? (
        <img src={artworkUrl} alt="Artwork" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[10px] text-white/50 font-semibold leading-tight text-center px-1">Your<br/>Design</span>
      )}
    </div>
  )
}

function StickerMockup({ shape, artworkUrl, variant }: { shape: string; artworkUrl: string; variant: 'single' | 'sheet' | 'roll' }) {
  if (variant === 'single') {
    return (
      <div className="relative flex flex-col items-center">
        <Sticker shape={shape} artworkUrl={artworkUrl} size={130} />
        {/* Soft floor shadow */}
        <div className="mt-4 w-28 h-3 rounded-full bg-black/50 blur-md opacity-60" />
      </div>
    )
  }
  if (variant === 'sheet') {
    return (
      <div
        className="relative p-3 rounded-md bg-gradient-to-b from-white/95 to-white/80 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        style={{ transform: 'perspective(800px) rotateX(18deg)' }}
      >
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <Sticker key={i} shape={shape} artworkUrl={artworkUrl} size={38} dashed />
          ))}
        </div>
      </div>
    )
  }
  // roll
  return (
    <div className="relative flex items-center" style={{ transform: 'perspective(600px) rotateY(-10deg)' }}>
      {/* Roll edge */}
      <div className="relative w-5 h-20 rounded-l-full bg-neutral-800 border border-neutral-700 shadow-inner">
        <div className="absolute inset-y-2 left-1.5 w-0.5 rounded-full bg-neutral-500/40" />
      </div>
      {/* Paper strip with stickers */}
      <div className="flex items-center gap-1 bg-gradient-to-r from-white/90 via-white to-white/70 px-2 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        {Array.from({ length: 3 }).map((_, i) => (
          <Sticker key={i} shape={shape} artworkUrl={artworkUrl} size={48} />
        ))}
      </div>
      {/* Soft end shadow */}
      <div className="w-6 h-16 bg-gradient-to-l from-transparent to-black/10" />
    </div>
  )
}

export default function Order({ embedded = false, initialShape = 'Die-Cut', initialMaterial = 'Matte Vinyl', initialFormat = 'handheld' }: { embedded?: boolean; initialShape?: string; initialMaterial?: string; initialFormat?: StickerFormat }) {
  const { addItem, replaceItem, items } = useCart()
  const navigate = useNavigate()
  const submittedRef = useRef(false)
  const [searchParams] = useSearchParams()
  const [shape, setShape] = useState(initialShape)
  const [material, setMaterial] = useState(initialMaterial)
  const [quantity, setQuantity] = useState(50)
  const [customQty, setCustomQty] = useState('')
  const [size, setSize] = useState(getSizesForShape(initialShape)[0])
  const [mockupView, setMockupView] = useState<StickerFormat>(initialFormat)
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkUrl, setArtworkUrl] = useState('')
  const [artworkUpload, setArtworkUpload] = useState<ArtworkAttachment | null>(null)
  const artworkGeneration = useRef(0)
  useEffect(() => () => { artworkGeneration.current += 1 }, [])
  const [artworkStatus, setArtworkStatus] = useState<'idle' | 'uploading' | 'uploaded' | 'error'>('idle')
  const [artworkError, setArtworkError] = useState('')
  const [artworkIntent, setArtworkIntent] = useState<ArtworkIntent | null>(null)
  const [artworkChoiceError, setArtworkChoiceError] = useState('')
  const [added, setAdded] = useState(false)
  const [rushAddon, setRushAddon] = useState(false)
  const [designAddon, setDesignAddon] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [pricingConfig, setPricingConfig] = useState(() => getPricing())
  useEffect(() => { trackEvent('view_item', { product: 'custom-stickers' }) }, [])
  const queryString = searchParams.toString()
  const editingItem = items.find(item => item.id === searchParams.get('edit'))

  useEffect(() => {
    let active = true
    loadPricing().then((config) => {
      if (active) setPricingConfig(config)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!queryString) return
    const params = new URLSearchParams(queryString)
    const product = (params.get('product') || '').toLowerCase()
    const format = (params.get('format') || '').toLowerCase()
    const nextFormat =
      format === 'sheet' || product.includes('sheet') ? 'sheet'
        : format === 'roll' || product.includes('roll') || product.includes('label') ? 'roll'
          : format === 'individual' || format === 'handheld' || product.includes('die-cut') || product.includes('sample') ? 'handheld'
            : null

    if (nextFormat) setMockupView(nextFormat)

    const shapeParam = params.get('shape')
    const nextShape =
      nextFormat === 'sheet' ? 'Kiss-Cut'
        : nextFormat === 'roll' ? 'Rectangle'
          : product.includes('die-cut') || product.includes('sample') ? 'Die-Cut'
            : shapeData.find(s => s.value.toLowerCase() === shapeParam?.toLowerCase())?.value
    if (nextShape) {
      setShape(nextShape)
      const validSizes = getSizesForShape(nextShape)
      const sizeParam = params.get('size')
      setSize(sizeParam && validSizes.includes(sizeParam) ? sizeParam : validSizes[0])
    }

    const materialParam = params.get('material')
    const nextMaterial = materialData.find(m => m.value.toLowerCase() === materialParam?.toLowerCase())?.value
    if (nextMaterial) setMaterial(nextMaterial)
    if (product.includes('sample')) { navigate('/contact?service=Sticker%20samples', { replace: true }); return }

    const qtyParam = Number(params.get('qty'))
    if (isValidStickerQuantity(qtyParam)) {
      if (qtyOptions.includes(qtyParam)) {
        setQuantity(qtyParam)
        setCustomQty('')
      } else {
        setCustomQty(String(qtyParam))
      }
    }
  }, [queryString, navigate])

  useEffect(() => {
    if (!editingItem?.configuration) return
    const config = editingItem.configuration
    setShape(config.shape); setMaterial(config.material); setSize(config.size)
    setCustomQty(String(config.pieces)); setMockupView(config.format)
    setRushAddon(Boolean(config.rush)); setDesignAddon(Boolean(config.design))
    setArtworkIntent(editingItem.artworkIntent === 'uploaded' ? 'upload' : editingItem.artworkIntent || null)
    setArtworkUpload(editingItem.artwork || null)
    setArtworkStatus(editingItem.artwork ? 'uploaded' : 'idle')
  }, [editingItem])

  const requestedQty = customQty ? Number(customQty) : quantity
  const quantityValid = isValidStickerQuantity(requestedQty)
  const effectiveQty = quantityValid ? requestedQty : MIN_QTY
  const matMult = getMaterialMultiplier(material, pricingConfig)
  const sizeMult = getSizeMultiplier(size, pricingConfig)
  const priceBreakdown = getStickerPrice(effectiveQty, pricingConfig, sizeMult, matMult)
  const stickerSubtotal = priceBreakdown.subtotal
  const addonsTotal = (rushAddon ? ADDON_RUSH.price : 0) + (designAddon ? ADDON_DESIGN.price : 0)
  const totalPrice = +(stickerSubtotal + addonsTotal).toFixed(2)
  const perUnit = stickerSubtotal / effectiveQty

  const refPerUnit = getBasePrice(50, pricingConfig) * matMult * sizeMult
  const getDiscount = (qty: number) => {
    const pu = getBasePrice(qty, pricingConfig) * matMult * sizeMult
    return Math.round((1 - pu / refPerUnit) * 100)
  }
  const getQtyTotal = (qty: number) => getStickerPrice(qty, pricingConfig, sizeMult, matMult).subtotal.toFixed(2)

  const materialLabel = materialData.find(m => m.value === material)?.label || material
  const shapeLabel = shapeData.find(s => s.value === shape)?.name || shape
  const formatLabel = stickerFormats.find(f => f.value === mockupView)?.cartLabel || 'Individual stickers'
  const cartProductName =
    mockupView === 'sheet' ? `${materialLabel} Sticker Sheets`
      : mockupView === 'roll' ? `${materialLabel} Roll Labels`
        : `${shapeLabel} ${materialLabel} Stickers`

  const uploadArtwork = async (file: File) => {
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
      trackEvent('artwork_upload_succeeded')
    } catch (error) {
      if (generation !== artworkGeneration.current) return
      setArtworkStatus('error')
      trackEvent('artwork_upload_failed')
      setArtworkError(error instanceof Error ? error.message : 'Artwork upload failed.')
    }
  }

  const handleFile = (file: File) => {
    setArtworkIntent('upload')
    setArtworkChoiceError('')
    setDesignAddon(false)
    setArtworkFile(file)
    setArtworkUrl(prev => { if (prev) URL.revokeObjectURL(prev); return canPreviewArtwork(file) ? URL.createObjectURL(file) : '' })
    void uploadArtwork(file)
  }

  const chooseArtworkIntent = (intent: ArtworkIntent) => {
    trackEvent('artwork_option_selected', { option: intent })
    setArtworkIntent(intent)
    setArtworkChoiceError('')
    setDesignAddon(intent === 'design_help')

    if (intent !== 'upload') {
      artworkGeneration.current += 1
      setArtworkFile(null)
      setArtworkUrl('')
      setArtworkUpload(null)
      setArtworkStatus('idle')
      setArtworkError('')
    }

    if (intent === 'upload' && fileRef.current) {
      fileRef.current.value = ''
      fileRef.current.click()
    }
  }

  useEffect(() => {
    return () => {
      if (artworkUrl) URL.revokeObjectURL(artworkUrl)
    }
  }, [artworkUrl])

  const handleAddToCart = (checkout = false) => {
    if (!quantityValid || submittedRef.current) return
    if (!artworkIntent) {
      document.getElementById('artwork-options')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      document.getElementById('artwork-options')?.focus()
      trackEvent('artwork_choice_required')
      setArtworkChoiceError('Choose how you will provide artwork to continue.')
      return
    }
    if (artworkIntent === 'upload' && !artworkFile && !artworkUpload) {
      setArtworkChoiceError('Select an artwork file, or choose to send it after checkout.')
      fileRef.current?.click()
      return
    }
    if (artworkFile && artworkStatus !== 'uploaded') return
    const addOns: { name: string; price: number }[] = []
    if (rushAddon) addOns.push({ name: ADDON_RUSH.label, price: ADDON_RUSH.price })
    if (designAddon) addOns.push({ name: ADDON_DESIGN.label, price: ADDON_DESIGN.price })
    const item = {
      id: editingItem?.id || `sticker-${crypto.randomUUID()}`,
      pieceCount: effectiveQty,
      configuration: { shape, material, size, pieces: effectiveQty, format: mockupView, rush: rushAddon, design: designAddon },
      name: cartProductName,
      category: 'Stickers',
      size,
      option: `${effectiveQty} pcs · ${formatLabel}`,
      price: stickerSubtotal,
      quantity: 1,
      material,
      shape,
      dimensions: size,
      artworkIntent: artworkIntent === 'upload' ? 'uploaded' as const : artworkIntent,
      addOns: addOns.length > 0 ? addOns : undefined,
      artwork: artworkUpload || undefined,
    }
    submittedRef.current = true
    if (editingItem) replaceItem(editingItem.id, item)
    else addItem(item)
    if (checkout) { navigate(`/stickers?edit=${encodeURIComponent(item.id)}#configure`, { replace: true }); navigate('/checkout'); return }
    setAdded(true)
    window.setTimeout(() => { submittedRef.current = false }, 1000)
    setTimeout(() => setAdded(false), 2000)
  }

  const selectFormat = (format: StickerFormat) => {
    if (format === mockupView) return
    const nextShape = format === 'sheet' ? 'Kiss-Cut' : format === 'roll' ? 'Rectangle' : 'Die-Cut'
    setMockupView(format)
    setShape(nextShape)
    const validSizes = getSizesForShape(nextShape)
    if (!validSizes.includes(size)) setSize(validSizes[0])
    trackEvent('configuration_change', { field: 'format', value: format })
  }
  const formatQuote = {
    artwork: artworkUpload || undefined,
    message: mockupView === 'sheet'
      ? `I'd like a quote for multi-design sticker sheets.\nSelected material: ${material}\nIndividual sticker size considered: ${size}\nSheet size: please advise\nNumber of sheets: \nDesigns per sheet: \n`
      : `I'd like a quote for roll labels.\nLabels: ${effectiveQty}\nLabel size: ${size}\nMaterial: ${material}\nCore size / unwind direction / labeling machine: \n`,
  }

  const configurator = (
      <section id="configure" className="pt-4 pb-24 md:pb-12 scroll-mt-24">
        <div className="section-container">
          <fieldset className="max-w-6xl mx-auto mb-6">
            <legend className="text-sm font-bold mb-3">Choose your sticker format</legend>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stickerFormats.map(format => {
                const FormatIcon = format.icon
                return <button key={format.value} type="button" aria-pressed={mockupView === format.value}
                  onClick={() => selectFormat(format.value)}
                  className={`rounded-xl border p-3 sm:p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${mockupView === format.value ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'}`}>
                  <span className="relative flex flex-col sm:flex-row items-start sm:items-center gap-2 font-bold text-xs sm:text-sm"><FormatIcon size={18} aria-hidden="true" />{format.label}{mockupView === format.value && <Check size={16} className="absolute right-0 top-0 sm:static sm:ml-auto text-primary" aria-hidden="true" />}</span>
                  <span className="hidden sm:block text-xs text-muted-foreground mt-1">{format.description}</span>
                </button>
              })}
            </div>
            {mockupView !== 'handheld' && <div className="mt-3 rounded-xl border border-border p-4 text-sm" aria-live="polite">
              <p className="font-semibold">{mockupView === 'sheet' ? 'One design on backing sheets · priced per sticker' : 'Priced per label, not per roll'}</p>
              <p className="text-muted-foreground mt-1">{mockupView === 'sheet' ? 'The options below count individual stickers. For multiple designs or a specific number of whole sheets, request a sheet quote.' : 'For machine application, we need your core size and unwind direction before confirming compatibility.'}</p>
              <Link to={`/contact?service=${mockupView === 'sheet' ? 'Sticker%20sheets' : 'Roll%20labels'}`} state={{ stickerQuote: formatQuote }} aria-disabled={artworkStatus === 'uploading'} onClick={event => { if (artworkStatus === 'uploading') event.preventDefault() }} className="inline-flex items-center gap-2 mt-2 text-primary font-bold underline underline-offset-4">
                {mockupView === 'sheet' ? 'Get a multi-design sheet quote' : 'Request machine-compatible roll labels'}<ArrowRight size={16} aria-hidden="true" />
              </Link>
              {artworkStatus === 'uploading' && <p className="text-xs mt-2">Wait for your artwork to finish uploading if you want to include it in the quote.</p>}
            </div>}
          </fieldset>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-start gap-6 lg:gap-8">
            <div className="min-w-0 space-y-3 md:sticky md:top-24">
            {/* Mockup preview */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center">
              <button type="button" onClick={() => chooseArtworkIntent('upload')} className="btn-primary w-full justify-center mb-3"><FileUp size={16} />{artworkFile ? 'Change artwork' : 'Upload & preview'}</button>
              {/* Preview area */}
              <div className="flex-1 flex items-center justify-center w-full min-w-0 overflow-hidden min-h-[160px] md:min-h-[240px] py-4">
                {mockupView === 'handheld' && (
                  <StickerMockup
                    shape={shape}
                    artworkUrl={artworkUrl}
                    variant="single"
                  />
                )}
                {mockupView === 'sheet' && (
                  <StickerMockup
                    shape={shape}
                    artworkUrl={artworkUrl}
                    variant="sheet"
                  />
                )}
                {mockupView === 'roll' && (
                  <StickerMockup
                    shape={shape}
                    artworkUrl={artworkUrl}
                    variant="roll"
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {artworkUrl ? 'Preview of your design' : 'Upload artwork to see your design applied'}
              </p>
            </div>

            {/* Artwork card */}
            <fieldset className="min-w-0 bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <legend className="sr-only">Choose how you will provide artwork</legend>
              <h3 className="font-bold text-lg mb-1">How will you provide artwork?</h3>
              <p className="text-sm text-muted-foreground mb-3">Upload now, send it later, or get design help.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => chooseArtworkIntent('upload')}
                  className={`w-full flex items-center justify-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                    artworkIntent === 'upload'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'bg-muted border-border hover:border-primary/30'
                  }`}
                  aria-pressed={artworkIntent === 'upload'}
                >
                  <FileUp size={16} className="text-primary" />
                  <span>{artworkFile ? 'Replace uploaded artwork' : 'Upload my artwork now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => chooseArtworkIntent('send_later')}
                  className={`w-full flex items-center justify-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                    artworkIntent === 'send_later'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'bg-muted border-border hover:border-primary/30'
                  }`}
                  aria-pressed={artworkIntent === 'send_later'}
                >
                  <Send size={16} className="text-primary" /> Send artwork after checkout
                </button>
                <button
                  type="button"
                  onClick={() => chooseArtworkIntent('design_help')}
                  className={`w-full flex items-center justify-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                    artworkIntent === 'design_help'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'bg-muted border-border hover:border-primary/30'
                  }`}
                  aria-pressed={artworkIntent === 'design_help'}
                >
                  <Sparkles size={16} className="text-primary" />
                  <span>I need design help · +${ADDON_DESIGN.price}</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf,.ai,.eps,.svg"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />
                {artworkFile && (
                  <p className="text-xs text-primary font-medium mt-2">
                    &#10003; {artworkFile.name}
                  </p>
                )}
                {artworkStatus === 'uploading' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploading artwork so it stays with the order...
                  </p>
                )}
                {artworkStatus === 'uploaded' && (
                  <p className="text-xs text-green-400 mt-1">
                    Artwork saved and ready to add to cart.
                  </p>
                )}
                {artworkStatus === 'error' && (
                  <p className="text-xs text-destructive mt-1">
                    {artworkError}
                  </p>
                )}
                {artworkFile && !artworkUrl && (
                  <p className="text-xs text-muted-foreground mt-1">
                    File received for proof. Upload PNG, JPG, or SVG for live preview.
                  </p>
                )}
                {artworkIntent === 'send_later' && (
                  <p className="text-xs font-medium text-primary">Email your artwork to thestickersmith@gmail.com with your order number after checkout.</p>
                )}
                {artworkIntent === 'design_help' && (
                  <p className="text-xs font-medium text-primary">Design help is included in the total below.</p>
                )}
                {artworkChoiceError && (
                  <p className="text-xs font-medium text-destructive" role="alert" aria-live="polite">{artworkChoiceError}</p>
                )}
              </div>
            </fieldset>

<p className="text-xs text-muted-foreground">Placement preview only; your emailed proof confirms the final cut and layout.</p>
            </div><div className="min-w-0 space-y-5"><div className="grid grid-cols-2 gap-3">
<label className="text-sm font-bold">Shape<select aria-label="Sticker shape" className="mt-2 w-full rounded-xl border border-border bg-card p-3" value={shape} onChange={e => { setShape(e.target.value); const sizes = getSizesForShape(e.target.value); if (!sizes.includes(size)) setSize(sizes[0]) }}>{shapeData.map(s => <option key={s.value} value={s.value}>{s.name}</option>)}</select></label>
<label className="text-sm font-bold">Size<select aria-label="Sticker size" className="mt-2 w-full rounded-xl border border-border bg-card p-3" value={size} onChange={e => setSize(e.target.value)}>{getSizesForShape(shape).map(s => <option key={s} value={s}>{formatSizeForShape(s, shape)}</option>)}</select></label>
<label className="col-span-2 text-sm font-bold">Material<select aria-label="Sticker material" className="mt-2 w-full rounded-xl border border-border bg-card p-3" value={material} onChange={e => { setMaterial(e.target.value); trackEvent('configuration_change', { field: 'material', value: e.target.value }) }}>{materialData.map(m => <option key={m.value} value={m.value}>{m.label} — {m.description}</option>)}</select></label>
</div><MaterialGuide value={material} onSelect={next => { setMaterial(next); trackEvent('configuration_change', { field: 'material', value: next }) }} />            {/* Quantity */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3">Quantity</h3>
              {mockupView !== 'handheld' && <p className="text-sm text-muted-foreground mb-3">{mockupView === 'sheet' ? 'Count individual stickers, not backing sheets. Size is for each sticker.' : 'Count individual labels, not rolls. Size is for each label.'}</p>}
              <p className="text-xs text-muted-foreground mb-3">Prices include your selected size and material. Bulk savings compare the unit price with {MIN_QTY} pcs; add-ons and cart discounts are shown separately.</p>
              <div className="grid grid-cols-2 gap-2">
                {qtyOptions.map(q => {
                  const total = getQtyTotal(q)
                  const disc = getDiscount(q)
                  const isActive = !customQty && quantity === q
                  return (
                    <button
                      key={q}
                      onClick={() => { setQuantity(q); setCustomQty('') }}
                      className={`w-full flex flex-col items-start justify-between px-3 py-3 rounded-xl text-sm font-medium border transition-all ${
                        isActive
                          ? 'border-primary bg-primary text-white'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <span>{q} pcs</span>
                      <span className="flex items-center gap-2">
                        <span className="font-bold">${total}</span>
                        {disc > 0 && (
                          <span className={`text-xs font-semibold ${isActive ? 'text-white/70' : 'text-green-400'}`}>
                            Save {disc}%/ea
                          </span>
                        )}
                      </span>
                    </button>
                  )
                })}
                {/* Custom quantity */}
                <div className={`col-span-2 rounded-xl border transition-all ${customQty ? (!quantityValid ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-primary bg-primary/10') : 'border-border'}`}>
                  <p className="text-xs text-muted-foreground text-center pt-3 pb-1.5">Custom quantity · min {MIN_QTY}</p>
                  <div className="flex items-center gap-2 px-3 pb-3">
                    <input
                      type="number"
                      min={MIN_QTY}
                      step={1}
                      aria-label="Custom sticker quantity"
                      aria-invalid={!quantityValid}
                      aria-describedby={!quantityValid ? 'quantity-error' : undefined}
                      placeholder={`Enter qty (${MIN_QTY}+)`}
                      value={customQty}
                      onChange={e => setCustomQty(e.target.value)}
                      className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm font-bold">
                      {quantityValid ? `$${getQtyTotal(effectiveQty)}` : '—'}
                    </span>
                  </div>
                  {!quantityValid && (
                    <p id="quantity-error" className="text-[11px] text-yellow-500 px-3 pb-3 -mt-1">
                      Enter a whole number of {MIN_QTY} pieces or more.
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Order Summary */}
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-center text-muted-foreground mb-4">
                Order Summary
              </h3>
              <div className="text-center mb-4">
                <p className="text-xl font-black">{quantityValid ? `${effectiveQty} {mockupView === 'roll' ? 'labels' : 'stickers'}` : 'Choose a valid quantity'}</p>
                <p className="text-sm text-muted-foreground">{shapeLabel} &middot; {formatSizeForShape(size, shape)}</p>
                <p className="text-sm text-muted-foreground">{materialLabel}</p>
                <p className="text-sm text-primary">{formatLabel}</p>
              </div>

              {/* Price breakdown */}
              {quantityValid && <div className="border-t border-border/60 pt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{effectiveQty} {mockupView === 'roll' ? 'labels' : 'stickers'} · base price</span>
                  <span className="tabular-nums">${priceBreakdown.baseTotal.toFixed(2)}</span>
                </div>
                {sizeMult !== 1 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{formatSizeForShape(size, shape)} size adjustment</span>
                    <span className="tabular-nums">{formatPriceAdjustment(priceBreakdown.sizeAdjustment)}</span>
                  </div>
                )}
                {matMult !== 1 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{materialLabel} {matMult < 1 ? 'savings' : 'upgrade'}</span>
                    <span className="tabular-nums">{formatPriceAdjustment(priceBreakdown.materialAdjustment)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-border/40 mt-1">
                  <span>Stickers subtotal</span>
                  <span className="font-semibold tabular-nums">${stickerSubtotal.toFixed(2)}</span>
                </div>
                {rushAddon && (
                  <div className="flex justify-between text-primary">
                    <span>+ Rush (2-day)</span>
                    <span className="tabular-nums">+${ADDON_RUSH.price}</span>
                  </div>
                )}
                {designAddon && (
                  <div className="flex justify-between text-primary">
                    <span>+ Design Assist</span>
                    <span className="tabular-nums">+${ADDON_DESIGN.price}</span>
                  </div>
                )}
              </div>}

              {/* Rush toggle inline */}
              <button
                onClick={() => setRushAddon(!rushAddon)}
                className={`mt-4 flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  rushAddon
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Zap size={13} />
                  Add Rush · 2-day production
                </span>
                <span className="tabular-nums">+${ADDON_RUSH.price}</span>
              </button>

              <div className="border-t border-border pt-4 mt-4 text-center">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total before cart discounts</p>
                <p className="text-4xl font-black">{quantityValid ? `$${totalPrice.toFixed(2)}` : '—'}</p>
                {quantityValid && <p className="text-xs text-primary mt-1.5">Stickers &asymp; ${perUnit.toFixed(3)}/ea · excludes add-ons</p>}
                <p className="text-xs text-muted-foreground mt-2">${MIN_ORDER_SUBTOTAL} cart minimum before discounts.</p>
              </div>
              <button
                onClick={() => handleAddToCart(true)}
                disabled={!quantityValid || (Boolean(artworkFile) && artworkStatus !== 'uploaded')}
                className={`btn-primary w-full mt-5 ${added ? 'bg-green-600' : ''} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:!transform-none`}
              >
                {!quantityValid ? (
                  <>Enter a whole quantity of {MIN_QTY}+</>
                ) : artworkFile && artworkStatus === 'uploading' ? (
                  <>Saving artwork...</>
                ) : artworkFile && artworkStatus === 'error' ? (
                  <>Fix artwork upload first</>
                ) : added ? (
                  <><Check size={18} /> Added to Cart!</>
                ) : (
                  <><ShoppingCart size={18} /> {editingItem ? 'Save & Continue to Checkout' : 'Continue to Checkout'}</>
                )}
              </button>
              <button type="button" className="mt-3 text-sm text-primary font-bold" disabled={!quantityValid} onClick={() => handleAddToCart(false)}>{added ? 'Saved to cart' : editingItem ? 'Save changes & keep shopping' : 'Add to cart & keep shopping'}</button>
              <PrintTrust />
              {effectiveQty > 2500 && (
                <a
                  href={`/contact?service=Bulk+Sticker+Order&qty=${effectiveQty}&size=${encodeURIComponent(size)}&material=${encodeURIComponent(material)}`}
                  className="block mt-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-3 text-center"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    Bulk quote available
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {effectiveQty.toLocaleString()}+ pieces? We'll beat this price — request a custom quote →
                  </p>
                </a>
              )}
              <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                Digital proof within 24 hours. Nothing prints until you approve.
              </p>
            </div>
</div>
          </div>
          <MobileOrderAction regionId="configure" price={quantityValid ? `$${totalPrice.toFixed(2)}` : '—'} detail={`${effectiveQty || 0} ${mockupView === 'roll' ? 'labels' : 'stickers'}`} label={added ? 'Saved!' : editingItem ? 'Save changes' : 'Continue to Checkout'} disabled={!quantityValid || (Boolean(artworkFile) && artworkStatus !== 'uploaded')} onClick={() => handleAddToCart(true)} />
          {/* Specs grid — trust signal, small, under the cart not blocking it */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {stickerSpecs.map((s) => (
              <div key={s.label} className="bg-card/60 border border-border rounded-xl p-4">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className="text-xs font-semibold leading-snug">{s.label === 'Material' ? materialLabel : s.label === 'Durability' && material === 'Paper' ? 'Dry indoor use; not waterproof' : s.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
  )
  if (embedded) return configurator
  return (
    <>
      <div className="section-container pt-6 md:pt-8"><ServicePageIntro eyebrow="Custom Stickers" title="Upload. Preview. Make it yours." description="Choose your finish, size and quantity. Every order gets a proof before printing." /></div>
      {configurator}

      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
                Bay Area sticker printing
              </p>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Printed in Hayward. Made for your brand.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  From merch drops to packaging labels, choose local pickup in Hayward or free US shipping. We check your artwork, cut lines and layout before production.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {cityLinks.map((city) => (
                  <Link
                    key={city.slug}
                    to={`/${city.slug}`}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    {city.name} stickers
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-3"
            >
              {localStickerTypes.map((type) => (
                <Link
                  key={type.label}
                  to={type.href}
                  className="group bg-card/70 border border-border rounded-xl p-4 hover:border-primary/40 transition-colors"
                >
                  <StickerIcon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{type.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    View format details and ordering options.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Explore options <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-border/50 bg-card">
        <div className="section-container max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Real Sticker Work</p>
            <h2 className="text-3xl md:text-4xl font-black">Proof from real Bay Area sticker projects.</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              These are real Sticker Smith projects for local brands: printed die-cut artwork, illustrated vinyl stickers, circular runs, and fast-turnaround brand drops.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stickerProofProjects.map((project) => (
              <Link
                key={project.slug}
                to={`/projects?project=${encodeURIComponent(project.slug)}`}
                className="group bg-background border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-black">
                  <img src={project.image} alt={project.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/90 mb-1">{project.category}</p>
                  <h3 className="font-bold text-sm mb-1">{project.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{project.scope || project.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/projects" className="btn-secondary text-sm">See More Sticker Projects</Link>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-border/50">
        <div className="section-container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-primary font-bold text-xs uppercase tracking-widest mb-3">Sticker FAQ</p>
            <h2 className="text-3xl md:text-4xl font-black">Bay Area custom sticker questions</h2>
          </div>
          <div className="grid gap-4">
            {stickerFaqs.map((faq) => (
              <details key={faq.q} className="bg-card/70 border border-border rounded-xl p-5">
                <summary className="font-bold cursor-pointer">{faq.q}</summary>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-12 md:py-20 border-t border-border/50 scroll-mt-24">
        <div className="section-container">
          <PortfolioStrip
            title="Sticker Work"
            subtitle="Finished stickers, print production and labeled format examples."
            projects={[
              { src: stkDieCut, alt: 'Die-cut sticker stack', caption: 'Die-cut vinyl' },
              { src: stkHolo, alt: 'Holographic stickers', caption: 'Holographic' },
              { src: stkLaptop, alt: 'EPIC RANE artwork in the print shop', caption: 'Behind the scenes' },
              { src: stkSheet, alt: 'Illustration of a kiss-cut sticker sheet', caption: 'Sticker sheets · format illustration' },
              { src: stkRoll, alt: 'Sticker artwork on roll-fed print equipment', caption: 'Roll-fed print production' },
              { src: stkMatte, alt: 'Sticker Smith labels on bottles', caption: 'Bottle labels' },
            ]}
          />
        </div>
      </section>
    </>
  )
}
