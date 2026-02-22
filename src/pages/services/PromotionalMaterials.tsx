import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Gift, CheckCircle, Car } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const pricingOptions = [
  { size: 'Postcards (4" x 6")', description: "Direct mail or handouts", price: 59, qtyPricing: [{ qty: "250", price: 59 }, { qty: "500", price: 89 }, { qty: "1000", price: 139 }] },
  { size: "Door Hangers", description: '3.5" x 8.5" with die-cut', price: 99, qtyPricing: [{ qty: "250", price: 99 }, { qty: "500", price: 149 }, { qty: "1000", price: 229 }] },
  { size: "Rack Cards", description: '4" x 9" display cards', price: 79, qtyPricing: [{ qty: "250", price: 79 }, { qty: "500", price: 119 }, { qty: "1000", price: 179 }] },
  { size: "Table Tents", description: '4" x 6" tri-fold stand', price: 89, qtyPricing: [{ qty: "50", price: 89 }, { qty: "100", price: 149 }, { qty: "250", price: 299 }] },
]
const magnetOptions = [
  { size: "Business Card Magnets", description: '3.5" x 2" magnetic cards', price: 129, qtyPricing: [{ qty: "100", price: 129 }, { qty: "250", price: 249 }, { qty: "500", price: 399 }] },
  { size: 'Vehicle Magnets (12" x 18")', description: "Removable car door signs", price: 49, qtyPricing: [{ qty: "1 pair", price: 49 }, { qty: "2 pairs", price: 89 }, { qty: "5 pairs", price: 199 }] },
  { size: 'Vehicle Magnets (12" x 24")', description: "Large car door magnets", price: 69, qtyPricing: [{ qty: "1 pair", price: 69 }, { qty: "2 pairs", price: 119 }, { qty: "5 pairs", price: 259 }] },
  { size: "Custom Shape Magnets", description: "Die-cut to your design", price: 159, qtyPricing: [{ qty: "100", price: 159 }, { qty: "250", price: 299 }, { qty: "500", price: 479 }] },
]
const additionalItems = [
  { name: "Counter Cards", description: "Tabletop displays", price: "From $79", priceValue: 79 },
  { name: "Gift Certificates", description: "With serial numbers", price: "From $69", priceValue: 69 },
  { name: "Coupons", description: "Perforated sheets", price: "From $49", priceValue: 49 },
  { name: "Event Tickets", description: "Numbered & perforated", price: "From $89", priceValue: 89 },
]
const features = ["Full-color printing", "UV coating available", "Weather-resistant options", "Custom die-cuts", "Free design assistance", "Fast turnaround"]

export default function PromotionalMaterials() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/business-print" className="hover:text-primary transition-colors">Business Print</Link>
              <span>/</span><span>Promotional Materials</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift size={32} className="text-primary" />
              <h1>Promotional Materials</h1>
            </div>
            <p className="text-lg text-muted-foreground">Postcards, door hangers, rack cards, magnets, and more. Everything you need to promote your business offline.</p>
          </motion.div>
        </div>
      </section>

      {/* Promotional Print Pricing Grid */}
      <section className="section-padding pt-0">
        <div className="section-container">
          <h2 className="text-center mb-8">Promotional Print Pricing</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingOptions.map((option, i) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-elevated">
                <h3 className="font-semibold text-lg mb-1">{option.size}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <div className="space-y-3">
                  {option.qtyPricing.map((tier) => (
                    <div key={tier.qty} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tier.qty}</span>
                        <span className="text-primary font-semibold">${tier.price}</span>
                      </div>
                      <AddToCartButton name="Promotional Materials" size={option.size} option={`${tier.qty}`} price={tier.price} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Magnets Section */}
      <section className="section-padding">
        <div className="section-container">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Car size={28} className="text-primary" />
            <h2>Magnets & Vehicle Signage</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {magnetOptions.map((option, i) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-elevated">
                <h3 className="font-semibold text-lg mb-1">{option.size}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <div className="space-y-3">
                  {option.qtyPricing.map((tier) => (
                    <div key={tier.qty} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{tier.qty}</span>
                        <span className="text-primary font-semibold">${tier.price}</span>
                      </div>
                      <AddToCartButton name="Magnets" size={option.size} option={`${tier.qty}`} price={tier.price} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Items */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">Additional Items</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalItems.map((item, i) => (
              <motion.div key={item.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card-elevated flex flex-col items-center text-center">
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
            <p className="text-lg text-muted-foreground mb-8">Have specific requirements or need a large order? Get in touch for a personalized quote.</p>
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
