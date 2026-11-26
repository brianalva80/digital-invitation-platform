-- Run as postgres in disposable Supabase, after V20–V23. Roll back all fixtures.
begin;
insert into auth.users(id,email) values ('a2300000-0000-4000-8000-000000000001','v23-a@example.invalid'),('b2300000-0000-4000-8000-000000000002','v23-b@example.invalid');
insert into public.amplop_weddings(id,owner_id) values ('a2300000-0000-4000-8000-000000000003','a2300000-0000-4000-8000-000000000001'),('b2300000-0000-4000-8000-000000000004','b2300000-0000-4000-8000-000000000002');
insert into public.amplop_drafts(wedding_id,revision,content) values ('a2300000-0000-4000-8000-000000000003',1,'{"slug":"secret-letter","data":{"schemaVersion":1,"timezone":"Asia/Jakarta"},"settings":{},"uploads":{},"experience":{}}');
set local role anon;
do $$ begin
 begin perform public.amplop_guest_gate(repeat('a',64));raise exception 'Anonymous gate allowed';exception when insufficient_privilege then null;end;
 begin perform public.amplop_event_action(null,null,null,'list');raise exception 'Anonymous event allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
do $$ begin
 begin perform 1 from public.amplop_event_settings;raise exception 'Direct settings read allowed';exception when insufficient_privilege then null;end;
 begin perform public.amplop_event_config(null,null,'settings');raise exception 'Direct config allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
-- postgres fixture introspection; functions called using exact server contracts.
do $$ declare a uuid:='a2300000-0000-4000-8000-000000000001';b uuid:='b2300000-0000-4000-8000-000000000002';w uuid:='a2300000-0000-4000-8000-000000000003';w2 uuid:='b2300000-0000-4000-8000-000000000004';rows jsonb;t text;q text;gid uuid;gid2 uuid;oid uuid;c jsonb;outcome jsonb;rejected boolean;k text:=repeat('c',64);staff text:=repeat('d',64);n integer; begin
 rows:=public.amplop_manage_guests(a,w,'add','[{"name":"Guest A","seats":2},{"name":"Guest B","seats":1}]');select (value->>'id')::uuid,value->>'token' into gid,t from jsonb_array_elements(rows) where value->>'name'='Guest A';select (value->>'id')::uuid into gid2 from jsonb_array_elements(rows) where value->>'name'='Guest B';select check_code into q from public.amplop_guests where id=gid;
 if q=t or length(q)<>64 then raise exception 'QR credential not separate';end if;
 begin perform public.amplop_event_config(b,w,'settings');raise exception 'Cross owner config allowed';exception when insufficient_privilege then null;end;
 perform public.amplop_event_config(a,w,'pin',repeat('a',32)||':'||repeat('b',64),k);
 perform public.amplop_event_config(a,w,'staff',staff);
 rejected:=false;begin perform public.amplop_event_action(null,null,staff,'list');exception when others then rejected:=true;end;if not rejected then raise exception 'Unpaid desk accessible';end if;
 oid:=(public.amplop_claim_checkout(a,w,10000)->'order'->>'id')::uuid;perform public.amplop_apply_payment(oid,10000,'paid');select content into c from public.amplop_drafts where wedding_id=w;perform public.amplop_publish(a,w,1,'v23-fixture',c);
 if public.amplop_read_publication_v23('v23-fixture') is not null or public.amplop_read_guest_v23(t,null) is not null or public.amplop_read_guest_v23(t,repeat('f',64)) is not null then raise exception 'PIN bypass';end if;
 if public.amplop_read_guest_v23(t,k)->>'check_code' is distinct from q then raise exception 'Authorized read failed';end if;
 rejected:=false;begin perform public.amplop_submit_rsvp_v23(t,null,'yes',1,'');exception when others then rejected:=true;end;if not rejected then raise exception 'PIN RSVP bypass';end if;
 for n in 1..5 loop if not public.amplop_reserve_pin(t,k) then raise exception 'Attempt rejected early';end if;end loop;if public.amplop_reserve_pin(t,k) then raise exception 'Sixth attempt accepted';end if;
 perform public.amplop_event_config(a,w,'pin',repeat('a',32)||':'||repeat('b',64),repeat('e',64));if public.amplop_read_guest_v23(t,k) is not null then raise exception 'Old PIN key accepted';end if;
 outcome:=public.amplop_event_action(null,null,staff,'list');if outcome::text like '%check_code%' or outcome::text like '%token%' or outcome::text like '%message%' then raise exception 'Staff sensitive data leaked';end if;
 rejected:=false;begin perform public.amplop_event_action(null,null,staff,'scan',null,q,3);exception when others then rejected:=true;end;if not rejected then raise exception 'Excess seats allowed';end if;
 perform public.amplop_event_action(null,null,staff,'scan',null,q,2);
 rejected:=false;begin perform public.amplop_event_action(a,w,null,'manual',gid,null,1);exception when others then rejected:=true;end;if not rejected then raise exception 'Duplicate accepted';end if;
 rejected:=false;begin perform public.amplop_manage_guests(a,w,'edit','{"name":"Guest A","seats":1}',gid);exception when others then rejected:=true;end;if not rejected then raise exception 'Capacity below check-in';end if;
 begin perform public.amplop_event_action(null,null,staff,'draw');raise exception 'Staff draw allowed';exception when insufficient_privilege then null;end;
 outcome:=public.amplop_event_action(a,w,null,'draw');if outcome->>'winner_id' is distinct from gid::text then raise exception 'Wrong winner';end if;
 rejected:=false;begin perform public.amplop_event_action(a,w,null,'draw');exception when others then rejected:=true;end;if not rejected then raise exception 'Duplicate winner allowed';end if;
 perform public.amplop_event_action(a,w,null,'manual',gid2,null,1);outcome:=public.amplop_event_action(a,w,null,'draw');if outcome->>'winner_id' is distinct from gid2::text then raise exception 'Second winner incorrect';end if;
 perform public.amplop_manage_guests(a,w,'rotate',null,gid);if (select check_code from public.amplop_guests where id=gid)=q then raise exception 'Old QR not rotated';end if;
 perform public.amplop_event_config(a,w,'revoke');begin perform public.amplop_event_action(null,null,staff,'list');raise exception 'Revoked staff allowed';exception when insufficient_privilege then null;end;
 perform public.amplop_event_config(a,w,'public');if public.amplop_read_publication_v23('v23-fixture') is null then raise exception 'Public mode not restored';end if;
end $$;
rollback;
