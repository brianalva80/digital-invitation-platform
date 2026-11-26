-- V20: apply ONLY to an isolated Supabase staging project after review.
-- One owner workspace/account in V20. No billing, guests, or publication.
begin;
create table public.amplop_weddings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.amplop_drafts (
  wedding_id uuid primary key references public.amplop_weddings(id) on delete cascade,
  revision integer not null check (revision > 0),
  content jsonb not null,
  updated_at timestamptz not null default now(),
  constraint draft_object check (jsonb_typeof(content) = 'object'),
  constraint draft_size check (octet_length(content::text) <= 4200000),
  constraint draft_shape check (coalesce(
    content->>'slug' in ('secret-letter','cinematic-romance','wedding-editorial','enchanted-garden','our-story')
    and jsonb_typeof(content->'data') = 'object'
    and content->'data'->>'schemaVersion' = '1'
    and content->'data'->>'timezone' = 'Asia/Jakarta'
    and jsonb_typeof(content->'settings') = 'object'
    and jsonb_typeof(content->'uploads') = 'object'
    and jsonb_typeof(content->'experience') = 'object', false))
);
alter table public.amplop_weddings enable row level security;
alter table public.amplop_drafts enable row level security;
revoke all on public.amplop_weddings, public.amplop_drafts from public, anon, authenticated;
grant select on public.amplop_weddings, public.amplop_drafts to authenticated;
create policy amplop_owner_read on public.amplop_weddings for select to authenticated using (owner_id = (select auth.uid()));
create policy amplop_draft_owner_read on public.amplop_drafts for select to authenticated using (
 exists (select 1 from public.amplop_weddings w where w.id = wedding_id and w.owner_id = (select auth.uid()))
);
-- Definer RPCs have fixed search_path, explicit actor checks and no caller-supplied owner.
create function public.amplop_create_workspace() returns uuid
language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); wid uuid;
begin
 if actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
 insert into public.amplop_weddings(owner_id) values (actor) on conflict (owner_id) do nothing;
 select id into strict wid from public.amplop_weddings where owner_id = actor;
 return wid;
end; $$;
create function public.amplop_save_draft(p_wedding uuid, p_expected integer, p_content jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); next_rev integer;
begin
 if actor is null or not exists(select 1 from public.amplop_weddings where id = p_wedding and owner_id = actor) then
   raise exception 'Workspace unavailable' using errcode = '42501';
 end if;
 if p_expected is null or p_expected < 0 or p_content is null then raise exception 'Invalid draft request' using errcode = '22023'; end if;
 if p_expected = 0 then
   insert into public.amplop_drafts(wedding_id, revision, content) values (p_wedding, 1, p_content)
   on conflict (wedding_id) do nothing returning revision into next_rev;
 else
   update public.amplop_drafts set content = p_content, revision = revision + 1, updated_at = now()
   where wedding_id = p_wedding and revision = p_expected returning revision into next_rev;
 end if;
 if next_rev is null then raise exception 'Draft revision conflict' using errcode = '40001'; end if;
 return next_rev;
end; $$;
revoke all on function public.amplop_create_workspace() from public, anon, authenticated;
revoke all on function public.amplop_save_draft(uuid,integer,jsonb) from public, anon, authenticated;
grant execute on function public.amplop_create_workspace() to authenticated;
grant execute on function public.amplop_save_draft(uuid,integer,jsonb) to authenticated;
commit;
