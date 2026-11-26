-- V23 sandbox only; apply after V22. No direct client access to event secrets.
begin;
alter table public.amplop_guests add column check_code text not null default replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','') unique check(check_code ~ '^[a-f0-9]{64}$');
create table public.amplop_event_settings(wedding_id uuid primary key references public.amplop_weddings(id) on delete cascade,
 pin_hash text check(pin_hash ~ '^[a-f0-9]{32}:[a-f0-9]{64}$'), pin_key text check(pin_key ~ '^[a-f0-9]{64}$'), staff_hash text unique check(staff_hash ~ '^[a-f0-9]{64}$'), check((pin_hash is null)=(pin_key is null)));
create table public.amplop_pin_attempts(guest_id uuid primary key references public.amplop_guests(id) on delete cascade, window_start timestamptz not null, attempts integer not null check(attempts between 1 and 5));
create table public.amplop_checkins(guest_id uuid primary key references public.amplop_guests(id) on delete restrict, count integer not null check(count between 1 and 10), checked_at timestamptz not null default now(), method text not null check(method in ('qr','manual')), actor_type text not null check(actor_type in ('owner','staff')));
create table public.amplop_winners(guest_id uuid primary key references public.amplop_checkins(guest_id) on delete restrict, drawn_at timestamptz not null default now(), name_snapshot text not null);
alter table public.amplop_event_settings enable row level security;
alter table public.amplop_pin_attempts enable row level security;
alter table public.amplop_checkins enable row level security;
alter table public.amplop_winners enable row level security;
revoke all on public.amplop_event_settings,public.amplop_pin_attempts,public.amplop_checkins,public.amplop_winners from public,anon,authenticated,service_role;
-- The V22 update already locks guest; prevent lowering capacity below attendance.
create function public.amplop_checkin_seat_guard() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if exists(select 1 from public.amplop_checkins where guest_id=old.id and count>new.seats) then raise exception 'Seats below check-in'; end if;return new;end;$$;
create trigger amplop_checkin_seat_guard before update of seats on public.amplop_guests for each row execute function public.amplop_checkin_seat_guard();
-- Rotate the independent QR credential whenever the V22 personal link is rotated.
create function public.amplop_rotate_check_code() returns trigger language plpgsql security definer set search_path='' as $$ begin
 if old.token is distinct from new.token then new.check_code:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');end if;return new;end;$$;
