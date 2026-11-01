alter table if exists public.members add column if not exists latitude double precision;
alter table if exists public.members add column if not exists longitude double precision;
alter table if exists public.members add column if not exists gps_address text;
alter table if exists public.members add column if not exists maps_url text;

alter table if exists public.visitors add column if not exists latitude double precision;
alter table if exists public.visitors add column if not exists longitude double precision;
alter table if exists public.visitors add column if not exists gps_address text;
alter table if exists public.visitors add column if not exists maps_url text;