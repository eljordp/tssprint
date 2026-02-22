import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, FileText, Briefcase, Gift, CheckCircle } from "lucide-react";

const sections = [
  {
    icon: CreditCard,
    title: "Business Cards & Identity Kits",
    description: "Make a lasting first impression with premium business cards. Available in standard, thick, and ultra-thick stocks with options for matte, gloss, spot UV, and foil finishes.",
    features: ["Standard & custom sizes", "Matte, gloss, or soft-touch finishes", "Foil stamping & spot UV", "Rounded corners available"],
    link: "/business-print/business-cards",
  },
  {
    icon: FileText,
    title: "Flyers, Brochures & Marketing Collateral",
    description: "Eye-catching promotional materials to showcase your products, services, and events. From single-page flyers to multi-fold brochures.",
    features: ["Single, bi-fold, tri-fold options", "Various paper weights", "Full-color or spot color printing", "Custom die-cut shapes"],
    link: "/business-print/marketing-collateral",
  },
  {
    icon: Briefcase,
    title: "Office & Operations Printing",
    description: "Professional stationery and operational documents that reinforce your brand across all business communications.",
    features: ["Letterheads & envelopes", "Notepads & memo pads", "Invoice & receipt books", "Presentation folders"],
    link: "/business-print/office-printing",
  },
  {
    icon: Gift,
    title: "Promotional & Branded Materials",
    description: "Stand out at trade shows, events, and retail spaces with custom promotional items that keep your brand top of mind.",
    features: ["Postcards & mailers", "Door hangers & rack cards", "Magnets & vehicle magnets", "Gift certificates & coupons"],
    link: "/business-print/promotional-materials",
  },
];

export default function BusinessPrint() {
  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="mb-4">Business Print Essentials</h1>
            <p className="text-lg text-muted-foreground">Professional everyday print assets built for durability, clarity, and a strong first impression.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="card-elevated">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <section.icon size={24} className="text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold mb-2">{section.title}</h2>
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
                  </div>
                  <Link to={section.link} className="btn-primary whitespace-nowrap group">
                    View Pricing <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-overlay">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Ready to Elevate Your Brand?</h2>
            <p className="text-lg text-muted-foreground mb-8">From business cards to complete branding kits, we'll help you make the right impression. Every quote includes a free digital proof.</p>
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
