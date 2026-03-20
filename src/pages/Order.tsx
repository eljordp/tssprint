import { useState, useMemo, useCallback } from 'react'
import { Upload, X, Hand, Layers, ScrollText, ShoppingCart, Laptop, GlassWater, ChevronRight, ChevronLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const QUANTITY_TIERS = [50, 100, 200, 300, 500, 1000] as const
type QuantityTier = (typeof QUANTITY_TIERS)[number]
type Shape = 'circle' | 'square' | 'rectangle' | 'die-cut' | 'kiss-cut'
type Material = 'matte' | 'gloss' | 'clear' | 'holographic' | 'paper' | 'embossed/UV'
type MockupType = 'hand-held' | 'sheet' | 'roll' | 'laptop' | 'bottle'

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

const CIRCLE_SIZE_OPTIONS = [
  { label: '1" diameter', diameter: 1, width: 1, height: 1 },
  { label: '2" diameter', diameter: 2, width: 2, height: 2 },
  { label: '3" diameter', diameter: 3, width: 3, height: 3 },
  { label: '4" diameter', diameter: 4, width: 4, height: 4 },
  { label: '5" diameter', diameter: 5, width: 5, height: 5 },
  { label: '6" diameter', diameter: 6, width: 6, height: 6 },
  { label: '7" diameter', diameter: 7, width: 7, height: 7 },
  { label: '8" diameter', diameter: 8, width: 8, height: 8 },
  { label: '9" diameter', diameter: 9, width: 9, height: 9 },
]

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

// Material overlay component
function MaterialOverlay({ material }: { material: Material }) {
  if (material === 'paper') return null

  if (material === 'gloss') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)',
          borderRadius: 'inherit',
        }}
      />
    )
  }

  if (material === 'holographic') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,100,200,0.2), rgba(100,200,255,0.2), rgba(100,255,150,0.2), rgba(255,200,100,0.2))',
          backgroundSize: '200% 200%',
          animation: 'holoShift 3s ease-in-out infinite',
          borderRadius: 'inherit',
        }}
      />
    )
  }

  if (material === 'clear') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-conic-gradient(rgba(200,200,200,0.15) 0% 25%, transparent 0% 50%)',
          backgroundSize: '12px 12px',
          borderRadius: 'inherit',
        }}
      />
    )
  }

  if (material === 'matte') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'rgba(0,0,0,0.12)',
          borderRadius: 'inherit',
        }}
      />
    )
  }

  if (material === 'embossed/UV') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          boxShadow: 'inset 0 0 8px rgba(255,255,255,0.4)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.08) 100%)',
          borderRadius: 'inherit',
        }}
      />
    )
  }

  return null
}

interface MockupProps {
  previewUrl: string | null
  shape: Shape
  diameter: number
  width: number
  height: number
  material: Material
}

const StickerWithOverlay = ({
  previewUrl,
  shape,
  material,
  style,
  className = '',
  placeholderText = 'Your Design',
}: {
  previewUrl: string | null
  shape: Shape
  material: Material
  style: React.CSSProperties
  className?: string
  placeholderText?: string
}) => {
  const borderRadius = getStickerBorderRadius(shape)
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ ...style, borderRadius }}
    >
      <MaterialOverlay material={material} />
      {previewUrl ? (
        <img src={previewUrl} alt="Sticker" className="w-full h-full object-cover relative z-[1]" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 bg-zinc-800 relative z-[1]">
          {placeholderText}
        </div>
      )}
    </div>
  )
}

const HandHeldMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 220)
  return (
    <div className="relative flex items-center justify-center min-h-[350px]">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <svg width="220" height="180" viewBox="0 0 120 100" className="text-zinc-700">
          <path d="M60 95 C30 95 15 75 15 55 C15 40 25 30 35 25 L35 15 C35 8 40 5 45 5 L50 5 L50 20 L55 20 L55 5 L60 5 L60 20 L65 20 L65 5 L70 5 L70 20 L75 20 L75 8 C80 8 85 12 85 20 L85 30 C95 35 105 45 105 60 C105 80 90 95 60 95Z" fill="currentColor" />
        </svg>
      </div>
      <StickerWithOverlay
        previewUrl={previewUrl}
        shape={shape}
        material={material}
        className="border-2 border-primary/30 shadow-lg transform -rotate-6 transition-all duration-300 z-10"
        style={{ width: size.width, height: size.height }}
      />
    </div>
  )
}

const SheetMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 75)
  const borderRadius = getStickerBorderRadius(shape)
  return (
    <div className="relative flex items-center justify-center min-h-[350px]">
      <div className="relative w-80 h-64 bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-wrap gap-2 h-full items-center justify-center">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden flex-shrink-0 bg-zinc-100 border border-zinc-200" style={{ width: size.width, height: size.height, borderRadius }}>
              <MaterialOverlay material={material} />
              {previewUrl ? <img src={previewUrl} alt="Sticker" className="w-full h-full object-cover relative z-[1]" /> : <div className="w-full h-full bg-zinc-200 relative z-[1]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const RollMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 45)
  const borderRadius = getStickerBorderRadius(shape)
  return (
    <div className="relative flex items-center justify-center min-h-[350px]">
      <div className="relative scale-150">
        <div className="w-14 h-28 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-600 rounded-full shadow-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-zinc-800 rounded-full border-2 border-zinc-700" />
        <div className="absolute top-6 left-12 w-36 h-7 bg-white rounded-r-sm shadow-md flex items-center gap-1.5 px-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden flex-shrink-0 bg-zinc-100 border border-zinc-200" style={{ width: size.width, height: size.height, borderRadius }}>
              <MaterialOverlay material={material} />
              {previewUrl ? <img src={previewUrl} alt="Sticker" className="w-full h-full object-cover relative z-[1]" /> : <div className="w-full h-full bg-zinc-200 relative z-[1]" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const LaptopMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 120)
  return (
    <div className="relative flex items-center justify-center min-h-[350px]">
      <div className="relative">
        {/* Laptop lid */}
        <div className="w-72 h-48 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-t-xl border border-zinc-500 flex items-center justify-center">
          <StickerWithOverlay
            previewUrl={previewUrl}
            shape={shape}
            material={material}
            className="shadow-md"
            style={{ width: size.width, height: size.height }}
          />
        </div>
        {/* Laptop base */}
        <div className="w-80 h-3 bg-gradient-to-b from-zinc-500 to-zinc-600 rounded-b-lg -ml-4 border-t border-zinc-400" />
        <div className="w-20 h-1 bg-zinc-500 rounded-full mx-auto mt-0.5" />
      </div>
    </div>
  )
}

const BottleMockup = ({ previewUrl, shape, diameter, width, height, material }: MockupProps) => {
  const size = getStickerStyle(shape, diameter, width, height, 100)
  return (
    <div className="relative flex items-center justify-center min-h-[350px]">
      <div className="relative flex flex-col items-center">
        {/* Cap */}
        <div className="w-10 h-5 bg-gradient-to-b from-zinc-400 to-zinc-500 rounded-t-lg border border-zinc-400" />
        {/* Neck */}
        <div className="w-12 h-4 bg-gradient-to-b from-zinc-500 to-zinc-600 border-x border-zinc-400" />
        {/* Body */}
        <div className="w-28 h-56 bg-gradient-to-b from-zinc-600 via-zinc-500 to-zinc-600 rounded-b-2xl border border-zinc-400 flex items-center justify-center relative">
          <StickerWithOverlay
            previewUrl={previewUrl}
            shape={shape}
            material={material}
            className="shadow-md"
            style={{ width: Math.min(size.width, 90), height: Math.min(size.height, 90) }}
          />
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

const STEPS = [
  { num: 1, label: 'Configure' },
  { num: 2, label: 'Upload' },
  { num: 3, label: 'Review' },
]

export default function Order() {
  const { addItem } = useCart()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeMockup, setActiveMockup] = useState<MockupType>('hand-held')
  const [currentStep, setCurrentStep] = useState(1)
  const [mobileStep, setMobileStep] = useState(1) // 1: Shape+Size, 2: Material+Qty, 3: Upload+Preview

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file); setPreviewUrl(URL.createObjectURL(file)); setCurrentStep(3)
    }
  }, [])
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file); setPreviewUrl(URL.createObjectURL(file)); setCurrentStep(3)
    }
  }, [])

  const [shape, setShape] = useState<Shape>('die-cut')
  const sizeOptions = useMemo(() => {
    if (shape === 'circle') return CIRCLE_SIZE_OPTIONS
    if (shape === 'rectangle') return RECT_SIZE_OPTIONS
    return SQUARE_SIZE_OPTIONS
  }, [shape])
  const [selectedSize, setSelectedSize] = useState(SQUARE_SIZE_OPTIONS[0])
  const [customWidth, setCustomWidth] = useState(3)
  const [customHeight, setCustomHeight] = useState(3)
  const [useCustomSize, setUseCustomSize] = useState(false)
  const [quantity, setQuantity] = useState(50)
  const [customQuantity, setCustomQuantity] = useState('')
  const [material, setMaterial] = useState<Material>('matte')

  const handleShapeChange = (newShape: Shape) => {
    setShape(newShape)
    const newOptions = newShape === 'circle' ? CIRCLE_SIZE_OPTIONS : newShape === 'rectangle' ? RECT_SIZE_OPTIONS : SQUARE_SIZE_OPTIONS
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

  const configSummary = useMemo(() => {
    const shapeName = shape.charAt(0).toUpperCase() + shape.slice(1)
    const sizeStr = shape === 'circle' ? `${diameter}"` : `${width}" x ${height}"`
    const matName = materials.find((m) => m.value === material)?.label ?? material
    return `${shapeName} · ${sizeStr} · ${matName} · ${quantity} pcs`
  }, [shape, diameter, width, height, material, quantity])

  const mockupTabs = [
    { id: 'hand-held' as MockupType, label: 'Hand-held', icon: Hand },
    { id: 'sheet' as MockupType, label: 'Sheet', icon: Layers },
    { id: 'roll' as MockupType, label: 'Roll', icon: ScrollText },
    { id: 'laptop' as MockupType, label: 'Laptop', icon: Laptop },
    { id: 'bottle' as MockupType, label: 'Bottle', icon: GlassWater },
  ]

  const mockupProps: MockupProps = { previewUrl, shape, diameter, width, height, material }

  return (
    <>
      {/* Holographic animation keyframes */}
      <style>{`
        @keyframes holoShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="min-h-screen bg-background pb-28 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Print customized stickers</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
              Choose your shape, size, material, and quantity. Upload your design and add to cart.
            </p>
          </header>

          {/* Step Progress Bar — desktop only */}
          <div className="hidden lg:flex items-center gap-2 mb-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    currentStep === step.num
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > step.num
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-current/20">
                    {step.num}
                  </span>
                  {step.label}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-px ${currentStep > step.num ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Step Navigation */}
          <div className="lg:hidden mb-4">
            <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
              <button
                onClick={() => setMobileStep(Math.max(1, mobileStep - 1))}
                disabled={mobileStep === 1}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <button key={s} onClick={() => setMobileStep(s)} className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${mobileStep === s ? 'bg-primary' : 'bg-border'}`} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                {result.total != null && <span className="text-sm font-bold text-foreground">${result.total.toFixed(0)}</span>}
                {mobileStep < 3 ? (
                  <button
                    onClick={() => setMobileStep(mobileStep + 1)}
                    className="flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!result.total}
                    className="flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {added ? 'Added!' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              {mobileStep === 1 ? 'Step 1: Shape & Size' : mobileStep === 2 ? 'Step 2: Material & Quantity' : 'Step 3: Upload & Review'}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT COLUMN — Configurator (~45%) */}
            <div className="w-full lg:w-[45%] space-y-6">
              {/* Shape Selector — mobile step 1, always on desktop */}
              <div className={`${mobileStep !== 1 ? 'hidden lg:block' : ''}`}>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Shape</h3>
                <div className="grid grid-cols-5 gap-2">
                  {([
                    { label: 'Square', value: 'square' as Shape, icon: '□' },
                    { label: 'Circle', value: 'circle' as Shape, icon: '○' },
                    { label: 'Rectangle', value: 'rectangle' as Shape, icon: '▭' },
                    { label: 'Die Cut', value: 'die-cut' as Shape, icon: '✂' },
                    { label: 'Kiss Cut', value: 'kiss-cut' as Shape, icon: '▢' },
                  ]).map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { handleShapeChange(s.value); setCurrentStep(1) }}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all cursor-pointer ${
                        shape === s.value
                          ? 'border-primary bg-primary/10 text-foreground shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20'
                      }`}
                    >
                      <span className="text-xl">{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Selector — mobile step 2, always on desktop */}
              <div className={`${mobileStep !== 2 ? 'hidden lg:block' : ''}`}>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Material</h3>
                {/* Desktop: 3x2 grid, Mobile: horizontal scroll */}
                <div className="hidden sm:grid grid-cols-3 gap-2">
                  {materials.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => { setMaterial(m.value); setCurrentStep(1) }}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                        material === m.value
                          ? 'border-primary bg-primary/10 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
                          : 'border-border bg-card hover:border-foreground/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${m.color} border border-border shadow-inner flex-shrink-0`} />
                      <div className="text-left min-w-0">
                        <span className={`text-xs font-medium block ${material === m.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {m.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight block truncate">{m.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Mobile: horizontal scroll */}
                <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                  {materials.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => { setMaterial(m.value); setCurrentStep(1) }}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all cursor-pointer flex-shrink-0 w-24 ${
                        material === m.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-foreground/20'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${m.color} border border-border shadow-inner`} />
                      <span className={`text-[10px] font-medium ${material === m.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector — mobile step 1, always on desktop */}
              <div className={`${mobileStep !== 1 ? 'hidden lg:block' : ''}`}>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Size {shape === 'circle' ? '(diameter)' : '(W x H)'}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size.label}
                      onClick={() => { setSelectedSize(size); setUseCustomSize(false); setCurrentStep(1) }}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                        !useCustomSize && selectedSize.label === size.label
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                {/* Custom size */}
                <div className={`mt-2 rounded-xl border p-3 transition-all ${useCustomSize ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                  <button
                    onClick={() => { setUseCustomSize(true); setCurrentStep(1) }}
                    className={`w-full text-left text-xs font-medium cursor-pointer ${useCustomSize ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    Custom size
                  </button>
                  {useCustomSize && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Width (in)</label>
                        <input type="number" min={0.5} step={0.5} value={customWidth}
                          onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 1)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Height (in)</label>
                        <input type="number" min={0.5} step={0.5} value={customHeight}
                          onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 1)}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity Selector — mobile step 2, always on desktop */}
              <div className={`${mobileStep !== 2 ? 'hidden lg:block' : ''}`}>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Quantity</h3>
                <div className="grid grid-cols-3 gap-2">
                  {tierPrices.map(({ qty, total, discount }) => (
                    <button
                      key={qty}
                      onClick={() => { setQuantity(qty); setCustomQuantity(''); setCurrentStep(1) }}
                      className={`flex flex-col items-center rounded-xl border px-3 py-3 text-xs transition-all cursor-pointer ${
                        quantity === qty && !customQuantity
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:border-foreground/20'
                      }`}
                    >
                      <span className={`font-bold text-sm ${quantity === qty && !customQuantity ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {qty}
                      </span>
                      <span className={`font-semibold ${quantity === qty && !customQuantity ? 'text-primary-foreground' : 'text-foreground'}`}>
                        ${total?.toFixed(0) ?? '---'}
                      </span>
                      {discount ? (
                        <span className={`text-[10px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-full ${
                          quantity === qty && !customQuantity
                            ? 'bg-white/20 text-primary-foreground'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          -{discount}%
                        </span>
                      ) : (
                        <span className="text-[10px] mt-0.5 px-1.5 py-0.5">&nbsp;</span>
                      )}
                    </button>
                  ))}
                </div>
                {/* Custom quantity */}
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-card border border-border p-3">
                  <input type="number" min={1} placeholder="Custom qty" value={customQuantity}
                    onChange={(e) => {
                      setCustomQuantity(e.target.value)
                      const num = parseInt(e.target.value, 10)
                      if (!isNaN(num) && num > 0) { setQuantity(num); setCurrentStep(1) }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                  <span className="text-sm font-semibold text-foreground min-w-[60px] text-right">
                    ${result.total?.toFixed(0) ?? '---'}
                  </span>
                </div>
              </div>

              {/* Upload Area — mobile step 3, always on desktop */}
              <div className={`${mobileStep !== 3 ? 'hidden lg:block' : ''}`}>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">Upload Artwork</h3>
                <div
                  className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : uploadedFile
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-card hover:border-foreground/20'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{uploadedFile.name}</span>
                        <button
                          onClick={() => { setUploadedFile(null); setPreviewUrl(null); setCurrentStep(2) }}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Drag & drop or click to upload</p>
                        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF, SVG</p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Choose file</span>
                        <input type="file" accept="image/*,.pdf,.svg" className="hidden" onChange={handleFileSelect} />
                      </label>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground text-center">
                  Need design help? <a href="/contact" className="text-primary hover:underline">Contact us</a>
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN — Preview + Summary (~55%, sticky). Hidden on mobile until step 3. */}
            <div className={`w-full lg:w-[55%] ${mobileStep !== 3 ? 'hidden lg:block' : ''}`}>
              <div className="lg:sticky lg:top-8 space-y-4">
                {/* Mockup Preview */}
                <div className="rounded-2xl border border-border bg-card p-4">
                  {/* Mockup Tabs */}
                  <div className="flex justify-center gap-1 mb-3 flex-wrap">
                    {mockupTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveMockup(tab.id)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
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

                  {/* Mockup Area */}
                  <div className="rounded-xl bg-muted/50 border border-border min-h-[400px] flex items-center justify-center">
                    {activeMockup === 'hand-held' && <HandHeldMockup {...mockupProps} />}
                    {activeMockup === 'sheet' && <SheetMockup {...mockupProps} />}
                    {activeMockup === 'roll' && <RollMockup {...mockupProps} />}
                    {activeMockup === 'laptop' && <LaptopMockup {...mockupProps} />}
                    {activeMockup === 'bottle' && <BottleMockup {...mockupProps} />}
                  </div>

                  {/* Config summary below mockup */}
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    {configSummary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Order Bar — desktop only, mobile uses the step nav */}
        <div className="hidden lg:block sticky bottom-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            {result.total != null ? (
              <div className="flex items-center justify-between gap-4">
                {/* Specs */}
                <div className="hidden sm:block text-xs text-muted-foreground min-w-0">
                  <span className="font-medium text-foreground">{quantity.toLocaleString()}</span> pcs
                  {' · '}
                  <span className="capitalize">{shape}</span>
                  {' · '}
                  {shape === 'circle' ? `${diameter}"` : `${width}" x ${height}"`}
                  {' · '}
                  {materials.find((m) => m.value === material)?.label}
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground leading-none">
                      ${result.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">${result.unit?.toFixed(3)}/ea</span>
                      {result.discount && (
                        <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                          -{result.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-glow"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {added ? 'Added!' : 'Add to Cart'}
                  </button>
                  <p className="text-[9px] text-muted-foreground mt-1 hidden sm:block">
                    Digital proof within 24 hours
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  <span className="text-amber-500 font-medium">Custom quote needed</span>
                  <span className="hidden sm:inline"> · {result.reason}</span>
                </div>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  Request Quote
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
