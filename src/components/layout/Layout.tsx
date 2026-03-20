import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import CursorGlow from './CursorGlow'
import { trackPageView, trackNavEvent } from '@/lib/analytics'

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
    </div>
  )
}
