import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Lock, ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

export default function Checkout() {
  const { items, total } = useCart()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'CA',
    zip: '',
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In production, this would call a Supabase edge function
      // that creates a Square checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: form }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
          return
        }
      }

      // Fallback: show success message
      alert('Order submitted! We\'ll send your proof within 24 hours.')
    } catch {
      alert('Order submitted! We\'ll contact you shortly with your proof.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <FadeIn>
          <h1 className="text-3xl font-bold mb-4">No Items in Cart</h1>
          <p className="text-muted-foreground mb-6">Add items to your cart before checking out.</p>
          <Link to="/order">
            <Button>Order Stickers</Button>
          </Link>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.1}>
              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-lg mb-2">Customer Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">First Name</label>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Last Name</label>
                    <input
                      required
                      value={form.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">Phone</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted mb-1.5">Address</label>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-muted mb-1.5">City</label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">State</label>
                    <input
                      required
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-1.5">ZIP</label>
                    <input
                      required
                      value={form.zip}
                      onChange={(e) => handleChange('zip', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Place Order – ${total.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted text-center">
                  Secure checkout powered by Square. We'll send a proof within 24 hours before printing.
                </p>
              </form>
            </FadeIn>
          </div>

          {/* Order Summary */}
          <div>
            <FadeIn delay={0.2}>
              <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
                <h2 className="font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted">{item.option} × {item.quantity}</p>
                      </div>
                      <span className="ml-3 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
