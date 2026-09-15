begin;
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

alter table public.quickbooks_webhook_events
 add column attempts integer not null default 0,
 add column next_attempt_at timestamptz not null default now(),
 add column lease_id uuid,
 add column lease_until timestamptz,
 add column last_error text;
create index quickbooks_webhooks_due on public.quickbooks_webhook_events(next_attempt_at) where processed_at is null;
create function public.claim_quickbooks_webhooks(p_realm_id text,p_limit integer default 3)
returns setof public.quickbooks_webhook_events language sql security invoker set search_path=public as $$
 with due as (select id from public.quickbooks_webhook_events where realm_id=p_realm_id and processed_at is null and next_attempt_at<=now()
 and (lease_id is null or lease_until<now()) order by next_attempt_at for update skip locked limit greatest(1,least(p_limit,10)))
 update public.quickbooks_webhook_events e set lease_id=gen_random_uuid(),lease_until=now()+interval '3 minutes',attempts=attempts+1
 from due where e.id=due.id returning e.*;
$$;
revoke all on function public.claim_quickbooks_webhooks(text,integer) from public,anon,authenticated;
grant execute on function public.claim_quickbooks_webhooks(text,integer) to service_role;

create table public.quickbooks_worker_runs (
 id uuid primary key default gen_random_uuid(),
 token_hash text,
 status text not null default 'queued' check(status in ('queued','running','completed','failed','expired')),
 expires_at timestamptz not null default now()+interval '2 minutes',
 created_at timestamptz not null default now(),
 started_at timestamptz, finished_at timestamptz,
 http_request_id bigint, stats jsonb, last_error text
);
alter table public.quickbooks_worker_runs enable row level security;
revoke all on public.quickbooks_worker_runs from public,anon,authenticated;
grant all on public.quickbooks_worker_runs to service_role;
create function public.claim_quickbooks_worker(p_id uuid,p_token_hash text)
returns boolean language plpgsql security invoker set search_path=public as $$
begin
 update public.quickbooks_worker_runs set status='running',token_hash=null,started_at=now()
 where id=p_id and status='queued' and expires_at>now() and token_hash=p_token_hash;
 return found;
end $$;
revoke all on function public.claim_quickbooks_worker(uuid,text) from public,anon,authenticated;
grant execute on function public.claim_quickbooks_worker(uuid,text) to service_role;

-- A new single-use token is generated per request and only its SHA256 is kept.
-- The short-lived plaintext is sent only to our fixed HTTPS worker endpoint.
create function public.dispatch_quickbooks_worker() returns bigint
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
 or exists(select 1 from public.quickbooks_checkouts where environment='production' and realm_id=company and invoice_id is not null and status<>'payment_recorded' and next_check_at<=now() and (lock_id is null or lock_expires_at<now()))
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

create function public.quickbooks_worker_health() returns jsonb
language sql security definer set search_path=pg_catalog,public as $$
 select jsonb_build_object(
 'scheduled',exists(select 1 from cron.job where jobname='tss-quickbooks-recovery' and active),
 'lastRun',(select jsonb_build_object('status',status,'createdAt',created_at,'finishedAt',finished_at,'error',last_error,'stats',stats) from public.quickbooks_worker_runs order by created_at desc limit 1),
 'pendingWebhooks',(select count(*) from public.quickbooks_webhook_events where processed_at is null),
 'pendingFollowUps',(select count(*) from public.quickbooks_delivery_jobs where status in ('pending','retry','processing')),
 'reviewFollowUps',(select count(*) from public.quickbooks_delivery_jobs where status='needs_review')
 );
$$;
revoke all on function public.quickbooks_worker_health() from public,anon,authenticated;
grant execute on function public.quickbooks_worker_health() to service_role;
commit;
-- Enable only after the production worker endpoint is deployed:
-- select cron.schedule('tss-quickbooks-recovery','*/2 * * * *','select public.dispatch_quickbooks_worker()');
