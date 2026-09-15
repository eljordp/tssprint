-- Checkout remains valid when browser attribution is unavailable.
create or replace function public.finalize_quickbooks_checkout(p_id uuid,p_lock_id uuid,p_payments jsonb)
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
 r.checkout->'items',r.total,'processing','payment_recorded','quickbooks',r.invoice_id,now(),r.total,'USD',r.checkout->>'visitorId',r.checkout->>'sessionId',coalesce(r.checkout->'attribution','{}'::jsonb));
 update public.quickbooks_checkouts set order_id=oid,status='payment_recorded',payment_ids=p_payments,last_error=null,updated_at=now() where id=p_id;
 insert into public.quickbooks_delivery_jobs(checkout_id,kind) values(p_id,'customer_email'),(p_id,'staff_email'),(p_id,'cart_link'),(p_id,'analytics');
 return oid;
end $$;
