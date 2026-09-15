import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart, type SavedCartLookup } from '@/context/CartContext'
import { CartRequestError } from '@/lib/cartSession'

type Lookup = { saved?: SavedCartLookup; error?: string; retryable?: boolean }

export default function RestoreCartWidget() {
  const { hash } = useLocation()
  const token = new URLSearchParams(hash.slice(1)).get('restore')
  if (!token) return <p className="my-5 text-sm text-muted-foreground">Saved a cart on another device? Open the cart link from your email.</p>
  return <SavedCartReview key={token} token={token} />
}

function SavedCartReview({ token }: { token: string }) {
  const navigate = useNavigate()
  const { items, restoreFromToken, restoreCart } = useCart()
  const [result, setResult] = useState<Lookup | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    void restoreFromToken(token).then(saved => {
      if (active) setResult({ saved })
    }).catch(error => {
      if (active) setResult({ error: error instanceof Error ? error.message : 'Could not open this cart link.', retryable: !(error instanceof CartRequestError) || ![400, 403, 404, 410].includes(error.status) })
    })
    return () => { active = false }
  }, [token, restoreFromToken, attempt])
  const current = result
  const saved = current?.saved
  return <section aria-label="Review saved cart" className="my-5 rounded-xl border border-primary/40 p-4 space-y-3">
    {current?.error ? <>
      <p role="alert">{current.error}</p>
      {current.retryable ? <button className="min-h-11 text-primary font-bold" onClick={() => { setResult(null); setAttempt(value => value + 1) }}>Try the link again</button> : <p className="text-sm text-muted-foreground">Open a newer cart email, request another link from the browser where you saved it, or <Link className="underline text-primary" to="/contact">ask the shop for help</Link>.</p>}
    </> : !saved ? <p role="status">Checking your saved cart…</p> : <>
      <h2 className="font-bold">Review your saved items</h2>
      <ul className="divide-y divide-border">
        {saved.items.map(item => <li key={item.id} className="py-3 text-sm space-y-1">
          <p className="font-semibold break-words">{item.name}</p>
          <p className="text-muted-foreground">{item.option} · {item.size} · {item.quantity} {item.quantity === 1 ? 'batch' : 'batches'}</p>
          {item.artwork && <p className="text-xs text-muted-foreground break-words">Artwork: {item.artwork.fileName}</p>}
          {!item.artwork && item.artworkIntent === 'send_later' && <p className="text-xs text-muted-foreground">Send artwork after checkout</p>}
          {item.artworkIntent === 'design_help' && <p className="text-xs text-muted-foreground">Design help requested</p>}
        </li>)}
      </ul>
      <p className="font-bold">Saved subtotal: ${saved.totalPrice.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground">Before discounts. Current pricing and available discounts are checked at checkout.</p>
      <p className="text-sm">{items.length ? 'Restoring replaces the items currently in this browser’s cart.' : 'Restore these items, then review your cart before paying.'}</p>
      <button className="btn-primary" onClick={() => { restoreCart(saved, ''); navigate('/cart', { replace: true }) }}>Restore these items</button>
    </>}
    <button className="block min-h-11 text-sm text-muted-foreground underline" onClick={() => navigate(items.length ? '/cart' : '/stickers', { replace: true })}>{items.length ? 'Keep my current cart' : 'Back to shopping'}</button>
  </section>
}
