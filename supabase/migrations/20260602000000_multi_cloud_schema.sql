create schema if not exists multi_cloud;

create extension if not exists pgcrypto;

do $$
begin
  if to_regtype('multi_cloud.multi_cloud_role') is null then
    create type multi_cloud.multi_cloud_role as enum ('super_admin', 'admin', 'viewer');
  end if;
end $$;

create table if not exists multi_cloud.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null unique,
  role multi_cloud.multi_cloud_role not null default 'viewer',
  source text not null default 'signup',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists multi_cloud.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  role multi_cloud.multi_cloud_role not null,
  created_by uuid references auth.users(id) on delete set null,
  created_by_username text,
  used_by uuid references auth.users(id) on delete set null,
  used_by_username text,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create or replace function multi_cloud.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch_updated_at on multi_cloud.profiles;
create trigger trg_profiles_touch_updated_at
before update on multi_cloud.profiles
for each row
execute function multi_cloud.touch_updated_at();

alter table multi_cloud.profiles enable row level security;
alter table multi_cloud.invites enable row level security;

grant usage on schema multi_cloud to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema multi_cloud to service_role;
grant usage, select on all sequences in schema multi_cloud to service_role;
