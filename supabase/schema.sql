-- Kept Phases 2 and 3. Run in Supabase: SQL Editor > New query > paste > Run.

-- Every contact, company, deal, task, note and your settings is one row here.
-- Rows belong to one user, and row-level security lets you touch only your own.
create table records (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  kind text not null check (kind in ('company', 'contact', 'deal', 'task', 'activity', 'settings')),
  id text not null,
  data jsonb,
  deleted boolean not null default false,
  updated_at bigint not null,
  primary key (user_id, kind, id)
);
alter table records enable row level security;
create policy "own records" on records for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Your public lead-capture form. The token is the secret part of its link.
create table lead_forms (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  token text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
  enabled boolean not null default true
);
alter table lead_forms enable row level security;
create policy "own lead form" on lead_forms for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Visitors are not logged in, so they cannot write to your tables. They call this function instead.
-- It checks the token, then files the lead in your contacts, with a note of what they wrote.
create function capture_lead(p_token text, p_name text, p_email text, p_message text) returns void
language plpgsql security definer set search_path = public as $$
declare
  f lead_forms;
  cid text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
  aid text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
  ms bigint := (extract(epoch from now()) * 1000)::bigint;
  msg text := coalesce(trim(p_message), '');
begin
  select * into f from lead_forms where token = p_token and enabled;
  if not found then raise exception 'This form is not available.'; end if;
  if char_length(trim(coalesce(p_name, ''))) not between 1 and 80 or char_length(coalesce(p_email, '')) > 120 or char_length(msg) > 1000 then
    raise exception 'Please check what you entered.';
  end if;
  insert into records (user_id, kind, id, data, updated_at) values (f.user_id, 'contact', cid, jsonb_build_object(
    'id', cid, 'name', trim(p_name), 'email', coalesce(trim(p_email), ''), 'phone', '', 'role', '', 'companyId', null,
    'tags', jsonb_build_array('lead', 'web form'), 'notes', '', 'createdAt', ms, 'updatedAt', ms), ms);
  insert into records (user_id, kind, id, data, updated_at) values (f.user_id, 'activity', aid, jsonb_build_object(
    'id', aid, 'type', 'note', 'text', 'Came in through your web form.' || case when msg <> '' then ' They wrote: ' || msg else '' end,
    'contactId', cid, 'dealId', null, 'at', ms, 'createdAt', ms, 'updatedAt', ms), ms);
end $$;
grant execute on function capture_lead(text, text, text, text) to anon, authenticated;
