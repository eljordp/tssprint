import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, CheckCircle } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

// --- Product data ---

type QuantityTier = { label: string; price: number }

interface LetterheadConfig {
  paper: string
  color: string
  quantity: number
}
interface EnvelopeConfig {
  style: string
  color: string
  quantity: number
}
interface NotepadConfig {
  size: string
  quantity: number
}
interface FolderConfig {
  pockets: string
  stock: string
  quantity: number
}

const PRODUCTS = ["Letterhead", "Envelopes", "Notepads", "Presentation Folders"] as const
type ProductName = (typeof PRODUCTS)[number]

const letterheadPaper = [
  { label: "70lb Text", adj: 0 },
  { label: "80lb Text", adj: 15 },
  { label: "100lb Text", adj: 30 },
]
const letterheadColor = [
  { label: "Full Color", adj: 0 },
  { label: "1-Color (Black)", adj: -20 },
]
const letterheadQty: QuantityTier[] = [
  { label: "250", price: 99 },
  { label: "500", price: 149 },
  { label: "1000", price: 229 },
  { label: "2500", price: 449 },
]

const envelopeStyle = [
  { label: "#10 Standard", adj: 0 },
  { label: "#10 Window", adj: 15 },
  { label: "A7 Invitation", adj: 20 },
]
const envelopeColor = [
  { label: "Full Color", adj: 0 },
  { label: "1-Color (Black)", adj: -20 },
]
const envelopeQty: QuantityTier[] = [
  { label: "250", price: 129 },
  { label: "500", price: 189 },
  { label: "1000", price: 299 },
  { label: "2500", price: 549 },
]

const notepadSize = [
  { label: '4.25"x5.5" (Half Letter)', multiplier: 1 },
  { label: '5.5"x8.5" (Half Page)', multiplier: 1 },
  { label: '8.5"x11" (Full Page)', multiplier: 1.5 },
]
const notepadQty: QuantityTier[] = [
  { label: "10 pads", price: 79 },
  { label: "25 pads", price: 159 },
  { label: "50 pads", price: 279 },
  { label: "100 pads", price: 479 },
]

const folderPockets = [
  { label: "Single Pocket", adj: 0 },
  { label: "Double Pocket", adj: 30 },
]
const folderStock = [
  { label: "14pt Gloss", adj: 0 },
  { label: "16pt Matte", adj: 25 },
]
const folderQty: QuantityTier[] = [
  { label: "100", price: 199 },
  { label: "250", price: 349 },
  { label: "500", price: 549 },
]

const additionalItems = [
  { name: "Invoice Books", description: "NCR carbonless copies", price: "From $89" },
  { name: "Receipt Books", description: "Numbered with duplicates", price: "From $69" },
  { name: "Memo Pads", description: "Custom sizes available", price: "From $49" },
  { name: "Appointment Cards", description: "Match your business cards", price: "From $39" },
]

const features = [
  "Consistent brand identity",
  "Premium paper stocks",
  "Full-color printing",
  "Matching sets available",
  "Free design assistance",
  "Bulk order discounts",
]

// --- Option selector component ---

function OptionRow({ label, options, value, onChange }: {
  label: string
  options: { label: string; detail?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onChange(opt.label)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
              value === opt.label
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {opt.label}{opt.detail ? ` ${opt.detail}` : ""}
          </button>
        ))}
      </div>
    </div>
  )
}

// --- Product configurators ---

