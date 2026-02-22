import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import MobileBar from './MobileBar'
import CursorGlow from './CursorGlow'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <CursorGlow />
      <Header />
      <main className="flex-1 pt-16 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
    </div>
  )
}
