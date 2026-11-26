-- postgres, disposable staging only, after migrations 001–005. ON_ERROR_STOP=1.
begin;
insert into auth.users(id,email) values ('a2400000-0000-4000-8000-000000000001','v24-a@example.invalid'),('b2400000-0000-4000-8000-000000000002','v24-b@example.invalid');
insert into public.amplop_weddings(id,owner_id) values ('a2400000-0000-4000-8000-000000000011','a2400000-0000-4000-8000-000000000001'),('b2400000-0000-4000-8000-000000000012','b2400000-0000-4000-8000-000000000002');
set local role service_role;
do $$ declare a uuid:='a2400000-0000-4000-8000-000000000001'; b uuid:='b2400000-0000-4000-8000-000000000002'; w uuid:='a2400000-0000-4000-8000-000000000011'; wb uuid:='b2400000-0000-4000-8000-000000000012'; p jsonb:='{"schema":1,"target":100,"tasks":[],"vendors":[],"expenses":[],"payments":[],"rundown":[]}'; result jsonb; begin
 result:=public.amplop_plan(a,w,'load',null,null);if result->>'revision'<>'0' then raise exception 'expected empty plan';end if;
 result:=public.amplop_plan(a,w,'save',0,p);if result->>'revision'<>'1' then raise exception 'expected revision 1';end if;
 result:=public.amplop_plan(a,w,'save',1,jsonb_set(p,'{target}','200'));if result->>'revision'<>'2' then raise exception 'expected revision 2';end if;
 begin perform public.amplop_plan(a,w,'save',1,p);raise exception 'stale save accepted';exception when serialization_failure then null;end;
 begin perform public.amplop_plan(a,w,'save',0,p);raise exception 'stale create accepted';exception when serialization_failure then null;end;
 begin perform public.amplop_plan(b,w,'load',null,null);raise exception 'cross tenant read accepted';exception when insufficient_privilege then null;end;
 begin perform public.amplop_plan(b,w,'save',2,p);raise exception 'cross tenant save accepted';exception when insufficient_privilege then null;end;
 begin perform public.amplop_plan(null,w,'load',null,null);raise exception 'null actor accepted';exception when insufficient_privilege then null;end;
 begin perform public.amplop_plan(a,w,'save',2,'{}');raise exception 'invalid plan accepted';exception when check_violation then null;end;
 result:=public.amplop_plan(b,wb,'load',null,null);if result->>'revision'<>'0' then raise exception 'tenant leak';end if;
 result:=public.amplop_plan(a,w,'load',null,null);if result->>'revision'<>'2' or result->'content'->>'target'<>'200' then raise exception 'failed save changed content';end if;
 begin update public.amplop_plans set revision=3;raise exception 'service direct write accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
do $$ begin
 begin perform public.amplop_plan('a2400000-0000-4000-8000-000000000001','a2400000-0000-4000-8000-000000000011','load',null,null);raise exception 'direct RPC accepted';exception when insufficient_privilege then null;end;
 begin perform 1 from public.amplop_plans;raise exception 'direct read accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform 1 from public.amplop_plans;raise exception 'anon read accepted';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
