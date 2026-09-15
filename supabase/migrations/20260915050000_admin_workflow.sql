begin;
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('processing','artwork_needed','artwork_review','awaiting_approval','in_production','ready_pickup','shipped','completed','cancelled'));
alter table public.orders add column if not exists staff_notes text not null default '', add column if not exists assigned_to text not null default '', add column if not exists due_date date, add column if not exists tracking_url text not null default '', add column if not exists proof_reference text not null default '', add column if not exists proof_approved_at timestamptz;
alter table public.contact_submissions add column if not exists staff_notes text not null default '', add column if not exists follow_up_at date;
alter table public.customers add column if not exists staff_tag text not null default 'customer';
create table if not exists public.order_activity (id uuid primary key default gen_random_uuid(), order_id text not null references public.orders(id), actor_id uuid, created_at timestamptz not null default now(), changes jsonb not null);
alter table public.order_activity enable row level security;
grant select on public.order_activity to authenticated;
revoke all on public.order_activity from anon;
drop policy if exists "Admin reads order activity" on public.order_activity;
create policy "Admin reads order activity" on public.order_activity for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create or replace function public.record_order_activity() returns trigger language plpgsql security definer set search_path = public as $$
declare changes jsonb;
begin
 select jsonb_object_agg(n.key, jsonb_build_object('from', o.value, 'to', n.value)) into changes from jsonb_each(to_jsonb(new)) n join jsonb_each(to_jsonb(old)) o using (key) where n.value is distinct from o.value and n.key in ('status','staff_notes','assigned_to','due_date','tracking_url','proof_reference','proof_approved_at','payment_status');
 if changes is not null then insert into public.order_activity(order_id,actor_id,changes) values (new.id,auth.uid(),changes); end if;
 return new;
end $$;
revoke all on function public.record_order_activity() from public, anon, authenticated;
drop trigger if exists record_order_activity on public.orders;
create trigger record_order_activity after update on public.orders for each row execute function public.record_order_activity();
create index if not exists order_activity_order_idx on public.order_activity(order_id, created_at desc);
commit;
