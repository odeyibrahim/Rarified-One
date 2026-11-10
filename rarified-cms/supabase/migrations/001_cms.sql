-- Rarified One CMS schema. Run in Supabase SQL Editor. Safe to re-run.
create extension if not exists pgcrypto;
create table if not exists site_content (key text primary key, value jsonb not null, updated_at timestamptz default now());
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text, interest text, message text not null,
  status text not null default 'new' check (status in ('new','handled')),
  ip text, created_at timestamptz default now());
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, title text not null, excerpt text, body text not null default '',
  cover_url text, is_published boolean default false, published_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists admin_sessions (
  token_hash text primary key, expires_at timestamptz not null, created_at timestamptz default now());
create table if not exists login_attempts (
  id uuid primary key default gen_random_uuid(), ip text not null, success boolean default false, created_at timestamptz default now());
create index if not exists idx_enq_created on enquiries(created_at desc);
create index if not exists idx_enq_ip on enquiries(ip, created_at);
create index if not exists idx_login_ip on login_attempts(ip, created_at);
-- Default-deny: RLS on, no anon policies. Only the service-role key (Netlify functions) can touch these tables.
alter table site_content enable row level security;
alter table enquiries enable row level security;
alter table posts enable row level security;
alter table admin_sessions enable row level security;
alter table login_attempts enable row level security;
select 'Rarified CMS schema ready' as status;

-- Public media bucket (read-only for the public; uploads go through the admin function only)
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
create index if not exists idx_posts_pub on posts(is_published, published_at desc);
