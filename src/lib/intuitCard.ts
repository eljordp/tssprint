export type IntuitCard = {
  name: string; number: string; expMonth: string; expYear: string; cvc: string
  address: { postalCode: string; country: string }
}
// Intuit's documented browser tokenization endpoint is anonymous. OAuth secrets
// never leave our server; card details never enter a TSS request or storage.
export async function tokenizeIntuitCard(card: IntuitCard, environment: 'sandbox' | 'production') {
  const host = environment === 'production' ? 'api.intuit.com' : 'sandbox.api.intuit.com'
  const response = await fetch(`https://${host}/quickbooks/v4/payments/tokens`, {
    method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error',
    headers: { 'Content-Type': 'application/json', 'Request-Id': crypto.randomUUID() },
    body: JSON.stringify({ card }), signal: AbortSignal.timeout(15000),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || typeof data?.value !== 'string' || !/^[A-Za-z0-9_+=/-]{10,512}$/.test(data.value)) {
    throw new Error('Check your card details and try again. Your card has not been charged by this step.')
  }
  return data.value as string
}
