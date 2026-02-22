import { useState } from 'react'
import { Circle, Square, RectangleHorizontal, Hexagon, Sparkles, ShoppingCart, Check } from 'lucide-react'
import FadeIn from '@/components/ui/FadeIn'
import Button from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'

const shapes = [
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'square', label: 'Square', icon: Square },
  { id: 'rectangle', label: 'Rectangle', icon: RectangleHorizontal },
  { id: 'oval', label: 'Oval', icon: Hexagon },
  { id: 'die-cut', label: 'Custom Die-Cut', icon: Sparkles },
]

const sizePresets = [
  { label: '2" x 2"', value: '2x2' },
  { label: '3" x 3"', value: '3x3' },
  { label: '4" x 4"', value: '4x4' },
  { label: '3" x 4"', value: '3x4' },
  { label: '4" x 6"', value: '4x6' },
  { label: '5" x 5"', value: '5x5' },
]

const materials = [
  { id: 'glossy', label: 'Glossy Vinyl', description: 'High-shine, vibrant colors', priceMultiplier: 1 },
  { id: 'matte', label: 'Matte Vinyl', description: 'Smooth, no-glare finish', priceMultiplier: 1 },
  { id: 'clear', label: 'Clear Vinyl', description: 'Transparent background', priceMultiplier: 1.3 },
  { id: 'holographic', label: 'Holographic', description: 'Rainbow shimmer effect', priceMultiplier: 1.6 },
]

const quantityTiers = [
  { qty: 50, unitPrice: 1.50 },
  { qty: 100, unitPrice: 1.20 },
  { qty: 250, unitPrice: 0.85 },
  { qty: 500, unitPrice: 0.60 },
  { qty: 1000, unitPrice: 0.40 },
  { qty: 2500, unitPrice: 0.28 },
]

export default function Order() {
  const [shape, setShape] = useState('circle')
  const [size, setSize] = useState('3x3')
  const [material, setMaterial] = useState('glossy')
  const [quantityIdx, setQuantityIdx] = useState(2)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const selectedMaterial = materials.find((m) => m.id === material)!
  const tier = quantityTiers[quantityIdx]
  const unitPrice = tier.unitPrice * selectedMaterial.priceMultiplier
  const totalPrice = unitPrice * tier.qty

  const handleAddToCart = () => {
    const shapeName = shapes.find((s) => s.id === shape)?.label ?? shape
    addItem({
      id: `${shape}-${size}-${material}-${tier.qty}`,
      name: `${shapeName} Stickers (${size})`,
      size,
      option: selectedMaterial.label,
      price: unitPrice,
      quantity: tier.qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold">Order Stickers</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Configure your custom stickers below. Proof within 24 hours.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-8">
            {/* Shape */}
            <div>
              <h3 className="font-semibold mb-3">1. Choose Shape</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {shapes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${
                      shape === s.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted hover:border-border-hover'
                    }`}
                  >
                    <s.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h3 className="font-semibold mb-3">2. Select Size</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {sizePresets.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    className={`px-3 py-2.5 text-sm rounded-lg border transition-all cursor-pointer ${
                      size === s.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted hover:border-border-hover'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <h3 className="font-semibold mb-3">3. Pick Material</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {materials.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      material === m.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-border-hover'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      material === m.id ? 'border-primary' : 'border-muted'
                    }`}>
                      {material === m.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${material === m.id ? 'text-primary' : 'text-foreground'}`}>
                        {m.label}
                      </p>
                      <p className="text-xs text-muted">{m.description}</p>
                    </div>
                    {m.priceMultiplier > 1 && (
                      <span className="ml-auto text-xs text-muted">+{((m.priceMultiplier - 1) * 100).toFixed(0)}%</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">4. Quantity</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quantityTiers.map((t, i) => (
                  <button
                    key={t.qty}
                    onClick={() => setQuantityIdx(i)}
                    className={`px-3 py-3 rounded-lg border transition-all cursor-pointer ${
                      quantityIdx === i
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-border-hover'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${quantityIdx === i ? 'text-primary' : 'text-foreground'}`}>
                      {t.qty.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted">
                      ${(t.unitPrice * selectedMaterial.priceMultiplier).toFixed(2)}/ea
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted">
                      {shapes.find((s) => s.id === shape)?.label} · {size} · {selectedMaterial.label} · {tier.qty.toLocaleString()} stickers
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                    <span className="text-sm text-muted">(${unitPrice.toFixed(2)} each)</span>
                  </div>
                </div>
                <Button onClick={handleAddToCart} size="lg" className="w-full sm:w-auto">
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
