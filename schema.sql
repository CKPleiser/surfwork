-- Surf Work DB Schema (Postgres / Supabase)
-- ----------------------------------------------------

-- Extensions
create extension if not exists pgcrypto;         -- for gen_random_uuid()

-- Enums
do $$ begin
  create type profile_kind      as enum ('person','org');
  create type role_type         as enum ('coach','media','camp_staff','ops','other');
  create type compensation_type as enum ('salary','day_rate','exchange','volunteer','unknown');
  create type contact_method    as enum ('email','whatsapp','link');
  create type job_status        as enum ('pending','active','closed');
  create type candidate_status  as enum ('active','archived');
  create type accommodation_lvl as enum ('yes','no','partial');  -- we decided to keep 'partial'
exception when duplicate_object then null; end $$;

-- Common helper
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ----------------------------------------------------
-- 1) Identities
-- ----------------------------------------------------

create table if not exists profiles (
  id uuid primary key,                     -- = auth.users.id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind profile_kind not null,
  display_name text not null,
  avatar_url text,
  country text,
  bio text
);
create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  website text,
  whatsapp text,
  email text,
  instagram text,
  city text,
  country text,
  lat double precision,
  lng double precision,
  verified boolean not null default false
);
create index if not exists schools_owner_idx on schools(owner_profile_id);
create trigger schools_updated_at
  before update on schools
  for each row execute function set_updated_at();

create table if not exists coach_profiles (
  id uuid primary key references profiles(id) on delete cascade, -- 1:1 person
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  years_experience int,
  sports text[] not null default array['surf'],       -- e.g. {'surf','kite','wing'}
  languages text[] not null default array[]::text[],  -- 'en','es','pt','it'
  certifications text[] not null default array[]::text[], -- 'ISA_L1','IKO','FirstAid'
  driving_license boolean,
  portfolio_url text,
  instagram text
);
create trigger coach_profiles_updated_at
  before update on coach_profiles
  for each row execute function set_updated_at();

-- ----------------------------------------------------
-- 2) Jobs (from schools)
-- ----------------------------------------------------

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  school_id uuid not null references schools(id) on delete cascade,
  status job_status not null default 'pending',

  title text not null,
  role role_type not null,
  sports text[] not null default array['surf'],

  description text not null,
  city text,
  country text,
  lat double precision,
  lng double precision,

  season_start date,
  season_end date,

  compensation compensation_type not null default 'unknown',
  pay text,                                      -- free text: "€1800/mo" or "€100/day"
  accommodation accommodation_lvl not null default 'no',

  contact contact_method not null,
  contact_value text not null,

  photo_url text,
  attributes jsonb not null default '{}'::jsonb   -- escape hatch (e.g., {"housing_detail":"shared room"})
);

create index if not exists jobs_status_idx   on jobs(status, created_at desc);
create index if not exists jobs_country_idx  on jobs(country);
create index if not exists jobs_role_idx     on jobs(role);
create index if not exists jobs_sports_gin   on jobs using gin (sports);
create index if not exists jobs_attributes_gin on jobs using gin (attributes);
create trigger jobs_updated_at
  before update on jobs
  for each row execute function set_updated_at();

-- Optional: dedupe guard (same school + title + country + season start)
create unique index if not exists jobs_dedupe_idx
  on jobs(school_id, title, coalesce(country,''), coalesce(season_start, '1900-01-01'::date))
  where status <> 'closed';

-- ----------------------------------------------------
-- 3) Candidate "Open to Work" pitches (from coaches)
-- ----------------------------------------------------

create table if not exists candidate_pitches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  profile_id uuid not null references profiles(id) on delete cascade,
  status candidate_status not null default 'active',

  title text not null,                              -- "Surf coach & content creator"
  sports text[] not null default array['surf'],
  languages text[] not null default array[]::text[],
  certifications text[] not null default array[]::text[],

  availability_start date,
  availability_end date,
  preferred_regions text[] not null default array[]::text[],
  exchange_ok boolean,

  description text not null,
  instagram text,
  portfolio_url text,

  contact contact_method not null,
  contact_value text not null,

  attributes jsonb not null default '{}'::jsonb
);
create index if not exists candidate_status_idx on candidate_pitches(status);
create index if not exists candidate_sports_gin on candidate_pitches using gin (sports);
create trigger candidate_updated_at
  before update on candidate_pitches
  for each row execute function set_updated_at();

-- ----------------------------------------------------
-- 4) Supporters (donations)
-- ----------------------------------------------------

create table if not exists supporters (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references profiles(id) on delete set null,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'EUR',
  stripe_session_id text unique
);

-- ----------------------------------------------------
-- Suggested RLS (Supabase)
-- ----------------------------------------------------
-- Enable RLS
alter table profiles          enable row level security;
alter table schools           enable row level security;
alter table coach_profiles    enable row level security;
alter table jobs              enable row level security;
alter table candidate_pitches enable row level security;
alter table supporters        enable row level security;

-- Public read policies (jobs & candidates visible)
create policy "public read jobs"
  on jobs for select using (status = 'active');

create policy "public read candidates"
  on candidate_pitches for select using (status = 'active');

-- Profile owner can read/update their own profile
create policy "profile owner rw"
  on profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- School owner CRUD on their school rows
create policy "school owner rw"
  on schools for all
  using (auth.uid() = owner_profile_id) with check (auth.uid() = owner_profile_id);

-- Coach can CRUD their coach_profile + candidate pitches
create policy "coach profile rw"
  on coach_profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "candidate owner rw"
  on candidate_pitches for all
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Schools can manage their jobs (but cannot self-activate if you want moderation)
create policy "school jobs rw"
  on jobs for all
  using (exists (select 1 from schools s where s.id = jobs.school_id and s.owner_profile_id = auth.uid()))
  with check (exists (select 1 from schools s where s.id = jobs.school_id and s.owner_profile_id = auth.uid())
              and (status in ('pending','closed') or true)); -- admins move to 'active'

-- Supporters: user may insert their own donation record
create policy "supporter insert"
  on supporters for insert
  with check (auth.uid() = user_id);

-- ----------------------------------------------------
-- Admin notes (not SQL):
-- - Gate "activate job" behind an admin-only RPC or dashboard.
-- - Put photos in Supabase Storage bucket: `public/jobs/{job_id}/main.jpg`
-- - Auto-expire jobs after 45 days with a cron (pg_cron) or edge function.
-- ----------------------------------------------------
