import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, PanelTop, CheckCircle } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const pricingOptions = [
  { size: 'Small (20" x 20")', description: "Compact square sidewalk sign", price: 129, qtyPricing: [{ qty: "1-2", price: 129 }, { qty: "3-5", price: 120 }, { qty: "6+", price: 108 }] },
  { size: 'Standard (24" x 36")', description: "Standard Large Sidewalk Sign", price: 259, qtyPricing: [{ qty: "1-2", price: 259 }, { qty: "3-5", price: 240 }, { qty: "6+", price: 218 }] },
]

const signStyles = [
  { name: "Permanent Graphics", description: "Weather-resistant vinyl", price: "Base price" },
  { name: "Changeable Inserts", description: "Snap frame for easy swaps", price: "+$20" },
  { name: "Chalkboard Surface", description: "Write your own messages", price: "+$15" },
  { name: "Weighted Base", description: "Extra stability for wind", price: "+$25" },
]

const features = [
  "Weather-resistant materials",
  "Foldable for easy storage",
  "Double-sided display",
  "UV-resistant graphics",
  "Rust-proof hardware",
  "Free design assistance",
]

export default function AFrameSigns() {
  return (
    <>
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/signage" className="hover:text-primary transition-colors">Signage</Link>
              <span>/</span><span>A-Frame Signs</span>
            </div>
            <h1 className="mb-4">A-Frame Signs</h1>
            <p className="text-lg text-muted-foreground">Portable sidewalk signs that grab attention. Perfect for restaurants, retail stores, salons, and events. Double-sided for maximum visibility.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-center mb-8">Choose Your Size</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {pricingOptions.map((option, index) => (
                <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (index + 1) }}
                  className="card-elevated">
                  <div className="text-center mb-4">
                    <PanelTop size={24} className="mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold text-lg">{option.size}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
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
                      <AddToCartButton key={tier.qty} name="A-Frame Sign" size={option.size}
                        option={`Qty: ${tier.qty}`} price={tier.price}
                        className="w-full text-sm py-2" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-center mb-8">Style Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {signStyles.map((style) => (
                <div key={style.name} className="card-elevated text-center">
                  <h3 className="font-semibold mb-1">{style.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{style.description}</p>
                  <span className="text-primary font-semibold">{style.price}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

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
            <h2 className="mb-4">Need a Custom Solution?</h2>
            <p className="text-lg text-muted-foreground mb-8">Looking for a specific size, shape, or style? Contact us for custom A-frame signs tailored to your business needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Quote <ArrowRight size={20} /></Link>
              <Link to="/signage" className="btn-secondary text-lg px-8 py-4">View All Signage <ArrowRight size={20} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
