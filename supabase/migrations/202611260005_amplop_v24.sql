-- V24 owner-only planning, independent of publication/payment. Staging only.
begin;
create table public.amplop_plans (
 wedding_id uuid primary key references public.amplop_weddings(id) on delete cascade,
 revision integer not null check(revision>0),
 content jsonb not null,
 updated_at timestamptz not null default now(),
 constraint plan_size check(octet_length(content::text)<=1200000),
 constraint plan_shape check(coalesce(jsonb_typeof(content)='object' and content->>'schema'='1'
  and jsonb_typeof(content->'target')='number' and jsonb_typeof(content->'tasks')='array'
  and jsonb_typeof(content->'vendors')='array' and jsonb_typeof(content->'expenses')='array'
  and jsonb_typeof(content->'payments')='array' and jsonb_typeof(content->'rundown')='array',false))
);
alter table public.amplop_plans enable row level security;
revoke all on public.amplop_plans from public,anon,authenticated,service_role;
-- Only server validates the full plan; direct callers including service role cannot write the table.
create function public.amplop_plan(p_actor uuid,p_wedding uuid,p_action text,p_expected integer,p_content jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare row_plan public.amplop_plans;
begin
 if p_actor is null then raise exception 'Workspace unavailable' using errcode='42501'; end if;
 perform 1 from public.amplop_weddings where id=p_wedding and owner_id=p_actor for update;
 if not found then raise exception 'Workspace unavailable' using errcode='42501'; end if;
 if p_action='load' then
  select * into row_plan from public.amplop_plans where wedding_id=p_wedding;
  if not found then return jsonb_build_object('revision',0,'content',null); end if;
 elsif p_action='save' then
  if p_expected is null or p_expected<0 or p_content is null then raise exception 'Invalid plan' using errcode='22023'; end if;
  if p_expected=0 then
   insert into public.amplop_plans(wedding_id,revision,content) values(p_wedding,1,p_content)
   on conflict(wedding_id) do nothing returning * into row_plan;
  else
   update public.amplop_plans set content=p_content,revision=revision+1,updated_at=now()
   where wedding_id=p_wedding and revision=p_expected returning * into row_plan;
  end if;
  if not found then raise exception 'Plan revision conflict' using errcode='40001'; end if;
 else raise exception 'Invalid plan action' using errcode='22023'; end if;
 return jsonb_build_object('revision',row_plan.revision,'content',row_plan.content);
end; $$;
revoke all on function public.amplop_plan(uuid,uuid,text,integer,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.amplop_plan(uuid,uuid,text,integer,jsonb) to service_role;
commit;
