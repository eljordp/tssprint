begin;
create table public.quickbooks_checkouts (
 id uuid primary key,
 token_hash text not null check(length(token_hash)=64),
 request_hash text not null,
 environment text not null check(environment in ('sandbox','production')),
 realm_id text not null check(realm_id ~ '^[0-9]{1,32}$'),
 checkout jsonb not null,
 cart_session jsonb,
 customer_id text,
 customer_payload jsonb,
 invoice_payload jsonb,
 invoice_id text,
 invoice_number text,
 invoice_link text,
 tax numeric(12,2),
 total numeric(12,2),
 status text not null default 'creating' check(status in ('creating','awaiting_payment','partially_paid','payment_recorded','needs_review')),
 order_id text,
 payment_ids jsonb,
 last_error text,
 last_checked_at timestamptz,
 next_check_at timestamptz not null default now(),
 lock_id uuid,
 lock_expires_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(environment,realm_id,invoice_id)
);
alter table public.quickbooks_checkouts enable row level security;
revoke all on public.quickbooks_checkouts from public,anon,authenticated;
grant all on public.quickbooks_checkouts to service_role;
create index quickbooks_checkout_due on public.quickbooks_checkouts(next_check_at) where status <> 'payment_recorded';
create function public.acquire_quickbooks_checkout_lock(p_id uuid,p_lock_id uuid)
returns setof public.quickbooks_checkouts language sql security invoker set search_path=public as $$
 update public.quickbooks_checkouts set lock_id=p_lock_id,lock_expires_at=now()+interval '3 minutes'
 where id=p_id and (lock_id is null or lock_expires_at<now()) returning *;
$$;
revoke all on function public.acquire_quickbooks_checkout_lock(uuid,uuid) from public,anon,authenticated;
grant execute on function public.acquire_quickbooks_checkout_lock(uuid,uuid) to service_role;

create table public.quickbooks_delivery_jobs (
 id uuid primary key default gen_random_uuid(),
 checkout_id uuid not null references public.quickbooks_checkouts(id),
 kind text not null check(kind in ('customer_email','staff_email','cart_link','analytics')),
 status text not null default 'pending' check(status in ('pending','processing','retry','accepted','completed','needs_review')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 lease_id uuid, lease_until timestamptz,
 first_send_at timestamptz, request_payload jsonb, provider_id text, last_error text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(checkout_id,kind)
);
alter table public.quickbooks_delivery_jobs enable row level security;
revoke all on public.quickbooks_delivery_jobs from public,anon,authenticated;
grant all on public.quickbooks_delivery_jobs to service_role;
create function public.claim_quickbooks_delivery(p_checkout_id uuid default null)
returns setof public.quickbooks_delivery_jobs language sql security invoker set search_path=public as $$
 with due as (select id from public.quickbooks_delivery_jobs where (p_checkout_id is null or checkout_id=p_checkout_id) and
 ((status in ('pending','retry') and next_attempt_at<=now()) or (status='processing' and lease_until<now())) order by next_attempt_at for update skip locked limit 6)
 update public.quickbooks_delivery_jobs j set status='processing', attempts=attempts+1,lease_id=gen_random_uuid(),lease_until=now()+interval '3 minutes',updated_at=now()
 from due where j.id=due.id returning j.*;
$$;
revoke all on function public.claim_quickbooks_delivery(uuid) from public,anon,authenticated;
grant execute on function public.claim_quickbooks_delivery(uuid) to service_role;

-- One atomic commit for the order and follow-up jobs. Only server-verified
-- records under a current lease can reach this function; public roles cannot.
create function public.finalize_quickbooks_checkout(p_id uuid,p_lock_id uuid,p_payments jsonb)
returns text language plpgsql security invoker set search_path=public as $$
declare r public.quickbooks_checkouts; oid text; c jsonb;
begin
 select * into strict r from public.quickbooks_checkouts where id=p_id and lock_id=p_lock_id and lock_expires_at>now() for update;
 if r.order_id is not null then return r.order_id; end if;
 if r.invoice_id is null or r.total is null or r.total<=0 or jsonb_array_length(p_payments)=0 then raise exception 'Payment evidence required'; end if;
 oid := 'QB-' || r.id; c := r.checkout->'customer';
 insert into public.orders(id,customer_first_name,customer_last_name,customer_email,customer_phone,customer_address,customer_city,customer_state,customer_zip,items,total,status,payment_status,payment_provider,payment_reference,payment_verified_at,payment_amount,payment_currency,visitor_id,session_id,attribution)
 values(oid,c->>'firstName',c->>'lastName',c->>'email',c->>'phone',case when c->>'deliveryMethod'='pickup' then 'Local pickup' else c->>'address' end,
 case when c->>'deliveryMethod'='pickup' then 'Hayward' else c->>'city' end,case when c->>'deliveryMethod'='pickup' then 'CA' else c->>'state' end,case when c->>'deliveryMethod'='pickup' then '94545' else c->>'zip' end,
 r.checkout->'items',r.total,'processing','payment_recorded','quickbooks',r.invoice_id,now(),r.total,'USD',r.checkout->>'visitorId',r.checkout->>'sessionId',r.checkout->'attribution');
 update public.quickbooks_checkouts set order_id=oid,status='payment_recorded',payment_ids=p_payments,last_error=null,updated_at=now() where id=p_id;
 insert into public.quickbooks_delivery_jobs(checkout_id,kind) values(p_id,'customer_email'),(p_id,'staff_email'),(p_id,'cart_link'),(p_id,'analytics');
 return oid;
end $$;
revoke all on function public.finalize_quickbooks_checkout(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finalize_quickbooks_checkout(uuid,uuid,jsonb) to service_role;

create table public.quickbooks_request_limits (key text primary key, hits integer not null, expires_at timestamptz not null);
alter table public.quickbooks_request_limits enable row level security;
revoke all on public.quickbooks_request_limits from public,anon,authenticated;
grant all on public.quickbooks_request_limits to service_role;
create function public.allow_quickbooks_checkout(p_key text) returns boolean language plpgsql security invoker set search_path=public as $$
declare count_now integer;
begin
 insert into public.quickbooks_request_limits(key,hits,expires_at) values(p_key,1,now()+interval '1 hour')
 on conflict(key) do update set hits=case when quickbooks_request_limits.expires_at<now() then 1 else quickbooks_request_limits.hits+1 end,
 expires_at=case when quickbooks_request_limits.expires_at<now() then now()+interval '1 hour' else quickbooks_request_limits.expires_at end returning hits into count_now;
 return count_now<=6;
end $$;
revoke all on function public.allow_quickbooks_checkout(text) from public,anon,authenticated;
grant execute on function public.allow_quickbooks_checkout(text) to service_role;
create table public.quickbooks_webhook_events (
 id text primary key, realm_id text not null, entity text not null, entity_id text not null,
 processed_at timestamptz, created_at timestamptz not null default now()
);
alter table public.quickbooks_webhook_events enable row level security;
revoke all on public.quickbooks_webhook_events from public,anon,authenticated;
grant all on public.quickbooks_webhook_events to service_role;
commit;
