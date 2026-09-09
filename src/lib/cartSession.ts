export type CartCredentials = { id: string; token: string }
const KEY = 'tss-cart-credentials-v2'
let memory: CartCredentials | null = null

export function getCartCredentials(): CartCredentials {
  if (memory) return memory
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (saved?.id && /^[a-f0-9]{64}$/.test(saved.token)) return (memory = saved)
  } catch { /* use a fresh cart */ }
  memory = { id: crypto.randomUUID(), token: crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '') }
  try { localStorage.setItem(KEY, JSON.stringify(memory)) } catch { /* memory still supports this visit */ }
  return memory
}

export function resetCartCredentials() {
  memory = null
  try { localStorage.removeItem(KEY); localStorage.removeItem('tss-cart-session-id') } catch { /* best effort */ }
}

export async function cartRequest(action: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/cart/${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(12000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Cart saving is temporarily unavailable. Your items remain in this browser.')
  return data
}
