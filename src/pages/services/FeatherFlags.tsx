import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Flag, CheckCircle, Percent, Minus, Plus, ImageIcon } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";

const products = [
  { size: "Medium (7ft)", dimensions: '13.5" x 57"', basePrice: 200, description: "Perfect for indoor events and smaller outdoor spaces" },
  { size: "Large (14ft)", dimensions: '24.25" x 140"', basePrice: 279, description: "Maximum height for trade shows and outdoor promotions" },
];

const bulkDiscounts = [
  { qty: "2-5 flags", discount: "10% off" },
  { qty: "6-9 flags", discount: "15% off" },
  { qty: "10+ flags", discount: "20% off" },
];

const flagStyles = [
  { name: "Feather Flag", description: "Classic curved top", popular: true },
  { name: "Teardrop Flag", description: "Rounded teardrop shape", popular: false },
  { name: "Rectangle Flag", description: "Straight edges", popular: false },
  { name: "Blade Flag", description: "Angled modern look", popular: false },
];

const bases = [
  { name: "X Base", price: "Included" },
  { name: "Cross base (indoor)", price: "+$25" },
  { name: "Water bag base", price: "+$35" },
  { name: "Car tire base", price: "+$29" },
];

const features = [
  "Double-sided printing", "UV-resistant inks", "Fiberglass poles included",
  "Carrying case included", "Wind-resistant design", "Free design assistance",
];

const FeatherFlags = () => {
  const [quantities, setQuantities] = useState<Record<string, number>>({ "Medium (7ft)": 1, "Large (14ft)": 1 });

  const updateQuantity = (size: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [size]: Math.max(1, (prev[size] || 1) + delta) }));
  };

  const getDiscountedPrice = (basePrice: number, qty: number) => {
    if (qty >= 10) return basePrice * 0.8;
    if (qty >= 6) return basePrice * 0.85;
    if (qty >= 2) return basePrice * 0.9;
    return basePrice;
  };

  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/canopies" className="hover:text-primary transition-colors">Event Branding</Link>
              <span>/</span><span>Feather Flags</span>
            </div>
            <h1 className="mb-4">Feather Flags</h1>
            <p className="text-lg text-muted-foreground">Eye-catching vertical displays that draw attention from a distance. Perfect for storefronts, events, and outdoor promotions.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="aspect-[4/3] bg-muted/30 rounded-xl border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground"><ImageIcon size={48} className="mx-auto mb-3 opacity-50" /><p className="text-sm">Product image coming soon</p><p className="text-xs mt-1">Feather Flag Display</p></div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted/20 rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"><ImageIcon size={20} className="text-muted-foreground/50" /></div>
                ))}
              </div>
              <div className="card-elevated mt-6">
                <h3 className="font-semibold mb-4">What's Included</h3>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature) => (<div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle size={14} className="text-primary flex-shrink-0" /><span>{feature}</span></div>))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div><h2 className="text-2xl font-semibold mb-2">Flag Sizes & Pricing</h2><p className="text-muted-foreground">All flags include pole, ground spike, and carrying case.</p></div>
              {products.map((product) => {
                const qty = quantities[product.size] || 1;
                const discountedPrice = getDiscountedPrice(product.basePrice, qty);
                const hasDiscount = discountedPrice < product.basePrice;
                return (
                  <div key={product.size} className="card-elevated flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Flag size={24} className="text-primary" /></div>
                      <div><h3 className="text-xl font-semibold">{product.size}</h3><p className="text-sm text-muted-foreground">{product.dimensions}</p></div>
                    </div>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      {hasDiscount ? (<><span className="text-3xl font-bold text-primary">${discountedPrice.toFixed(0)}</span><span className="text-lg text-muted-foreground line-through">${product.basePrice}</span><span className="text-sm text-primary font-medium">each</span></>) : (<><span className="text-3xl font-bold text-primary">${product.basePrice}</span><span className="text-sm text-muted-foreground">each</span></>)}
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(product.size, -1)} className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors cursor-pointer" disabled={qty <= 1}><Minus size={16} /></button>
                        <span className="w-12 text-center font-semibold">{qty}</span>
                        <button onClick={() => updateQuantity(product.size, 1)} className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"><Plus size={16} /></button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-3 border-t border-border mb-4"><span className="text-muted-foreground">Total:</span><span className="text-xl font-bold">${(discountedPrice * qty).toFixed(2)}</span></div>
                    <AddToCartButton name="Feather Flag" size={product.size} option={`${product.dimensions} - Double-sided`} price={discountedPrice * qty} className="w-full mt-auto" />
                  </div>
                );
              })}
              <div className="card-elevated bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Percent size={20} className="text-primary" /></div>
                  <div><h3 className="font-semibold">Bulk Order Discounts</h3><p className="text-sm text-muted-foreground">Automatic savings on multi-flag orders</p></div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {bulkDiscounts.map((tier) => (<div key={tier.qty} className="flex justify-between items-center p-3 bg-background rounded-lg"><span className="text-sm">{tier.qty}</span><span className="font-semibold text-primary">{tier.discount}</span></div>))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
              <h3 className="font-semibold mb-4">Flag Styles</h3>
              <div className="space-y-3">
                {flagStyles.map((style) => (
                  <div key={style.name} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div><span className="font-medium">{style.name}</span><span className="text-sm text-muted-foreground ml-2">- {style.description}</span></div>
                    {style.popular && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Popular</span>}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card-elevated">
              <h3 className="font-semibold mb-4">Base Options</h3>
              <div className="space-y-3">
                {bases.map((base) => (
                  <div key={base.name} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"><span>{base.name}</span><span className="font-semibold text-primary">{base.price}</span></div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-overlay">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Ready to Stand Out?</h2>
            <p className="text-lg text-muted-foreground mb-8">Upload your logo or let us design a flag that gets noticed. Free mockup included with every quote.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">Get a Quote <ArrowRight size={20} /></Link>
              <Link to="/canopies" className="btn-secondary text-lg px-8 py-4">View All Event Products</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default FeatherFlags;
