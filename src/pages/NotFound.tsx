import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function NotFound() {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <section className="py-24 text-center">
      <div className="section-container">
        <h1 className="text-6xl md:text-8xl font-black text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">The page "{location.pathname}" doesn't exist.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </section>
  )
}
