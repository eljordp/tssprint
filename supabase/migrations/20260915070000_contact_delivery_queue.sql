begin;
alter table public.contact_submissions
 add column if not exists delivery_workflow_version integer not null default 0,
 add column if not exists subscribe_requested boolean not null default false,
 add column if not exists subscription_tags text[] not null default '{}';

create table public.contact_delivery_jobs (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.contact_submissions(id),
 kind text not null check(kind in ('customer_sync','subscription','staff_email','customer_email')),
 status text not null default 'pending' check(status in ('pending','processing','retry','accepted','completed','skipped','needs_review')),
 attempts integer not null default 0,
 next_attempt_at timestamptz not null default now(),
 lease_id uuid,
 lease_until timestamptz,
 first_send_at timestamptz,
 request_payload jsonb,
 provider_id text,
 last_error text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(lead_id,kind)
);
alter table public.contact_delivery_jobs enable row level security;
revoke all on public.contact_delivery_jobs from public,anon,authenticated;
grant select on public.contact_delivery_jobs to authenticated;
grant all on public.contact_delivery_jobs to service_role;
create policy "Admins read contact delivery jobs" on public.contact_delivery_jobs for select to authenticated using(public.has_role(auth.uid(),'admin'));
create index contact_delivery_due_idx on public.contact_delivery_jobs(next_attempt_at) where status in ('pending','retry','processing');

create function public.queue_contact_delivery() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.delivery_workflow_version=1 then
  insert into public.contact_delivery_jobs(lead_id,kind) values(new.id,'customer_sync'),(new.id,'staff_email'),(new.id,'customer_email');
  if new.subscribe_requested then insert into public.contact_delivery_jobs(lead_id,kind) values(new.id,'subscription'); end if;
 end if;
 return new;
end $$;
revoke all on function public.queue_contact_delivery() from public,anon,authenticated;
create trigger queue_contact_delivery after insert on public.contact_submissions for each row execute function public.queue_contact_delivery();

create function public.claim_contact_delivery(_lead_id uuid default null) returns setof public.contact_delivery_jobs language sql security definer set search_path=public as $$
 with due as (
  select id from public.contact_delivery_jobs
  where (_lead_id is null or lead_id=_lead_id)
    and ((status in ('pending','retry') and next_attempt_at<=now()) or (status='processing' and lease_until<now()))
  order by next_attempt_at,id for update skip locked limit 4
 )
 update public.contact_delivery_jobs j set status='processing',attempts=attempts+1,lease_id=gen_random_uuid(),lease_until=now()+interval '5 minutes',updated_at=now()
 from due where j.id=due.id returning j.*;
$$;
revoke all on function public.claim_contact_delivery(uuid) from public,anon,authenticated;
grant execute on function public.claim_contact_delivery(uuid) to service_role;

create function public.apply_contact_subscription(_lead_id uuid) returns boolean language plpgsql security definer set search_path=public as $$
declare lead public.contact_submissions; saved_id uuid;
begin
 select * into strict lead from public.contact_submissions where id=_lead_id;
 if not lead.subscribe_requested then return false; end if;
 -- A delayed job must never undo an unsubscribe. Preserve it for staff review.
 insert into public.email_subscribers(email,name,phone,source,service_interest,tags,status,consented_at,updated_at)
 values(lower(trim(lead.email)),lead.name,lead.phone,lead.source,lead.service,lead.subscription_tags,'subscribed',lead.created_at,now())
 on conflict(email) do update set
  name=coalesce(excluded.name,email_subscribers.name), phone=coalesce(excluded.phone,email_subscribers.phone),
  tags=(select coalesce(array_agg(distinct tag),'{}'::text[]) from unnest(coalesce(email_subscribers.tags,'{}'::text[])||excluded.tags) tag),
  updated_at=now()
 where email_subscribers.status<>'unsubscribed'
 returning id into saved_id;
 return saved_id is not null;
end $$;
revoke all on function public.apply_contact_subscription(uuid) from public,anon,authenticated;
grant execute on function public.apply_contact_subscription(uuid) to service_role;
commit;
