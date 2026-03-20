import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useProfile } from '@/context/ProfileContext'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { profile, login, addOrder, updateProfile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    address: profile?.address ?? '',
    city: profile?.city ?? '',
    state: profile?.state || 'CA',
    zip: profile?.zip ?? '',
  })

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        firstName: prev.firstName || profile.firstName,
        lastName: prev.lastName || profile.lastName,
        email: prev.email || profile.email,
        phone: prev.phone || profile.phone,
        address: prev.address || profile.address,
        city: prev.city || profile.city,
        state: prev.state === 'CA' && profile.state ? profile.state : prev.state,
        zip: prev.zip || profile.zip,
      }))
    }
  }, [profile])

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Save/update profile
      const email = form.email.trim().toLowerCase()
      login(email)
      updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
      })

      // Save order to profile history
      addOrder({
        items: items.map((i) => ({
          name: i.name,
          size: i.size,
          option: i.option,
          price: i.price,
          quantity: i.quantity,
          material: i.material,
          shape: i.shape,
        })),
        total,
      })

      // Build mailto body with order details
      const orderLines = items.map(
        (i) => `${i.name} (${i.option}) x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`
      ).join('\n')

      const body = [
        `Name: ${form.firstName} ${form.lastName}`,
        `Email: ${form.email}`,
        `Phone: ${form.phone}`,
        `Address: ${form.address}, ${form.city}, ${form.state} ${form.zip}`,
        '',
        'Order:',
        orderLines,
        '',
        `Total: $${total.toFixed(2)}`,
      ].join('\n')

      const mailtoUrl = `mailto:thestickersmith@gmail.com?subject=${encodeURIComponent(
        `New Order — $${total.toFixed(2)}`
      )}&body=${encodeURIComponent(body)}`

      clearCart()
      window.location.href = mailtoUrl
    } catch {
      alert('Something went wrong. Please email us directly at thestickersmith@gmail.com')
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
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
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
                    <label className="block text-sm text-muted-foreground mb-1.5">First Name</label>
                    <input
                      required
                      value={form.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Last Name</label>
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
                    <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">Phone</label>
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
                  <label className="block text-sm text-muted-foreground mb-1.5">Address</label>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">City</label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">State</label>
                    <input
                      required
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1.5">ZIP</label>
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
                      <Mail className="w-4 h-4" />
                      Send Order – ${total.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  This will open your email to send us your order. We'll reply within 24 hours with a proof before printing.
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
                        <p className="text-xs text-muted-foreground">{item.option} × {item.quantity}</p>
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
