-- Run after 006, as postgres, on disposable staging. No mutation.
begin;
do $$
declare role_name text; sig text;
begin
 foreach role_name in array array['anon','authenticated','service_role'] loop
  foreach sig in array array['public.amplop_read_publication(text)','public.amplop_read_guest(text)','public.amplop_submit_rsvp(text,text,integer,text)','public.amplop_checkin_seat_guard()'] loop
   if has_function_privilege(role_name,sig,'EXECUTE') then raise exception 'Unexpected execute: % %',role_name,sig; end if;
  end loop;
 end loop;
 foreach sig in array array['public.amplop_read_publication_v23(text)','public.amplop_read_guest_v23(text,text)','public.amplop_submit_rsvp_v23(text,text,text,integer,text)'] loop
  if not has_function_privilege('service_role',sig,'EXECUTE') or has_function_privilege('authenticated',sig,'EXECUTE') or has_function_privilege('anon',sig,'EXECUTE') then raise exception 'Incorrect new RPC grants: %',sig; end if;
 end loop;
 if not has_table_privilege('service_role','public.amplop_drafts','SELECT') or has_table_privilege('service_role','public.amplop_drafts','INSERT,UPDATE,DELETE') then raise exception 'Unexpected draft grants';end if;
 if not has_table_privilege('authenticated','public.amplop_drafts','SELECT') then raise exception 'Owner read missing';end if;
end $$;
rollback;
