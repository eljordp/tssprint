begin;
create table if not exists public.quickbooks_invoice_tests (
  id uuid primary key default gen_random_uuid(),
  environment text not null check (environment = 'sandbox'),
  realm_id text not null check (realm_id ~ '^[0-9]{1,32}$'),
  run_key text not null,
  checkout jsonb not null,
  fingerprint text not null,
  customer_id text,
  invoice_payload jsonb,
  invoice_id text,
  invoice_number text,
  invoice_link text,
  status text not null default 'creating' check (status in ('creating','awaiting_payment','partially_paid','payment_recorded','needs_review')),
  last_error text,
  last_checked_at timestamptz,
  lock_id uuid,
  lock_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (environment, realm_id, run_key),
  unique (environment, realm_id, invoice_id)
);
alter table public.quickbooks_invoice_tests enable row level security;
revoke all on public.quickbooks_invoice_tests from public, anon, authenticated;
grant select, insert, update on public.quickbooks_invoice_tests to service_role;
create or replace function public.acquire_quickbooks_invoice_test_lock(p_id uuid, p_lock_id uuid)
returns setof public.quickbooks_invoice_tests language sql security invoker set search_path = public as $$
  update public.quickbooks_invoice_tests set lock_id = p_lock_id, lock_expires_at = now() + interval '3 minutes'
  where id = p_id and (lock_id is null or lock_expires_at < now()) returning *;
$$;
revoke all on function public.acquire_quickbooks_invoice_test_lock(uuid,uuid) from public, anon, authenticated;
grant execute on function public.acquire_quickbooks_invoice_test_lock(uuid,uuid) to service_role;
commit;