create trigger amplop_rotate_check_code before update of token on public.amplop_guests for each row execute function public.amplop_rotate_check_code();
revoke all on function public.amplop_rotate_check_code() from public,anon,authenticated,service_role;
-- Owner config only; PIN can be set before first publication. Staff key only stored as digest.
create function public.amplop_event_config(p_actor uuid,p_wedding uuid,p_action text,p_hash text default null,p_key text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.amplop_event_settings;begin
 perform 1 from public.amplop_weddings where id=p_wedding and owner_id=p_actor for update;if not found then raise exception 'Workspace unavailable' using errcode='42501';end if;
 insert into public.amplop_event_settings(wedding_id) values(p_wedding) on conflict do nothing;
 if p_action='pin' then if p_hash is null or p_key is null then raise exception 'PIN required';end if;update public.amplop_event_settings set pin_hash=p_hash,pin_key=p_key where wedding_id=p_wedding;delete from public.amplop_pin_attempts a using public.amplop_guests g where a.guest_id=g.id and g.wedding_id=p_wedding;
 elsif p_action='public' then update public.amplop_event_settings set pin_hash=null,pin_key=null where wedding_id=p_wedding;
 elsif p_action='staff' then if p_hash is null then raise exception 'Staff key required';end if;update public.amplop_event_settings set staff_hash=p_hash where wedding_id=p_wedding;
 elsif p_action='revoke' then update public.amplop_event_settings set staff_hash=null where wedding_id=p_wedding;
 elsif p_action is distinct from 'settings' then raise exception 'Unknown action';end if;
 select * into strict s from public.amplop_event_settings where wedding_id=p_wedding;return jsonb_build_object('private',s.pin_hash is not null,'staff',s.staff_hash is not null);end;$$;
-- Internal gate lookup, only available to backend. No names or invitation content returned before PIN.
create function public.amplop_guest_gate(p_token text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('pin_hash',s.pin_hash,'pin_key',s.pin_key) from public.amplop_guests g join public.amplop_publications p on p.wedding_id=g.wedding_id join public.amplop_orders o on o.wedding_id=g.wedding_id and o.state='paid' left join public.amplop_event_settings s on s.wedding_id=g.wedding_id where g.token=p_token;$$;
-- Atomically reserve max 5 PIN attempts per guest in 15 min, before expensive verification.
create function public.amplop_reserve_pin(p_token text,p_key text) returns boolean language plpgsql security definer set search_path='' as $$
declare gid uuid;wid uuid;n integer;begin
 select wedding_id into wid from public.amplop_guests where token=p_token;perform 1 from public.amplop_weddings where id=wid for update;
 select g.id into gid from public.amplop_guests g join public.amplop_event_settings s on s.wedding_id=g.wedding_id and s.pin_key=p_key join public.amplop_orders o on o.wedding_id=g.wedding_id and o.state='paid' join public.amplop_publications p on p.wedding_id=g.wedding_id where g.token=p_token;
 if gid is null then return false;end if;
 insert into public.amplop_pin_attempts(guest_id,window_start,attempts) values(gid,now(),1) on conflict(guest_id) do update set window_start=case when amplop_pin_attempts.window_start<=now()-interval '15 minutes' then now() else amplop_pin_attempts.window_start end,attempts=case when amplop_pin_attempts.window_start<=now()-interval '15 minutes' then 1 else amplop_pin_attempts.attempts+1 end where amplop_pin_attempts.window_start<=now()-interval '15 minutes' or amplop_pin_attempts.attempts<5 returning attempts into n;return n is not null;end;$$;
-- Same-statement authorization: generic slug is unavailable while private; guest read requires current key.
create function public.amplop_read_publication_v23(p_slug text) returns jsonb language sql stable security definer set search_path='' as $$
 select public.amplop_read_publication(p_slug) from public.amplop_publications p left join public.amplop_event_settings s on s.wedding_id=p.wedding_id where p.slug=p_slug and s.pin_hash is null;$$;
create function public.amplop_read_guest_v23(p_token text,p_key text) returns jsonb language sql stable security definer set search_path='' as $$
 select public.amplop_read_guest(p_token)||jsonb_build_object('check_code',g.check_code) from public.amplop_guests g left join public.amplop_event_settings s on s.wedding_id=g.wedding_id where g.token=p_token and (s.pin_hash is null or s.pin_key=p_key);$$;
create function public.amplop_submit_rsvp_v23(p_token text,p_key text,p_attendance text,p_count integer,p_message text) returns void language plpgsql security definer set search_path='' as $$
declare wid uuid;begin select wedding_id into wid from public.amplop_guests where token=p_token;perform 1 from public.amplop_weddings where id=wid for update;
 if public.amplop_read_guest_v23(p_token,p_key) is null then raise exception 'Invitation unavailable';end if;perform public.amplop_submit_rsvp(p_token,p_attendance,p_count,p_message);end;$$;
-- Single locked transaction for check-in and draw; owner OR scoped staff, no token/Rsvp messages returned.
create function public.amplop_event_action(p_actor uuid,p_wedding uuid,p_staff text,p_action text,p_id uuid default null,p_code text default null,p_count integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare wid uuid;g public.amplop_guests;who text;winner uuid;rows jsonb;wins jsonb;begin
 if p_actor is not null and p_staff is null then wid:=p_wedding;who:='owner';perform 1 from public.amplop_weddings where id=wid and owner_id=p_actor for update;
 elsif p_actor is null and p_staff is not null then who:='staff';select wedding_id into wid from public.amplop_event_settings where staff_hash=p_staff;perform 1 from public.amplop_weddings where id=wid for update;
 else raise exception 'Unauthorized' using errcode='42501';end if;
 if not found or (who='staff' and not exists(select 1 from public.amplop_event_settings where wedding_id=wid and staff_hash=p_staff)) then raise exception 'Unauthorized' using errcode='42501';end if;
 perform 1 from public.amplop_orders where wedding_id=wid and state='paid' for update;
 if not found or not exists(select 1 from public.amplop_publications where wedding_id=wid) then raise exception 'Paid publication required';end if;
 if p_action in ('scan','manual') then
  select * into g from public.amplop_guests where wedding_id=wid and ((p_action='scan' and check_code=p_code) or (p_action='manual' and id=p_id)) for update;
  if not found or p_count is null or p_count<1 or p_count>g.seats then raise exception 'Invalid guest or attendance count';end if;
  insert into public.amplop_checkins(guest_id,count,method,actor_type) values(g.id,p_count,case when p_action='scan' then 'qr' else 'manual' end,who) on conflict(guest_id) do nothing;
  if not found then raise exception 'Already checked in';end if;
 elsif p_action='draw' then
  if who<>'owner' then raise exception 'Owner required' using errcode='42501';end if;
  select x.id into winner from public.amplop_guests x join public.amplop_checkins c on c.guest_id=x.id left join public.amplop_winners v on v.guest_id=x.id where x.wedding_id=wid and v.guest_id is null order by gen_random_uuid() limit 1;
  if winner is null then raise exception 'No eligible guest';end if;
  insert into public.amplop_winners(guest_id,name_snapshot) select id,name from public.amplop_guests where id=winner;
 elsif p_action is distinct from 'list' then raise exception 'Unknown action';end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'seats',x.seats,'checked',c.count,'checked_at',c.checked_at) order by x.created_at,x.id),'[]'::jsonb) into rows from public.amplop_guests x left join public.amplop_checkins c on c.guest_id=x.id where x.wedding_id=wid;
 select coalesce(jsonb_agg(jsonb_build_object('id',v.guest_id,'name',v.name_snapshot,'drawn_at',v.drawn_at) order by v.drawn_at,v.guest_id),'[]'::jsonb) into wins from public.amplop_winners v join public.amplop_guests x on x.id=v.guest_id where x.wedding_id=wid and who='owner';
 return jsonb_build_object('rows',rows,'winners',wins,'winner_id',winner);end;$$;
revoke all on function public.amplop_checkin_seat_guard(),public.amplop_event_config(uuid,uuid,text,text,text),public.amplop_guest_gate(text),public.amplop_reserve_pin(text,text),public.amplop_read_publication_v23(text),public.amplop_read_guest_v23(text,text),public.amplop_submit_rsvp_v23(text,text,text,integer,text),public.amplop_event_action(uuid,uuid,text,text,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.amplop_event_config(uuid,uuid,text,text,text),public.amplop_guest_gate(text),public.amplop_reserve_pin(text,text),public.amplop_read_publication_v23(text),public.amplop_read_guest_v23(text,text),public.amplop_submit_rsvp_v23(text,text,text,integer,text),public.amplop_event_action(uuid,uuid,text,text,uuid,text,integer) to service_role;
commit;
