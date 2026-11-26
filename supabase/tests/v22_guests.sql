-- Run as postgres in disposable Supabase after V20–V22; all fixtures rolled back.
begin;
insert into auth.users(id,email) values ('a2200000-0000-4000-8000-000000000001','v22-a@example.invalid'),('b2200000-0000-4000-8000-000000000002','v22-b@example.invalid');
insert into public.amplop_weddings(id,owner_id) values ('a2200000-0000-4000-8000-000000000003','a2200000-0000-4000-8000-000000000001'),('b2200000-0000-4000-8000-000000000004','b2200000-0000-4000-8000-000000000002');
insert into public.amplop_drafts(wedding_id,revision,content) values ('a2200000-0000-4000-8000-000000000003',1,'{"slug":"secret-letter","data":{"schemaVersion":1,"timezone":"Asia/Jakarta"},"settings":{},"uploads":{},"experience":{}}');
set local role anon;
do $$ begin
 begin perform public.amplop_read_guest(repeat('a',64));raise exception 'Anonymous access allowed';exception when insufficient_privilege then null;end;
 begin perform public.amplop_submit_rsvp(repeat('a',64),'yes',1,'');raise exception 'Anonymous submit allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
do $$ begin
 begin perform 1 from public.amplop_guests;raise exception 'Direct read allowed';exception when insufficient_privilege then null;end;
 begin perform public.amplop_manage_guests(null,null,'list',null);raise exception 'Direct RPC allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role service_role;
do $$ declare a uuid:='a2200000-0000-4000-8000-000000000001';b uuid:='b2200000-0000-4000-8000-000000000002';w uuid:='a2200000-0000-4000-8000-000000000003';rows jsonb;token text;replacement text;gid uuid;oid uuid;c jsonb; rejected boolean; begin
 begin perform public.amplop_manage_guests(b,w,'list',null);raise exception 'Cross owner list allowed';exception when insufficient_privilege then null;end;
 rows:=public.amplop_manage_guests(a,w,'add','[{"name":"Guest A","seats":2},{"name":"Guest B","seats":1}]');select (value->>'id')::uuid,value->>'token' into gid,token from jsonb_array_elements(rows) where value->>'name'='Guest A';
 if jsonb_array_length(rows)<>2 or length(token)<>64 then raise exception 'Guest creation failed';end if;
 if public.amplop_read_guest(token) is not null then raise exception 'Unpublished read allowed';end if;
 rejected:=false;begin perform public.amplop_submit_rsvp(token,'yes',1,'');exception when others then rejected:=true;end;if not rejected then raise exception 'Unpublished RSVP allowed';end if;
 oid:=(public.amplop_claim_checkout(a,w,10000)->'order'->>'id')::uuid;perform public.amplop_apply_payment(oid,10000,'paid');select content into c from public.amplop_drafts where wedding_id=w;perform public.amplop_publish(a,w,1,'v22-fixture',c);
 if public.amplop_read_guest(token)->>'id' is distinct from gid::text then raise exception 'Guest mismatch';end if;
 rejected:=false;begin perform public.amplop_submit_rsvp(token,'yes',3,'');exception when others then rejected:=true;end;if not rejected then raise exception 'Excess capacity accepted';end if;
 perform public.amplop_submit_rsvp(token,'yes',2,'first');perform public.amplop_submit_rsvp(token,'no',0,'updated');
 if public.amplop_read_guest(token)->>'message' is distinct from 'updated' then raise exception 'RSVP upsert failed';end if;
 rows:=public.amplop_manage_guests(a,w,'rotate',null,gid);select value->>'token' into replacement from jsonb_array_elements(rows) where value->>'id'=gid::text;
 if replacement is null or replacement=token or public.amplop_read_guest(token) is not null or public.amplop_read_guest(replacement) is null then raise exception 'Rotation failed';end if;
 perform public.amplop_apply_payment(oid,10000,'blocked');if public.amplop_read_guest(replacement) is not null then raise exception 'Blocked payment guest link accessible';end if;
 rows:=public.amplop_manage_guests(a,w,'delete',null,gid);if jsonb_array_length(rows)<>1 then raise exception 'Delete failed';end if;
end $$;
reset role;
set constraints all immediate;
rollback;
