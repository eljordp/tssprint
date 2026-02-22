import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-muted" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Add some stickers or products to get started.</p>
            <Link to="/order">
              <Button size="lg">
                Order Stickers
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </FadeIn>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        </FadeIn>

        <div className="space-y-3 mb-8">
          {items.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.05}>
              <div className="bg-card border border-border rounded-xl p-4 sm:p-5 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted">{item.option} · ${item.price.toFixed(2)} each</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-border-hover transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-border-hover transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right w-20">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-muted hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-muted">Subtotal</span>
              <span className="text-lg font-bold">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted mb-4">
              Shipping and tax calculated at checkout.
            </p>
            <Link to="/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
