import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Megaphone, CheckCircle, Car } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

// Section 1: Flyers & Brochures
const flyersBrochures = [
  { size: 'Flyers (8.5" x 11")', description: "Full-page promotional flyers", price: 89, qtyPricing: [{ qty: "250", price: 89 }, { qty: "500", price: 139 }, { qty: "1000", price: 199 }] },
  { size: 'Half-Page (5.5" x 8.5")', description: "Compact marketing piece", price: 69, qtyPricing: [{ qty: "250", price: 69 }, { qty: "500", price: 109 }, { qty: "1000", price: 159 }] },
  { size: "Bi-Fold Brochure", description: "4-panel folded brochure", price: 179, qtyPricing: [{ qty: "250", price: 179 }, { qty: "500", price: 279 }, { qty: "1000", price: 399 }] },
  { size: "Tri-Fold Brochure", description: "6-panel folded brochure", price: 199, qtyPricing: [{ qty: "250", price: 199 }, { qty: "500", price: 319 }, { qty: "1000", price: 459 }] },
]

// Section 2: Promotional Print
const promotionalPrint = [
  { size: 'Postcards (4" x 6")', description: "Direct mail or handouts", price: 59, qtyPricing: [{ qty: "250", price: 59 }, { qty: "500", price: 89 }, { qty: "1000", price: 139 }] },
  { size: "Door Hangers", description: '3.5" x 8.5" with die-cut', price: 99, qtyPricing: [{ qty: "250", price: 99 }, { qty: "500", price: 149 }, { qty: "1000", price: 229 }] },
  { size: "Rack Cards", description: '4" x 9" display cards', price: 79, qtyPricing: [{ qty: "250", price: 79 }, { qty: "500", price: 119 }, { qty: "1000", price: 179 }] },
  { size: "Table Tents", description: '4" x 6" tri-fold stand', price: 89, qtyPricing: [{ qty: "50", price: 89 }, { qty: "100", price: 149 }, { qty: "250", price: 299 }] },
]

// Section 3: Magnets & Vehicle Signage
const magnetOptions = [
  { size: "Business Card Magnets", description: '3.5" x 2" magnetic cards', price: 129, qtyPricing: [{ qty: "100", price: 129 }, { qty: "250", price: 249 }, { qty: "500", price: 399 }] },
  { size: 'Vehicle Magnets (12" x 18")', description: "Removable car door signs", price: 49, qtyPricing: [{ qty: "1 pair", price: 49 }, { qty: "2 pairs", price: 89 }, { qty: "5 pairs", price: 199 }] },
  { size: 'Vehicle Magnets (12" x 24")', description: "Large car door magnets", price: 69, qtyPricing: [{ qty: "1 pair", price: 69 }, { qty: "2 pairs", price: 119 }, { qty: "5 pairs", price: 259 }] },
  { size: "Custom Shape Magnets", description: "Die-cut to your design", price: 159, qtyPricing: [{ qty: "100", price: 159 }, { qty: "250", price: 299 }, { qty: "500", price: 479 }] },
]

// Section 4: Additional Items
const additionalItems = [
  { name: "Counter Cards", description: "Tabletop displays", price: "From $79", priceValue: 79 },
  { name: "Gift Certificates", description: "With serial numbers", price: "From $69", priceValue: 69 },
  { name: "Coupons", description: "Perforated sheets", price: "From $49", priceValue: 49 },
  { name: "Event Tickets", description: "Numbered & perforated", price: "From $89", priceValue: 89 },
]

// Paper Options
const paperOptions = [
  { name: "100lb Gloss Text", description: "Standard glossy paper", price: "Included", priceValue: 0 },
  { name: "100lb Matte Text", description: "Non-reflective finish", price: "Included", priceValue: 0 },
  { name: "80lb Gloss Cover", description: "Thicker cardstock", price: "+$25", priceValue: 25 },
  { name: "100lb Gloss Cover", description: "Premium thick stock", price: "+$40", priceValue: 40 },
]

// Combined features from both pages
const features = [
  "Full-color printing",
  "Multiple fold options",
  "Various paper weights",
  "Custom die-cuts available",
  "UV coating available",
  "Weather-resistant options",
  "Free design assistance",
  "Fast 3-5 day turnaround",
]

function PricingGrid({ items, cartName }: { items: typeof flyersBrochures; cartName: string }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((option, i) => (
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
                <AddToCartButton name={cartName} size={option.size} option={`${tier.qty}`} price={tier.price} />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function PrintMarketing() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/business-print" className="hover:text-primary transition-colors">Business Print</Link>
              <span>/</span><span>Print Marketing</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Megaphone size={32} className="text-primary" />
              <h1>Print Marketing</h1>
            </div>
            <p className="text-lg text-muted-foreground">Flyers, brochures, postcards, magnets, and everything you need to promote your business offline. Full-color on premium paper stocks with multiple finish options.</p>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Flyers & Brochures */}
      <section className="section-padding pt-0">
        <div className="section-container">
          <h2 className="text-center mb-8">Flyers & Brochures</h2>
          <PricingGrid items={flyersBrochures} cartName="Print Marketing - Flyers & Brochures" />
        </div>
      </section>

      {/* Section 2: Promotional Print */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">Promotional Print</h2>
          <PricingGrid items={promotionalPrint} cartName="Print Marketing - Promotional Print" />
        </div>
      </section>

      {/* Section 3: Magnets & Vehicle Signage */}
      <section className="section-padding">
        <div className="section-container">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Car size={28} className="text-primary" />
            <h2>Magnets & Vehicle Signage</h2>
          </div>
          <PricingGrid items={magnetOptions} cartName="Print Marketing - Magnets" />
        </div>
      </section>

      {/* Section 4: Additional Items */}
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

      {/* Paper Options */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">Paper Options</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paperOptions.map((paper, i) => (
              <motion.div key={paper.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card-elevated flex flex-col items-center text-center">
                <h4 className="font-semibold">{paper.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{paper.description}</p>
                <span className={`text-sm font-semibold ${paper.priceValue === 0 ? "text-green-500" : "text-primary"}`}>{paper.price}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="text-center mb-8">What's Included</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
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
