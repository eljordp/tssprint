import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CreditCard, CheckCircle, Layers, Paintbrush, RectangleHorizontal, CreditCard as CardIcon } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

/* ── Data ────────────────────────────────────────────────────── */

type SizeKey = "standard" | "square" | "mini"
type StockKey = "16pt" | "32pt" | "18pt-recycled"
type FinishKey = "matte" | "gloss" | "soft-touch" | "spot-uv" | "foil" | "rounded"
type Sides = "single" | "double"
type Qty = 250 | 500 | 1000 | 2500 | 5000

const SIZES: { key: SizeKey; label: string; dimensions: string; multiplier: number }[] = [
  { key: "standard", label: "Standard", dimensions: '3.5" × 2"', multiplier: 1 },
  { key: "square", label: "Square", dimensions: '2.5" × 2.5"', multiplier: 1.15 },
  { key: "mini", label: "Mini", dimensions: '3" × 1"', multiplier: 0.8 },
]

const STOCKS: { key: StockKey; label: string; extra: number; tag: string }[] = [
  { key: "16pt", label: "16pt Standard", extra: 0, tag: "Included" },
  { key: "32pt", label: "32pt Ultra-Thick", extra: 20, tag: "+$20" },
  { key: "18pt-recycled", label: "18pt Recycled", extra: 10, tag: "+$10" },
]

const FINISHES: { key: FinishKey; label: string; description: string; extra: number; tag: string; swatch: string }[] = [
  { key: "matte", label: "Matte", description: "Smooth, non-reflective", extra: 0, tag: "Included", swatch: "bg-zinc-600" },
  { key: "gloss", label: "Gloss", description: "Shiny, vibrant colors", extra: 0, tag: "Included", swatch: "bg-gradient-to-br from-white/40 to-zinc-400" },
  { key: "soft-touch", label: "Soft-Touch", description: "Velvety premium feel", extra: 15, tag: "+$15", swatch: "bg-gradient-to-br from-zinc-500 to-zinc-700" },
  { key: "spot-uv", label: "Spot UV", description: "Glossy accents on matte", extra: 25, tag: "+$25", swatch: "bg-gradient-to-br from-white/60 to-zinc-500" },
  { key: "foil", label: "Foil Stamping", description: "Gold, silver, or copper", extra: 35, tag: "+$35", swatch: "bg-gradient-to-br from-yellow-400 to-amber-600" },
  { key: "rounded", label: "Rounded Corners", description: "Modern curved edges", extra: 10, tag: "+$10", swatch: "bg-zinc-500 rounded-xl" },
]

const QUANTITIES: Qty[] = [250, 500, 1000, 2500, 5000]

const BASE_PRICES: Record<Qty, number> = {
  250: 49,
  500: 79,
  1000: 129,
  2500: 249,
  5000: 399,
}

const FEATURES = [
  "Premium 16pt+ cardstock",
  "Full-color printing",
  "Free design assistance",
  "Proof before printing",
  "Fast 3–5 day turnaround",
  "Free shipping on 1000+",
]

/* ── Component ───────────────────────────────────────────────── */

