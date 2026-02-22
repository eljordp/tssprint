import { type HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-primary/30',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'
export default Card
