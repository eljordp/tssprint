import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle,
  Eye,
  Sun,
  Shield,
  Paintbrush,
  Layers,
  Plus,
  Minus,
  Ruler,
} from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const filmTypes = [
  { id: "frosted", label: "Frosted Privacy", rate: 8 },
  { id: "solar", label: "Solar Protection", rate: 12 },
  { id: "security", label: "Security Film", rate: 15 },
  { id: "decorative", label: "Decorative", rate: 10 },
  { id: "mirror", label: "One-Way Mirror", rate: 14 },
]

const windowSizes = [
  { id: "small", label: "Small", description: "3' × 3'", sqft: 9 },
  { id: "medium", label: "Medium", description: "4' × 5'", sqft: 20 },
  { id: "large", label: "Large", description: "5' × 6'", sqft: 30 },
  { id: "storefront", label: "Storefront", description: "6' × 8'", sqft: 48 },
  { id: "custom", label: "Custom", description: "Enter dimensions", sqft: 0 },
]

const quantityPresets = [1, 2, 3, 5, 10]

const bulkDiscounts = [
  { minQty: 3, percent: 0.10, label: "10% off" },
  { minQty: 5, percent: 0.15, label: "15% off" },
  { minQty: 10, percent: 0.20, label: "20% off" },
]

const addOns = [
  { id: "install", name: "Professional Installation", description: "+$3/sqft", perSqft: 3, flat: 0 },
  { id: "branding", name: "Logo/Branding Integration", description: "+$150 flat", perSqft: 0, flat: 150 },
  { id: "rush", name: "Rush (3-Day Turnaround)", description: "+25%", perSqft: 0, flat: 0, rushPercent: 0.25 },
]

const features = [
  { icon: Sun, title: "UV Protection", description: "Block up to 99% of harmful UV rays, protecting interiors and occupants." },
  { icon: Layers, title: "Energy Savings", description: "Reduce cooling costs by up to 30% with solar heat rejection film." },
  { icon: Eye, title: "Privacy Solutions", description: "Frosted and one-way mirror films for offices, storefronts, and homes." },
  { icon: Paintbrush, title: "Custom Designs", description: "Branded patterns, logos, and decorative prints on any film type." },
  { icon: Shield, title: "Professional Install", description: "Bubble-free application with clean edges by certified technicians." },
  { icon: CheckCircle, title: "Warranty Included", description: "Manufacturer-backed warranty on all film products and installation." },
]

