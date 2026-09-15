-- Private attempts inherit service-role-only access. No PAN or CVC is stored.
alter table public.quickbooks_checkouts
  add column if not exists payment_mode text not null default 'invoice'
    check (payment_mode in ('invoice','direct')),
  add column if not exists direct_payment jsonb;
