import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Building2, CheckCircle, Lightbulb, Box, Landmark } from "lucide-react"
import AddToCartButton from "@/components/cart/AddToCartButton"

const channelLetters = [
  {
    size: "Small Set (up to 6 letters)",
    description: "Storefronts & small businesses",
    qtyPricing: [
      { qty: "1", price: 1200 },
      { qty: "2+", price: 1100 },
      { qty: "4+", price: 950 },
    ],
  },
  {
    size: "Medium Set (7-12 letters)",
    description: "Most common business signage",
    qtyPricing: [
      { qty: "1", price: 2200 },
      { qty: "2+", price: 2000 },
      { qty: "4+", price: 1800 },
    ],
  },
  {
    size: "Large Set (13+ letters)",
    description: "Large storefronts & plazas",
    qtyPricing: [{ qty: "1", price: 3500, label: "Starting at" }],
    customQuote: true,
  },
]

const cabinetSigns = [
  {
    size: "2' x 4'",
    description: "Small lightbox sign",
    qtyPricing: [
      { qty: "1", price: 800 },
      { qty: "2+", price: 700 },
    ],
  },
  {
    size: "3' x 6'",
    description: "Standard lightbox sign",
    qtyPricing: [
      { qty: "1", price: 1400 },
      { qty: "2+", price: 1200 },
    ],
  },
  {
    size: "4' x 8'",
    description: "Large lightbox sign",
    qtyPricing: [
      { qty: "1", price: 2200 },
      { qty: "2+", price: 1900 },
    ],
  },
  {
    size: "Custom Size",
    description: "Any size to fit your space",
    qtyPricing: [],
    customQuote: true,
  },
]

const dimensionalLetters = [
  {
    size: 'Small (up to 8")',
    description: "Suite numbers & small signage",
    unit: "/letter",
    qtyPricing: [
      { qty: "1-9", price: 25 },
      { qty: "10+", price: 20 },
      { qty: "20+", price: 16 },
    ],
  },
  {
    size: 'Medium (8"-16")',
    description: "Standard lobby & wall letters",
    unit: "/letter",
    qtyPricing: [
      { qty: "1-9", price: 45 },
      { qty: "10+", price: 38 },
      { qty: "20+", price: 30 },
    ],
  },
  {
    size: 'Large (16"-24")',
    description: "Exterior & high-visibility letters",
    unit: "/letter",
    qtyPricing: [
      { qty: "1-9", price: 75 },
      { qty: "10+", price: 65 },
      { qty: "20+", price: 55 },
    ],
  },
]

const monumentSigns = [
  {
    size: "Standard (4' x 2')",
    description: "Business entrance sign",
    qtyPricing: [
      { qty: "1", price: 2800 },
      { qty: "2+", price: 2500 },
    ],
  },
  {
    size: "Large (6' x 3')",
    description: "Campus & plaza entrance sign",
    qtyPricing: [
      { qty: "1", price: 4500 },
      { qty: "2+", price: 4000 },
    ],
  },
]

const features = [
  "Professional design included",
  "Permitting assistance",
  "Weather-resistant materials",
  "LED illumination options",
  "Professional installation",
  "Free digital proof",
]

interface PricingTier {
  qty: string
  price: number
  label?: string
}

interface ProductOption {
  size: string
  description: string
  unit?: string
  qtyPricing: PricingTier[]
  customQuote?: boolean
}

function ProductCard({ option, index, productName, icon: Icon }: { option: ProductOption; index: number; productName: string; icon: React.ElementType }) {
  const isPopular = option.description.toLowerCase().includes("most common") || option.description.toLowerCase().includes("standard")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * (index + 1) }}
      className={`card-elevated relative ${isPopular ? "border-primary/50 ring-2 ring-primary/20" : ""}`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
          Popular
        </span>
      )}
      <div className="text-center mb-4">
        <Icon size={24} className="mx-auto mb-2 text-primary" />
        <h3 className="font-semibold text-lg">{option.size}</h3>
        <p className="text-sm text-muted-foreground">{option.description}</p>
      </div>
      <div className="space-y-3">
        {option.qtyPricing.map((tier) => (
          <div key={tier.qty} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <div className="font-medium text-sm">Qty: {tier.qty}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">
                {tier.label ? `${tier.label} $${tier.price.toLocaleString()}` : `$${tier.price.toLocaleString()}`}
              </div>
              <div className="text-xs text-muted-foreground">{option.unit || "each"}</div>
            </div>
          </div>
        ))}
        {option.customQuote && option.qtyPricing.length === 0 && (
          <div className="flex items-center justify-center p-3 rounded-lg bg-muted/30 border border-border">
            <span className="text-primary font-semibold">Contact for Quote</span>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {option.qtyPricing.map((tier) => (
          <AddToCartButton
            key={tier.qty}
            name={productName}
            size={option.size}
            option={`Qty: ${tier.qty}`}
            price={tier.price}
            className="w-full text-sm py-2"
          />
        ))}
        {option.customQuote && (
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 w-full text-sm py-2 px-4 bg-muted/50 text-primary rounded-lg font-medium transition-all hover:bg-muted border border-border"
          >
            Get Custom Quote <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </motion.div>
  )
}

export default function StorefrontSigns() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding pb-8">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/signage" className="hover:text-primary transition-colors">Business Signage</Link>
              <span>/</span>
              <span>Storefront Signs</span>
            </div>
            <h1 className="mb-4">Storefront & Building Signs</h1>
            <p className="text-lg text-muted-foreground">
              Make your business impossible to miss. From illuminated channel letters to elegant dimensional signage, we build signs that attract customers and elevate your brand.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Channel Letters */}
      <section className="section-padding pt-0">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-center mb-2">Channel Letters</h2>
            <p className="text-center text-muted-foreground mb-8">Individual illuminated letters — the gold standard for storefront signage</p>
            <div className="grid md:grid-cols-3 gap-6">
              {channelLetters.map((option, index) => (
                <ProductCard key={option.size} option={option} index={index} productName="Channel Letters" icon={Lightbulb} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cabinet Signs */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-center mb-2">Cabinet Signs</h2>
            <p className="text-center text-muted-foreground mb-8">Backlit lightbox signs — bold, bright, and visible day and night</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cabinetSigns.map((option, index) => (
                <ProductCard key={option.size} option={option} index={index} productName="Cabinet Sign" icon={Box} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dimensional Letters */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-center mb-2">Dimensional Letters</h2>
            <p className="text-center text-muted-foreground mb-8">Non-illuminated 3D letters — professional look for lobbies, offices, and storefronts</p>
            <div className="grid md:grid-cols-3 gap-6">
              {dimensionalLetters.map((option, index) => (
                <ProductCard key={option.size} option={option} index={index} productName="Dimensional Letters" icon={Building2} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Monument Signs */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-center mb-2">Monument Signs</h2>
            <p className="text-center text-muted-foreground mb-8">Ground-level entrance signs — make a statement before anyone walks in</p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {monumentSigns.map((option, index) => (
                <ProductCard key={option.size} option={option} index={index} productName="Monument Sign" icon={Landmark} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated max-w-3xl mx-auto">
            <h2 className="text-center mb-6">What's Included</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={14} className="text-primary flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Ready to Make Your Mark?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Every business is different. Get a custom quote tailored to your storefront, building, or location. We handle design, permitting, and installation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Custom Quote <ArrowRight size={20} /></Link>
              <Link to="/signage" className="btn-secondary text-lg px-8 py-4">View All Signage <ArrowRight size={20} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
