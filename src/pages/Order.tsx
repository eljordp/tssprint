import { useState, useMemo, useCallback } from 'react'
import { Upload, X, Hand, Layers, Paintbrush, FileCheck, ArrowLeft, ShoppingCart, Laptop, GlassWater } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const QUANTITY_TIERS = [50, 100, 200, 300, 500, 1000] as const
type QuantityTier = (typeof QUANTITY_TIERS)[number]
type Shape = 'circle' | 'square' | 'rectangle' | 'die-cut' | 'kiss-cut'
type Material = 'matte' | 'gloss' | 'clear' | 'holographic' | 'paper' | 'embossed/UV'
type MockupType = 'hand-held' | 'sheet' | 'laptop' | 'bottle'

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
  { label: '3" x 1"', diameter: 3, width: 3, height: 1 },
  { label: '4" x 2"', diameter: 4, width: 4, height: 2 },
  { label: '5" x 2"', diameter: 5, width: 5, height: 2 },
  { label: '5" x 3"', diameter: 5, width: 5, height: 3 },
  { label: '6" x 3"', diameter: 6, width: 6, height: 3 },
  { label: '7" x 4"', diameter: 7, width: 7, height: 4 },
  { label: '8" x 3"', diameter: 8, width: 8, height: 3 },
  { label: '9" x 4"', diameter: 9, width: 9, height: 4 },
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

// Material effect overlay component
function MaterialOverlay({ material }: { material: Material }) {
  if (material === 'gloss') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10" style={{ borderRadius: 'inherit' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" style={{ borderRadius: 'inherit' }} />
        <div className="absolute top-[15%] left-[10%] w-[30%] h-[8%] bg-white/30 rounded-full blur-sm rotate-[-20deg]" />
      </div>
    )
  }
  if (material === 'holographic') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" style={{ borderRadius: 'inherit' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/25 via-purple-400/20 to-cyan-400/25 animate-pulse" style={{ borderRadius: 'inherit', animationDuration: '3s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)]" style={{ borderRadius: 'inherit' }} />
      </div>
    )
  }
  if (material === 'clear') {
    return (
      <div className="absolute inset-[-4px] pointer-events-none z-[-1]">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-conic-gradient(#e4e4e7 0% 25%, #f4f4f5 0% 50%)',
          backgroundSize: '12px 12px',
          borderRadius: 'inherit',
        }} />
      </div>
    )
  }
  if (material === 'embossed/UV') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10" style={{ borderRadius: 'inherit' }}>
        <div className="absolute inset-0 border-2 border-white/20" style={{ borderRadius: 'inherit' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10" style={{ borderRadius: 'inherit' }} />
      </div>
    )
  }
  if (material === 'matte') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10" style={{ borderRadius: 'inherit' }}>
        <div className="absolute inset-0 bg-zinc-900/10" style={{ borderRadius: 'inherit' }} />
      </div>
    )
  }
  return null
}

// Sticker element with material effect
function StickerPreview({ previewUrl, shape, material, style, className = '' }: {
  previewUrl: string | null; shape: Shape; material: Material
  style: React.CSSProperties; className?: string
}) {
  const borderRadius = getStickerBorderRadius(shape)
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ ...style, borderRadius }}>
      {previewUrl ? (
        <img src={previewUrl} alt="Sticker" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-xs">Your Design</div>
      )}
      <MaterialOverlay material={material} />
    </div>
  )
}

interface MockupProps { previewUrl: string | null; shape: Shape; diameter: number; width: number; height: number; material: Material }

const HandHeldMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 140)
  return (
    <div className="relative flex items-center justify-center h-72">
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <svg width="160" height="130" viewBox="0 0 120 100" className="text-zinc-700">
          <path d="M60 95 C30 95 15 75 15 55 C15 40 25 30 35 25 L35 15 C35 8 40 5 45 5 L50 5 L50 20 L55 20 L55 5 L60 5 L60 20 L65 20 L65 5 L70 5 L70 20 L75 20 L75 8 C80 8 85 12 85 20 L85 30 C95 35 105 45 105 60 C105 80 90 95 60 95Z" fill="currentColor" />
        </svg>
      </div>
      <StickerPreview
        previewUrl={previewUrl} shape={shape} material={material}
        className="relative z-10 border-2 border-primary/30 shadow-xl transform -rotate-6 transition-all duration-300"
        style={{ width: size.width, height: size.height }}
      />
    </div>
  )
}

const SheetMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 56)
  return (
    <div className="relative flex items-center justify-center h-72">
      <div className="relative w-64 h-52 bg-white rounded-xl shadow-xl p-4">
        <div className="flex flex-wrap gap-2.5 h-full items-center justify-center">
          {Array.from({ length: 9 }).map((_, i) => (
            <StickerPreview key={i} previewUrl={previewUrl} shape={shape} material={material}
              className="border border-zinc-200 flex-shrink-0"
              style={{ width: size.width, height: size.height }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const LaptopMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 80)
  return (
    <div className="relative flex items-center justify-center h-72">
      {/* Laptop lid */}
      <div className="relative">
        <div className="w-72 h-48 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-t-xl border-2 border-zinc-500 flex items-center justify-center shadow-xl">
          {/* Screen area */}
          <div className="w-64 h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
            {/* Sticker on the laptop lid (outside) - positioned off-center for realism */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-3">
              <StickerPreview previewUrl={previewUrl} shape={shape} material={material}
                className="shadow-lg"
                style={{ width: size.width, height: size.height }}
              />
            </div>
          </div>
        </div>
        {/* Laptop base */}
        <div className="w-80 h-3 bg-gradient-to-b from-zinc-500 to-zinc-600 rounded-b-lg mx-auto border-t border-zinc-400 shadow-md" />
        <div className="w-20 h-1 bg-zinc-500 rounded-b-sm mx-auto" />
      </div>
    </div>
  )
}

const BottleMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 70)
  return (
    <div className="relative flex items-center justify-center h-72">
      <div className="relative">
        {/* Bottle cap */}
        <div className="w-10 h-6 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-t-lg mx-auto border border-zinc-400" />
        {/* Bottle neck */}
        <div className="w-12 h-8 bg-gradient-to-b from-zinc-300/80 to-zinc-200/60 mx-auto" />
        {/* Bottle body */}
        <div className="w-28 h-44 bg-gradient-to-r from-zinc-300/40 via-zinc-100/60 to-zinc-300/40 rounded-b-2xl rounded-t-lg relative overflow-visible shadow-xl border border-zinc-300/30">
          {/* Water line */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-cyan-400/20 to-transparent rounded-b-2xl" />
          {/* Sticker on bottle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <StickerPreview previewUrl={previewUrl} shape={shape} material={material}
              className="shadow-md"
              style={{ width: size.width, height: size.height }}
            />
          </div>
          {/* Glass reflection */}
          <div className="absolute top-0 left-2 w-3 h-full bg-white/20 rounded-full blur-sm" />
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
    { id: 'laptop' as MockupType, label: 'Laptop', icon: Laptop },
    { id: 'bottle' as MockupType, label: 'Bottle', icon: GlassWater },
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
                { label: 'Rectangle', value: 'rectangle' as Shape, icon: '▭' },
                { label: 'Die Cut', value: 'die-cut' as Shape, icon: '◇' },
                { label: 'Kiss Cut', value: 'kiss-cut' as Shape, icon: '□' },
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

        {/* Upload + Preview (hero section) */}
        <div className="grid gap-6 lg:grid-cols-5 mb-8">
          {/* Artwork Upload — compact left column */}
          <div
            className={`lg:col-span-2 flex flex-col justify-center rounded-2xl border bg-card p-6 text-center transition-colors ${
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

            {/* Material badge */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-2">Selected finish</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                <div className={`w-4 h-4 rounded-full ${materials.find(m => m.value === material)?.color} border border-border`} />
                <span className="text-xs font-medium text-foreground capitalize">{material}</span>
              </div>
            </div>
          </div>

          {/* Mockup Preview — large center/right area */}
          <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-foreground">Preview — what you'll get</p>
              <div className="flex gap-1">
                {mockupTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMockup(tab.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      activeMockup === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-muted/30 border border-border flex-1 flex items-center justify-center min-h-[320px]">
              {activeMockup === 'hand-held' && <HandHeldMockup previewUrl={previewUrl} shape={shape} diameter={diameter} width={width} height={height} material={material} />}
              {activeMockup === 'sheet' && <SheetMockup previewUrl={previewUrl} shape={shape} diameter={diameter} width={width} height={height} material={material} />}
              {activeMockup === 'laptop' && <LaptopMockup previewUrl={previewUrl} shape={shape} diameter={diameter} width={width} height={height} material={material} />}
              {activeMockup === 'bottle' && <BottleMockup previewUrl={previewUrl} shape={shape} diameter={diameter} width={width} height={height} material={material} />}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {previewUrl ? `${materials.find(m => m.value === material)?.label} finish · ${shape} · ${width}" × ${height}"` : 'Upload artwork to see your sticker in action'}
              </p>
              {previewUrl && (
                <p className="text-[10px] text-primary font-medium">Real-time preview</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Bar */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Quantity</p>
                <p className="text-lg font-bold text-foreground">{quantity.toLocaleString()}</p>
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Specs</p>
                <p className="text-sm font-medium text-foreground">
                  <span className="capitalize">{shape}</span>
                  {shape === 'circle' && ` · ${diameter}"`}
                  {shape === 'square' && ` · ${width}" × ${width}"`}
                  {(shape === 'rectangle' || shape === 'die-cut' || shape === 'kiss-cut') && ` · ${width}" × ${height}"`}
                  {' · '}{materials.find((m) => m.value === material)?.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              {result.total != null ? (
                <>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-foreground">
                        ${result.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      {result.discount && <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">-{result.discount}%</span>}
                    </div>
                    <p className="text-[10px] text-primary">≈ ${result.unit?.toFixed(3)}/ea</p>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {added ? 'Added!' : 'Add to Cart'}
                  </button>
                </>
              ) : (
                <>
                  <div className="text-right">
                    <p className="text-sm text-amber-500 font-medium">Custom quote needed</p>
                    <p className="text-[10px] text-muted-foreground">{result.reason}</p>
                  </div>
                  <a href="/contact" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
                    Request Quote →
                  </a>
                </>
              )}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            Digital proof within 24 hours. Nothing prints until you approve.
          </p>
        </div>
      </div>
    </div>
  )
}
