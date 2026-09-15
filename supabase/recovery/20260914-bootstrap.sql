-- TSS Print fresh-project bootstrap. Target: obomvaiaboqkvbyvlnav ONLY.
begin;

-- SOURCE: schema.sql
-- The Sticker Smith - Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project

-- 1. Contact form submissions
create table if not exists contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  service text,
  message text not null,
  source text default 'contact-page',
  created_at timestamptz default now()
);

-- 2. Orders (synced from PayPal checkout)
create table if not exists orders (
  id text primary key, -- PayPal order ID
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_state text,
  customer_zip text,
  items jsonb not null default '[]',
  total numeric(10,2) not null,
  status text default 'processing' check (status in ('processing', 'shipped', 'completed')),
  payment_status text default 'unverified' check (payment_status in ('unverified', 'captured', 'not_captured', 'not_found', 'refunded')),
  paypal_capture_id text,
  payment_verified_at timestamptz,
  payment_amount numeric(10,2),
  payment_currency text default 'USD',
  created_at timestamptz default now()
);

-- 3. Cart sessions (for abandoned cart tracking)
create table if not exists cart_sessions (
  id uuid default gen_random_uuid() primary key,
  email text,
  items jsonb not null default '[]',
  total_price numeric(10,2) default 0,
  converted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Admin user roles
create type user_role as enum ('admin', 'user', 'owner', 'manager', 'sales', 'production', 'follow_up', 'technical');

create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role user_role default 'user',
  created_at timestamptz default now(),
  unique(user_id, role)
);

-- RPC function to check admin role
create or replace function has_role(_user_id uuid, _role text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from user_roles
    where user_id = _user_id
    and role = _role::user_role
  );
end;
$$;

-- Row Level Security
alter table contact_submissions enable row level security;
alter table orders enable row level security;
alter table cart_sessions enable row level security;
grant select, insert, update on cart_sessions to anon;
grant select, insert, update on cart_sessions to authenticated;
alter table user_roles enable row level security;

-- Anyone can insert contact submissions
create policy "Anyone can submit contact form"
  on contact_submissions for insert
  with check (true);

-- Only admins can read contact submissions
create policy "Admins can read contact submissions"
  on contact_submissions for select
  using (has_role(auth.uid(), 'admin'));

-- Anyone can insert orders (from checkout)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

-- Admins can read/update orders
create policy "Admins can read orders"
  on orders for select
  using (has_role(auth.uid(), 'admin'));

create policy "Admins can update orders"
  on orders for update
  using (has_role(auth.uid(), 'admin'));

-- Anyone can create/update cart sessions
create policy "Anyone can create cart sessions"
  on cart_sessions for insert
  with check (true);

create policy "Anyone can update their cart session"
  on cart_sessions for update
  with check (true);

-- Admins can read cart sessions
create policy "Admins can read cart sessions"
  on cart_sessions for select
  using (has_role(auth.uid(), 'admin'));

-- Only admins can read user_roles
create policy "Admins can read roles"
  on user_roles for select
  using (has_role(auth.uid(), 'admin') or user_id = auth.uid());

-- SETUP: After running this schema, create an admin user:
-- 1. Go to Authentication > Users > Create User
-- 2. Set email: thestickersmith@gmail.com, set a secure password
-- 3. Then run:
--    INSERT INTO user_roles (user_id, role)
--    VALUES ('<user-id-from-step-2>', 'admin');


-- SOURCE: schema-v2.sql
-- The Sticker Smith - Schema V2: Analytics, Referrals, CRM
-- Run this AFTER the original schema.sql

-- 5. Page views (analytics)
create table if not exists page_views (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  referrer text,
  session_id text,
  visitor_id text,
  user_agent text,
  screen_width int,
  created_at timestamptz default now()
);

-- 6. Click events (heatmap/interaction tracking)
create table if not exists click_events (
  id uuid default gen_random_uuid() primary key,
  path text not null,
  element text, -- CSS selector or description
  x_percent numeric(5,2), -- % from left
  y_percent numeric(5,2), -- % from top
  session_id text,
  visitor_id text,
  created_at timestamptz default now()
);

