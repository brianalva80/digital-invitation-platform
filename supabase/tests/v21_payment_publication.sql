-- Run as postgres in disposable staging with ON_ERROR_STOP=1 after V20 + V21. Rolls back all fixtures.
begin;
insert into auth.users(id,email) values ('a2100000-0000-4000-8000-000000000001','v21-fixture-a@example.invalid'),('b2100000-0000-4000-8000-000000000002','v21-fixture-b@example.invalid');
insert into public.amplop_weddings(id,owner_id) values ('a2100000-0000-4000-8000-000000000003','a2100000-0000-4000-8000-000000000001'),('b2100000-0000-4000-8000-000000000004','b2100000-0000-4000-8000-000000000002');
insert into public.amplop_drafts(wedding_id,revision,content) select id,1,'{"slug":"secret-letter","data":{"schemaVersion":1,"timezone":"Asia/Jakarta"},"settings":{},"uploads":{},"experience":{}}'::jsonb from public.amplop_weddings where id in ('a2100000-0000-4000-8000-000000000003','b2100000-0000-4000-8000-000000000004');
set local role authenticated;
do $$ begin
 begin perform public.amplop_claim_checkout('a2100000-0000-4000-8000-000000000001','a2100000-0000-4000-8000-000000000003',10000);raise exception 'authenticated payment RPC allowed';exception when insufficient_privilege then null;end;
 begin perform 1 from public.amplop_orders;raise exception 'authenticated order read allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.amplop_read_publication('v21-fixture');raise exception 'anonymous RPC allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role service_role;
do $$ declare actor uuid:='a2100000-0000-4000-8000-000000000001';other uuid:='b2100000-0000-4000-8000-000000000002';w uuid:='a2100000-0000-4000-8000-000000000003';claim jsonb;again jsonb;oid uuid;c jsonb; begin
 select content into strict c from public.amplop_drafts where wedding_id=w;
 begin perform public.amplop_claim_checkout(other,w,10000);raise exception 'cross-owner checkout accepted';exception when insufficient_privilege then null;end;
 claim:=public.amplop_claim_checkout(actor,w,10000);oid:=(claim->'order'->>'id')::uuid;
 again:=public.amplop_claim_checkout(actor,w,20000);if claim->>'claimed'<>'true' or again->>'claimed'<>'false' or again->'order'->>'id'<>oid::text or (again->'order'->>'amount')::int<>10000 then raise exception 'duplicate claim or price mutation';end if;
 begin perform public.amplop_publish(actor,w,1,'v21-fixture',c);raise exception 'unpaid publication accepted';exception when insufficient_privilege then null;end;
 if public.amplop_read_publication('v21-fixture') is not null then raise exception 'unpublished content leaked';end if;
 if public.amplop_apply_payment(oid,10000,'pending')<>'creating' then raise exception 'pending unlocked';end if;
 if public.amplop_apply_payment(oid,10000,'paid')<>'paid' then raise exception 'settlement not applied';end if;
 if public.amplop_apply_payment(oid,10000,'paid')<>'paid' then raise exception 'replay not idempotent';end if;
 if public.amplop_apply_payment(oid,10000,'pending')<>'paid' then raise exception 'stale pending downgraded';end if;
 begin perform public.amplop_publish(other,w,1,'v21-fixture',c);raise exception 'cross-owner publication accepted';exception when insufficient_privilege then null;end;
 begin perform public.amplop_publish(actor,w,2,'v21-fixture',c);raise exception 'stale revision accepted';exception when serialization_failure then null;end;
 begin perform public.amplop_publish(actor,w,1,'v21-fixture','{}');raise exception 'mismatched JSON accepted';exception when serialization_failure then null;end;
 if public.amplop_publish(actor,w,1,'v21-fixture',c)<>1 then raise exception 'publish failed';end if;
 if public.amplop_read_publication('v21-fixture') is distinct from c then raise exception 'snapshot mismatch';end if;
 if public.amplop_publish(actor,w,1,'v21-fixture',c)<>1 then raise exception 'replay failed';end if;
 begin perform public.amplop_publish(actor,w,1,'different-slug',c);raise exception 'slug change accepted';exception when invalid_parameter_value then null;end;
end $$;
reset role;
-- Simulate actual owner's V20 CAS update; draft must not silently become public.
update public.amplop_drafts set revision=2,content=jsonb_set(content,'{slug}','"our-story"') where wedding_id='a2100000-0000-4000-8000-000000000003';
set local role service_role;
do $$ declare actor uuid:='a2100000-0000-4000-8000-000000000001';w uuid:='a2100000-0000-4000-8000-000000000003';oid uuid;c jsonb; begin
 select id into strict oid from public.amplop_orders where wedding_id=w;
 select content into strict c from public.amplop_drafts where wedding_id=w;
 if public.amplop_read_publication('v21-fixture')->>'slug'<>'secret-letter' then raise exception 'draft autoswitched';end if;
 perform public.amplop_publish(actor,w,2,'v21-fixture',c);
 if public.amplop_read_publication('v21-fixture') is distinct from c then raise exception 'republish failed';end if;
 if (select count(*) from public.amplop_publication_versions where wedding_id=w)<>2 then raise exception 'version history lost';end if;
 perform public.amplop_apply_payment(oid,10000,'blocked');
 if public.amplop_read_publication('v21-fixture') is not null then raise exception 'blocked publication remains accessible';end if;
 if public.amplop_apply_payment(oid,10000,'paid')<>'blocked' then raise exception 'stale paid reactivated blocked order';end if;
end $$;
reset role;
set constraints all immediate;
rollback;
