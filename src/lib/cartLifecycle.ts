export type CartLifecycleRow = {
  items?: unknown[] | null; converted?: boolean; paid_order_id?: string | null;
  updated_at: string; last_activity_at?: string | null; recovered_at?: string | null;
  checkout_started_at?: string | null; payment_issue_at?: string | null; expires_at?: string | null;
  access_token_hash?: string | null; is_test?: boolean;
}

export function cartLifecycle(cart: CartLifecycleRow, now = Date.now()): string {
  if (cart.is_test) return 'Test'
  if (cart.paid_order_id) return 'Paid'
  if (cart.converted) return 'Legacy conversion (unverified)'
  if (!cart.items?.length) return 'Empty'
  if (cart.expires_at && Date.parse(cart.expires_at) < now) return 'Expired'
  if (cart.recovered_at) return 'Restored'
  if (cart.payment_issue_at) return 'Payment issue'
  if (!cart.access_token_hash) return 'Legacy (unverified)'
  if (now - Date.parse(cart.last_activity_at || cart.updated_at) >= 60 * 60 * 1000) return 'Inactive'
  return cart.checkout_started_at ? 'Checkout started' : 'Active'
}