-- 7. Navigation events (funnel/drop-off tracking)
create table if not exists nav_events (
  id uuid default gen_random_uuid() primary key,
  from_path text,
  to_path text,
  session_id text,
  visitor_id text,
  duration_ms int, -- time spent on from_path
  created_at timestamptz default now()
);

-- 8. Customers (CRM)
create table if not exists customers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  total_spent numeric(10,2) default 0,
  order_count int default 0,
  referred_by uuid references customers(id),
  referral_code text unique,
  source text, -- 'checkout', 'cart-email', 'contact', 'referral'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Referral tracking
create table if not exists referrals (
  id uuid default gen_random_uuid() primary key,
  referrer_id uuid references customers(id) on delete cascade,
  referred_id uuid references customers(id) on delete cascade,
  referral_code text not null,
  status text default 'clicked' check (status in ('clicked', 'signed_up', 'purchased')),
  order_id text references orders(id),
  created_at timestamptz default now(),
  unique(referrer_id, referred_id)
);

-- RLS
alter table page_views enable row level security;
alter table click_events enable row level security;
alter table nav_events enable row level security;
alter table customers enable row level security;
alter table referrals enable row level security;

-- Anyone can insert analytics (anonymous tracking)
create policy "Anyone can log page views" on page_views for insert with check (true);
create policy "Anyone can log clicks" on click_events for insert with check (true);
create policy "Anyone can log navigation" on nav_events for insert with check (true);

-- Anyone can insert/update customers (from checkout/contact)
create policy "Anyone can create customers" on customers for insert with check (true);
create policy "Anyone can update customers" on customers for update with check (true);

-- Anyone can create referrals
create policy "Anyone can create referrals" on referrals for insert with check (true);
create policy "Anyone can update referrals" on referrals for update with check (true);

-- Only admins read analytics/CRM
create policy "Admins can read page views" on page_views for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read clicks" on click_events for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read navigation" on nav_events for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read customers" on customers for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can read referrals" on referrals for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can update customers" on customers for update using (has_role(auth.uid(), 'admin'));

-- Helper: Get or create customer by email
create or replace function get_or_create_customer(_email text, _first_name text default null, _last_name text default null, _phone text default null, _source text default 'unknown')
returns uuid
language plpgsql
security definer
as $$
declare
  _id uuid;
  _code text;
begin
  select id into _id from customers where email = lower(trim(_email));
  if _id is not null then
    update customers set
      first_name = coalesce(_first_name, customers.first_name),
      last_name = coalesce(_last_name, customers.last_name),
      phone = coalesce(_phone, customers.phone),
      updated_at = now()
    where id = _id;
    return _id;
  end if;

  -- Generate unique referral code (6 chars)
  _code := upper(substr(md5(random()::text), 1, 6));
  while exists (select 1 from customers where referral_code = _code) loop
    _code := upper(substr(md5(random()::text), 1, 6));
  end loop;

  insert into customers (email, first_name, last_name, phone, source, referral_code)
  values (lower(trim(_email)), _first_name, _last_name, _phone, _source, _code)
  returning id into _id;

  return _id;
end;
$$;

-- Helper: Record a purchase for CRM
create or replace function record_purchase(_email text, _order_id text, _total numeric)
returns void
language plpgsql
security definer
as $$
declare
  _customer_id uuid;
begin
  select id into _customer_id from customers where email = lower(trim(_email));
  if _customer_id is not null then
    update customers set
      total_spent = total_spent + _total,
      order_count = order_count + 1,
      updated_at = now()
    where id = _customer_id;

    -- Update referral status if this customer was referred
    update referrals set status = 'purchased', order_id = _order_id
    where referred_id = _customer_id and status != 'purchased';
  end if;
end;
$$;

-- Grant execute on functions
grant execute on function get_or_create_customer to anon, authenticated;
grant execute on function record_purchase to anon, authenticated;

-- 10. Store-wide pricing
create table if not exists pricing_configs (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz default now()
);

alter table pricing_configs enable row level security;

drop policy if exists "Anyone can read pricing configs" on pricing_configs;
drop policy if exists "Admins can insert pricing configs" on pricing_configs;
drop policy if exists "Admins can update pricing configs" on pricing_configs;

