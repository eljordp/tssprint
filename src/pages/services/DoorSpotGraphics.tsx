import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Car, CheckCircle } from "lucide-react";

const pricingOptions = [
  {
    size: 'Small (12" x 12")',
    description: "Logo or text on one door",
    price: "$75",
    qtyPricing: [
      { qty: "1-2", price: "$75 each" },
      { qty: "3-5", price: "$65 each" },
      { qty: "6+", price: "$55 each" },
    ],
  },
  {
    size: 'Medium (18" x 18")',
    description: "Logo with contact info",
    price: "$120",
    qtyPricing: [
      { qty: "1-2", price: "$120 each" },
      { qty: "3-5", price: "$100 each" },
      { qty: "6+", price: "$85 each" },
    ],
  },
  {
    size: 'Large (24" x 24")',
    description: "Full door logo treatment",
    price: "$175",
    qtyPricing: [
      { qty: "1-2", price: "$175 each" },
      { qty: "3-5", price: "$150 each" },
      { qty: "6+", price: "$125 each" },
    ],
  },
  {
    size: 'Door Panel (36" x 18")',
    description: "Complete door branding",
    price: "$225",
    qtyPricing: [
      { qty: "1-2", price: "$225 each" },
      { qty: "3-5", price: "$195 each" },
      { qty: "6+", price: "$165 each" },
    ],
  },
];

const features = [
  "Premium 3M or Avery vinyl",
  "UV & weather resistant",
  "Professional installation available",
  "Easy removal without damage",
  "Custom shapes & sizes available",
  "Free digital proof included",
];

export default function DoorSpotGraphics() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/vehicle-graphics" className="hover:text-primary transition-colors">Vehicle Graphics</Link>
              <span>/</span>
              <span>Door & Spot Graphics</span>
            </div>
            <h1 className="mb-4">Door & Spot Graphics</h1>
            <p className="text-lg text-muted-foreground">Affordable branding that makes an impact. Perfect for company logos, contact info, and essential messaging on work vehicles.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Pricing</h2>
            <p className="text-muted-foreground">Volume discounts available for fleet orders.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingOptions.map((option, index) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card-elevated flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Car size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.size}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-4">
                  {option.price}
                  <span className="text-sm font-normal text-muted-foreground"> starting</span>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Pricing</p>
                  {option.qtyPricing.map((tier) => (
                    <div key={tier.qty} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tier.qty}</span>
                      <span className="font-medium">{tier.price}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
            <h3 className="font-semibold mb-4">What's Included</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={14} className="text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-surface-overlay">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Need a Custom Size?</h2>
            <p className="text-lg text-muted-foreground mb-8">We can create door graphics in any size or shape. Contact us for a custom quote and free digital proof.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Custom Quote <ArrowRight size={20} /></Link>
              <Link to="/vehicle-graphics" className="btn-secondary text-lg px-8 py-4">View All Vehicle Graphics</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
