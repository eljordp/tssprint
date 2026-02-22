import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, CheckCircle } from "lucide-react";

const pricingOptions = [
  {
    size: "Starter Fleet (3-5)",
    description: "Small business fleet",
    price: "15% off",
    qtyPricing: [
      { qty: "Door graphics", price: "From $55/ea" },
      { qty: "Partial wraps", price: "From $600/ea" },
      { qty: "Full wraps", price: "From $2,200/ea" },
    ],
  },
  {
    size: "Growing Fleet (6-10)",
    description: "Expanding operations",
    price: "20% off",
    qtyPricing: [
      { qty: "Door graphics", price: "From $50/ea" },
      { qty: "Partial wraps", price: "From $550/ea" },
      { qty: "Full wraps", price: "From $2,000/ea" },
    ],
  },
  {
    size: "Large Fleet (11-25)",
    description: "Regional coverage",
    price: "25% off",
    qtyPricing: [
      { qty: "Door graphics", price: "From $45/ea" },
      { qty: "Partial wraps", price: "From $500/ea" },
      { qty: "Full wraps", price: "From $1,800/ea" },
    ],
  },
  {
    size: "Enterprise (26+)",
    description: "National operations",
    price: "Custom",
    qtyPricing: [
      { qty: "All services", price: "Volume pricing" },
      { qty: "Dedicated support", price: "Included" },
    ],
  },
];

const features = [
  "Consistent branding across all vehicles",
  "Dedicated fleet account manager",
  "Scheduled installation windows",
  "Priority turnaround times",
  "Replacement graphics program",
  "Brand guidelines compliance",
];

export default function FleetBranding() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/vehicle-graphics" className="hover:text-primary transition-colors">Vehicle Graphics</Link>
              <span>/</span>
              <span>Fleet Branding</span>
            </div>
            <h1 className="mb-4">Fleet Branding Programs</h1>
            <p className="text-lg text-muted-foreground">Consistent branding across your entire fleet. Volume pricing and coordinated designs that reinforce your brand identity.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Fleet Volume Discounts</h2>
            <p className="text-muted-foreground">The more vehicles you brand, the more you save.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingOptions.map((option, index) => (
              <motion.div key={option.size} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card-elevated flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.size}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-4">
                  {option.price}
                  <span className="text-sm font-normal text-muted-foreground"> discount</span>
                </div>
                <div className="space-y-2 mt-auto">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Pricing</p>
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
            <h3 className="font-semibold mb-4">Fleet Program Benefits</h3>
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
            <h2 className="mb-4">Let's Brand Your Fleet</h2>
            <p className="text-lg text-muted-foreground mb-8">Tell us about your fleet size and branding goals. We'll create a custom proposal with volume pricing.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get Fleet Pricing <ArrowRight size={20} /></Link>
              <Link to="/vehicle-graphics" className="btn-secondary text-lg px-8 py-4">View All Vehicle Graphics</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
