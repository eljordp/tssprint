import { useState, useMemo, useCallback } from 'react'
import { Upload, X, Hand, Layers, ScrollText, Paintbrush, FileCheck, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const QUANTITY_TIERS = [50, 100, 200, 300, 500, 1000] as const
type QuantityTier = (typeof QUANTITY_TIERS)[number]
type Shape = 'circle' | 'square' | 'rectangle' | 'die-cut' | 'kiss-cut'
type Material = 'matte' | 'gloss' | 'clear' | 'holographic' | 'paper' | 'embossed/UV'
type MockupType = 'hand-held' | 'sheet' | 'roll'

const baseCirclePrices: Record<number, Record<QuantityTier, number>> = {
  1: { 50: 51, 100: 60, 200: 70, 300: 75, 500: 90, 1000: 125 },
  2: { 50: 60, 100: 70, 200: 90, 300: 105, 500: 135, 1000: 200 },
  3: { 50: 70, 100: 90, 200: 120, 300: 145, 500: 200, 1000: 310 },
  4: { 50: 80, 100: 110, 200: 155, 300: 199, 500: 275, 1000: 450 },
  5: { 50: 95, 100: 130, 200: 199, 300: 255, 500: 365, 1000: 605 },
  6: { 50: 110, 100: 160, 200: 245, 300: 325, 500: 470, 1000: 790 },
  7: { 50: 130, 100: 190, 200: 300, 300: 400, 500: 585, 1000: 990 },
  8: { 50: 145, 100: 225, 200: 355, 300: 480, 500: 705, 1000: 1210 },
  9: { 50: 155, 100: 236, 200: 385, 300: 525, 500: 771, 1000: 1325 },
  11: { 50: 210, 100: 337, 200: 563, 300: 765, 500: 1141, 1000: 2140 },
}

const KNOWN_DIAMETERS = Object.keys(baseCirclePrices).map(Number).sort((a, b) => a - b)

const materialMultipliers: Record<Material, number> = {
  matte: 1, gloss: 1, clear: 1.15, holographic: 1.25, paper: 0.9, 'embossed/UV': 2,
}

const SQUARE_SIZE_OPTIONS = [
  { label: '2" x 2"', diameter: 2, width: 2, height: 2 },
  { label: '3" x 3"', diameter: 3, width: 3, height: 3 },
  { label: '4" x 4"', diameter: 4, width: 4, height: 4 },
  { label: '5" x 5"', diameter: 5, width: 5, height: 5 },
  { label: '6" x 6"', diameter: 6, width: 6, height: 6 },
  { label: '7" x 7"', diameter: 7, width: 7, height: 7 },
  { label: '8" x 8"', diameter: 8, width: 8, height: 8 },
  { label: '9" x 9"', diameter: 9, width: 9, height: 9 },
]

const RECT_SIZE_OPTIONS = [
  { label: '3" x 2"', diameter: 3, width: 3, height: 2 },
  { label: '4" x 2"', diameter: 4, width: 4, height: 2 },
  { label: '4" x 3"', diameter: 4, width: 4, height: 3 },
  { label: '5" x 3"', diameter: 5, width: 5, height: 3 },
  { label: '6" x 4"', diameter: 6, width: 6, height: 4 },
  { label: '7" x 5"', diameter: 7, width: 7, height: 5 },
  { label: '8" x 5"', diameter: 8, width: 8, height: 5 },
  { label: '9" x 6"', diameter: 9, width: 9, height: 6 },
]

function getArea(shape: Shape, diameter: number, width: number, height: number): number {
  if (shape === 'circle') return Math.PI * Math.pow(diameter / 2, 2)
  if (shape === 'square') return width * width
  return width * height
}

function mapAreaToDiameter(area: number): number | null {
  if (area <= 0) return null
  for (const d of KNOWN_DIAMETERS) {
    if (Math.PI * Math.pow(d / 2, 2) >= area) return d
  }
  return null
}

function calculatePrice(shape: Shape, diameter: number, width: number, height: number, qty: number, material: Material) {
  const area = getArea(shape, diameter, width, height)
  const mappedDiameter = mapAreaToDiameter(area)
  if (!mappedDiameter) return { total: null, unit: null, reason: 'Size is above our online calculator range.' }

  const baseRow = baseCirclePrices[mappedDiameter]
  if (!baseRow) return { total: null, unit: null, reason: 'No pricing tier found.' }

  const sortedTiers = [...QUANTITY_TIERS].sort((a, b) => a - b)
  let tierQty: QuantityTier = sortedTiers[0]
  for (const t of sortedTiers) { if (qty >= t) tierQty = t }

  const base = baseRow[tierQty]
  if (!base) return { total: null, unit: null, reason: 'Quantity not supported.' }

  const baseUnitPrice = base / tierQty
  const materialMult = materialMultipliers[material] ?? 1
  let discount = 0
  if (qty >= 1000) discount = 30
  else if (qty >= 500) discount = 22
  else if (qty >= 300) discount = 15
  else if (qty >= 200) discount = 10
  else if (qty >= 100) discount = 5

  const total = Math.round(baseUnitPrice * qty * materialMult * (1 - discount / 100) * 100) / 100
  const unit = Math.round((total / qty) * 1000) / 1000
  return { total, unit, discount: discount > 0 ? discount : undefined }
}

// Mockup sizing helpers
function getStickerStyle(shape: Shape, diameter: number, width: number, height: number, baseSize = 80) {
  const maxDim = 11
  const minScale = 0.3
  const maxScale = 1.2
  let w: number, h: number

  if (shape === 'circle') {
    const scale = minScale + (diameter / maxDim) * (maxScale - minScale)
    w = h = Math.round(baseSize * scale)
  } else if (shape === 'square') {
    const scale = minScale + (width / maxDim) * (maxScale - minScale)
    w = h = Math.round(baseSize * scale)
  } else {
    const maxSide = Math.max(width, height)
    const scale = minScale + (maxSide / maxDim) * (maxScale - minScale)
    const aspectRatio = height > 0 ? width / height : 1
    if (aspectRatio >= 1) {
      w = Math.round(baseSize * scale)
      h = Math.round((baseSize * scale) / aspectRatio)
    } else {
      h = Math.round(baseSize * scale)
      w = Math.round(baseSize * scale * aspectRatio)
    }
  }
  return { width: Math.max(24, w), height: Math.max(24, h) }
}

function getStickerBorderRadius(shape: Shape): string {
  if (shape === 'circle') return '9999px'
  return '4px'
}

interface MockupProps { previewUrl: string | null; shape: Shape; diameter: number; width: number; height: number }

const HandHeldMockup = ({ previewUrl, shape, diameter, width, height }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 90)
  const borderRadius = getStickerBorderRadius(shape)
  return (
    <div className="relative flex items-center justify-center h-44">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <svg width="110" height="90" viewBox="0 0 120 100" className="text-zinc-700">
          <path d="M60 95 C30 95 15 75 15 55 C15 40 25 30 35 25 L35 15 C35 8 40 5 45 5 L50 5 L50 20 L55 20 L55 5 L60 5 L60 20 L65 20 L65 5 L70 5 L70 20 L75 20 L75 8 C80 8 85 12 85 20 L85 30 C95 35 105 45 105 60 C105 80 90 95 60 95Z" fill="currentColor" />
        </svg>
      </div>
      <div
        className="relative z-10 border-2 border-primary/30 bg-zinc-800 overflow-hidden shadow-lg transform -rotate-6 transition-all duration-300"
        style={{ width: size.width, height: size.height, borderRadius }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Sticker" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500">Your Design</div>
        )}
      </div>
    </div>
  )
}

