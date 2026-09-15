import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import ExitIntentModal from '@/components/ExitIntentModal'

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <Outlet />
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16 md:pt-18 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
      <ExitIntentModal />
    </div>
  )
}
