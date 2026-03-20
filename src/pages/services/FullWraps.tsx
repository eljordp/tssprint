import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, CheckCircle } from "lucide-react";

const pricingOptions = [
  {
    size: "Compact Car",
    description: "Coupe, hatchback, small sedan",
    price: "$2,500",
    qtyPricing: [
      { qty: "1", price: "$2,500" },
      { qty: "2-3", price: "$2,250 each" },
      { qty: "4+", price: "$2,000 each" },
    ],
  },
  {
    size: "Sedan/SUV",
    description: "Standard cars and crossovers",
    price: "$3,200",
    qtyPricing: [
      { qty: "1", price: "$3,200" },
      { qty: "2-3", price: "$2,900 each" },
      { qty: "4+", price: "$2,600 each" },
    ],
  },
  {
    size: "Truck/Van",
    description: "Pickup trucks and cargo vans",
    price: "$4,000",
    qtyPricing: [
      { qty: "1", price: "$4,000" },
      { qty: "2-3", price: "$3,600 each" },
      { qty: "4+", price: "$3,200 each" },
    ],
  },
  {
    size: "Box Truck/Trailer",
    description: "Large commercial vehicles",
    price: "$5,500+",
    qtyPricing: [
      { qty: "Any", price: "Custom quote" },
    ],
  },
];

const features = [
  "Premium 3M 2080 or Avery Supreme vinyl",
  "7+ year outdoor durability",
  "Full custom design included",
  "Professional certified installation",
  "Complete paint protection",
  "Warranty included",
];

export default function FullWraps() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/vehicle-graphics" className="hover:text-primary transition-colors">Vehicle Graphics</Link>
              <span>/</span>
              <span>Full Wraps</span>
            </div>
            <h1 className="mb-4">Full Vehicle Wraps</h1>
            <p className="text-lg text-muted-foreground">Complete vehicle transformation with edge-to-edge graphics. Maximum brand exposure that turns heads everywhere you go.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Pricing by Vehicle Type</h2>
            <p className="text-muted-foreground">Includes design, materials, and professional installation.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingOptions.map((option, index) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card-elevated flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Truck size={20} className="text-primary" />
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
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Fleet Pricing</p>
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
            <h2 className="mb-4">Ready for a Complete Transformation?</h2>
            <p className="text-lg text-muted-foreground mb-8">Send us photos of your vehicle and your vision. We'll create a custom mockup so you can see exactly how it will look.</p>
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
