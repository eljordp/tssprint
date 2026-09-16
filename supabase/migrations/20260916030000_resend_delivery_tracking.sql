begin;
create table if not exists public.resend_delivery_events (
  id text primary key check (length(id) <= 200),
  provider_id uuid not null,
  event_type text not null check (event_type in ('email.sent','email.delivered','email.delivery_delayed','email.bounced','email.failed','email.complained','email.suppressed')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index if not exists resend_delivery_events_provider_idx on public.resend_delivery_events(provider_id, event_type, occurred_at desc);
alter table public.resend_delivery_events enable row level security;
revoke all on public.resend_delivery_events from public, anon, authenticated;
grant select, insert on public.resend_delivery_events to service_role;
create or replace view public.resend_delivery_status with (security_invoker = true) as
  select provider_id, event_type, max(occurred_at) as occurred_at
  from public.resend_delivery_events group by provider_id, event_type;
revoke all on public.resend_delivery_status from public, anon, authenticated;
grant select on public.resend_delivery_status to service_role;
comment on table public.resend_delivery_events is 'Verified Resend callbacks only. No message bodies or recipient addresses. Send-job status remains separate; delivery problems never automatically resend receipts.';
notify pgrst, 'reload schema';
commit;
