import { useEffect, useMemo, useState, useCallback } from 'react'
import { Upload, X, Package, Sparkles, Box } from 'lucide-react'
import AddToCartButton from '@/components/cart/AddToCartButton'

type Tier = { min: number; max: number | null; regular: number; holo: number }
type TieredProduct = {
  id: 'eighth' | 'qtr' | 'ounce' | 'half' | 'pound' | 'jar'
  label: string
  shortLabel: string
  type: 'tiered'
  tiers: Tier[]
  mockupScale: number
}
type MylarProduct = TieredProduct
type MylarProductId = MylarProduct['id']
type MockupType = 'pouch' | 'foil' | 'jar'

const mylarProducts: MylarProduct[] = [
  {
    id: 'eighth', label: 'Custom Mylar 8ths (3" × 5")', shortLabel: '8ths (3×5)', type: 'tiered', mockupScale: 0.6,
    tiers: [
      { min: 1, max: 249, regular: 0.90, holo: 1.00 },
      { min: 250, max: 999, regular: 0.85, holo: 0.95 },
      { min: 1000, max: 2499, regular: 0.80, holo: 0.90 },
      { min: 2500, max: 4999, regular: 0.75, holo: 0.85 },
      { min: 5000, max: null, regular: 0.70, holo: 0.80 },
    ],
  },
  {
    id: 'qtr', label: 'Custom Mylar QTRs (4" × 6")', shortLabel: 'QTRs (4×6)', type: 'tiered', mockupScale: 0.75,
    tiers: [
      { min: 1, max: 249, regular: 1.00, holo: 1.25 },
      { min: 250, max: 999, regular: 0.97, holo: 1.15 },
      { min: 1000, max: 2499, regular: 0.90, holo: 1.00 },
      { min: 2500, max: 4999, regular: 0.87, holo: 0.95 },
      { min: 5000, max: null, regular: 0.72, holo: 0.90 },
    ],
  },
  {
    id: 'ounce', label: 'Custom Mylar Ounce Bags (5" × 8")', shortLabel: 'Ounce (5×8)', type: 'tiered', mockupScale: 0.85,
    tiers: [
      { min: 1, max: 249, regular: 2.00, holo: 2.25 },
      { min: 250, max: 999, regular: 1.95, holo: 2.00 },
      { min: 1000, max: 2499, regular: 1.85, holo: 1.95 },
      { min: 2500, max: 4999, regular: 1.80, holo: 1.90 },
      { min: 5000, max: null, regular: 1.75, holo: 1.85 },
    ],
  },
  {
    id: 'half', label: 'Custom Mylar Half Pound (10" × 12")', shortLabel: 'Half (10×12)', type: 'tiered', mockupScale: 1.0,
    tiers: [
      { min: 1, max: 49, regular: 7.50, holo: 8.00 },
      { min: 50, max: 99, regular: 7.00, holo: 7.50 },
      { min: 100, max: 249, regular: 6.50, holo: 7.00 },
      { min: 250, max: null, regular: 6.00, holo: 6.50 },
    ],
  },
  {
    id: 'pound', label: 'Pound Bags (14" × 16")', shortLabel: 'Pound (14×16)', type: 'tiered', mockupScale: 1.15,
    tiers: [
      { min: 1, max: 49, regular: 10.00, holo: 12.00 },
      { min: 50, max: 99, regular: 9.00, holo: 10.00 },
      { min: 100, max: 249, regular: 8.00, holo: 9.00 },
      { min: 250, max: null, regular: 7.50, holo: 8.50 },
    ],
  },
  {
    id: 'jar', label: '2oz Compliant Jars (8th size – top & bottom labels)', shortLabel: '2oz Jars (8th)', type: 'tiered', mockupScale: 0.7,
    tiers: [
      { min: 1, max: 640, regular: 2.00, holo: 2.50 },
      { min: 641, max: 1280, regular: 1.95, holo: 2.45 },
      { min: 1281, max: 1920, regular: 1.90, holo: 2.40 },
      { min: 1921, max: 2500, regular: 1.85, holo: 2.35 },
      { min: 2501, max: null, regular: 1.80, holo: 2.30 },
    ],
  },
]

