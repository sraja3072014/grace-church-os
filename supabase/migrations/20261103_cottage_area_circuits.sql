-- Migration: 20261103_cottage_area_circuits.sql
-- Table: cottage_area_circuits
-- Table: pastoral_visits

create table if not exists public.cottage_area_circuits (
  id text primary key,
  scheduled_date date not null,
  time_slot text default '07:00 PM',
  area_name text not null,
  host_family_id text,
  host_family_name text,
  assigned_leader text,
  target_family_ids jsonb default '[]'::jsonb,
  summary_notes text,
  coverage_percentage numeric default 0,
  status text default 'IN_PROGRESS',
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

create index if not exists cottage_area_circuits_area_idx on public.cottage_area_circuits (area_name);
create index if not exists cottage_area_circuits_date_idx on public.cottage_area_circuits (scheduled_date);

create table if not exists public.pastoral_visits (
  id text primary key,
  circuit_id text references public.cottage_area_circuits(id) on delete set null,
  family_id text not null,
  family_name text,
  area_name text,
  leader_name text,
  status text not null default 'SCHEDULED', -- 'SCHEDULED', 'VISITED', 'ABSENT'
  prayer_notes text,
  visited_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

create index if not exists pastoral_visits_family_idx on public.pastoral_visits (family_id);
create index if not exists pastoral_visits_circuit_idx on public.pastoral_visits (circuit_id);