export default function WindowFilm() {
  const [selectedFilm, setSelectedFilm] = useState("frosted")
  const [selectedSize, setSelectedSize] = useState("medium")
  const [customWidth, setCustomWidth] = useState(4)
  const [customHeight, setCustomHeight] = useState(5)
  const [quantity, setQuantity] = useState(1)
  const [customQty, setCustomQty] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const currentFilm = filmTypes.find((f) => f.id === selectedFilm)!
  const currentSize = windowSizes.find((s) => s.id === selectedSize)!
  const sqft = selectedSize === "custom" ? customWidth * customHeight : currentSize.sqft

  const getDiscount = (qty: number) => {
    for (let i = bulkDiscounts.length - 1; i >= 0; i--) {
      if (qty >= bulkDiscounts[i].minQty) return bulkDiscounts[i]
    }
    return null
  }

  const discount = getDiscount(quantity)

  const pricing = useMemo(() => {
    const filmCost = sqft * currentFilm.rate * quantity
    const discountAmount = discount ? filmCost * discount.percent : 0
    const afterDiscount = filmCost - discountAmount

    let addOnCost = 0
    const hasInstall = selectedAddOns.includes("install")
    const hasBranding = selectedAddOns.includes("branding")
    const hasRush = selectedAddOns.includes("rush")

    if (hasInstall) addOnCost += 3 * sqft * quantity
    if (hasBranding) addOnCost += 150

    const subtotal = afterDiscount + addOnCost
    const rushCost = hasRush ? subtotal * 0.25 : 0
    const total = subtotal + rushCost

    return { filmCost, discountAmount, addOnCost, rushCost, total }
  }, [sqft, currentFilm.rate, quantity, discount, selectedAddOns])

  const toggleAddOn = (id: string) =>
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )

  const sizeLabel =
    selectedSize === "custom"
      ? `${customWidth}' × ${customHeight}' (${sqft} sqft)`
      : `${currentSize.description} (${currentSize.sqft} sqft)`

  const addOnNames = selectedAddOns
    .map((id) => addOns.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  return (
    <>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/services" className="hover:text-primary transition-colors">
                Services
              </Link>
              <span>/</span>
              <span>Window Film</span>
            </div>
            <h1 className="mb-4">Window Film Solutions</h1>
            <p className="text-lg text-muted-foreground">
              Privacy, Protection &amp; Style
            </p>
          </motion.div>
        </div>
      </section>

      {/* Configurator */}
      <section className="section-padding pt-0">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column — Summary & Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Live Preview Card */}
              <div className="aspect-[4/3] bg-muted/30 rounded-xl border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground px-6">
                  <Ruler size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-semibold text-lg">{currentFilm.label}</p>
                  <p className="text-sm mt-1">{sizeLabel}</p>
                  <p className="text-sm">
                    {quantity} window{quantity > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Features Card */}
              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Why Window Film?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {features.map((f) => (
                    <div
                      key={f.title}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle
                        size={14}
                        className="text-primary flex-shrink-0 mt-0.5"
                      />
                      <span>{f.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column — Configurator Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Film Type */}
              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Film Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {filmTypes.map((film) => (
                    <button
                      key={film.id}
                      onClick={() => setSelectedFilm(film.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        selectedFilm === film.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold">{film.label}</div>
                      <div className="text-sm text-primary mt-1">
                        ${film.rate}/sqft
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Window Size */}
              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Window Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {windowSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        selectedSize === size.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold">{size.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {size.description}
                      </div>
                      {size.id !== "custom" && (
                        <div className="text-sm text-primary mt-1">
                          {size.sqft} sqft
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedSize === "custom" && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Width (feet)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={customWidth}
                        onChange={(e) =>
                          setCustomWidth(Math.max(1, Number(e.target.value)))
                        }
                        className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Height (feet)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={customHeight}
                        onChange={(e) =>
                          setCustomHeight(Math.max(1, Number(e.target.value)))
                        }
                        className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
                      />
                    </div>
                    <div className="col-span-2 text-sm text-primary">
                      {customWidth}' × {customHeight}' = {sqft} sqft
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Number of Windows</h3>
                {!customQty ? (
                  <div className="flex flex-wrap gap-3">
                    {quantityPresets.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setQuantity(q)
                          setCustomQty(false)
                        }}
                        className={`px-5 py-3 rounded-lg border-2 font-semibold transition-all cursor-pointer ${
                          quantity === q && !customQty
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                    <button
                      onClick={() => setCustomQty(true)}
                      className="px-5 py-3 rounded-lg border-2 border-border hover:border-primary/50 font-semibold transition-all cursor-pointer"
                    >
                      Other
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                        disabled={quantity <= 1}
                      >
                        <Minus size={18} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value)))
                        }
                        className="w-20 text-center text-xl font-semibold p-2 rounded-lg border border-border bg-card text-foreground"
                      />
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setCustomQty(false)
                        if (!quantityPresets.includes(quantity))
                          setQuantity(1)
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      Back to presets
                    </button>
                  </div>
                )}
                {discount && (
                  <span className="inline-block mt-3 text-sm text-primary font-medium">
                    {discount.label} bulk discount applied!
                  </span>
                )}
                <div className="flex gap-2 mt-4">
                  {bulkDiscounts.map((tier) => (
                    <div
                      key={tier.minQty}
                      className={`flex-1 text-center p-2 rounded-lg text-xs ${
                        quantity >= tier.minQty
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-muted/30 text-muted-foreground"
                      }`}
                    >
                      <div className="font-semibold">{tier.label}</div>
                      <div>{tier.minQty}+ windows</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-Ons */}
              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Add-Ons (Optional)</h3>
                <div className="space-y-3">
                  {addOns.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all flex justify-between items-center cursor-pointer ${
                        selectedAddOns.includes(addon.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedAddOns.includes(addon.id)
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedAddOns.includes(addon.id) && (
                            <CheckCircle
                              size={14}
                              className="text-primary-foreground"
                            />
                          )}
                        </div>
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="text-primary font-semibold text-sm">
                        {addon.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="card-elevated bg-primary/5 border-primary/20">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {currentFilm.label} — {sqft} sqft × ${currentFilm.rate}/sqft × {quantity}
                    </span>
                    <span>${pricing.filmCost.toFixed(2)}</span>
                  </div>

                  {pricing.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Bulk Discount ({discount!.label})</span>
                      <span>-${pricing.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {pricing.addOnCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Add-ons</span>
                      <span>+${pricing.addOnCost.toFixed(2)}</span>
                    </div>
                  )}

                  {pricing.rushCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rush (+25%)</span>
                      <span>+${pricing.rushCost.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-border pt-2 flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <AddToCartButton
                  name="Window Film"
                  size={sizeLabel}
                  option={`${currentFilm.label}${addOnNames ? ` + ${addOnNames}` : ""}`}
                  price={pricing.total}
                  className="w-full text-base py-3"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-4">Why Choose Our Window Film</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade films backed by expert installation and industry
              warranties.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated"
              >
                <feature.icon
                  size={28}
                  className="text-primary mb-3"
                />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="mb-4">Need a Custom Solution?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Multi-story buildings, specialty films, or unique requirements? Let us
              design the perfect window film solution for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="btn-primary text-lg px-8 py-4"
              >
                Get a Custom Quote <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
