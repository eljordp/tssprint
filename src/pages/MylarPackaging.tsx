import { useState } from 'react'
import { Package, Ruler, Palette, Shield, Zap, Calculator } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import Button from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const sizes = [
  { label: '3.5" x 5"', value: '3.5x5', basePrice: 0.35 },
  { label: '4" x 6"', value: '4x6', basePrice: 0.45 },
  { label: '5" x 8"', value: '5x8', basePrice: 0.55 },
  { label: '6" x 9"', value: '6x9', basePrice: 0.65 },
  { label: '8" x 12"', value: '8x12', basePrice: 0.85 },
  { label: '1 lb Stand Up', value: '1lb', basePrice: 0.75 },
]

const quantityTiers = [100, 250, 500, 1000, 2500, 5000]

function getDiscount(qty: number) {
  if (qty >= 5000) return 0.40
  if (qty >= 2500) return 0.30
  if (qty >= 1000) return 0.20
  if (qty >= 500) return 0.10
  if (qty >= 250) return 0.05
  return 0
}

export default function MylarPackaging() {
  const [selectedSize, setSelectedSize] = useState(sizes[0])
  const [quantity, setQuantity] = useState(500)

  const discount = getDiscount(quantity)
  const unitPrice = selectedSize.basePrice * (1 - discount)
  const totalPrice = unitPrice * quantity

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-sm text-primary uppercase tracking-widest mb-3">Custom Packaging</p>
            <h1 className="text-4xl sm:text-5xl font-bold">Mylar Packaging</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Custom-printed mylar bags with your branding. Premium barrier protection with vibrant full-color printing. Resealable zipper options available.
            </p>
          </div>
        </FadeIn>

        {/* Calculator */}
        <FadeIn delay={0.1}>
          <div className="max-w-2xl mx-auto mb-20">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Price Calculator</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Bag Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-2.5 text-sm rounded-lg border transition-all cursor-pointer ${
                          selectedSize.value === size.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Quantity</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {quantityTiers.map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setQuantity(qty)}
                        className={`px-3 py-2.5 text-sm rounded-lg border transition-all cursor-pointer ${
                          quantity === qty
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {qty.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit price</span>
                    <span className="text-foreground">${unitPrice.toFixed(2)} / bag</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Volume discount</span>
                      <span className="text-primary">-{(discount * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Link to="/contact">
                  <Button className="w-full">
                    Get a Quote
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {[
            { icon: Package, title: 'Multiple Sizes', description: 'From 3.5x5 to 1lb stand-up pouches. Custom sizes available on request.' },
            { icon: Palette, title: 'Full Color Printing', description: 'Vibrant CMYK printing on both sides. Matte or glossy finish options.' },
            { icon: Shield, title: 'Barrier Protection', description: 'Food-grade mylar provides excellent moisture, odor, and light barrier.' },
            { icon: Zap, title: 'Resealable Zipper', description: 'Heavy-duty zipper closure keeps contents fresh. Tear notch for easy opening.' },
            { icon: Ruler, title: 'Custom Sizes', description: 'Need a specific size? We can produce custom dimensions for your product.' },
            { icon: Calculator, title: 'Bulk Pricing', description: 'Volume discounts up to 40% off. The more you order, the more you save.' },
          ].map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.1}>
              <div className="bg-card border border-border rounded-xl p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bottom CTA */}
        <FadeIn>
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Order?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Contact us for custom sizes, special finishes, or bulk orders. Proof within 24 hours.
            </p>
            <Link to="/contact">
              <Button size="lg">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