function LetterheadConfigurator() {
  const [cfg, setCfg] = useState<LetterheadConfig>({
    paper: letterheadPaper[0].label,
    color: letterheadColor[0].label,
    quantity: 0,
  })

  const price = useMemo(() => {
    const base = letterheadQty[cfg.quantity].price
    const paperAdj = letterheadPaper.find((p) => p.label === cfg.paper)!.adj
    const colorAdj = letterheadColor.find((c) => c.label === cfg.color)!.adj
    return Math.max(0, base + paperAdj + colorAdj)
  }, [cfg])

  const qtyLabel = letterheadQty[cfg.quantity].label
  const optionSummary = `${qtyLabel} / ${cfg.paper} / ${cfg.color}`

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">8.5" x 11" branded stationery</p>
      <OptionRow
        label="Paper"
        options={letterheadPaper.map((p) => ({ label: p.label, detail: p.adj > 0 ? `(+$${p.adj})` : undefined }))}
        value={cfg.paper}
        onChange={(v) => setCfg((s) => ({ ...s, paper: v }))}
      />
      <OptionRow
        label="Color"
        options={letterheadColor.map((c) => ({ label: c.label, detail: c.adj !== 0 ? `(${c.adj > 0 ? "+" : ""}$${Math.abs(c.adj)})` : undefined }))}
        value={cfg.color}
        onChange={(v) => setCfg((s) => ({ ...s, color: v }))}
      />
      <OptionRow
        label="Quantity"
        options={letterheadQty.map((q) => ({ label: q.label, detail: undefined }))}
        value={qtyLabel}
        onChange={(v) => setCfg((s) => ({ ...s, quantity: letterheadQty.findIndex((q) => q.label === v) }))}
      />
      <PriceBar price={price} name="Letterhead" size='8.5"x11"' option={optionSummary} />
    </div>
  )
}

function EnvelopeConfigurator() {
  const [cfg, setCfg] = useState<EnvelopeConfig>({
    style: envelopeStyle[0].label,
    color: envelopeColor[0].label,
    quantity: 0,
  })

  const price = useMemo(() => {
    const base = envelopeQty[cfg.quantity].price
    const styleAdj = envelopeStyle.find((s) => s.label === cfg.style)!.adj
    const colorAdj = envelopeColor.find((c) => c.label === cfg.color)!.adj
    return Math.max(0, base + styleAdj + colorAdj)
  }, [cfg])

  const qtyLabel = envelopeQty[cfg.quantity].label
  const optionSummary = `${qtyLabel} / ${cfg.style} / ${cfg.color}`

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">#10 Standard business envelopes</p>
      <OptionRow
        label="Style"
        options={envelopeStyle.map((s) => ({ label: s.label, detail: s.adj > 0 ? `(+$${s.adj})` : undefined }))}
        value={cfg.style}
        onChange={(v) => setCfg((s) => ({ ...s, style: v }))}
      />
      <OptionRow
        label="Color"
        options={envelopeColor.map((c) => ({ label: c.label, detail: c.adj !== 0 ? `(${c.adj > 0 ? "+" : ""}$${Math.abs(c.adj)})` : undefined }))}
        value={cfg.color}
        onChange={(v) => setCfg((s) => ({ ...s, color: v }))}
      />
      <OptionRow
        label="Quantity"
        options={envelopeQty.map((q) => ({ label: q.label }))}
        value={qtyLabel}
        onChange={(v) => setCfg((s) => ({ ...s, quantity: envelopeQty.findIndex((q) => q.label === v) }))}
      />
      <PriceBar price={price} name="Envelopes" size={cfg.style} option={optionSummary} />
    </div>
  )
}

function NotepadConfigurator() {
  const [cfg, setCfg] = useState<NotepadConfig>({
    size: notepadSize[0].label,
    quantity: 0,
  })

  const price = useMemo(() => {
    const base = notepadQty[cfg.quantity].price
    const mult = notepadSize.find((s) => s.label === cfg.size)!.multiplier
    return Math.round(base * mult)
  }, [cfg])

  const qtyLabel = notepadQty[cfg.quantity].label
  const optionSummary = `${qtyLabel} / ${cfg.size}`

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">50 sheets per pad, branded</p>
      <OptionRow
        label="Size"
        options={notepadSize.map((s) => ({ label: s.label, detail: s.multiplier > 1 ? `(1.5x)` : undefined }))}
        value={cfg.size}
        onChange={(v) => setCfg((s) => ({ ...s, size: v }))}
      />
      <OptionRow
        label="Quantity (pads)"
        options={notepadQty.map((q) => ({ label: q.label }))}
        value={qtyLabel}
        onChange={(v) => setCfg((s) => ({ ...s, quantity: notepadQty.findIndex((q) => q.label === v) }))}
      />
      <PriceBar price={price} name="Notepads" size={cfg.size} option={optionSummary} />
    </div>
  )
}

