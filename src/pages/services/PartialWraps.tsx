import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Palette, CheckCircle } from "lucide-react";

const pricingOptions = [
  {
    size: "Quarter Wrap",
    description: "Rear or single side coverage",
    price: "$500",
    qtyPricing: [
      { qty: "1", price: "$500" },
      { qty: "2-3", price: "$450 each" },
      { qty: "4+", price: "$400 each" },
    ],
  },
  {
    size: "Half Wrap",
    description: "Both sides or front/back coverage",
    price: "$900",
    qtyPricing: [
      { qty: "1", price: "$900" },
      { qty: "2-3", price: "$800 each" },
      { qty: "4+", price: "$700 each" },
    ],
  },
  {
    size: "Three-Quarter Wrap",
    description: "Sides + rear or hood coverage",
    price: "$1,400",
    qtyPricing: [
      { qty: "1", price: "$1,400" },
      { qty: "2-3", price: "$1,250 each" },
      { qty: "4+", price: "$1,100 each" },
    ],
  },
  {
    size: "Custom Coverage",
    description: "Tailored to your needs",
    price: "Quote",
    qtyPricing: [
      { qty: "Any", price: "Contact us" },
    ],
  },
];

const features = [
  "Premium cast vinyl (3M/Avery)",
  "5-7 year outdoor durability",
  "Professional design included",
  "Expert installation",
  "Paint protection",
  "Free digital proof",
];

export default function PartialWraps() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/vehicle-graphics" className="hover:text-primary transition-colors">Vehicle Graphics</Link>
              <span>/</span>
              <span>Partial Wraps</span>
            </div>
            <h1 className="mb-4">Partial Vehicle Wraps</h1>
            <p className="text-lg text-muted-foreground">Strategic coverage that maximizes visibility while keeping costs manageable. Covers key areas like sides, rear, or hood.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Pricing</h2>
            <p className="text-muted-foreground">Prices based on standard sedan/SUV. Larger vehicles quoted separately.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingOptions.map((option, index) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card-elevated flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Palette size={20} className="text-primary" />
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
            <h2 className="mb-4">Ready to Wrap Your Vehicle?</h2>
            <p className="text-lg text-muted-foreground mb-8">Send us photos of your vehicle and we'll provide a custom quote with a free digital mockup.</p>
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
