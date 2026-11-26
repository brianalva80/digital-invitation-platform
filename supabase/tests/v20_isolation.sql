-- Run as postgres ONLY in a disposable local/staging Supabase database after applying V20.
-- psql -v ON_ERROR_STOP=1 -f supabase/tests/v20_isolation.sql
-- All fixtures rolled back. Do not run on production.
begin;
insert into auth.users(id,email) values
 ('a1000000-0000-4000-8000-000000000001','v20-fixture-a@example.invalid'),
 ('b1000000-0000-4000-8000-000000000002','v20-fixture-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','a1000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"a1000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ declare w uuid; rev int; c jsonb := '{"slug":"secret-letter","data":{"schemaVersion":1,"timezone":"Asia/Jakarta"},"settings":{},"uploads":{},"experience":{}}'; begin
 w:=public.amplop_create_workspace();
 if w<>public.amplop_create_workspace() then raise exception 'duplicate workspace'; end if;
 rev:=public.amplop_save_draft(w,0,c);if rev<>1 then raise exception 'expected revision 1';end if;
 rev:=public.amplop_save_draft(w,1,c);if rev<>2 then raise exception 'expected revision 2';end if;
 begin perform public.amplop_save_draft(w,1,c);raise exception 'stale update accepted';exception when serialization_failure then null;end;
 begin update public.amplop_drafts set revision=3 where wedding_id=w;raise exception 'direct update accepted';exception when insufficient_privilege then null;end;
 begin perform public.amplop_save_draft(w,2,'{"slug":"invalid"}');raise exception 'invalid shape accepted';exception when check_violation then null;end;
 perform set_config('amplop.test.wedding_a',w::text,true);
end $$;
select set_config('request.jwt.claim.sub','b1000000-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"b1000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$ declare w uuid:=current_setting('amplop.test.wedding_a')::uuid; b uuid; begin
 b:=public.amplop_create_workspace();if b=w then raise exception 'tenant reused';end if;
 if exists(select 1 from public.amplop_weddings where id=w) then raise exception 'wedding leaked';end if;
 if exists(select 1 from public.amplop_drafts where wedding_id=w) then raise exception 'draft leaked';end if;
 begin perform public.amplop_save_draft(w,2,'{}');raise exception 'cross-tenant write accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.amplop_create_workspace();raise exception 'anonymous create accepted';exception when insufficient_privilege then null;end;
 begin perform 1 from public.amplop_drafts;raise exception 'anonymous read accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
