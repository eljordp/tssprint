import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { X, Tag } from 'lucide-react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import CursorGlow from './CursorGlow'
import { trackPageView, trackNavEvent } from '@/lib/analytics'
import { supabase } from '@/lib/supabase'

function PromoBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('tss-promo-dismissed') === '1' } catch { return false }
  })
  const [promo, setPromo] = useState<{ code: string; discountPercent: number; minOrder: number } | null>(null)

  useEffect(() => {
    if (dismissed) return
    // Try Supabase first, fall back to localStorage
    supabase.from('promo_codes').select('*').eq('active', true).limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        setPromo({ code: data[0].code, discountPercent: data[0].discount_percent, minOrder: data[0].min_order })
      } else {
        // Fallback to localStorage admin promos
        try {
          const local = JSON.parse(localStorage.getItem('tss-admin-promos') || '[]')
          const active = local.find((p: any) => p.active)
          if (active) setPromo({ code: active.code, discountPercent: active.discountPercent, minOrder: active.minOrder })
        } catch {}
      }
    })
  }, [dismissed])

  if (dismissed || !promo) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 bg-card border border-primary/20 rounded-xl px-4 py-3 shadow-lg max-w-[260px]">
      <button
        onClick={() => { setDismissed(true); try { sessionStorage.setItem('tss-promo-dismissed', '1') } catch {} }}
        className="absolute top-2 right-2 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Tag className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{promo.discountPercent}% OFF First Order</p>
          <p className="text-[10px] text-muted-foreground">
            Code <span className="font-mono font-semibold text-primary">{promo.code}</span> · min ${promo.minOrder}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const prevPath = useRef(pathname)
  const prevTime = useRef(Date.now())

  useEffect(() => {
    window.scrollTo(0, 0)

    // Track page view
    trackPageView(pathname)

    // Track navigation event (skip first load)
    if (prevPath.current !== pathname) {
      const now = Date.now()
      trackNavEvent(prevPath.current, pathname, now - prevTime.current)
      prevPath.current = pathname
      prevTime.current = now
    }
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
