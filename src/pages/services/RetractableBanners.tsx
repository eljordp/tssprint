import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, MapPin, CheckCircle } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const pricingOptions = [
  { size: 'Economy (33" x 78")', description: "Budget-friendly option", price: 89, qtyPricing: [{ qty: "1", price: 89 }, { qty: "2-5", price: 79 }, { qty: "6+", price: 69 }] },
  { size: 'Standard (33" x 81")', description: "Most popular size", price: 129, qtyPricing: [{ qty: "1", price: 129 }, { qty: "2-5", price: 109 }, { qty: "6+", price: 95 }] },
  { size: 'Premium (36" x 85")', description: "Wider, taller display", price: 169, qtyPricing: [{ qty: "1", price: 169 }, { qty: "2-5", price: 149 }, { qty: "6+", price: 129 }] },
  { size: 'Wide (47" x 85")', description: "Maximum visibility", price: 229, qtyPricing: [{ qty: "1", price: 229 }, { qty: "2-5", price: 199 }, { qty: "6+", price: 179 }] },
]

const bannerTypes = [
  { name: "Single-Sided", description: "Standard retractable banner", price: 0, label: "Base price" },
  { name: "Double-Sided", description: "Graphics on both sides", price: 50, label: "+$50" },
  { name: "Outdoor Base", description: "Wind-resistant weighted base", price: 40, label: "+$40" },
  { name: "Travel Case", description: "Padded carrying case", price: 25, label: "+$25" },
]

const features = [
  "Full-color printing",
  "Premium anti-curl material",
  "Aluminum retractable base",
  "Carrying bag included",
  "Sets up in seconds",
  "Free design assistance",
]

export default function RetractableBanners() {
  return (
    <>
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/signage" className="hover:text-primary transition-colors">Signage</Link>
              <span>/</span><span>Retractable Banners</span>
            </div>
            <h1 className="mb-4">Retractable Banners</h1>
            <p className="text-lg text-muted-foreground">Portable, professional retractable banner stands. Perfect for trade shows, lobbies, events, and retail displays. Sets up in seconds.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-center mb-8">Choose Your Size</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingOptions.map((option, index) => (
                <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (index + 1) }}
                  className={`card-elevated relative ${option.description === "Most popular size" ? "border-primary/50 ring-2 ring-primary/20" : ""}`}>
                  {option.description === "Most popular size" && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">Most Popular</span>
                  )}
                  <div className="text-center mb-4">
                    <MapPin size={24} className="mx-auto mb-2 text-primary" />
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
                      <AddToCartButton key={tier.qty} name="Retractable Banner" size={option.size}
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
            <h2 className="text-center mb-8">Upgrade Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bannerTypes.map((type) => (
                <div key={type.name} className="card-elevated text-center">
                  <h3 className="font-semibold mb-1">{type.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <span className="text-primary font-semibold">{type.label}</span>
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
            <p className="text-lg text-muted-foreground mb-8">Have specific requirements or need a custom size? Contact us for personalized recommendations and bulk pricing.</p>
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
