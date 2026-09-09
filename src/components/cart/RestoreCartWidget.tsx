import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart, type SavedCartLookup } from '@/context/CartContext'

export default function RestoreCartWidget() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  const { items, restoreFromToken, restoreCart } = useCart()
  const token = new URLSearchParams(hash.slice(1)).get('restore')
  const [saved, setSaved] = useState<SavedCartLookup | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!token) return
    let active = true
    void restoreFromToken(token).then(result => { if (active) { setSaved(result); setError('') } }).catch(error => { if (active) setError(error instanceof Error ? error.message : 'Could not open this cart link.') })
    return () => { active = false }
  }, [token, restoreFromToken, attempt])
  if (!token) return <p className="my-5 text-sm text-muted-foreground">Saved a cart on another device? Open the cart link from your email.</p>
  return <div className="my-5 rounded-xl border border-primary/40 p-4 space-y-3" role="status">
    {error ? <><p>{error}</p><button className="text-primary font-bold" onClick={() => setAttempt(value => value + 1)}>Try the link again</button></> : !saved ? <p>Checking your saved cart…</p> : <><p className="font-bold">{saved.items.length} saved items · ${saved.totalPrice.toFixed(2)}</p><p className="text-sm text-muted-foreground">{items.length ? 'Restoring will replace the items currently in this browser’s cart.' : 'Review these items before checking out.'} Check the saved quantities, finish and total before paying.</p><button className="btn-primary" onClick={() => { restoreCart(saved, ''); navigate('/cart', { replace: true }) }}>Restore these items</button></>}
    <button className="block text-sm text-muted-foreground" onClick={() => navigate('/cart', { replace: true })}>Keep my current cart</button>
  </div>
}
