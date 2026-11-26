-- V15 scratch database only. Review against actual repository before execution.
-- Server-only access. Use narrowly scoped role/grants in deployment, not browser keys.
begin;
create schema amplop_private;
revoke all on schema amplop_private from public, anon, authenticated;
set local search_path = amplop_private, public;
create table weddings (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 slug text unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,79}$'), active_version_id uuid,
 created_at timestamptz not null default now(), archived_at timestamptz
);
create table wedding_members (
 wedding_id uuid not null references weddings(id), user_id uuid not null references auth.users(id),
 role text not null check(role in ('editor','checkin_staff')), primary key(wedding_id,user_id)
);
create table drafts (
 wedding_id uuid primary key references weddings(id), revision bigint not null default 1 check(revision>0),
 content jsonb not null default '{}'::jsonb check(jsonb_typeof(content)='object'), updated_at timestamptz not null default now()
);
create table assets (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references weddings(id),
 object_key text not null unique, kind text not null check(kind in ('photo','audio','video')),
 status text not null default 'pending' check(status in ('pending','processing','ready','rejected')),
 mime text, bytes bigint check(bytes>=0), sha256 text, created_at timestamptz not null default now(), unique(wedding_id,id)
);
create table publication_versions (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references weddings(id),
 draft_revision bigint not null check(draft_revision>0), snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
 template_key text not null check(template_key in ('secret-letter','cinematic-romance','wedding-editorial','enchanted-garden','our-story')),
 renderer_version text not null, created_at timestamptz not null default now(), unique(wedding_id,id)
);
alter table weddings add constraint active_version_same_wedding foreign key(id,active_version_id) references publication_versions(wedding_id,id);
create table publication_assets (
 wedding_id uuid not null, version_id uuid not null, asset_id uuid not null,
 primary key(version_id,asset_id), foreign key(wedding_id,version_id) references publication_versions(wedding_id,id),
 foreign key(wedding_id,asset_id) references assets(wedding_id,id)
);
create table orders (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references weddings(id),
 idempotency_key text not null, provider_order_id text not null unique,
 amount_idr bigint not null check(amount_idr>0), status text not null check(status in ('created','pending','paid','failed','expired','review','refunded')),
 created_at timestamptz not null default now(), unique(wedding_id,idempotency_key), unique(wedding_id,id)
);
create table entitlements (
 wedding_id uuid primary key references weddings(id), order_id uuid not null unique,
 status text not null check(status in ('active','suspended','revoked')), valid_until timestamptz,
 foreign key(wedding_id,order_id) references orders(wedding_id,id)
);
create table guests (
 id uuid primary key default gen_random_uuid(), wedding_id uuid not null references weddings(id),
 name text not null check(char_length(name) between 1 and 100), contact text, party_limit int not null default 1 check(party_limit between 1 and 100),
 token_digest text unique, revoked_at timestamptz, unique(wedding_id,id)
);
create table rsvps (
 wedding_id uuid not null, guest_id uuid not null, attendance text not null check(attendance in ('yes','no')),
 party_count int not null check((attendance='no' and party_count=0) or (attendance='yes' and party_count between 1 and 100)),
 message text not null default '' check(char_length(message)<=500), updated_at timestamptz not null default now(),
 primary key(wedding_id,guest_id), foreign key(wedding_id,guest_id) references guests(wedding_id,id)
);
create table webhook_receipts (
 provider text not null, fingerprint text not null, provider_order_id text not null references orders(provider_order_id),
 received_at timestamptz not null default now(), primary key(provider,fingerprint)
);
create table audit_events (
 id bigint generated always as identity primary key, wedding_id uuid references weddings(id), actor_id uuid,
 action text not null, trace_id text, created_at timestamptz not null default now()
);
create index weddings_owner_idx on weddings(owner_id);
create index members_user_idx on wedding_members(user_id);
create index assets_wedding_idx on assets(wedding_id);
create index publication_wedding_idx on publication_versions(wedding_id,created_at);
create index guests_wedding_idx on guests(wedding_id);
create index audit_wedding_idx on audit_events(wedding_id,created_at);
-- No public policies: all browser traffic is through authenticated, authorized server routes.
-- Service role bypasses RLS: deployment must explicitly provision server access and test every authorization path.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='amplop_private' loop
 execute format('alter table amplop_private.%I enable row level security',t.tablename);
 end loop;
end $$;
revoke all on all tables in schema amplop_private from public, anon, authenticated;
revoke all on all sequences in schema amplop_private from public, anon, authenticated;
commit;
-- Transaction procedures, role grants, storage policies, immutable snapshot enforcement,
-- ownership checks, retention and concurrent publish tests remain implementation gates.
