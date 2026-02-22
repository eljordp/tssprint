import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Truck, Palette, Shield, CheckCircle } from "lucide-react";

const sections = [
  {
    icon: Car,
    title: "Door & Spot Graphics",
    description: "Affordable branding that makes an impact. Perfect for company logos, contact info, and essential messaging on work vehicles.",
    features: ["Logo placement on doors", "Contact information", "Quick installation", "Easy removal & updates"],
    link: "/vehicle-graphics/door-spot",
  },
  {
    icon: Palette,
    title: "Partial Wraps",
    description: "Strategic coverage that maximizes visibility while keeping costs manageable. Covers key areas like sides, rear, or hood.",
    features: ["Side panel coverage", "Rear window graphics", "Hood & bumper wraps", "Custom design layouts"],
    link: "/vehicle-graphics/partial-wraps",
  },
  {
    icon: Truck,
    title: "Full Vehicle Wraps",
    description: "Complete vehicle transformation with edge-to-edge graphics. Maximum brand exposure that turns heads everywhere you go.",
    features: ["Complete coverage", "Color change wraps", "Complex designs welcome", "Premium vinyl materials"],
    link: "/vehicle-graphics/full-wraps",
  },
  {
    icon: Shield,
    title: "Fleet Branding",
    description: "Consistent branding across your entire fleet. Volume pricing and coordinated designs that reinforce your brand identity.",
    features: ["Multi-vehicle discounts", "Consistent branding", "Fleet management", "Scheduled installations"],
    link: "/vehicle-graphics/fleet-branding",
  },
];

export default function VehicleGraphics() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="mb-4">Vehicle & Fleet Graphics</h1>
            <p className="text-lg text-muted-foreground">Turn your vehicles into mobile billboards with professional wraps and graphics that demand attention.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Link key={section.title} to={section.link} className="block">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card-elevated hover:border-primary/50 transition-colors group">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-semibold mb-2">{section.title}</h2>
                        <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {section.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={14} className="text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-sm font-medium text-primary group-hover:underline">View Pricing & Options →</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-overlay">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Ready to Wrap Your Fleet?</h2>
            <p className="text-lg text-muted-foreground mb-8">From single vehicles to entire fleets, we'll design and install graphics that get your brand noticed. Every quote includes a free digital proof.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Start My Project <ArrowRight size={20} /></Link>
              <Link to="/contact" className="btn-secondary text-lg px-8 py-4">Get a Proof in 24 Hours <ArrowRight size={20} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
