import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { User, Package, Clock, LogOut, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'proof-sent': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  approved: 'bg-primary/15 text-primary border-primary/30',
  printing: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  shipped: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  delivered: 'bg-green-500/15 text-green-400 border-green-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  'proof-sent': 'Proof Sent',
  approved: 'Approved',
  printing: 'Printing',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

export default function Profile() {
  const { profile, login, logout } = useProfile()
  const [email, setEmail] = useState('')

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      login(email.trim())
    }
  }

  if (!profile) {
    return (
      <div className="py-20">
        <div className="max-w-md mx-auto px-4">
          <FadeIn>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto mb-6">
                <User className="w-7 h-7 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-center mb-1">Welcome back</h1>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Enter your email to view your orders and save your info for faster checkout.
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Mail className="w-4 h-4" />
                  Continue
                </Button>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>
    )
  }

  const sortedOrders = [...profile.orders].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <FadeIn>
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                  Member since {memberSince}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Saved Info */}
        <FadeIn delay={0.05}>
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Saved Information</h2>
            <div className="space-y-3">
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.phone}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    {profile.address}
                    {profile.city && `, ${profile.city}`}
                    {profile.state && `, ${profile.state}`}
                    {profile.zip && ` ${profile.zip}`}
                  </span>
                </div>
              )}
              {!profile.phone && !profile.address && (
                <p className="text-sm text-muted-foreground">
                  No saved info yet. Your details will be saved after your first checkout.
                </p>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Order History */}
        <FadeIn delay={0.1}>
          <h2 className="font-semibold text-lg mb-4">Order History</h2>
        </FadeIn>

        {sortedOrders.length === 0 ? (
          <FadeIn delay={0.15}>
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Link to="/order">
                <Button>
                  Order Stickers
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        ) : (
          <div className="space-y-3">
            {sortedOrders.map((order, i) => (
              <FadeIn key={order.id} delay={0.15 + i * 0.05}>
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">#{order.id}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${STATUS_COLORS[order.status] || ''}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {order.items.map((item, j) => (
                      <p key={j} className="text-sm text-foreground">
                        {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                      </p>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-semibold">
                      Total: <span className="text-primary">${order.total.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        {/* Logout */}
        <FadeIn delay={0.25}>
          <div className="mt-8 text-center">
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
