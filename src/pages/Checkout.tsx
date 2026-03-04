import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
}

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
  })
  const [formValid, setFormValid] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  if (items.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="section-container text-center">
          <h1 className="text-3xl font-black mb-4">Nothing to Checkout</h1>
          <p className="text-muted-foreground mb-8">Your cart is empty.</p>
          <Link to="/order" className="btn-primary">Make Custom Stickers</Link>
        </div>
      </section>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...customerInfo, [e.target.name]: e.target.value }
    setCustomerInfo(updated)
    setFormValid(
      updated.firstName.trim() !== '' &&
      updated.lastName.trim() !== '' &&
      updated.email.trim() !== '' &&
      updated.phone.trim() !== '' &&
      updated.address.trim() !== '' &&
      updated.city.trim() !== '' &&
      updated.state.trim() !== '' &&
      updated.zip.trim() !== ''
    )
  }

  const orderDescription = items
    .map(i => `${i.name} (${i.option}, ${i.size}) x${i.quantity}`)
    .join(', ')

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
      <section className="py-8 md:py-16">
        <div className="section-container max-w-6xl">
          <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft size={18} /> Back to Cart
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black mb-8"
          >
            Checkout
          </motion.h1>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Customer Info Form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">First Name *</label>
                    <input
                      type="text" name="firstName" value={customerInfo.firstName}
                      onChange={handleChange} required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Last Name *</label>
                    <input
                      type="text" name="lastName" value={customerInfo.lastName}
                      onChange={handleChange} required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email *</label>
                    <input
                      type="email" name="email" value={customerInfo.email}
                      onChange={handleChange} required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Phone *</label>
                    <input
                      type="tel" name="phone" value={customerInfo.phone}
                      onChange={handleChange} required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Street Address *</label>
                    <input
                      type="text" name="address" value={customerInfo.address}
                      onChange={handleChange} required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">City *</label>
                      <input
                        type="text" name="city" value={customerInfo.city}
                        onChange={handleChange} required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="Sacramento"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">State *</label>
                      <input
                        type="text" name="state" value={customerInfo.state}
                        onChange={handleChange} required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">ZIP Code *</label>
                      <input
                        type="text" name="zip" value={customerInfo.zip}
                        onChange={handleChange} required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        placeholder="95814"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PayPal Payment */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-2">Payment</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Lock size={14} /> Secured by PayPal
                </div>

                {!formValid && (
                  <p className="text-sm text-muted-foreground mb-4 bg-muted/50 rounded-xl p-4">
                    Fill out all fields above to enable payment.
                  </p>
                )}

                {paymentError && (
                  <div className="text-sm text-destructive mb-4 bg-destructive/10 rounded-xl p-4">
                    {paymentError}
                  </div>
                )}

                <div className={!formValid ? 'opacity-40 pointer-events-none' : ''}>
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'gold',
                      shape: 'pill',
                      label: 'pay',
                      height: 50,
                    }}
                    disabled={!formValid}
                    createOrder={(_data, actions) => {
                      return actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [{
                          description: orderDescription.substring(0, 127),
                          amount: {
                            currency_code: 'USD',
                            value: total.toFixed(2),
                            breakdown: {
                              item_total: { currency_code: 'USD', value: total.toFixed(2) },
                            },
                          },
                          items: items.map(item => ({
                            name: item.name.substring(0, 127),
                            unit_amount: {
                              currency_code: 'USD',
                              value: ((item.price + (item.addOns?.reduce((a, b) => a + b.price, 0) || 0))).toFixed(2),
                            },
                            quantity: item.quantity.toString(),
                            description: `${item.option} · ${item.size}`.substring(0, 127),
                            category: 'PHYSICAL_GOODS' as const,
                          })),
                          shipping: {
                            name: { full_name: `${customerInfo.firstName} ${customerInfo.lastName}` },
                            address: {
                              address_line_1: customerInfo.address,
                              admin_area_2: customerInfo.city,
                              admin_area_1: customerInfo.state,
                              postal_code: customerInfo.zip,
                              country_code: 'US',
                            },
                          },
                        }],
                      })
                    }}
                    onApprove={async (_data, actions) => {
                      const details = await actions.order!.capture()
                      const order = {
                        id: details.id,
                        date: new Date().toISOString(),
                        customer: { ...customerInfo },
                        items: items.map(i => ({ ...i })),
                        total: total.toFixed(2),
                        status: 'completed' as const,
                      }
                      const prev = JSON.parse(localStorage.getItem('tss-orders') || '[]')
                      localStorage.setItem('tss-orders', JSON.stringify([order, ...prev]))
                      clearCart()
                      navigate('/order-confirmation', {
                        state: {
                          orderId: details.id,
                          payerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
                          email: customerInfo.email,
                          total: total.toFixed(2),
                        },
                      })
                    }}
                    onError={(err) => {
                      console.error('PayPal error:', err)
                      setPaymentError('Payment failed. Please try again or contact us.')
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {items.map(item => {
                    const addOnTotal = item.addOns?.reduce((a, b) => a + b.price, 0) || 0
                    const itemTotal = (item.price + addOnTotal) * item.quantity
                    return (
                      <div key={item.id} className="flex justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.option} · {item.size}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          {item.addOns && item.addOns.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              + {item.addOns.map(a => a.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-primary shrink-0">${itemTotal.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-xl font-black pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={16} className="text-green-400 shrink-0" />
                  <span>Your payment is protected by PayPal Buyer Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PayPalScriptProvider>
  )
}