function FolderConfigurator() {
  const [cfg, setCfg] = useState<FolderConfig>({
    pockets: folderPockets[0].label,
    stock: folderStock[0].label,
    quantity: 0,
  })

  const price = useMemo(() => {
    const base = folderQty[cfg.quantity].price
    const pocketAdj = folderPockets.find((p) => p.label === cfg.pockets)!.adj
    const stockAdj = folderStock.find((s) => s.label === cfg.stock)!.adj
    return Math.max(0, base + pocketAdj + stockAdj)
  }, [cfg])

  const qtyLabel = folderQty[cfg.quantity].label
  const optionSummary = `${qtyLabel} / ${cfg.pockets} / ${cfg.stock}`

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">9" x 12" presentation folders</p>
      <OptionRow
        label="Pockets"
        options={folderPockets.map((p) => ({ label: p.label, detail: p.adj > 0 ? `(+$${p.adj})` : undefined }))}
        value={cfg.pockets}
        onChange={(v) => setCfg((s) => ({ ...s, pockets: v }))}
      />
      <OptionRow
        label="Stock"
        options={folderStock.map((s) => ({ label: s.label, detail: s.adj > 0 ? `(+$${s.adj})` : undefined }))}
        value={cfg.stock}
        onChange={(v) => setCfg((s) => ({ ...s, stock: v }))}
      />
      <OptionRow
        label="Quantity"
        options={folderQty.map((q) => ({ label: q.label }))}
        value={qtyLabel}
        onChange={(v) => setCfg((s) => ({ ...s, quantity: folderQty.findIndex((q) => q.label === v) }))}
      />
      <PriceBar price={price} name="Presentation Folders" size='9"x12"' option={optionSummary} />
    </div>
  )
}

// --- Price bar with add to cart ---

function PriceBar({ price, name, size, option }: { price: number; name: string; size: string; option: string }) {
  return (
    <motion.div
      key={price}
      initial={{ opacity: 0.6, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border mt-2"
    >
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">Total</span>
        <p className="text-2xl font-bold text-primary">${price}</p>
      </div>
      <AddToCartButton name={`Office Printing - ${name}`} size={size} option={option} price={price} />
    </motion.div>
  )
}

// --- Main page ---

const configurators: Record<ProductName, () => React.JSX.Element> = {
  Letterhead: LetterheadConfigurator,
  Envelopes: EnvelopeConfigurator,
  Notepads: NotepadConfigurator,
  "Presentation Folders": FolderConfigurator,
}

export default function OfficePrinting() {
  const [activeTab, setActiveTab] = useState<ProductName>("Letterhead")
  const ActiveConfigurator = configurators[activeTab]

  return (
    <>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/business-print" className="hover:text-primary transition-colors">Business Print</Link>
              <span>/</span><span>Office Printing</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Briefcase size={32} className="text-primary" />
              <h1>Office Printing</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Letterheads, envelopes, notepads, and presentation folders. Keep your brand consistent across all office materials.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Configurator */}
      <section className="section-padding pt-0">
        <div className="section-container max-w-2xl mx-auto">
          {/* Product Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {PRODUCTS.map((product) => (
              <button
                key={product}
                onClick={() => setActiveTab(product)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                  activeTab === product
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {product}
              </button>
            ))}
          </div>

          {/* Active configurator */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card-elevated"
          >
            <h2 className="text-xl font-bold mb-4">{activeTab}</h2>
            <ActiveConfigurator />
          </motion.div>
        </div>
      </section>

      {/* Additional Items */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">Additional Items</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalItems.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card-elevated flex flex-col items-center text-center"
              >
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <span className="text-primary font-semibold">{item.price}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">What's Included</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {features.map((feature) => (
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
            <h2 className="mb-4">Need a Custom Order?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have specific requirements or need a large order? Get in touch for a personalized quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Quote <ArrowRight size={20} /></Link>
              <Link to="/business-print" className="btn-secondary text-lg px-8 py-4">All Business Print</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