type PricingResult = {
  unitPrice: number
  totalPrice: number
  effectiveQty: number
  tierLabel: string
  belowDirectMin: boolean
}

const PouchMockup = ({ previewUrl, pouchColor, finish, scale }: { previewUrl: string | null; pouchColor: 'white' | 'black'; finish: string; scale: number }) => {
  const width = 140 * scale
  const height = 200 * scale
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{
        width: `${width}px`, height: `${height}px`,
        background: pouchColor === 'white'
          ? 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 30%, #f5f5f5 50%, #e0e0e0 70%, #f0f0f0 100%)'
          : 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 30%, #252525 50%, #1e1e1e 70%, #222 100%)',
      }}>
        <div className="absolute inset-0 opacity-40" style={{
          background: finish === 'foil'
            ? 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.6) 25%, transparent 50%, rgba(255,255,255,0.4) 75%, transparent 100%)'
            : finish === 'gloss' ? 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 40%, transparent 60%)' : 'none',
        }} />
        <div className={`absolute top-3 left-3 right-3 h-1.5 rounded-full ${pouchColor === 'white' ? 'bg-zinc-300' : 'bg-zinc-600'}`} />
        <div className={`absolute top-5 left-3 right-3 h-0.5 rounded-full ${pouchColor === 'white' ? 'bg-zinc-200' : 'bg-zinc-700'}`} />
        <div className="absolute inset-0 flex items-center justify-center p-6 pt-10">
          {previewUrl ? (
            <img src={previewUrl} alt="Your design" className="max-w-full max-h-full object-contain drop-shadow-lg" />
          ) : (
            <div className={`text-center ${pouchColor === 'white' ? 'text-zinc-400' : 'text-zinc-500'}`}><span className="text-xs">Your Design</span></div>
          )}
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-2 ${pouchColor === 'white' ? 'bg-zinc-200' : 'bg-zinc-800'}`} />
      </div>
    </div>
  )
}

const FoilMockup = ({ previewUrl, scale }: { previewUrl: string | null; scale: number }) => {
  const width = 140 * scale
  const height = 200 * scale
  return (
    <div className="relative flex items-center justify-center h-56">
      <div className="relative rounded-lg overflow-hidden shadow-2xl" style={{
        width: `${width}px`, height: `${height}px`,
        background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 15%, #ffd3b6 30%, #ffaaa5 45%, #ff8b94 60%, #a8e6cf 75%, #88d8b0 90%, #ffd3b6 100%)',
      }}>
        <div className="absolute inset-0 opacity-60" style={{ background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.8) 25%, transparent 50%, rgba(255,255,255,0.6) 75%, transparent 100%)' }} />
        <div className="absolute top-3 left-3 right-3 h-1.5 rounded-full bg-white/40" />
        <div className="absolute top-5 left-3 right-3 h-0.5 rounded-full bg-white/30" />
        <div className="absolute inset-0 flex items-center justify-center p-6 pt-10">
          {previewUrl ? (
            <img src={previewUrl} alt="Your design" className="max-w-full max-h-full object-contain drop-shadow-lg" />
          ) : (
            <div className="text-center text-white/70"><span className="text-xs">Your Design</span></div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/20" />
      </div>
    </div>
  )
}

const JarMockup = ({ previewUrl }: { previewUrl: string | null }) => (
  <div className="relative flex items-center justify-center h-56">
    <div className="relative">
      <div className="relative w-24 h-28 rounded-lg overflow-hidden shadow-xl" style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0.1) 100%)',
        border: '1px solid rgba(255,255,255,0.3)',
      }}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 rounded-t-lg bg-zinc-800 border border-zinc-700" style={{ background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)' }} />
        <div className="absolute top-6 left-0 right-0 bottom-3 flex items-center justify-center p-2">
          {previewUrl ? (
            <img src={previewUrl} alt="Your label" className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-center text-zinc-400"><span className="text-[10px]">Label Here</span></div>
          )}
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)' }} />
      </div>
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-zinc-700/50 flex items-center justify-center">
        <span className="text-[8px] text-zinc-400">Top Label</span>
      </div>
    </div>
  </div>
)

export default function MylarPackaging() {
  const [selectedProduct, setSelectedProduct] = useState<MylarProductId>('qtr')
  const [quantity, setQuantity] = useState(250)
  const [isHolographic, setIsHolographic] = useState(false)
  const [isDirectPrint, setIsDirectPrint] = useState(false)
  const [finish, setFinish] = useState<'matte' | 'gloss' | 'foil'>('matte')
  const [pouchColor, setPouchColor] = useState<'white' | 'black'>('white')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [activeMockup, setActiveMockup] = useState<MockupType>('pouch')

  const selectedProductConfig = useMemo(() => mylarProducts.find((p) => p.id === selectedProduct), [selectedProduct])

  const pricing: PricingResult | null = useMemo(() => {
    if (!selectedProductConfig) return null
    const qty = Math.max(0, quantity || 0)
    const tiers = selectedProductConfig.tiers
    const tier = tiers.find((t) => qty >= t.min && (t.max === null || qty <= t.max)) ?? tiers[tiers.length - 1]
    const unitPrice = isHolographic ? tier.holo : tier.regular
    const totalPrice = unitPrice * qty
    const belowDirectMin = isDirectPrint && qty > 0 && qty < 500
    const tierLabel = `${tier.min}${tier.max ? `–${tier.max}` : '+'} pcs — $${tier.regular.toFixed(2)} reg / $${tier.holo.toFixed(2)} holo`
    return { unitPrice, totalPrice, effectiveQty: qty, tierLabel, belowDirectMin }
  }, [selectedProductConfig, quantity, isHolographic, isDirectPrint])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setUploadedFile(file); setPreviewUrl(URL.createObjectURL(file))
    }
  }, [])
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url })
  }

  useEffect(() => { return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) } }, [previewUrl])

  const tieredProducts = mylarProducts.filter((p) => p.type === 'tiered')
  const mockupTabs = [
    { id: 'pouch' as MockupType, label: 'Mylar Pouch', icon: Package },
    { id: 'foil' as MockupType, label: 'Holographic', icon: Sparkles },
    { id: 'jar' as MockupType, label: 'Jar', icon: Box },
  ]

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <header className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Mylar Packaging Suite</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            <span className="text-primary">Custom</span> Mylar Bags, Jars & Labels
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-sm md:text-base text-muted-foreground">
            Quarter, 8th, ounce and pound bags, plus 2oz compliant jars with top & bottom labels. Holographic upgrades, windows and direct print available.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 mb-10">
          <div className={`flex flex-col justify-center rounded-2xl border bg-card p-6 md:p-8 text-center transition-colors ${isDragging ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted"><Upload className="h-6 w-6 text-muted-foreground" /></div>
              <div>
                <p className="text-base font-medium text-foreground">Drag & drop your artwork</p>
                <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, PDF, or SVG. You'll receive a proof before printing.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  <span>Upload file</span>
                  <input type="file" accept="image/*,.pdf,.svg" className="hidden" onChange={handleFileChange} />
                </label>
                {uploadedFile && (
                  <button onClick={() => { setUploadedFile(null); setPreviewUrl(null) }} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
              </div>
              {uploadedFile && <p className="text-xs text-muted-foreground">Selected: <span className="font-medium text-foreground">{uploadedFile.name}</span></p>}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex justify-center gap-1 mb-4">
              {mockupTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveMockup(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${activeMockup === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  <tab.icon className="h-3.5 w-3.5" />{tab.label}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-muted/50 border border-border">
              {activeMockup === 'pouch' && <PouchMockup previewUrl={previewUrl} pouchColor={pouchColor} finish={finish} scale={selectedProductConfig?.mockupScale ?? 0.75} />}
              {activeMockup === 'foil' && <FoilMockup previewUrl={previewUrl} scale={selectedProductConfig?.mockupScale ?? 0.75} />}
              {activeMockup === 'jar' && <JarMockup previewUrl={previewUrl} />}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {previewUrl ? 'Your design preview' : 'Upload artwork to see it mocked up'} — {selectedProductConfig?.shortLabel}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pouch Size</p>
              <div className="flex flex-wrap gap-2">
                {tieredProducts.map((product) => (
                  <button key={product.id} onClick={() => setSelectedProduct(product.id)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${selectedProduct === product.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}>
                    {product.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Finish</p>
              <div className="flex flex-wrap gap-2">
                {[{ value: 'matte', label: 'Matte' }, { value: 'gloss', label: 'Gloss' }, { value: 'foil', label: 'Foil' }].map((f) => (
                  <button key={f.value} onClick={() => setFinish(f.value as typeof finish)}
                    className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${finish === f.value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pouch Color</p>
              <div className="flex gap-3">
                {(['white', 'black'] as const).map((c) => (
                  <button key={c} onClick={() => setPouchColor(c)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${pouchColor === c ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground hover:text-foreground'}`}>
                    <span className={`inline-flex h-4 w-4 rounded-full border border-border ${c === 'white' ? 'bg-white' : 'bg-black'}`} />
                    <span className="capitalize">{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantity</p>
              <input type="number" min={1} className="w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 0)} placeholder="Enter quantity (pcs)" />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Options</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setIsHolographic((v) => !v)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${isHolographic ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:text-foreground'}`}>
                  Holographic Material
                </button>
                <button onClick={() => setIsDirectPrint((v) => !v)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors cursor-pointer ${isDirectPrint ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted text-muted-foreground hover:text-foreground'}`}>
                  Direct Print (min 500)
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <h2 className="text-lg font-semibold mb-3 text-center">Instant Price Estimate</h2>
              <p className="text-xs text-muted-foreground mb-4 text-center">Use this as a quick ballpark. We'll dial in exact pricing once we see your artwork.</p>
              {pricing && (
                <div className="rounded-xl bg-muted px-4 py-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tier</span><span className="font-medium text-right text-xs">{pricing.tierLabel}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-medium">{pricing.effectiveQty.toLocaleString()} pcs</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Est. unit price</span><span className="font-semibold text-primary">${pricing.unitPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="text-muted-foreground">Est. total</span><span className="font-bold text-lg">${pricing.totalPrice.toFixed(2)}</span></div>
                  {pricing.belowDirectMin && <p className="text-xs text-amber-500 mt-2">Direct print minimum is 500 bags. Below that, we'll default to labels on blank mylar.</p>}
                </div>
              )}
              <p className="mt-3 text-[10px] text-muted-foreground text-center">This calculator does not lock in pricing. Final quote may adjust for finishing, rush timelines, and compliance.</p>
            </div>

            {pricing && pricing.effectiveQty > 0 && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <AddToCartButton name={selectedProductConfig?.label || 'Mylar Bags'} size={selectedProductConfig?.shortLabel || selectedProduct}
                  option={`${pricing.effectiveQty} pcs · ${isHolographic ? 'Holographic' : 'Standard'}`} price={pricing.totalPrice} className="w-full rounded-full px-5 py-3 text-sm font-semibold" />
                <p className="text-[10px] text-muted-foreground text-center mt-2">You'll receive a proof before anything prints.</p>
              </div>
            )}

            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
              <p className="font-medium text-foreground mb-2">Need custom artwork help?</p>
              <p className="text-sm text-muted-foreground mb-4">Send your logo, strain list, and any compliance notes.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <a href="mailto:thestickersmith1@gmail.com?subject=Mylar%20Packaging%20Quote" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">Email files & details</a>
                <a href="/contact" className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">Fill out project form</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