const SheetMockup = ({ previewUrl, shape, diameter, width, height }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 38)
  const borderRadius = getStickerBorderRadius(shape)
  return (
    <div className="relative flex items-center justify-center h-44">
      <div className="relative w-40 h-32 bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-wrap gap-1.5 h-full items-center justify-center">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0" style={{ width: size.width, height: size.height, borderRadius }}>
              {previewUrl ? <img src={previewUrl} alt="Sticker" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-200" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const RollMockup = ({ previewUrl, shape, diameter, width, height }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 22)
  const borderRadius = getStickerBorderRadius(shape)
  return (
    <div className="relative flex items-center justify-center h-44">
      <div className="relative">
        <div className="w-14 h-28 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-600 rounded-full shadow-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-zinc-800 rounded-full border-2 border-zinc-700" />
        <div className="absolute top-6 left-12 w-28 h-5 bg-white rounded-r-sm shadow-md flex items-center gap-1 px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-zinc-100 border border-zinc-200 flex-shrink-0 overflow-hidden" style={{ width: size.width, height: size.height, borderRadius }}>
              {previewUrl ? <img src={previewUrl} alt="Sticker" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-200" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const materials: { value: Material; label: string; color: string; desc: string }[] = [
  { value: 'matte', label: 'Matte', color: 'bg-gradient-to-br from-zinc-300 to-zinc-400', desc: 'Smooth, no-glare finish' },
  { value: 'gloss', label: 'Gloss', color: 'bg-gradient-to-br from-white to-zinc-200', desc: 'Shiny, vibrant colors' },
  { value: 'clear', label: 'Clear', color: 'bg-gradient-to-br from-zinc-100/50 to-zinc-300/50', desc: 'Transparent background' },
  { value: 'holographic', label: 'Holographic', color: 'bg-gradient-to-br from-pink-200 via-purple-200 to-cyan-200', desc: 'Rainbow shimmer effect' },
  { value: 'paper', label: 'Paper', color: 'bg-gradient-to-br from-amber-100 to-amber-200', desc: 'Eco-friendly, writable' },
  { value: 'embossed/UV', label: 'Embossed/UV', color: 'bg-gradient-to-br from-zinc-200 via-white to-zinc-300', desc: 'Raised texture, premium' },
]

export default function Order() {
  const { addItem } = useCart()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [designChoice, setDesignChoice] = useState<'none' | 'need' | 'have'>('none')
  const [added, setAdded] = useState(false)
  const [activeMockup, setActiveMockup] = useState<MockupType>('hand-held')

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file); setPreviewUrl(URL.createObjectURL(file))
    }
  }, [])
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file); setPreviewUrl(URL.createObjectURL(file))
    }
  }, [])

  const [shape, setShape] = useState<Shape>('die-cut')
  const sizeOptions = shape === 'rectangle' ? RECT_SIZE_OPTIONS : SQUARE_SIZE_OPTIONS
  const [selectedSize, setSelectedSize] = useState(SQUARE_SIZE_OPTIONS[0])
  const [customWidth, setCustomWidth] = useState(3)
  const [customHeight, setCustomHeight] = useState(3)
  const [useCustomSize, setUseCustomSize] = useState(false)
  const [quantity, setQuantity] = useState(50)
  const [customQuantity, setCustomQuantity] = useState('')
  const [material, setMaterial] = useState<Material>('matte')

  const handleShapeChange = (newShape: Shape) => {
    setShape(newShape)
    const newOptions = newShape === 'rectangle' ? RECT_SIZE_OPTIONS : SQUARE_SIZE_OPTIONS
    setSelectedSize(newOptions[0])
    setUseCustomSize(false)
  }

  const diameter = useCustomSize ? customWidth : selectedSize.diameter
  const width = useCustomSize ? customWidth : selectedSize.width
  const height = useCustomSize ? customHeight : selectedSize.height

  const result = useMemo(
    () => calculatePrice(shape, Math.max(0, diameter), Math.max(0, width), Math.max(0, height), quantity, material),
    [shape, diameter, width, height, quantity, material]
  )

  const tierPrices = useMemo(() =>
    QUANTITY_TIERS.map((qty) => ({
      qty,
      ...calculatePrice(shape, Math.max(0, diameter), Math.max(0, width), Math.max(0, height), qty, material),
    })),
    [shape, diameter, width, height, material]
  )

  const handleAddToCart = () => {
    if (!result.total) return
    addItem({
      id: `sticker-${shape}-${diameter}-${material}-${quantity}-${Date.now()}`,
      name: 'Custom Stickers',
      size: shape === 'circle' ? `${shape} ${diameter}"` : `${shape} ${width}" x ${height}"`,
      option: `${quantity} pcs · ${material}`,
      price: result.total,
      quantity: 1,
      material,
      shape,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const mockupTabs = [
    { id: 'hand-held' as MockupType, label: 'Hand-held', icon: Hand },
    { id: 'sheet' as MockupType, label: 'Sheet', icon: Layers },
    { id: 'roll' as MockupType, label: 'Roll', icon: ScrollText },
  ]

  return (
    <div className="min-h-screen bg-background py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Print customized stickers</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
            Choose your desired cutline, size, quantity and material. Upload your design and go to checkout.
          </p>
        </header>

        {/* 4-Column Configurator */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Shape */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">Shape</h3>
            <div className="space-y-2">
              {([
                { label: 'Square', value: 'square' as Shape, icon: '□' },
                { label: 'Circle', value: 'circle' as Shape, icon: '○' },
                { label: 'Rectangle', value: 'rectangle' as Shape, icon: '▢' },
                { label: 'Die Cut', value: 'die-cut' as Shape, icon: '◇' },
                { label: 'Kiss Cut', value: 'kiss-cut' as Shape, icon: '◇' },
              ]).map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleShapeChange(s.value)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left cursor-pointer ${
                    shape === s.value
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20'
                  }`}
                >
                  <span className="text-lg opacity-60">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">Material</h3>
            <div className="grid grid-cols-2 gap-2">
              {materials.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMaterial(m.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors cursor-pointer ${
                    material === m.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-foreground/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${m.color} border border-border shadow-inner`} />
                  <span className={`text-xs font-medium ${material === m.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {m.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">Size, inch (WxH)</h3>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {sizeOptions.map((size) => (
                <button
                  key={size.label}
                  onClick={() => { setSelectedSize(size); setUseCustomSize(false) }}
                  className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left cursor-pointer ${
                    !useCustomSize && selectedSize.label === size.label
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20'
                  }`}
                >
                  {size.label}
                </button>
              ))}
              <div className={`rounded-lg border p-3 transition-colors ${useCustomSize ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                <button
                  onClick={() => setUseCustomSize(true)}
                  className={`w-full text-left text-sm font-medium mb-2 cursor-pointer ${useCustomSize ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  Custom size
                </button>
                {useCustomSize && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Width</label>
                      <input type="number" min={0.5} step={0.5} value={customWidth}
                        onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 1)}
                        className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Height</label>
                      <input type="number" min={0.5} step={0.5} value={customHeight}
                        onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 1)}
                        className="mt-1 w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-3">Quantity</h3>
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {tierPrices.map(({ qty, total, discount }) => (
                <button
                  key={qty}
                  onClick={() => { setQuantity(qty); setCustomQuantity('') }}
                  className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors cursor-pointer ${
                    quantity === qty && !customQuantity
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-foreground/20'
                  }`}
                >
                  <span className={`font-medium ${quantity === qty && !customQuantity ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {qty} pcs
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${quantity === qty && !customQuantity ? 'text-primary-foreground' : 'text-foreground'}`}>
                      ${total?.toFixed(0) ?? '—'}
                    </span>
                    {discount && (
                      <span className={`text-xs font-medium ${quantity === qty && !customQuantity ? 'text-primary-foreground/80' : 'text-green-500'}`}>
                        -{discount}%
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground text-center mb-2">Custom quantity</p>
              <div className="flex items-center gap-3">
                <input type="number" min={1} placeholder="Enter qty" value={customQuantity}
                  onChange={(e) => {
                    setCustomQuantity(e.target.value)
                    const num = parseInt(e.target.value, 10)
                    if (!isNaN(num) && num > 0) setQuantity(num)
                  }}
                  className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                />
                <span className="text-sm font-semibold text-foreground min-w-[60px] text-right">
                  ${result.total?.toFixed(0) ?? '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Three Columns: Artwork, Mockup, Summary */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Artwork */}
          <div
            className={`flex flex-col justify-center rounded-2xl border bg-card p-6 text-center transition-colors min-h-[280px] ${
              isDragging && designChoice === 'have' ? 'border-primary ring-2 ring-primary/20' : 'border-border'
            }`}
            onDragOver={designChoice === 'have' ? handleDragOver : undefined}
            onDragLeave={designChoice === 'have' ? handleDragLeave : undefined}
            onDrop={designChoice === 'have' ? handleDrop : undefined}
          >
            {designChoice === 'none' && (
              <div className="flex flex-col items-center gap-5">
                <div>
                  <p className="text-sm font-medium text-foreground">Do you have artwork ready?</p>
                  <p className="mt-1 text-xs text-muted-foreground">Let us know so we can help you best</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[200px]">
                  <button onClick={() => setDesignChoice('need')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <Paintbrush className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">I need a design</span>
                  </button>
                  <button onClick={() => setDesignChoice('have')} className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">I have a design</span>
                  </button>
                </div>
              </div>
            )}

            {designChoice === 'need' && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Paintbrush className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">We can help with that!</p>
                  <p className="mt-1 text-xs text-muted-foreground">Describe your vision in the notes. Our team will create a design proof for you.</p>
                </div>
                <button onClick={() => setDesignChoice('none')} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <ArrowLeft className="h-3 w-3" /> Go back
                </button>
              </div>
            )}

            {designChoice === 'have' && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drag & drop your artwork</p>
                  <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF, or SVG</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <span>Upload file</span>
                    <input type="file" accept="image/*,.pdf,.svg" className="hidden" onChange={handleFileSelect} />
                  </label>
                  {uploadedFile && (
                    <button onClick={() => { setUploadedFile(null); setPreviewUrl(null) }} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                      <X className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
                {uploadedFile && (
                  <p className="text-[10px] text-muted-foreground"><span className="font-medium text-foreground">{uploadedFile.name}</span></p>
                )}
                <button onClick={() => { setDesignChoice('none'); setUploadedFile(null); setPreviewUrl(null) }} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <ArrowLeft className="h-3 w-3" /> Go back
                </button>
              </div>
            )}
          </div>

          {/* Mockup Preview */}
          <div className="rounded-2xl border border-border bg-card p-4 min-h-[280px] flex flex-col">
            <div className="flex justify-center gap-1 mb-3">
              {mockupTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMockup(tab.id)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
                    activeMockup === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-muted/50 border border-border flex-1 flex items-center justify-center">
              {activeMockup === 'hand-held' && <HandHeldMockup previewUrl={previewUrl} shape={shape} diameter={diameter} width={width} height={height} />}
              {activeMockup === 'sheet' && <SheetMockup previewUrl={previewUrl} shape={shape} diameter={diameter} width={width} height={height} />}
              {activeMockup === 'roll' && <RollMockup previewUrl={previewUrl} shape={shape} diameter={diameter} width={width} height={height} />}
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              {previewUrl ? 'Your design preview' : 'Upload artwork to preview'}
            </p>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 rounded-2xl border border-border bg-card p-5 min-h-[280px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center">Order Summary</p>

            <div className="space-y-1.5 text-center">
              <p className="text-base font-medium text-foreground">{quantity.toLocaleString()} stickers</p>
              <p className="text-xs text-muted-foreground">
                <span className="capitalize">{shape}</span>
                {shape === 'circle' && ` · ${diameter}"`}
                {shape === 'square' && ` · ${width}" × ${width}"`}
                {(shape === 'rectangle' || shape === 'die-cut' || shape === 'kiss-cut') && ` · ${width}" × ${height}"`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {materials.find((m) => m.value === material)?.label}
              </p>
            </div>

            <div className="h-px bg-border" />

            {result.total != null ? (
              <div className="space-y-1 text-center">
                <p className="text-[10px] text-primary">Total</p>
                <p className="text-3xl font-bold text-foreground">
                  ${result.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-[10px] text-primary">≈ ${result.unit?.toFixed(3)}/ea</p>
                  {result.discount && <span className="text-[10px] font-medium text-green-500">{result.discount}% off</span>}
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <p className="text-xs text-amber-500 font-medium">Custom quote needed</p>
                <p className="text-[10px] text-muted-foreground">{result.reason}</p>
              </div>
            )}

            <div className="h-px bg-border" />

            {result.total != null ? (
              <button
                onClick={handleAddToCart}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? 'Added!' : 'Add to Cart'}
              </button>
            ) : (
              <a href="/contact" className="w-full inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Request Custom Quote →
              </a>
            )}

            <p className="text-[10px] text-muted-foreground text-center">
              Digital proof within 24 hours. Nothing prints until you approve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
