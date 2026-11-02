alter table if exists public.visitors add column if not exists pipeline_stage text not null default '1ST_VISIT';
alter table if exists public.visitors add column if not exists call_notes text;
alter table if exists public.visitors add column if not exists home_visit_date timestamptz;
alter table if exists public.visitors add column if not exists assigned_leader text;
alter table if exists public.visitors add column if not exists is_converted boolean not null default false;
alter table if exists public.visitors add column if not exists converted_member_id text;
alter table if exists public.visitors add column if not exists converted_at timestamptz;

alter table if exists public.visitors drop constraint if exists visitors_pipeline_stage_check;
alter table if exists public.visitors add constraint visitors_pipeline_stage_check
  check (pipeline_stage in ('1ST_VISIT', 'LEADER_CALLED', 'HOME_VISITED', 'CONVERTED'));

create index if not exists visitors_pipeline_stage_idx on public.visitors (pipeline_stage);
create index if not exists visitors_converted_member_id_idx on public.visitors (converted_member_id);

alter table if exists public.visitors drop constraint if exists visitors_converted_member_id_fkey;
alter table if exists public.visitors add constraint visitors_converted_member_id_fkey
  foreign key (converted_member_id) references public.members(id) on delete set null;