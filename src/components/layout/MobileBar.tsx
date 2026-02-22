import { Link } from 'react-router-dom'
import { Sticker, MessageSquareQuote } from 'lucide-react'

export default function MobileBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="flex">
        <Link
          to="/order"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors"
        >
          <Sticker className="w-4 h-4" />
          Order Stickers
        </Link>
        <Link
          to="/contact"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors border-l border-border"
        >
          <MessageSquareQuote className="w-4 h-4" />
          Get Quote
        </Link>
      </div>
    </div>
  )
}
