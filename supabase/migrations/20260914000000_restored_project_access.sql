-- Already applied to replacement project on 2026-09-14.
-- Explicit grants are required because automatic table exposure was disabled.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select, insert on public.contact_submissions, public.orders, public.page_views,
 public.click_events, public.nav_events, public.customers, public.referrals, public.seo_rankings to anon, authenticated;
grant update on public.contact_submissions, public.orders, public.customers, public.referrals to authenticated;
grant select on public.cart_sessions, public.user_roles, public.email_subscribers,
 public.admin_audit_events, public.square_invoices to authenticated;
grant insert, update on public.square_invoices, public.pricing_configs to authenticated;
grant update on public.email_subscribers to authenticated;
grant select on public.pricing_configs to anon, authenticated;
-- Bind security-definer name resolution to the intended schema.
alter function public.has_role(uuid,text) set search_path = public;
alter function public.get_or_create_customer(text,text,text,text,text) set search_path = public;
alter function public.record_purchase(text,text,numeric) set search_path = public;
-- Customer account order history: only the signed-in customer's own email.
drop policy if exists "Customers can read their own orders" on public.orders;
create policy "Customers can read their own orders" on public.orders
for select to authenticated using (lower(customer_email) = lower(auth.jwt()->>'email'));
-- Uploaded artwork stays private; the server issues short-lived signed URLs.
insert into storage.buckets (id,name,public,file_size_limit)
values ('order-artwork','order-artwork',false,52428800)
on conflict (id) do nothing;
