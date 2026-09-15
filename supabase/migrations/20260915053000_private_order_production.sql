begin;
create table if not exists public.order_production_details (
 order_id text primary key references public.orders(id), staff_notes text not null default '', assigned_to text not null default '', due_date date, tracking_url text not null default '', proof_reference text not null default '', proof_approved_at timestamptz
);
alter table public.order_production_details enable row level security;
revoke all on public.order_production_details from anon;
grant select, insert, update on public.order_production_details to authenticated;
grant all on public.order_production_details to service_role;
create policy "Admins manage production details" on public.order_production_details for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.order_production_details select id,staff_notes,assigned_to,due_date,tracking_url,proof_reference,proof_approved_at from public.orders where staff_notes <> '' or assigned_to <> '' or due_date is not null or tracking_url <> '' or proof_reference <> '' or proof_approved_at is not null on conflict (order_id) do nothing;
alter table public.orders drop column staff_notes, drop column assigned_to, drop column due_date, drop column tracking_url, drop column proof_reference, drop column proof_approved_at;
create or replace function public.record_order_activity() returns trigger language plpgsql security definer set search_path = public as $$
declare changes jsonb; record_id text;
begin
 if tg_table_name = 'orders' and to_jsonb(new)->>'status' = 'in_production' and not exists(select 1 from public.order_production_details where order_id = to_jsonb(new)->>'id' and proof_approved_at is not null and proof_reference <> '') then raise exception 'Record proof approval before starting production.'; end if;
 select jsonb_object_agg(n.key,jsonb_build_object('from',o.value,'to',n.value)) into changes from jsonb_each(to_jsonb(new)) n left join jsonb_each(case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end) o using(key) where n.value is distinct from o.value and n.key in ('status','staff_notes','assigned_to','due_date','tracking_url','proof_reference','proof_approved_at','payment_status');
 record_id := coalesce(to_jsonb(new)->>'order_id',to_jsonb(new)->>'id');
 if changes is not null then insert into public.order_activity(order_id,actor_id,changes) values(record_id,auth.uid(),changes); end if;
 return new;
end $$;
create trigger record_production_activity after insert or update on public.order_production_details for each row execute function public.record_order_activity();
commit;
