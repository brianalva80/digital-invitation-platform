-- V25 hardening; review and execute only in isolated staging after 001–005.
-- Retire pre-PIN RPCs even for the server role, prevent accidental bypass by new routes.
begin;
revoke all on function public.amplop_read_publication(text),public.amplop_read_guest(text),public.amplop_submit_rsvp(text,text,integer,text) from public,anon,authenticated,service_role;
-- Explicit least privilege for server reads; avoid relying on project default grants.
revoke all on public.amplop_weddings,public.amplop_drafts from service_role;
grant select on public.amplop_weddings,public.amplop_drafts to service_role;
revoke all on function public.amplop_checkin_seat_guard() from public,anon,authenticated,service_role;
commit;
