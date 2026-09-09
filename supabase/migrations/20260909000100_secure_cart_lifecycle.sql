-- Deploy together with the cart API. Anonymous browsers use per-cart bearer
-- secrets via the API; customer carts are never publicly selectable by email.
alter table public.cart_sessions
  add column if not exists access_token_hash text,
  add column if not exists last_activity_at timestamptz,
  add column if not exists checkout_started_at timestamptz,
  add column if not exists payment_issue_at timestamptz,
  add column if not exists recovered_at timestamptz,
  add column if not exists recovery_source_id uuid references public.cart_sessions(id),
  add column if not exists paid_order_id text,
  add column if not exists expires_at timestamptz,
  add column if not exists email_status text,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_provider_id text,
  add column if not exists is_test boolean not null default false;

revoke all on public.cart_sessions from anon;
revoke insert, update, delete on public.cart_sessions from authenticated;
revoke execute on function public.get_saved_cart(text) from public, anon, authenticated;
-- Retain authenticated admin SELECT policy. The service role owns mutations.
create index if not exists cart_sessions_activity_idx on public.cart_sessions(last_activity_at desc) where converted = false;
create index if not exists cart_sessions_paid_order_idx on public.cart_sessions(paid_order_id) where paid_order_id is not null;
