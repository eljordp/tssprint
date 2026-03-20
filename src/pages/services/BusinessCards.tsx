import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, CreditCard, CheckCircle } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const pricingOptions = [
  { size: 'Standard (3.5" x 2")', description: "Classic business card size", quantities: [{ qty: 250, price: 49 }, { qty: 500, price: 79 }, { qty: 1000, price: 129 }] },
  { size: 'Square (2.5" x 2.5")', description: "Modern square format", quantities: [{ qty: 250, price: 59 }, { qty: 500, price: 89 }, { qty: 1000, price: 149 }] },
  { size: 'Mini (3" x 1")', description: "Slim profile cards", quantities: [{ qty: 250, price: 39 }, { qty: 500, price: 59 }, { qty: 1000, price: 99 }] },
]
const finishOptions = [
  { name: "Matte", description: "Smooth, non-reflective finish", price: "Included", priceValue: 0 },
  { name: "Gloss", description: "Shiny, vibrant colors", price: "Included", priceValue: 0 },
  { name: "Soft-Touch", description: "Velvety premium feel", price: "+$15", priceValue: 15 },
  { name: "Spot UV", description: "Glossy accents on matte", price: "+$25", priceValue: 25 },
  { name: "Foil Stamping", description: "Gold, silver, or copper", price: "+$35", priceValue: 35 },
  { name: "Rounded Corners", description: "Modern curved edges", price: "+$10", priceValue: 10 },
]
const features = ["Premium 16pt cardstock", "Full-color printing", "Double-sided available", "Free design assistance", "Proof before printing", "Fast turnaround"]

export default function BusinessCards() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/business-print" className="hover:text-primary transition-colors">Business Print</Link>
              <span>/</span><span>Business Cards</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <CreditCard size={32} className="text-primary" />
              <h1>Business Cards</h1>
            </div>
            <p className="text-lg text-muted-foreground">Premium business cards printed on thick 16pt cardstock with a variety of finishes. Make a lasting first impression.</p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="section-padding pt-0">
        <div className="section-container">
          <h2 className="text-center mb-8">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingOptions.map((option, i) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card-elevated">
                <h3 className="font-semibold text-lg mb-1">{option.size}</h3>
                <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                <div className="space-y-3">
                  {option.quantities.map((tier) => (
                    <div key={tier.qty} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <div>
                        <span className="font-medium">{tier.qty} cards</span>
                        <span className="text-primary font-semibold ml-2">${tier.price}</span>
                      </div>
                      <AddToCartButton name="Business Cards" size={option.size} option={`${tier.qty} cards`} price={tier.price} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finish Options */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">Finish Options</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {finishOptions.map((finish, i) => (
              <motion.div key={finish.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card-elevated flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{finish.name}</h4>
                  <p className="text-sm text-muted-foreground">{finish.description}</p>
                </div>
                <span className={`text-sm font-semibold ${finish.priceValue === 0 ? "text-green-500" : "text-primary"}`}>{finish.price}</span>
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
