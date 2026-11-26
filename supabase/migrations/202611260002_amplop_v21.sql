-- Sandbox only. Apply after V20, in disposable staging. Server-only RPCs.
begin;
create table public.amplop_orders (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null unique references public.amplop_weddings(id) on delete restrict,
 amount integer not null check (amount between 1 and 100000000), currency text not null default 'IDR' check(currency='IDR'),
 state text not null default 'reserved' check(state in ('reserved','creating','pending','paid','blocked')),
 redirect_url text, created_at timestamptz not null default now(), paid_at timestamptz
);
create table public.amplop_publications (
 wedding_id uuid primary key references public.amplop_weddings(id) on delete restrict,
 slug text not null unique check(slug ~ '^[a-z0-9][a-z0-9-]{2,62}[a-z0-9]$'), active_revision integer not null
);
create table public.amplop_publication_versions (
 wedding_id uuid not null references public.amplop_publications(wedding_id) on delete restrict,
 revision integer not null, content jsonb not null, created_at timestamptz not null default now(), primary key(wedding_id,revision)
);
alter table public.amplop_publications add constraint active_version_fk foreign key(wedding_id,active_revision) references public.amplop_publication_versions(wedding_id,revision) deferrable initially deferred;
alter table public.amplop_orders enable row level security;
alter table public.amplop_publications enable row level security;
alter table public.amplop_publication_versions enable row level security;
revoke all on public.amplop_orders,public.amplop_publications,public.amplop_publication_versions from public,anon,authenticated,service_role;
grant select on public.amplop_weddings,public.amplop_drafts to service_role;
grant select on public.amplop_orders,public.amplop_publications,public.amplop_publication_versions to service_role;
-- Claim exactly once. Failed/ambiguous provider create requires reconciliation by operator, never a new order automatically.
create function public.amplop_claim_checkout(p_actor uuid,p_wedding uuid,p_amount integer) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.amplop_orders; claimed boolean:=false;
begin
 perform 1 from public.amplop_weddings where id=p_wedding and owner_id=p_actor for update;
 if not found then raise exception 'Workspace unavailable' using errcode='42501'; end if;
 if not exists(select 1 from public.amplop_drafts where wedding_id=p_wedding) then raise exception 'Save draft first' using errcode='22023'; end if;
 insert into public.amplop_orders(wedding_id,amount) values(p_wedding,p_amount) on conflict(wedding_id) do nothing;
 update public.amplop_orders set state='creating' where wedding_id=p_wedding and state='reserved' returning * into o;
 claimed:=found;
 if not claimed then select * into strict o from public.amplop_orders where wedding_id=p_wedding; end if;
 return jsonb_build_object('order',to_jsonb(o),'claimed',claimed);
end; $$;
create function public.amplop_store_checkout(p_order uuid,p_url text) returns void
language plpgsql security definer set search_path='' as $$
begin
 update public.amplop_orders set redirect_url=p_url,state=case when state='creating' then 'pending' else state end where id=p_order;
 if not found then raise exception 'Order unavailable'; end if;
end; $$;
-- Provider result was authenticated and amount checked by the server. Block is sticky; no stale paid notification can reverse it.
create function public.amplop_apply_payment(p_order uuid,p_amount integer,p_result text) returns text
language plpgsql security definer set search_path='' as $$
declare o public.amplop_orders;
begin
 select * into strict o from public.amplop_orders where id=p_order for update;
 if p_amount is distinct from o.amount or p_result is null or p_result not in ('paid','blocked','pending') then raise exception 'Invalid payment result'; end if;
 if o.state='blocked' then return 'blocked'; end if;
 if p_result='blocked' then update public.amplop_orders set state='blocked' where id=p_order; return 'blocked'; end if;
 if p_result='paid' then update public.amplop_orders set state='paid',paid_at=coalesce(paid_at,now()) where id=p_order; return 'paid'; end if;
 return o.state;
end; $$;
-- CAS on the exact server-validated draft. Immutable versions, stable slug, atomic pointer update.
create function public.amplop_publish(p_actor uuid,p_wedding uuid,p_revision integer,p_slug text,p_content jsonb) returns integer
language plpgsql security definer set search_path='' as $$
declare d public.amplop_drafts; existing public.amplop_publications;
begin
 perform 1 from public.amplop_weddings where id=p_wedding and owner_id=p_actor for update;
 if not found then raise exception 'Workspace unavailable' using errcode='42501'; end if;
 perform 1 from public.amplop_orders where wedding_id=p_wedding and state='paid' for update;
 if not found then raise exception 'Payment required' using errcode='42501'; end if;
 select * into strict d from public.amplop_drafts where wedding_id=p_wedding for update;
 if d.revision is distinct from p_revision or d.content is distinct from p_content then raise exception 'Draft revision conflict' using errcode='40001'; end if;
 select * into existing from public.amplop_publications where wedding_id=p_wedding;
 if found and existing.slug<>p_slug then raise exception 'Published slug is immutable' using errcode='22023'; end if;
 insert into public.amplop_publications(wedding_id,slug,active_revision) values(p_wedding,p_slug,p_revision) on conflict(wedding_id) do nothing;
 insert into public.amplop_publication_versions(wedding_id,revision,content) values(p_wedding,p_revision,d.content) on conflict(wedding_id,revision) do nothing;
 update public.amplop_publications set active_revision=p_revision where wedding_id=p_wedding;
 return p_revision;
end; $$;
create function public.amplop_read_publication(p_slug text) returns jsonb
language sql stable security definer set search_path='' as $$
 select v.content from public.amplop_publications p join public.amplop_orders o on o.wedding_id=p.wedding_id and o.state='paid' join public.amplop_publication_versions v on v.wedding_id=p.wedding_id and v.revision=p.active_revision where p.slug=p_slug;
$$;
revoke all on function public.amplop_claim_checkout(uuid,uuid,integer),public.amplop_store_checkout(uuid,text),public.amplop_apply_payment(uuid,integer,text),public.amplop_publish(uuid,uuid,integer,text,jsonb),public.amplop_read_publication(text) from public,anon,authenticated;
grant execute on function public.amplop_claim_checkout(uuid,uuid,integer),public.amplop_store_checkout(uuid,text),public.amplop_apply_payment(uuid,integer,text),public.amplop_publish(uuid,uuid,integer,text,jsonb),public.amplop_read_publication(text) to service_role;
commit;
