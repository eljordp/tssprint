import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { X, Tag } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import CursorGlow from './CursorGlow'

function PromoBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('tss-promo-dismissed') === '1' } catch { return false }
  })

  if (dismissed) return null

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 bg-card border border-primary/30 rounded-xl p-4 shadow-lg">
      <button
        onClick={() => { setDismissed(true); try { sessionStorage.setItem('tss-promo-dismissed', '1') } catch {} }}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Tag className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">15% OFF First Order</p>
          <p className="text-xs text-muted-foreground">
            Use code <span className="font-mono font-semibold text-primary">WELCOME15</span> · min $50
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col relative">
      <CursorGlow />
      <Header />
      <main className="flex-1 pt-16 md:pt-20 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
      <PromoBanner />
    </div>
  )
}
