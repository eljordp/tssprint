-- Scope escalation is bound to the one-use server-side OAuth state.
-- Existing accounting-only connections continue to work until owner reconnect.
alter table public.quickbooks_oauth_states
  add column if not exists requested_scopes jsonb;
