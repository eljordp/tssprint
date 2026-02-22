import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Tent, Flag, Table, Image, CheckCircle } from "lucide-react";

const sections = [
  {
    icon: Tent,
    title: "Canopies",
    description: "Branded 5x5, 10x10, 10x15, and 10x20 canopy tents with full-color printing. Durable frames and weather-resistant fabric for any event.",
    features: ["Multiple size options", "Full-color printing", "Water-resistant fabric", "Sturdy aluminum frames"],
    link: "/event-canopies/canopies",
  },
  {
    icon: Flag,
    title: "Feather Flags",
    description: "Eye-catching vertical displays that draw attention from a distance. Perfect for storefronts, events, and outdoor promotions.",
    features: ["Feather & teardrop flags", "Retractable banners", "X-stand banners", "Hanging banners"],
    link: "/event-canopies/feather-flags",
  },
  {
    icon: Table,
    title: "Table Covers & Throws",
    description: "Professional branded table covers that complete your booth setup. Available in fitted, draped, and stretch styles.",
    features: ["6ft & 8ft sizes", "Fitted or draped styles", "Stretch fabric options", "Machine washable"],
    link: "/event-canopies/table-covers",
  },
  {
    icon: Image,
    title: "Backdrops & Displays",
    description: "Large-format backdrops and display systems for trade shows, photo ops, and presentations. Make a statement at any event.",
    features: ["Step & repeat walls", "Fabric backdrops", "Pop-up displays", "Portable systems"],
    link: "/event-canopies/backdrops",
  },
];

export default function Canopies() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="mb-4">Event Branding & Displays</h1>
            <p className="text-lg text-muted-foreground">Stand out at trade shows, farmers markets, and outdoor events with professional branded displays.</p>
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
            <h2 className="mb-4">Ready for Your Next Event?</h2>
            <p className="text-lg text-muted-foreground mb-8">From canopies to complete booth setups, we'll help you make a lasting impression. Every quote includes a free digital proof.</p>
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
