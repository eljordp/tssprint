-- Admin live updates are authorized by each table's existing RLS policies.
do $$ begin
 if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='contact_submissions') then
  alter publication supabase_realtime add table public.contact_submissions;
 end if;
 if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='orders') then
  alter publication supabase_realtime add table public.orders;
 end if;
end $$;
