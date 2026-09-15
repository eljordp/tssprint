begin;
-- Wallet tax quotes are non-posting. PayPal Connector remains the only accounting writer.
alter table public.quickbooks_checkouts drop constraint quickbooks_checkouts_payment_mode_check;
alter table public.quickbooks_checkouts add constraint quickbooks_checkouts_payment_mode_check check(payment_mode in ('invoice','direct','wallet'));
alter table public.quickbooks_checkouts add column if not exists estimate_id text, add column if not exists wallet_payment jsonb;
create unique index if not exists quickbooks_wallet_order_unique on public.quickbooks_checkouts ((wallet_payment->>'orderId')) where wallet_payment->>'orderId' is not null;
-- Checkout remains valid when browser attribution is unavailable.
create or replace function public.finalize_wallet_checkout(p_id uuid,p_lock_id uuid)
returns text language plpgsql security invoker set search_path=public as $$
declare r public.quickbooks_checkouts; oid text; c jsonb;
begin
 select * into strict r from public.quickbooks_checkouts where id=p_id and lock_id=p_lock_id and lock_expires_at>now() for update;
 if r.order_id is not null then return r.order_id; end if;
 if r.payment_mode <> 'wallet' or r.estimate_id is null or r.invoice_id is not null or r.total is null or r.total<=0 or r.wallet_payment->>'status' <> 'COMPLETED' or coalesce((r.wallet_payment->>'paid')::boolean,false) <> true or coalesce(r.wallet_payment->>'captureId','') !~ '^[A-Z0-9]{10,32}$' then raise exception 'Payment evidence required'; end if;
 oid := r.wallet_payment->>'orderId'; c := r.checkout->'customer';
 insert into public.orders(id,customer_first_name,customer_last_name,customer_email,customer_phone,customer_address,customer_city,customer_state,customer_zip,items,total,status,payment_status,payment_provider,payment_reference,payment_verified_at,payment_amount,payment_currency,paypal_capture_id,visitor_id,session_id,attribution)
 values(oid,c->>'firstName',c->>'lastName',c->>'email',c->>'phone',case when c->>'deliveryMethod'='pickup' then 'Local pickup' else c->>'address' end,
 case when c->>'deliveryMethod'='pickup' then 'Hayward' else c->>'city' end,case when c->>'deliveryMethod'='pickup' then 'CA' else c->>'state' end,case when c->>'deliveryMethod'='pickup' then '94545' else c->>'zip' end,
 r.checkout->'items',r.total,'processing','captured','paypal',r.wallet_payment->>'captureId',now(),r.total,'USD',r.wallet_payment->>'captureId',r.checkout->>'visitorId',r.checkout->>'sessionId',coalesce(r.checkout->'attribution','{}'::jsonb));
 update public.quickbooks_checkouts set order_id=oid,status='payment_recorded',payment_ids=jsonb_build_array(r.wallet_payment->>'captureId'),last_error=null,updated_at=now() where id=p_id;
 insert into public.quickbooks_delivery_jobs(checkout_id,kind) values(p_id,'customer_email'),(p_id,'staff_email'),(p_id,'cart_link'),(p_id,'analytics');
 return oid;
end $$;

revoke all on function public.finalize_wallet_checkout(uuid,uuid) from public,anon,authenticated;
grant execute on function public.finalize_wallet_checkout(uuid,uuid) to service_role;

create or replace function public.dispatch_quickbooks_worker() returns bigint
language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare run_id uuid; bearer text; request_id bigint; company text;
begin
 if not pg_try_advisory_xact_lock(714092611) then return null; end if;
 select realm_id into company from public.quickbooks_connections where environment='production' and status='connected';
 if company is null then return null; end if;
 update public.quickbooks_worker_runs set status='expired',token_hash=null,last_error='worker_did_not_finish',finished_at=now()
 where status in ('queued','running') and expires_at<now();
 if exists(select 1 from public.quickbooks_worker_runs where status in ('queued','running')) then return null; end if;
 if not (
 exists(select 1 from public.quickbooks_webhook_events where realm_id=company and processed_at is null and next_attempt_at<=now() and (lease_id is null or lease_until<now()))
 or exists(select 1 from public.quickbooks_checkouts where environment='production' and realm_id=company and (invoice_id is not null or wallet_payment->>'orderId' is not null) and (status<>'payment_recorded' or payment_mode='wallet') and next_check_at<=now() and (lock_id is null or lock_expires_at<now()))
 or exists(select 1 from public.quickbooks_delivery_jobs j join public.quickbooks_checkouts c on c.id=j.checkout_id where c.environment='production' and c.realm_id=company and ((j.status in ('pending','retry') and j.next_attempt_at<=now()) or (j.status='processing' and j.lease_until<now())))
 ) then return null; end if;
 bearer := encode(extensions.gen_random_bytes(32),'hex');
 insert into public.quickbooks_worker_runs(token_hash) values(encode(extensions.digest(bearer,'sha256'),'hex')) returning id into run_id;
 select net.http_post(url:='https://tssprint.com/api/quickbooks/worker',headers:=jsonb_build_object('Content-Type','application/json'),
 body:=jsonb_build_object('id',run_id,'token',bearer),timeout_milliseconds:=55000) into request_id;
 update public.quickbooks_worker_runs set http_request_id=request_id where id=run_id;
 return request_id;
end $$;
revoke all on function public.dispatch_quickbooks_worker() from public,anon,authenticated;
grant execute on function public.dispatch_quickbooks_worker() to service_role;


commit;
