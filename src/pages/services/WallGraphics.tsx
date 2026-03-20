import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle, Layers, Image, Diamond, Square } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const vinylGraphics = [
  { size: "Small (up to 4 sqft)", description: "Lettering & small logos", price: 120, qtyPricing: [{ qty: "1", price: 120 }, { qty: "3+", price: 100 }, { qty: "6+", price: 85 }] },
  { size: "Medium (4-12 sqft)", description: "Wall logos & displays", price: 280, qtyPricing: [{ qty: "1", price: 280 }, { qty: "3+", price: 240 }, { qty: "6+", price: 200 }] },
  { size: "Large (12-24 sqft)", description: "Feature walls & signage", price: 480, qtyPricing: [{ qty: "1", price: 480 }, { qty: "3+", price: 420 }, { qty: "6+", price: 360 }] },
  { size: "XL (24+ sqft)", description: "Full wall coverage", price: 0, qtyPricing: [], isCustom: true },
]

const wallMurals = [
  { size: "Small (4' x 4')", description: "Accent wall graphic", price: 350, qtyPricing: [{ qty: "1", price: 350 }, { qty: "2+", price: 300 }] },
  { size: "Medium (4' x 8')", description: "Half-wall coverage", price: 600, qtyPricing: [{ qty: "1", price: 600 }, { qty: "2+", price: 520 }] },
  { size: "Large (8' x 8')", description: "Full panel mural", price: 950, qtyPricing: [{ qty: "1", price: 950 }, { qty: "2+", price: 850 }] },
  { size: "Full Wall (Custom)", description: "Quote based on sqft", price: 0, qtyPricing: [], isCustom: true },
]

const acrylicSigns = [
  { size: '12" x 12"', description: "Small mounted panel", price: 150, qtyPricing: [{ qty: "1", price: 150 }, { qty: "3+", price: 130 }] },
  { size: '18" x 24"', description: "Medium mounted panel", price: 250, qtyPricing: [{ qty: "1", price: 250 }, { qty: "3+", price: 220 }] },
  { size: '24" x 36"', description: "Large mounted panel", price: 380, qtyPricing: [{ qty: "1", price: 380 }, { qty: "3+", price: 340 }] },
]

const foamBoards = [
  { size: '18" x 24"', description: "Standard poster size", price: 45, qtyPricing: [{ qty: "1", price: 45 }, { qty: "5+", price: 38 }, { qty: "10+", price: 30 }] },
  { size: '24" x 36"', description: "Large display", price: 65, qtyPricing: [{ qty: "1", price: 65 }, { qty: "5+", price: 55 }, { qty: "10+", price: 45 }] },
  { size: '36" x 48"', description: "Extra-large display", price: 95, qtyPricing: [{ qty: "1", price: 95 }, { qty: "5+", price: 80 }, { qty: "10+", price: 65 }] },
]

const features = [
  "Premium vinyl materials",
  "UV-resistant inks",
  "Removable options available",
  "Professional installation",
  "Custom shapes & sizes",
  "Free digital proof",
]

interface PricingOption {
  size: string
  description: string
  price: number
  qtyPricing: { qty: string; price: number }[]
  isCustom?: boolean
}

function ProductSection({ title, icon: Icon, products, productName, cols = "lg:grid-cols-4" }: {
  title: string
  icon: React.ElementType
  products: PricingOption[]
  productName: string
  cols?: string
}) {
  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-center mb-8">{title}</h2>
          <div className={`grid md:grid-cols-2 ${cols} gap-6`}>
            {products.map((option, index) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * (index + 1) }}
                className="card-elevated relative">
                <div className="text-center mb-4">
                  <Icon size={24} className="mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-lg">{option.size}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                {option.isCustom ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">Contact us for a custom quote based on your project specifications.</p>
                    <Link to="/contact" className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm transition-all hover:bg-primary/90 w-full">
                      Get Quote <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {option.qtyPricing.map((tier) => (
                        <div key={tier.qty} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                          <div>
                            <div className="font-medium text-sm">Qty: {tier.qty}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary">${tier.price}</div>
                            <div className="text-xs text-muted-foreground">each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      {option.qtyPricing.map((tier) => (
                        <AddToCartButton key={tier.qty} name={productName} size={option.size}
                          option={`Qty: ${tier.qty}`} price={tier.price}
                          className="w-full text-sm py-2" />
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function WallGraphics() {
  return (
    <>
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/signage" className="hover:text-primary transition-colors">Business Signage</Link>
              <span>/</span><span>Wall Graphics</span>
            </div>
            <h1 className="mb-4">Wall Graphics</h1>
            <p className="text-lg text-muted-foreground">Transform any wall into a branded experience. From cut vinyl lettering to full-color murals and mounted acrylic signs — we cover it all.</p>
          </motion.div>
        </div>
      </section>

      <ProductSection title="Vinyl Wall Graphics" icon={Layers} products={vinylGraphics} productName="Vinyl Wall Graphic" />
      <ProductSection title="Wall Murals" icon={Image} products={wallMurals} productName="Wall Mural" />
      <ProductSection title="Acrylic Signs" icon={Diamond} products={acrylicSigns} productName="Acrylic Sign" cols="lg:grid-cols-3" />
      <ProductSection title="Foam Board Displays" icon={Square} products={foamBoards} productName="Foam Board Display" cols="lg:grid-cols-3" />

      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated max-w-3xl mx-auto">
            <h2 className="text-center mb-6">What's Included</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={14} className="text-primary flex-shrink-0" /><span>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Ready to Transform Your Space?</h2>
            <p className="text-lg text-muted-foreground mb-8">Need a custom size, professional installation, or have a unique project in mind? We'll make it happen.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Custom Quote <ArrowRight size={20} /></Link>
              <Link to="/signage" className="btn-secondary text-lg px-8 py-4">View All Signage <ArrowRight size={20} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
