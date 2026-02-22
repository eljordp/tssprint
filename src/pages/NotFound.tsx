import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/ui/FadeIn'

export default function NotFound() {
  return (
    <div className="py-32 text-center">
      <FadeIn>
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-foreground mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">Back to Home</Button>
        </Link>
      </FadeIn>
    </div>
  )
}
