import { useModalFocus } from '@/hooks/useModalFocus'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { searchStorefront, type SearchItem } from '@/lib/storefrontSearch'

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useModalFocus(isOpen, onClose)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setTimeout(() => {
      setQuery('')
      inputRef.current?.focus()
    }, 100)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  const results = searchStorefront(query)

  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-20 md:pt-32 px-4"
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Search products and services"
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <Search size={20} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search products and services"
                placeholder="Search products & services..."
                className="min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base focus:outline-none"
              />
              <button aria-label="Close search" onClick={onClose} className="min-h-11 min-w-11 inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Type to search stickers, banners, cards, wraps, and more...
                </div>
              ) : results.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No results for "{query}"
                </div>
              ) : (
                <div className="py-2">
                  {Object.entries(grouped).map(([category, items]) => (
                    <div key={category}>
                      <p className="px-5 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{category}</p>
                      {items.map(item => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={onClose}
                          className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors group"
                        >
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                          <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd> to close</span>
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
