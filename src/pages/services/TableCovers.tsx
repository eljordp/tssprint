import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Table, CheckCircle, Circle, Percent, Minus, Plus, ImageIcon } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";

const tableCoverProducts = [
  { id: "6ft-fitted", size: "6ft Cover", description: "Standard trade show table", basePrice: 190 },
  { id: "8ft-fitted", size: "8ft Cover", description: "Extended display table", basePrice: 210 },
];

const roundTableProducts = [
  { id: "31-round", size: '31" Round', description: "Cocktail table throw", basePrice: 159 },
  { id: "36-round", size: '36" Round', description: "Small round table", basePrice: 179 },
  { id: "48-round", size: '48" Round', description: "Standard round table", basePrice: 209 },
  { id: "60-round", size: '60" Round', description: "Large banquet table", basePrice: 225 },
];

const bulkDiscounts = [
  { qty: "2-5 covers", discount: "10% off", minQty: 2, maxQty: 5, rate: 0.1 },
  { qty: "6-9 covers", discount: "15% off", minQty: 6, maxQty: 9, rate: 0.15 },
  { qty: "10+ covers", discount: "20% off", minQty: 10, maxQty: Infinity, rate: 0.2 },
];

const styleOptions = [
  { id: "fitted-4", name: "Fitted (4-sided)", description: "Fully enclosed table cover", priceAdjust: 0 },
  { id: "draped", name: "Draped/Throw", description: "Loose flowing style", priceAdjust: -10 },
];

const features = [
  "Full-color dye sublimation", "Wrinkle-resistant fabric", "Machine washable",
  "Open or closed back options", "Custom sizes available", "Free design assistance",
];

const getDiscountRate = (quantity: number): number => {
  for (const tier of bulkDiscounts) {
    if (quantity >= tier.minQty && quantity <= tier.maxQty) return tier.rate;
  }
  return 0;
};

