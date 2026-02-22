import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, CheckCircle } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const pricingOptions = [
  { size: "Letterhead", description: '8.5" x 11" branded stationery', price: 99, qtyPricing: [{ qty: "250", price: 99 }, { qty: "500", price: 149 }, { qty: "1000", price: 229 }] },
  { size: "#10 Envelopes", description: "Standard business envelopes", price: 129, qtyPricing: [{ qty: "250", price: 129 }, { qty: "500", price: 189 }, { qty: "1000", price: 299 }] },
  { size: "Notepads", description: "50 sheets per pad, branded", price: 79, qtyPricing: [{ qty: "10 pads", price: 79 }, { qty: "25 pads", price: 159 }, { qty: "50 pads", price: 279 }] },
  { size: "Presentation Folders", description: '9" x 12" with pockets', price: 199, qtyPricing: [{ qty: "100", price: 199 }, { qty: "250", price: 349 }, { qty: "500", price: 549 }] },
]
const additionalItems = [
  { name: "Invoice Books", description: "NCR carbonless copies", price: "From $89", priceValue: 89 },
  { name: "Receipt Books", description: "Numbered with duplicates", price: "From $69", priceValue: 69 },
  { name: "Memo Pads", description: "Custom sizes available", price: "From $49", priceValue: 49 },
  { name: "Appointment Cards", description: "Match your business cards", price: "From $39", priceValue: 39 },
]
const features = ["Consistent brand identity", "Premium paper stocks", "Full-color or 1-color printing", "Matching sets available", "Free design assistance", "Bulk order discounts"]

export default function OfficePrinting() {
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
            <p className="text-lg text-muted-foreground">Letterheads, envelopes, notepads, and presentation folders. Keep your brand consistent across all office materials.</p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="section-padding pt-0">
        <div className="section-container">
          <h2 className="text-center mb-8">Pricing</h2>
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
                      <AddToCartButton name="Office Printing" size={option.size} option={`${tier.qty}`} price={tier.price} />
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