export default function BusinessCards() {
  const [size, setSize] = useState<SizeKey>("standard")
  const [stock, setStock] = useState<StockKey>("16pt")
  const [finish, setFinish] = useState<FinishKey>("matte")
  const [sides, setSides] = useState<Sides>("single")
  const [qty, setQty] = useState<Qty>(500)

  const sizeData = SIZES.find((s) => s.key === size)!
  const stockData = STOCKS.find((s) => s.key === stock)!
  const finishData = FINISHES.find((f) => f.key === finish)!

  const { total, perCard } = useMemo(() => {
    const base = BASE_PRICES[qty] * sizeData.multiplier * (sides === "double" ? 1.3 : 1)
    const t = Math.round((base + stockData.extra + finishData.extra) * 100) / 100
    const pc = Math.round((t / qty) * 1000) / 1000
    return { total: t, perCard: pc }
  }, [qty, size, stock, finish, sides, sizeData, stockData, finishData])

  const specSummary = `${sizeData.label} ${sizeData.dimensions} · ${stockData.label} · ${finishData.label} · ${sides === "double" ? "Double-sided" : "Single-sided"} · ${qty} cards`

  return (
    <>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/business-print" className="hover:text-primary transition-colors">Business Print</Link>
              <span>/</span>
              <span className="text-foreground">Business Cards</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <CreditCard size={32} className="text-primary" />
              <h1>Business Cards</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Configure your perfect business card below. Premium cardstock, full-color printing, and dozens of finish options — all with real-time pricing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Configurator */}
      <section className="section-padding pt-0">
        <div className="section-container max-w-4xl mx-auto space-y-10">

          {/* 1 — Card Size */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
            <div className="flex items-center gap-2 mb-4">
              <RectangleHorizontal size={20} className="text-primary" />
              <h3 className="font-semibold text-lg">Card Size</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSize(s.key)}
                  className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                    size === s.key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 hover:border-muted-foreground/40"
                  }`}
                >
                  <span className="block font-semibold">{s.label}</span>
                  <span className="block text-sm text-muted-foreground">{s.dimensions}</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    {s.multiplier === 1 ? "Base price" : s.multiplier > 1 ? `+${Math.round((s.multiplier - 1) * 100)}%` : `${Math.round((1 - s.multiplier) * 100)}% less`}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 2 — Paper Stock */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={20} className="text-primary" />
              <h3 className="font-semibold text-lg">Paper Stock</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {STOCKS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStock(s.key)}
                  className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                    stock === s.key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 hover:border-muted-foreground/40"
                  }`}
                >
                  <span className="block font-semibold text-sm">{s.label}</span>
                  <span className={`block text-xs mt-1 font-medium ${s.extra === 0 ? "text-green-500" : "text-primary"}`}>
                    {s.tag}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 3 — Finish (swatch selector) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
            <div className="flex items-center gap-2 mb-4">
              <Paintbrush size={20} className="text-primary" />
              <h3 className="font-semibold text-lg">Finish</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FINISHES.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFinish(f.key)}
                  className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                    finish === f.key
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 hover:border-muted-foreground/40"
                  }`}
                >
                  {/* Swatch */}
                  <div className={`w-8 h-8 rounded-md flex-shrink-0 ${f.swatch} border border-white/10`} />
                  <div className="min-w-0">
                    <span className="block font-semibold text-sm">{f.label}</span>
                    <span className="block text-xs text-muted-foreground">{f.description}</span>
                    <span className={`block text-xs mt-1 font-medium ${f.extra === 0 ? "text-green-500" : "text-primary"}`}>
                      {f.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 4 — Sides Toggle */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
            <div className="flex items-center gap-2 mb-4">
              <CardIcon size={20} className="text-primary" />
              <h3 className="font-semibold text-lg">Sides</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["single", "double"] as Sides[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSides(s)}
                  className={`p-4 rounded-lg border-2 text-center transition-all cursor-pointer ${
                    sides === s
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 hover:border-muted-foreground/40"
                  }`}
                >
                  <span className="block font-semibold">{s === "single" ? "Single-Sided" : "Double-Sided"}</span>
                  <span className="block text-xs text-muted-foreground mt-1">
                    {s === "single" ? "Front only" : "+30% — Front & back"}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 5 — Quantity Tiers */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
            <h3 className="font-semibold text-lg mb-4">Quantity</h3>
            <div className="grid grid-cols-5 gap-3">
              {QUANTITIES.map((q) => {
                const tierBase = BASE_PRICES[q] * sizeData.multiplier * (sides === "double" ? 1.3 : 1)
                const tierTotal = Math.round((tierBase + stockData.extra + finishData.extra) * 100) / 100
                return (
                  <button
                    key={q}
                    onClick={() => setQty(q)}
                    className={`p-3 rounded-lg border-2 text-center transition-all cursor-pointer ${
                      qty === q
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/20 hover:border-muted-foreground/40"
                    }`}
                  >
                    <span className="block font-bold text-lg">{q.toLocaleString()}</span>
                    <span className="block text-primary font-semibold text-sm">${tierTotal.toFixed(2)}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* 6 — Price Summary + Add to Cart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-elevated border-primary/30"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Configuration</p>
                <p className="text-sm font-medium mb-3">{specSummary}</p>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-bold text-primary">${total.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">
                    ${perCard.toFixed(3)} per card
                  </span>
                </div>
              </div>
              <AddToCartButton
                name="Business Cards"
                size={`${sizeData.label} ${sizeData.dimensions}`}
                option={specSummary}
                price={total}
                className="px-8 py-3 text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">What's Included</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle size={16} className="text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Need Custom Cards?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have specific requirements, custom shapes, or need a large order? Get in touch for a personalized quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">
                Get a Quote <ArrowRight size={20} />
              </Link>
              <Link to="/business-print" className="btn-secondary text-lg px-8 py-4">
                All Business Print
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
