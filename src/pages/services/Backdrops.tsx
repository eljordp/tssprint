import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle, Minus, Plus, ImageIcon } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const sizes = [
  { id: "8x7.5", name: "8' x 7.5'", description: "Wall Backdrop" },
  { id: "10x7.5", name: "10' x 7.5'", description: "Standard Backdrop" },
]

const frameOptions = [
  { id: "with-frame", name: "With Frame", description: "Complete display system with 25mm aluminum frame", priceAdd: { "8x7.5": 199, "10x7.5": 349 } },
  { id: "graphic-only", name: "Graphic Only", description: "Replacement graphic or for existing frame", priceAdd: { "8x7.5": 99, "10x7.5": 149 } },
]

const backdropTypes = [
  { id: "fabric", name: "Fabric Backdrop", description: "Wrinkle-resistant, machine washable", popular: true, priceAdjust: 0 },
  { id: "vinyl", name: "Vinyl Backdrop", description: "Durable, wipes clean", popular: false, priceAdjust: 20 },
  { id: "popup", name: "Pop-Up Display", description: "Self-standing with frame", popular: true, priceAdjust: 50 },
  { id: "tension", name: "Tension Fabric", description: "Pillow case style, sleek look", popular: false, priceAdjust: 30 },
]

const bulkDiscounts = [
  { qty: "2-3 backdrops", discount: "10% off", minQty: 2, maxQty: 3, rate: 0.1 },
  { qty: "4-5 backdrops", discount: "15% off", minQty: 4, maxQty: 5, rate: 0.15 },
  { qty: "6+ backdrops", discount: "20% off", minQty: 6, maxQty: Infinity, rate: 0.2 },
]

const features = [
  "25mm Aluminum Frame",
  '4.5" Pole pockets on top and bottom w/ hemmed sides',
  "Material: Stretch Fabric",
  'Shipping Dimension: 46" x 6 x 6',
  "Warranty: Lifetime on Frame, 1 year on Graphics",
  "Free design assistance",
]

export default function Backdrops() {
  const [selectedSize, setSelectedSize] = useState("10x7.5")
  const [selectedFrame, setSelectedFrame] = useState("with-frame")
  const [selectedType, setSelectedType] = useState("fabric")
  const [quantity, setQuantity] = useState(1)

  const currentSize = sizes.find((s) => s.id === selectedSize)!
  const currentFrame = frameOptions.find((f) => f.id === selectedFrame)!
  const currentType = backdropTypes.find((t) => t.id === selectedType)!

  const basePrice = currentFrame.priceAdd[selectedSize as keyof typeof currentFrame.priceAdd] + currentType.priceAdjust

  const getDiscount = (qty: number) => {
    for (let i = bulkDiscounts.length - 1; i >= 0; i--) {
      if (qty >= bulkDiscounts[i].minQty && qty <= bulkDiscounts[i].maxQty) return bulkDiscounts[i]
    }
    return null
  }

  const discount = getDiscount(quantity)
  const discountedUnitPrice = discount ? basePrice * (1 - discount.rate) : basePrice
  const totalPrice = discountedUnitPrice * quantity

  return (
    <>
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/canopies" className="hover:text-primary transition-colors">Event Branding</Link>
              <span>/</span><span>Backdrops</span>
            </div>
            <h1 className="mb-4">Custom Backdrops</h1>
            <p className="text-lg text-muted-foreground">Professional backdrops for events, trade shows, and photo ops. Full-color printing on premium materials with optional frame systems.</p>
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
                  <p className="text-xs mt-1">{currentSize.name} - {currentType.name}</p>
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
                  {sizes.map((size) => (
                    <button key={size.id} onClick={() => setSelectedSize(size.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${selectedSize === size.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="font-semibold">{size.name}</div>
                      <div className="text-sm text-muted-foreground">{size.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Frame Option</h3>
                <div className="grid grid-cols-2 gap-3">
                  {frameOptions.map((frame) => (
                    <button key={frame.id} onClick={() => setSelectedFrame(frame.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${selectedFrame === frame.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="font-semibold">{frame.name}</div>
                      <div className="text-sm text-muted-foreground">{frame.description}</div>
                      <div className="text-sm mt-1 text-primary">${frame.priceAdd[selectedSize as keyof typeof frame.priceAdd]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Backdrop Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {backdropTypes.map((type) => (
                    <button key={type.id} onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer relative ${selectedType === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      {type.popular && (
                        <span className="absolute -top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Popular</span>
                      )}
                      <div className="font-semibold">{type.name}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                      {type.priceAdjust > 0 && <div className="text-sm mt-1 text-primary">+${type.priceAdjust}</div>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-elevated">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Quantity</h3>
                    {discount && <span className="text-sm text-primary">{discount.discount} bulk discount applied!</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer" disabled={quantity <= 1}><Minus size={18} /></button>
                    <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"><Plus size={18} /></button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {bulkDiscounts.map((tier) => (
                    <div key={tier.minQty} className={`flex-1 text-center p-2 rounded-lg text-xs ${quantity >= tier.minQty && quantity <= tier.maxQty ? "bg-primary/10 text-primary border border-primary/30" : quantity >= tier.minQty ? "bg-primary/10 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground"}`}>
                      <div className="font-semibold">{tier.discount}</div><div>{tier.qty}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-elevated bg-primary/5 border-primary/20">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{currentSize.name} - {currentFrame.name}</span><span>${currentFrame.priceAdd[selectedSize as keyof typeof currentFrame.priceAdd]}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">{currentType.name}</span><span>{currentType.priceAdjust > 0 ? `+$${currentType.priceAdjust}` : "Included"}</span></div>
                  {discount && <div className="flex justify-between text-sm text-primary"><span>Bulk Discount ({discount.discount})</span><span>-${(basePrice * discount.rate).toFixed(0)}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quantity</span><span>&times;{quantity}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between items-center"><span className="font-semibold">Total</span><span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span></div>
                </div>
                <AddToCartButton name="Custom Backdrop" size={currentSize.name}
                  option={`${currentFrame.name} - ${currentType.name}`}
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
            <p className="text-lg text-muted-foreground mb-8">Not sure which backdrop size or type is right for your event? Get personalized recommendations and a free mockup.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Quote <ArrowRight size={20} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