create policy "Anyone can read pricing configs" on pricing_configs for select using (true);
create policy "Admins can insert pricing configs" on pricing_configs for insert with check (has_role(auth.uid(), 'admin'));
create policy "Admins can update pricing configs" on pricing_configs for update using (has_role(auth.uid(), 'admin'));

-- 11. Email list
create table if not exists email_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  service_interest text,
  source text,
  status text default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  tags text[] default '{}'::text[],
  consented_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table email_subscribers enable row level security;

drop policy if exists "Admins can read subscribers" on email_subscribers;
drop policy if exists "Admins can update subscribers" on email_subscribers;

create policy "Admins can read subscribers" on email_subscribers for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can update subscribers" on email_subscribers for update using (has_role(auth.uid(), 'admin'));

create or replace function upsert_email_subscriber(
  _email text,
  _name text default null,
  _phone text default null,
  _source text default 'website',
  _service_interest text default null,
  _tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _id uuid;
begin
  if _email is null or length(trim(_email)) = 0 then
    raise exception 'Email is required';
  end if;

  insert into email_subscribers (
    email,
    name,
    phone,
    source,
    service_interest,
    tags,
    status,
    consented_at,
    updated_at
  )
  values (
    lower(trim(_email)),
    nullif(trim(_name), ''),
    nullif(trim(_phone), ''),
    nullif(trim(_source), ''),
    nullif(trim(_service_interest), ''),
    coalesce(_tags, '{}'::text[]),
    'subscribed',
    now(),
    now()
  )
  on conflict (email) do update set
    name = coalesce(excluded.name, email_subscribers.name),
    phone = coalesce(excluded.phone, email_subscribers.phone),
    source = coalesce(excluded.source, email_subscribers.source),
    service_interest = coalesce(excluded.service_interest, email_subscribers.service_interest),
    status = 'subscribed',
    consented_at = now(),
    updated_at = now(),
    tags = (
      select coalesce(array_agg(distinct t.tag), '{}'::text[])
      from unnest(coalesce(email_subscribers.tags, '{}'::text[]) || coalesce(excluded.tags, '{}'::text[])) as t(tag)
      where t.tag <> ''
    )
  returning id into _id;

  return _id;
end;
$$;

grant execute on function upsert_email_subscriber to anon, authenticated;


-- SOURCE: migrations/20260605021900_store_pricing_and_email_list.sql
-- Store-wide admin pricing + email list for The Sticker Smith.
-- Safe to run once in Supabase SQL Editor before deploying the frontend.

create table if not exists pricing_configs (
  id text primary key,
  config jsonb not null,
  updated_at timestamptz default now()
);

alter table pricing_configs enable row level security;

drop policy if exists "Anyone can read pricing configs" on pricing_configs;
drop policy if exists "Admins can insert pricing configs" on pricing_configs;
drop policy if exists "Admins can update pricing configs" on pricing_configs;

create policy "Anyone can read pricing configs" on pricing_configs for select using (true);
create policy "Admins can insert pricing configs" on pricing_configs for insert with check (has_role(auth.uid(), 'admin'));
create policy "Admins can update pricing configs" on pricing_configs for update using (has_role(auth.uid(), 'admin'));

create table if not exists email_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  phone text,
  service_interest text,
  source text,
  status text default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  tags text[] default '{}'::text[],
  consented_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table email_subscribers enable row level security;

drop policy if exists "Admins can read subscribers" on email_subscribers;
drop policy if exists "Admins can update subscribers" on email_subscribers;

create policy "Admins can read subscribers" on email_subscribers for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can update subscribers" on email_subscribers for update using (has_role(auth.uid(), 'admin'));

create or replace function upsert_email_subscriber(
  _email text,
  _name text default null,
  _phone text default null,
  _source text default 'website',
  _service_interest text default null,
  _tags text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _id uuid;
begin
  if _email is null or length(trim(_email)) = 0 then
    raise exception 'Email is required';
  end if;

  insert into email_subscribers (
    email,
    name,
    phone,
    source,
    service_interest,
    tags,
    status,
    consented_at,
    updated_at
  )
  values (
    lower(trim(_email)),
    nullif(trim(_name), ''),
    nullif(trim(_phone), ''),
    nullif(trim(_source), ''),
    nullif(trim(_service_interest), ''),
    coalesce(_tags, '{}'::text[]),
    'subscribed',
    now(),
    now()
  )
  on conflict (email) do update set
    name = coalesce(excluded.name, email_subscribers.name),
    phone = coalesce(excluded.phone, email_subscribers.phone),
    source = coalesce(excluded.source, email_subscribers.source),
    service_interest = coalesce(excluded.service_interest, email_subscribers.service_interest),
    status = 'subscribed',
    consented_at = now(),
    updated_at = now(),
    tags = (
      select coalesce(array_agg(distinct t.tag), '{}'::text[])
      from unnest(coalesce(email_subscribers.tags, '{}'::text[]) || coalesce(excluded.tags, '{}'::text[])) as t(tag)
      where t.tag <> ''
    )
  returning id into _id;

  return _id;
end;
$$;

grant execute on function upsert_email_subscriber to anon, authenticated;


-- SOURCE: migrations/20260605033000_square_oauth_and_team_roles.sql
-- Square OAuth, invoice tracking, and expanded admin team roles.
-- Run in Supabase SQL Editor before using the Square admin tab.

do $$
begin
  alter type user_role add value if not exists 'owner';
  alter type user_role add value if not exists 'manager';
  alter type user_role add value if not exists 'sales';
  alter type user_role add value if not exists 'production';
  alter type user_role add value if not exists 'follow_up';
  alter type user_role add value if not exists 'technical';
exception
  when duplicate_object then null;
end $$;

create table if not exists square_oauth_states (
  state text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists square_connections (
  id text primary key default 'primary',
  merchant_id text,
  location_id text,
  location_name text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[] default '{}'::text[],
  status text default 'connected' check (status in ('connected', 'disconnected', 'error')),
  connected_by uuid references auth.users(id),
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists square_invoices (
  id uuid default gen_random_uuid() primary key,
  square_invoice_id text unique,
  square_invoice_number text,
  square_order_id text,
  square_customer_id text,
  local_order_id text references orders(id),
  contact_submission_id uuid references contact_submissions(id),
  customer_email text,
  customer_name text,
  title text,
  description text,
  amount numeric(10,2) not null,
  currency text default 'USD',
  status text default 'draft',
  public_url text,
  due_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table square_oauth_states enable row level security;
alter table square_connections enable row level security;
alter table square_invoices enable row level security;

drop policy if exists "Admins can read square invoices" on square_invoices;
drop policy if exists "Admins can update square invoices" on square_invoices;

create policy "Admins can read square invoices" on square_invoices for select using (has_role(auth.uid(), 'admin'));
create policy "Admins can update square invoices" on square_invoices for update using (has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can create square invoices" on square_invoices;
create policy "Admins can create square invoices" on square_invoices for insert with check (has_role(auth.uid(), 'admin'));


-- SOURCE: migrations/20260612000000_order_payment_status.sql
alter table orders
  alter column status set default 'processing';

alter table orders
  add column if not exists payment_status text default 'unverified',
  add column if not exists paypal_capture_id text,
  add column if not exists payment_verified_at timestamptz,
  add column if not exists payment_amount numeric(10,2),
  add column if not exists payment_currency text default 'USD';

update orders
set payment_status = 'unverified'
where payment_status is null;


-- SOURCE: migrations/20260615000000_seo_rankings.sql
-- SEO rank tracking — fed by the weekly tss-seo-rank-monitor automation,
-- displayed in the admin "SEO Rankings" tab. Later also backfilled by GSC.
create table if not exists seo_rankings (
  id uuid default gen_random_uuid() primary key,
  query text not null,
  city text,                          -- null = generic / national
  device text default 'desktop',      -- 'desktop' | 'mobile'
  rank int,                           -- null = not in top 20
  ranking_url text,
  local_pack boolean default false,   -- Google Business / local pack presence
  serp_feature text,                  -- 'organic' | 'local_pack' | 'none' | ...
  source text default 'monitor',      -- 'monitor' | 'gsc' | 'baseline' | 'manual'
  notes text,
  checked_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists seo_rankings_query_checked_idx
  on seo_rankings (query, checked_at desc);

alter table seo_rankings enable row level security;

-- The local weekly monitor inserts snapshots anonymously; only admins can read.
create policy "Anyone can log seo rankings" on seo_rankings
  for insert with check (true);
create policy "Admins can read seo rankings" on seo_rankings
  for select using (has_role(auth.uid(), 'admin'));


-- SOURCE: migrations/20260617000000_cart_sessions_allow_anon.sql
-- Allow abandoned-cart tracking without requiring an email.
-- The deployed policy required `email is not null`, which silently dropped
-- ~100% of carts since the email modal never opens. Replace with an open
-- insert/update policy so every cart can be counted.

drop policy if exists "Anyone can insert their cart session" on cart_sessions;
drop policy if exists "Anyone can insert cart session" on cart_sessions;
drop policy if exists "Anyone can submit cart session" on cart_sessions;
drop policy if exists "Anyone can update their cart session" on cart_sessions;
drop policy if exists "Anyone can update cart session" on cart_sessions;

create policy "Anyone can insert cart session"
  on cart_sessions for insert
  with check (true);

create policy "Anyone can update cart session"
  on cart_sessions for update
  with check (true);


-- SOURCE: migrations/20260617000100_cart_sessions_grant_anon.sql
-- RLS policies alone aren't enough — anon role also needs explicit table grants
-- to actually read/write rows. Without this, inserts hit 401 even with permissive
-- policies in place.

grant select, insert, update on cart_sessions to anon;
grant select, insert, update on cart_sessions to authenticated;


-- SOURCE: migrations/20260617000200_cart_sessions_policy_reset.sql
-- Drop ALL existing policies on cart_sessions (names unknown — earlier drops
-- by name found nothing, but inserts still hit RLS 401, so a restrictive
-- policy exists under a name we haven't guessed). Recreate from scratch.

do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'cart_sessions' loop
    execute format('drop policy if exists %I on cart_sessions', pol.policyname);
  end loop;
end $$;

-- Anyone can insert a cart session (with or without email)
create policy "cart_sessions_anon_insert"
  on cart_sessions for insert to anon, authenticated
  with check (true);

-- Anyone can update their cart session
create policy "cart_sessions_anon_update"
  on cart_sessions for update to anon, authenticated
  using (true)
  with check (true);

-- Only admins can read cart sessions (preserves original intent)
create policy "cart_sessions_admin_select"
  on cart_sessions for select to authenticated
  using (has_role(auth.uid(), 'admin'));


-- SOURCE: migrations/20260617010000_get_saved_cart_rpc.sql
-- Cross-device cart restore by email.
-- Returns the most recent non-converted cart for a given email, or nothing.
-- Security-definer so anon can call it without granting broad SELECT on cart_sessions.

create or replace function public.get_saved_cart(p_email text)
returns table (
  id uuid,
  items jsonb,
  total_price numeric,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select id, items, total_price, created_at, updated_at
  from cart_sessions
  where lower(email) = lower(trim(p_email))
    and converted = false
    and jsonb_array_length(items) > 0
  order by updated_at desc
  limit 1;
$$;

grant execute on function public.get_saved_cart(text) to anon, authenticated;


-- SOURCE: migrations/20260706000000_admin_audit_events.sql
-- Admin login / security audit log.
-- Server-side API routes insert with the service-role key; admins can read in the dashboard.

create table if not exists admin_audit_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  event_type text not null,
  outcome text not null default 'success',
  ip_address text,
  country text,
  region text,
  city text,
  user_agent text,
  path text,
  referrer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_events_created_at_idx on admin_audit_events (created_at desc);
create index if not exists admin_audit_events_user_created_idx on admin_audit_events (user_id, created_at desc);
create index if not exists admin_audit_events_ip_idx on admin_audit_events (ip_address);

alter table admin_audit_events enable row level security;

grant select on admin_audit_events to authenticated;

drop policy if exists "Admins can read admin audit events" on admin_audit_events;
create policy "Admins can read admin audit events"
  on admin_audit_events for select
  using (has_role(auth.uid(), 'admin'));


-- SOURCE: migrations/20260713000000_contact_submissions_visitor_link.sql
-- Link contact submissions to the analytics visitor/session so the admin
-- Abandoned Carts panel can match a form submission to cart activity exactly.
-- (Already applied to prod 2026-07-13 via management API; idempotent.)
alter table contact_submissions add column if not exists visitor_id text;
alter table contact_submissions add column if not exists session_id text;


-- SOURCE: migrations/20260715000000_marketing_attribution.sql
-- Durable first/last-touch attribution for every lead, cart, paid order, and
-- phone/CTA click. JSONB keeps vendor click IDs and future UTM fields together
-- without adding a new column for every ad platform.
alter table contact_submissions
  add column if not exists attribution jsonb not null default '{}'::jsonb;

alter table orders
  add column if not exists visitor_id text,
  add column if not exists session_id text,
  add column if not exists attribution jsonb not null default '{}'::jsonb;

alter table cart_sessions
  add column if not exists visitor_id text,
  add column if not exists session_id text,
  add column if not exists attribution jsonb not null default '{}'::jsonb;

alter table click_events
  add column if not exists event_type text not null default 'click',
  add column if not exists attribution jsonb not null default '{}'::jsonb;

create index if not exists contact_submissions_attribution_source_idx
  on contact_submissions ((attribution #>> '{lastTouch,source}'));

create index if not exists orders_attribution_source_idx
  on orders ((attribution #>> '{lastTouch,source}'));

create index if not exists click_events_event_type_created_at_idx
  on click_events (event_type, created_at desc);


-- SOURCE: migrations/20260715223000_lead_response_workflow.sql
-- Give every inquiry an explicit owner and follow-up state so leads cannot sit
-- in the admin as an unowned list.
alter table contact_submissions
  add column if not exists lead_status text not null default 'new',
  add column if not exists assigned_to text not null default 'JP',
  add column if not exists responded_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_submissions_lead_status_check'
  ) then
    alter table contact_submissions
      add constraint contact_submissions_lead_status_check
      check (lead_status in ('new', 'contacted', 'won', 'closed', 'spam'));
  end if;
end $$;

grant update on contact_submissions to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_submissions'
      and policyname = 'Admins can update contact submissions'
  ) then
    create policy "Admins can update contact submissions"
      on contact_submissions for update
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

create index if not exists contact_submissions_lead_queue_idx
  on contact_submissions (lead_status, created_at desc);


-- SOURCE: migrations/20260715233000_square_checkout.sql
alter table orders
  add column if not exists payment_provider text default 'paypal',
  add column if not exists payment_reference text;

update orders
set payment_provider = 'paypal'
where payment_provider is null;

create index if not exists idx_orders_payment_provider
  on orders (payment_provider, payment_status, created_at desc);


-- SOURCE: migrations/20260909000100_secure_cart_lifecycle.sql
-- Deploy together with the cart API. Anonymous browsers use per-cart bearer
-- secrets via the API; customer carts are never publicly selectable by email.
alter table public.cart_sessions
  add column if not exists access_token_hash text,
  add column if not exists last_activity_at timestamptz,
  add column if not exists checkout_started_at timestamptz,
  add column if not exists payment_issue_at timestamptz,
  add column if not exists recovered_at timestamptz,
  add column if not exists recovery_source_id uuid references public.cart_sessions(id),
  add column if not exists paid_order_id text,
  add column if not exists expires_at timestamptz,
  add column if not exists email_status text,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_provider_id text,
  add column if not exists is_test boolean not null default false;

revoke all on public.cart_sessions from anon;
revoke insert, update, delete on public.cart_sessions from authenticated;
revoke execute on function public.get_saved_cart(text) from public, anon, authenticated;
-- Retain authenticated admin SELECT policy. The service role owns mutations.
create index if not exists cart_sessions_activity_idx on public.cart_sessions(last_activity_at desc) where converted = false;
create index if not exists cart_sessions_paid_order_idx on public.cart_sessions(paid_order_id) where paid_order_id is not null;


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
create policy "Customers can read their own orders" on public.orders
for select to authenticated using (lower(customer_email) = lower(auth.jwt()->>'email'));
-- Uploaded artwork stays private; the server issues short-lived signed URLs.
insert into storage.buckets (id,name,public,file_size_limit)
values ('order-artwork','order-artwork',false,52428800)
on conflict (id) do nothing;
commit;
select tablename, rowsecurity from pg_tables where schemaname='public' order by tablename;
