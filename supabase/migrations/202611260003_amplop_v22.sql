-- V22 staging only. All guest tables and RPCs restricted to server service role.
begin;
create table public.amplop_guests (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references public.amplop_weddings(id) on delete cascade,
 token text not null unique check(token ~ '^[a-f0-9]{64}$'), name text not null check(char_length(btrim(name)) between 1 and 100 and name !~ '[[:cntrl:]]'),
 seats integer not null check(seats between 1 and 10), created_at timestamptz not null default now()
);
create index amplop_guest_workspace_idx on public.amplop_guests(wedding_id);
create table public.amplop_rsvps (
 guest_id uuid primary key references public.amplop_guests(id) on delete cascade,
 attendance text not null check(attendance in ('yes','no')), count integer not null check((attendance='yes' and count between 1 and 10) or (attendance='no' and count=0)),
 message text not null default '' check(char_length(message)<=500 and message !~ '[[:cntrl:]]'), updated_at timestamptz not null default now()
);
alter table public.amplop_guests enable row level security;
alter table public.amplop_rsvps enable row level security;
revoke all on public.amplop_guests,public.amplop_rsvps from public,anon,authenticated,service_role;
-- Owner identity verified by API and again here. Lock workspace to serialize imports/capacity.
create function public.amplop_manage_guests(p_actor uuid,p_wedding uuid,p_action text,p_rows jsonb,p_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare target public.amplop_guests; item jsonb; n integer;
begin
 perform 1 from public.amplop_weddings where id=p_wedding and owner_id=p_actor for update;
 if not found then raise exception 'Workspace unavailable' using errcode='42501'; end if;
 if p_action='add' then
  if jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'Invalid rows'; end if;
  n:=jsonb_array_length(p_rows);
  if n<1 or n>500 or (select count(*) from public.amplop_guests where wedding_id=p_wedding)+n>500 then raise exception 'Guest limit'; end if;
  for item in select value from jsonb_array_elements(p_rows) loop
   insert into public.amplop_guests(wedding_id,token,name,seats) values(p_wedding,replace(gen_random_uuid()::text||gen_random_uuid()::text,'-',''),btrim(item->>'name'),(item->>'seats')::integer);
  end loop;
 elsif p_action in ('edit','delete','rotate') then
  select * into target from public.amplop_guests where wedding_id=p_wedding and id=p_id for update;
  if not found then raise exception 'Guest unavailable'; end if;
  if p_action='delete' then delete from public.amplop_guests where id=target.id;
  elsif p_action='rotate' then update public.amplop_guests set token=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','') where id=target.id;
  else
   if exists(select 1 from public.amplop_rsvps where guest_id=target.id and count>(p_rows->>'seats')::integer) then raise exception 'Seats below RSVP'; end if;
   update public.amplop_guests set name=btrim(p_rows->>'name'),seats=(p_rows->>'seats')::integer where id=target.id;
  end if;
 elsif p_action is distinct from 'list' then raise exception 'Unknown action'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',g.id,'token',g.token,'name',g.name,'seats',g.seats,'attendance',r.attendance,'count',r.count,'message',r.message) order by g.created_at,g.id) from public.amplop_guests g left join public.amplop_rsvps r on r.guest_id=g.id where g.wedding_id=p_wedding),'[]'::jsonb);
end; $$;
-- Guest bearer token authorizes only this guest and paid active publication. No other guest list exposed.
create function public.amplop_read_guest(p_token text) returns jsonb
language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',g.id,'name',g.name,'seats',g.seats,'slug',p.slug,'content',v.content,'attendance',r.attendance,'count',r.count,'message',r.message)
 from public.amplop_guests g join public.amplop_publications p on p.wedding_id=g.wedding_id join public.amplop_orders o on o.wedding_id=g.wedding_id and o.state='paid' join public.amplop_publication_versions v on v.wedding_id=p.wedding_id and v.revision=p.active_revision left join public.amplop_rsvps r on r.guest_id=g.id where g.token=p_token;
$$;
-- Lock order then guest; recheck token after lock. Upsert one RSVP per guest. No trusting browser seat capacity.
create function public.amplop_submit_rsvp(p_token text,p_attendance text,p_count integer,p_message text) returns void
language plpgsql security definer set search_path='' as $$
declare g public.amplop_guests; wid uuid;
begin
 select wedding_id into wid from public.amplop_guests where token=p_token;
 perform 1 from public.amplop_orders where wedding_id=wid and state='paid' for update;
 if not found or not exists(select 1 from public.amplop_publications where wedding_id=wid) then raise exception 'Invitation unavailable'; end if;
 select * into g from public.amplop_guests where token=p_token and wedding_id=wid for update;
 if not found or p_count is null or p_count>g.seats then raise exception 'RSVP unavailable'; end if;
 insert into public.amplop_rsvps(guest_id,attendance,count,message) values(g.id,p_attendance,p_count,p_message)
 on conflict(guest_id) do update set attendance=excluded.attendance,count=excluded.count,message=excluded.message,updated_at=now();
end; $$;
revoke all on function public.amplop_manage_guests(uuid,uuid,text,jsonb,uuid),public.amplop_read_guest(text),public.amplop_submit_rsvp(text,text,integer,text) from public,anon,authenticated;
grant execute on function public.amplop_manage_guests(uuid,uuid,text,jsonb,uuid),public.amplop_read_guest(text),public.amplop_submit_rsvp(text,text,integer,text) to service_role;
commit;
