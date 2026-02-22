import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle, Plus, Minus, ImageIcon } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const sizes = [
  { id: "5x5", label: "5' x 5'", description: "Compact", steelPrice: 399, aluminumPrice: 549 },
  { id: "10x10", label: "10' x 10'", description: "Standard", steelPrice: 728, aluminumPrice: 899 },
  { id: "10x15", label: "10' x 15'", description: "Extended", steelPrice: 1200, aluminumPrice: 1400 },
  { id: "10x20", label: "10' x 20'", description: "Maximum", steelPrice: 1500, aluminumPrice: 1750 },
]

const frames = [
  { id: "steel", label: "Steel Frame", description: "Durable, heavier" },
  { id: "aluminum", label: "Aluminum Frame", description: "Lightweight, premium" },
]

const addOns = [
  { id: "sidewalls", name: "Sidewalls (set of 4)", price: 199 },
  { id: "halfwalls", name: "Half Walls (set of 4)", price: 149 },
]

const bulkDiscounts = [
  { minQty: 2, percent: 0.10, label: "10% off" },
  { minQty: 5, percent: 0.15, label: "15% off" },
  { minQty: 10, percent: 0.20, label: "20% off" },
]

const features = [
  "Full-color dye sublimation printing",
  "600D water-resistant polyester",
  "Heavy-duty frame included",
  "Easy pop-up assembly",
  "Includes carrying bag",
  "Free design assistance",
]

export default function Canopies() {
  const [selectedSize, setSelectedSize] = useState("10x10")
  const [selectedFrame, setSelectedFrame] = useState("steel")
  const [quantity, setQuantity] = useState(1)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const currentSize = sizes.find((s) => s.id === selectedSize)!
  const basePrice = selectedFrame === "steel" ? currentSize.steelPrice : currentSize.aluminumPrice

  const isSizeDisabled = (sizeId: string) => {
    if (selectedFrame === "steel") return sizeId === "10x15" || sizeId === "10x20"
    return sizeId === "5x5"
  }

  const handleFrameChange = (frameId: string) => {
    setSelectedFrame(frameId)
    if (frameId === "steel" && (selectedSize === "10x15" || selectedSize === "10x20")) setSelectedSize("10x10")
    else if (frameId === "aluminum" && selectedSize === "5x5") setSelectedSize("10x10")
  }

  const getDiscount = (qty: number) => {
    for (let i = bulkDiscounts.length - 1; i >= 0; i--) {
      if (qty >= bulkDiscounts[i].minQty) return bulkDiscounts[i]
    }
    return null
  }

  const discount = getDiscount(quantity)
  const discountedUnitPrice = discount ? basePrice * (1 - discount.percent) : basePrice
  const addOnsTotal = selectedAddOns.reduce((sum, id) => sum + (addOns.find((a) => a.id === id)?.price || 0), 0)
  const totalPrice = (discountedUnitPrice + addOnsTotal) * quantity

  const toggleAddOn = (id: string) => setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id])
  const selectedAddOnNames = selectedAddOns.map((id) => addOns.find((a) => a.id === id)?.name).filter(Boolean).join(", ")

  return (
    <>
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/canopies" className="hover:text-primary transition-colors">Event Branding</Link>
              <span>/</span><span>Canopies</span>
            </div>
            <h1 className="mb-4">Custom Printed Canopies</h1>
            <p className="text-lg text-muted-foreground">Branded pop-up canopy tents with full-color printing. Durable frames and weather-resistant fabric.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="aspect-[4/3] bg-muted/30 rounded-xl border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Product image coming soon</p>
                  <p className="text-xs mt-1">{currentSize.label} - {selectedFrame === "steel" ? "Steel" : "Aluminum"} Frame</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted/20 rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <ImageIcon size={20} className="text-muted-foreground/50" />
                  </div>
                ))}
              </div>
              <div className="card-elevated mt-6">
                <h3 className="font-semibold mb-4">What's Included</h3>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-primary flex-shrink-0" /><span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Select Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizes.map((size) => {
                    const disabled = isSizeDisabled(size.id)
                    return (
                      <button key={size.id} onClick={() => !disabled && setSelectedSize(size.id)} disabled={disabled}
                        className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${disabled ? "border-border/50 bg-muted/20 opacity-50 cursor-not-allowed" : selectedSize === size.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div className={`font-semibold ${disabled ? "text-muted-foreground" : ""}`}>{size.label}</div>
                        <div className="text-sm text-muted-foreground">{size.description}</div>
                        <div className={`text-sm mt-1 ${disabled ? "text-muted-foreground" : "text-primary"}`}>From ${selectedFrame === "steel" ? size.steelPrice : size.aluminumPrice}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Frame Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {frames.map((frame) => (
                    <button key={frame.id} onClick={() => handleFrameChange(frame.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${selectedFrame === frame.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="font-semibold">{frame.label}</div>
                      <div className="text-sm text-muted-foreground">{frame.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Add-Ons (Optional)</h3>
                <div className="space-y-3">
                  {addOns.map((addon) => (
                    <button key={addon.id} onClick={() => toggleAddOn(addon.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all flex justify-between items-center cursor-pointer ${selectedAddOns.includes(addon.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedAddOns.includes(addon.id) ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                          {selectedAddOns.includes(addon.id) && <CheckCircle size={14} className="text-primary-foreground" />}
                        </div>
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="text-primary font-semibold">+${addon.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-elevated">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Quantity</h3>
                    {discount && <span className="text-sm text-primary">{discount.label} bulk discount applied!</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer" disabled={quantity <= 1}><Minus size={18} /></button>
                    <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"><Plus size={18} /></button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {bulkDiscounts.map((tier) => (
                    <div key={tier.minQty} className={`flex-1 text-center p-2 rounded-lg text-xs ${quantity >= tier.minQty ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground"}`}>
                      <div className="font-semibold">{tier.label}</div><div>{tier.minQty}+ units</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-elevated bg-primary/5 border-primary/20">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{currentSize.label} {selectedFrame === "steel" ? "Steel" : "Aluminum"} Frame</span><span>${basePrice}</span></div>
                  {discount && <div className="flex justify-between text-sm text-primary"><span>Bulk Discount ({discount.label})</span><span>-${(basePrice * discount.percent).toFixed(0)}</span></div>}
                  {selectedAddOns.length > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Add-ons</span><span>+${addOnsTotal}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quantity</span><span>×{quantity}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between items-center"><span className="font-semibold">Total</span><span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span></div>
                </div>
                <AddToCartButton name="Custom Canopy" size={currentSize.label}
                  option={`${selectedFrame === "steel" ? "Steel" : "Aluminum"} Frame${selectedAddOnNames ? ` + ${selectedAddOnNames}` : ""}`}
                  price={totalPrice} className="w-full text-base py-3" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Need Help Choosing?</h2>
            <p className="text-lg text-muted-foreground mb-8">Not sure which size or options are right for your event? Get personalized recommendations and a free mockup.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Quote <ArrowRight size={20} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
