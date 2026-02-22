import { Link } from 'react-router-dom'
import { FileText, MessageSquare } from 'lucide-react'

export default function MobileBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex">
        <Link
          to="/order"
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-primary-foreground font-semibold"
        >
          <FileText size={18} />
          Order Stickers
        </Link>
        <Link
          to="/contact"
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-secondary text-secondary-foreground font-semibold border-l border-border"
        >
          <MessageSquare size={18} />
          Get Quote
        </Link>
      </div>
    </div>
  )
}