const TableCovers = () => {
  const [tableType, setTableType] = useState<"rectangular" | "round">("rectangular");
  const [rectSelected, setRectSelected] = useState<string>("6ft-fitted");
  const [rectStyle, setRectStyle] = useState("fitted-4");
  const [rectQuantity, setRectQuantity] = useState(1);
  const [roundSelected, setRoundSelected] = useState<string>("31-round");
  const [roundStyle, setRoundStyle] = useState("fitted-4");
  const [roundQuantity, setRoundQuantity] = useState(1);

  const getSelectedRectProduct = () => tableCoverProducts.find((p) => p.id === rectSelected);
  const getSelectedRoundProduct = () => roundTableProducts.find((p) => p.id === roundSelected);
  const getStyleOption = (id: string) => styleOptions.find((s) => s.id === id);

  const calculatePrice = (basePrice: number, styleId: string, quantity: number) => {
    const style = getStyleOption(styleId);
    const unitPrice = basePrice + (style?.priceAdjust || 0);
    const subtotal = unitPrice * quantity;
    const discountRate = getDiscountRate(quantity);
    const discount = subtotal * discountRate;
    return { unitPrice, subtotal, discountRate, discount, total: subtotal - discount };
  };

  const rectProduct = getSelectedRectProduct();
  const rectPricing = rectProduct ? calculatePrice(rectProduct.basePrice, rectStyle, rectQuantity) : null;
  const roundProduct = getSelectedRoundProduct();
  const roundPricing = roundProduct ? calculatePrice(roundProduct.basePrice, roundStyle, roundQuantity) : null;
  const currentProduct = tableType === "rectangular" ? rectProduct : roundProduct;
  const currentStyle = tableType === "rectangular" ? getStyleOption(rectStyle) : getStyleOption(roundStyle);

  return (
    <>
      <section className="section-padding pb-12">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Link to="/canopies" className="hover:text-primary transition-colors">Event Branding</Link>
              <span>/</span><span>Table Covers</span>
            </div>
            <h1 className="mb-4">Custom Table Covers & Throws</h1>
            <p className="text-lg text-muted-foreground">Make your event tables stand out with premium table covers + throws.</p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="aspect-[4/3] bg-muted/30 rounded-xl border border-border flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Product image coming soon</p>
                  <p className="text-xs mt-1">{currentProduct?.size} - {currentStyle?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted/20 rounded-lg border border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <ImageIcon size={20} className="text-muted-foreground/50" />
                  </div>
                ))}
              </div>
              <div className="card-elevated mt-6">
                <h3 className="font-semibold mb-4">What's Included</h3>
                <div className="grid grid-cols-2 gap-2">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle size={14} className="text-primary flex-shrink-0" /><span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-elevated bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Percent size={20} className="text-primary" /></div>
                  <div><h3 className="font-semibold">Bulk Order Discounts</h3><p className="text-sm text-muted-foreground">Automatic savings on multi-cover orders</p></div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {bulkDiscounts.map((tier) => (
                    <div key={tier.qty} className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <span className="text-sm">{tier.qty}</span><span className="font-semibold text-primary">{tier.discount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Select Table Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setTableType("rectangular")} className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${tableType === "rectangular" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tableType === "rectangular" ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}>
                        <Table size={20} className={tableType === "rectangular" ? "" : "text-primary"} />
                      </div>
                      <div><div className="font-semibold">Rectangular</div><div className="text-sm text-muted-foreground">6ft & 8ft tables</div></div>
                    </div>
                  </button>
                  <button onClick={() => setTableType("round")} className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${tableType === "round" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tableType === "round" ? "bg-primary text-primary-foreground" : "bg-primary/10"}`}>
                        <Circle size={20} className={tableType === "round" ? "" : "text-primary"} />
                      </div>
                      <div><div className="font-semibold">Round</div><div className="text-sm text-muted-foreground">31" to 60" tables</div></div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Select Size</h3>
                {tableType === "rectangular" ? (
                  <div className="grid grid-cols-2 gap-3">
                    {tableCoverProducts.map((product) => (
                      <button key={product.id} onClick={() => setRectSelected(product.id)} className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${rectSelected === product.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div className="font-semibold">{product.size}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                        <div className="text-sm text-primary mt-1">From ${product.basePrice}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {roundTableProducts.map((product) => (
                      <button key={product.id} onClick={() => setRoundSelected(product.id)} className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${roundSelected === product.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                        <div className="font-semibold">{product.size}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                        <div className="text-sm text-primary mt-1">From ${product.basePrice}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-elevated">
                <h3 className="font-semibold mb-4">Select Style</h3>
                <div className="grid grid-cols-2 gap-3">
                  {styleOptions.map((style) => (
                    <button key={style.id} onClick={() => (tableType === "rectangular" ? setRectStyle(style.id) : setRoundStyle(style.id))}
                      className={`p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${(tableType === "rectangular" ? rectStyle : roundStyle) === style.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                      <div className="flex justify-between items-start">
                        <div><div className="font-medium">{style.name}</div><div className="text-sm text-muted-foreground">{style.description}</div></div>
                        <span className={`text-sm font-semibold ${style.priceAdjust === 0 ? "text-muted-foreground" : style.priceAdjust > 0 ? "text-orange-400" : "text-green-400"}`}>
                          {style.priceAdjust === 0 ? "Base" : style.priceAdjust > 0 ? `+$${style.priceAdjust}` : `-$${Math.abs(style.priceAdjust)}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-elevated">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Quantity</h3>
                    {(tableType === "rectangular" && rectPricing?.discountRate) || (tableType === "round" && roundPricing?.discountRate) ? (
                      <span className="text-sm text-green-400">{((tableType === "rectangular" ? rectPricing?.discountRate : roundPricing?.discountRate) || 0) * 100}% bulk discount applied!</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => tableType === "rectangular" ? setRectQuantity(Math.max(1, rectQuantity - 1)) : setRoundQuantity(Math.max(1, roundQuantity - 1))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"><Minus size={18} /></button>
                    <span className="w-12 text-center text-xl font-semibold">{tableType === "rectangular" ? rectQuantity : roundQuantity}</span>
                    <button onClick={() => tableType === "rectangular" ? setRectQuantity(rectQuantity + 1) : setRoundQuantity(roundQuantity + 1)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"><Plus size={18} /></button>
                  </div>
                </div>
              </div>

              {tableType === "rectangular" && rectProduct && rectPricing && (
                <div className="card-elevated bg-primary/5 border-primary/20">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{rectProduct.size} - {getStyleOption(rectStyle)?.name}</span><span>${rectPricing.unitPrice}</span></div>
                    {rectPricing.discountRate > 0 && <div className="flex justify-between text-sm text-green-400"><span>Bulk Discount ({(rectPricing.discountRate * 100).toFixed(0)}% off)</span><span>-${rectPricing.discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quantity</span><span>×{rectQuantity}</span></div>
                    <div className="border-t border-border pt-2 flex justify-between items-center"><span className="font-semibold">Total</span><span className="text-2xl font-bold text-primary">${rectPricing.total.toFixed(2)}</span></div>
                  </div>
                  <AddToCartButton name={`${rectProduct.size} Table Cover`} size={rectProduct.size} option={getStyleOption(rectStyle)?.name || ""} price={rectPricing.total} className="w-full text-base py-3" />
                </div>
              )}

              {tableType === "round" && roundProduct && roundPricing && (
                <div className="card-elevated bg-primary/5 border-primary/20">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{roundProduct.size} - {getStyleOption(roundStyle)?.name}</span><span>${roundPricing.unitPrice}</span></div>
                    {roundPricing.discountRate > 0 && <div className="flex justify-between text-sm text-green-400"><span>Bulk Discount ({(roundPricing.discountRate * 100).toFixed(0)}% off)</span><span>-${roundPricing.discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Quantity</span><span>×{roundQuantity}</span></div>
                    <div className="border-t border-border pt-2 flex justify-between items-center"><span className="font-semibold">Total</span><span className="text-2xl font-bold text-primary">${roundPricing.total.toFixed(2)}</span></div>
                  </div>
                  <AddToCartButton name={`${roundProduct.size} Table Throw`} size={roundProduct.size} option={getStyleOption(roundStyle)?.name || ""} price={roundPricing.total} className="w-full text-base py-3" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-surface-overlay">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="mb-4">Complete Your Booth Setup</h2>
            <p className="text-lg text-muted-foreground mb-8">Bundle with canopies and banners for additional savings. Contact us for package pricing.</p>
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

export default TableCovers;
