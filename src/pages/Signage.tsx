import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Lightbulb, MapPin, PanelTop, CheckCircle } from "lucide-react";

const sections = [
  {
    icon: Building2,
    title: "Storefront & Building Signs",
    description: "Make your business visible from the street with professional exterior signage. Channel letters, cabinet signs, and dimensional logos.",
    features: ["Channel letters", "Cabinet signs", "Dimensional logos", "Monument signs"],
    link: "/contact",
  },
  {
    icon: Lightbulb,
    title: "Wall Graphics",
    description: "Stand out day and night with vinyl wall graphics that bring vision to your store. Keep your brand visible 24/7.",
    features: ["LED channel letters", "Backlit signs", "Neon alternatives", "Light box displays"],
    link: "/contact",
  },
  {
    icon: MapPin,
    title: "Retractable Banners",
    description: "Guide customers and visitors with clear, professional wayfinding signage. Indoor and outdoor solutions for any space.",
    features: ["Directory signs", "ADA compliant signs", "Parking lot signs", "Interior wayfinding"],
    link: "/business-signage/retractable-banners",
  },
  {
    icon: PanelTop,
    title: "A-Frames & Sidewalk Signs",
    description: "Portable signage that brings foot traffic to your door. Perfect for daily specials, promotions, and directional messaging.",
    features: ["A-frame signs", "Sandwich boards", "Poster frames", "Wind-resistant designs"],
    link: "/business-signage/a-frames",
  },
];

export default function Signage() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="mb-4">Business Signage</h1>
            <p className="text-lg text-muted-foreground">Professional signage solutions that elevate your storefront and guide your customers.</p>
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
            <h2 className="mb-4">Ready to Upgrade Your Signage?</h2>
            <p className="text-lg text-muted-foreground mb-8">From storefront signs to complete wayfinding systems, we'll help your business stand out. Every quote includes a free digital proof.</p>
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
