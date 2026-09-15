-- Private QuickBooks connection. Only service_role may access these tables.
create table if not exists public.quickbooks_connections (
  environment text primary key check (environment in ('sandbox', 'production')),
  realm_id text,
  company_name text,
  encrypted_tokens text,
  access_expires_at timestamptz,
  refresh_expires_at timestamptz,
  status text not null default 'disconnected'
    check (status in ('connected', 'disconnected', 'reconnect_required')),
  connected_by uuid references auth.users(id),
  version uuid not null default gen_random_uuid(),
  lock_id uuid,
  lock_expires_at timestamptz,
  updated_at timestamptz not null default now()
);
create table if not exists public.quickbooks_oauth_states (
  state_hash text primary key,
  browser_hash text not null,
  environment text not null references public.quickbooks_connections(environment),
  connection_version uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists quickbooks_oauth_state_expiry on public.quickbooks_oauth_states(expires_at);
alter table public.quickbooks_connections enable row level security;
alter table public.quickbooks_oauth_states enable row level security;
revoke all on public.quickbooks_connections, public.quickbooks_oauth_states from public, anon, authenticated;
grant all on public.quickbooks_connections, public.quickbooks_oauth_states to service_role;
insert into public.quickbooks_connections(environment) values ('sandbox'), ('production') on conflict do nothing;

-- Serialize rotating refresh tokens, disconnects and OAuth callback writes across instances.
create or replace function public.acquire_quickbooks_lock(p_environment text, p_lock_id uuid)
returns setof public.quickbooks_connections
language sql security invoker set search_path = public
as $$
  update public.quickbooks_connections
  set lock_id = p_lock_id, lock_expires_at = now() + interval '60 seconds'
  where environment = p_environment
    and (lock_id is null or lock_expires_at < now())
  returning *;
$$;
revoke all on function public.acquire_quickbooks_lock(text, uuid) from public, anon, authenticated;
grant execute on function public.acquire_quickbooks_lock(text, uuid) to service_role;
