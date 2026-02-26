import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const shapes = ['Die-Cut', 'Kiss-Cut', 'Circle', 'Square', 'Rectangle']
const materials = ['Matte Vinyl', 'Glossy Vinyl', 'Clear', 'Holographic', 'Paper']
const quantities = [50, 100, 200, 300, 500, 1000]

export default function Order() {
  const { addItem } = useCart()
  const [shape, setShape] = useState('Die-Cut')
  const [material, setMaterial] = useState('Matte Vinyl')
  const [quantity, setQuantity] = useState(100)
  const [size, setSize] = useState('3"x3"')
  const [added, setAdded] = useState(false)

  const basePrice = quantity <= 50 ? 0.45 : quantity <= 100 ? 0.35 : quantity <= 200 ? 0.28 : quantity <= 500 ? 0.22 : 0.18
  const materialMultiplier = material === 'Holographic' ? 1.4 : material === 'Clear' ? 1.2 : 1
  const price = +(basePrice * materialMultiplier * quantity).toFixed(2)

  const handleAddToCart = () => {
    addItem({ id: `sticker-${Date.now()}`, name: `${shape} ${material} Stickers`, size, option: `${quantity} pcs`, price, quantity: 1, material, shape, dimensions: size })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="-mt-16 md:-mt-18 pt-24 md:pt-32 pb-10 md:pb-14" style={{ backgroundColor: 'hsl(199 89% 64%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center section-container">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-white">Order Custom Stickers</h1>
          <p className="text-white/80 text-lg">Configure your stickers and add to cart</p>
        </motion.div>
      </div>
      <section className="py-8 md:py-16">
        <div className="section-container">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {shapes.map(s => (<button key={s} onClick={() => setShape(s)} className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${shape === s ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'}`}>{s}</button>))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Material</label>
              <div className="grid grid-cols-3 gap-2">
                {materials.map(m => (<button key={m} onClick={() => setMaterial(m)} className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${material === m ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'}`}>{m}</button>))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Size</label>
              <div className="grid grid-cols-4 gap-2">
                {['2"x2"', '3"x3"', '4"x4"', '5"x5"'].map(s => (<button key={s} onClick={() => setSize(s)} className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${size === s ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'}`}>{s}</button>))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-3 uppercase tracking-wider">Quantity</label>
              <div className="grid grid-cols-3 gap-2">
                {quantities.map(q => (<button key={q} onClick={() => setQuantity(q)} className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${quantity === q ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'}`}>{q}</button>))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="upload-zone text-center">
              <Upload size={40} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-semibold mb-1">Upload Your Design</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, PDF, AI, SVG</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between"><span className="text-muted-foreground">Shape</span><span>{shape}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Material</span><span>{material}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Size</span><span>{size}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{quantity}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Per sticker</span><span>${(price / quantity).toFixed(2)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">${price.toFixed(2)}</span></div>
              </div>
              <button onClick={handleAddToCart} className={`btn-primary w-full ${added ? 'bg-green-600' : ''}`}>
                {added ? 'Added to Cart!' : 'Add to Cart'}<ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  )
}
