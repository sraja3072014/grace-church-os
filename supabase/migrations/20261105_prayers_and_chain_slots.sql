create table if not exists public.prayers (
  id text primary key,
  user_id text,
  author_name text not null default 'Anonymous Believer',
  category text not null default 'GENERAL'
    check (category in ('HEALING', 'FAMILY', 'JOB', 'SPIRITUAL', 'DELIVERANCE', 'NATION', 'GENERAL')),
  description text not null,
  visibility text not null default 'PUBLIC'
    check (visibility in ('PUBLIC', 'PASTORAL', 'ANONYMOUS')),
  prayer_count integer not null default 0 check (prayer_count >= 0),
  is_answered boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb
);

alter table public.prayers enable row level security;

drop policy if exists "Public and anonymous prayers are visible" on public.prayers;
create policy "Public and anonymous prayers are visible"
  on public.prayers for select
  to anon, authenticated
  using (visibility in ('PUBLIC', 'ANONYMOUS'));

drop policy if exists "Authors can view pastoral prayers" on public.prayers;
create policy "Authors can view pastoral prayers"
  on public.prayers for select
  to authenticated
  using (visibility = 'PASTORAL' and user_id = auth.uid()::text);

drop policy if exists "Pastoral staff can view pastoral prayers" on public.prayers;
create policy "Pastoral staff can view pastoral prayers"
  on public.prayers for select
  to authenticated
  using (
    visibility = 'PASTORAL'
    and (
      auth.jwt() -> 'app_metadata' ->> 'role' in ('pastor', 'admin', 'Senior Pastor / Super Admin')
      or auth.jwt() -> 'app_metadata' ->> 'pastoralCare' = 'true'
    )
  );

revoke insert, update, delete on public.prayers from anon, authenticated;

create or replace function public.sync_prayer(record_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  prayer_id text;
  incoming_visibility text;
  incoming_category text;
  incoming_count integer;
  existing_visibility text;
  existing_user_id text;
  actor_is_pastoral boolean;
  actor_owns_prayer boolean;
begin
  prayer_id := nullif(record_payload ->> 'id', '');
  if prayer_id is null or coalesce(record_payload ->> 'description', '') = '' then
    raise exception 'Prayer id and description are required';
  end if;

  incoming_visibility := case
    when record_payload ->> 'visibility' in ('PUBLIC', 'ANONYMOUS', 'PASTORAL')
      then record_payload ->> 'visibility'
    else 'PUBLIC'
  end;
  incoming_category := case
    when record_payload ->> 'category' in ('HEALING', 'FAMILY', 'JOB', 'SPIRITUAL', 'DELIVERANCE', 'NATION', 'GENERAL')
      then record_payload ->> 'category'
    else 'GENERAL'
  end;
  incoming_count := greatest(coalesce((record_payload ->> 'prayer_count')::integer, 0), 0);
  actor_is_pastoral := auth.jwt() -> 'app_metadata' ->> 'role'
      in ('pastor', 'admin', 'Senior Pastor / Super Admin')
    or auth.jwt() -> 'app_metadata' ->> 'pastoralCare' = 'true';

  select visibility, user_id
    into existing_visibility, existing_user_id
    from public.prayers
    where id = prayer_id
    for update;

  if not found then
    insert into public.prayers (
      id, user_id, author_name, category, description, visibility,
      prayer_count, is_answered, created_at, updated_at, raw_payload
    ) values (
      prayer_id,
      nullif(record_payload ->> 'user_id', ''),
      case when incoming_visibility = 'ANONYMOUS' then 'Anonymous Believer'
        else coalesce(nullif(record_payload ->> 'author_name', ''), 'Anonymous Believer') end,
      incoming_category,
      record_payload ->> 'description',
      incoming_visibility,
      incoming_count,
      coalesce((record_payload ->> 'is_answered')::boolean, false),
      coalesce(nullif(record_payload ->> 'created_at', '')::timestamptz, now()),
      coalesce(nullif(record_payload ->> 'updated_at', '')::timestamptz, now()),
      coalesce(record_payload -> 'raw_payload', '{}'::jsonb)
    );
    return;
  end if;

  actor_owns_prayer := existing_user_id is not null and existing_user_id = auth.uid()::text;
  if actor_is_pastoral or actor_owns_prayer then
    update public.prayers set
      author_name = case when incoming_visibility = 'ANONYMOUS' then 'Anonymous Believer'
        else coalesce(nullif(record_payload ->> 'author_name', ''), 'Anonymous Believer') end,
      category = incoming_category,
      description = record_payload ->> 'description',
      visibility = incoming_visibility,
      prayer_count = incoming_count,
      is_answered = coalesce((record_payload ->> 'is_answered')::boolean, false),
      updated_at = coalesce(nullif(record_payload ->> 'updated_at', '')::timestamptz, now()),
      raw_payload = coalesce(record_payload -> 'raw_payload', '{}'::jsonb)
    where id = prayer_id;
  elsif existing_visibility in ('PUBLIC', 'ANONYMOUS')
    and incoming_visibility = existing_visibility then
    update public.prayers
      set prayer_count = greatest(prayer_count, least(incoming_count, prayer_count + 1)),
          updated_at = case when incoming_count > prayer_count then now() else updated_at end
      where id = prayer_id;
  end if;
end;
$$;

revoke all on function public.sync_prayer(jsonb) from public;
grant execute on function public.sync_prayer(jsonb) to anon, authenticated;

create table if not exists public.prayer_chain_slots (
  id text primary key,
  user_id text not null,
  author_name text not null default 'Prayer Warrior',
  slot_date date not null,
  start_minute integer not null check (start_minute between 0 and 1380 and start_minute % 60 = 0),
  duration_minutes integer not null default 60 check (duration_minutes = 60),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'CANCELLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb
);

create index if not exists prayer_chain_slots_date_status_idx
  on public.prayer_chain_slots (slot_date, status, start_minute);

alter table public.prayer_chain_slots enable row level security;

drop policy if exists "Prayer chain slots are visible" on public.prayer_chain_slots;
create policy "Prayer chain slots are visible"
  on public.prayer_chain_slots for select
  to anon, authenticated
  using (status = 'ACTIVE' or user_id = auth.uid()::text);

revoke insert, update, delete on public.prayer_chain_slots from anon, authenticated;

create or replace function public.sync_prayer_slot(record_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  slot_id text;
  slot_owner text;
  requested_user text;
  requested_date date;
  requested_minute integer;
  requested_status text;
begin
  slot_id := nullif(record_payload ->> 'id', '');
  requested_user := nullif(record_payload ->> 'user_id', '');
  requested_date := nullif(record_payload ->> 'slot_date', '')::date;
  requested_minute := (record_payload ->> 'start_minute')::integer;
  requested_status := case when record_payload ->> 'status' = 'CANCELLED' then 'CANCELLED' else 'ACTIVE' end;

  if slot_id is null or requested_user is null or requested_date is null
    or requested_minute not between 0 and 1380 or requested_minute % 60 <> 0 then
    raise exception 'Invalid prayer chain slot';
  end if;

  perform pg_advisory_xact_lock(hashtext(requested_date::text));
  select user_id into slot_owner from public.prayer_chain_slots where id = slot_id for update;

  if found and slot_owner <> requested_user then
    raise exception 'Cannot change another member''s prayer slot';
  end if;

  if requested_status = 'ACTIVE' and exists (
    select 1 from public.prayer_chain_slots
      where slot_date = requested_date
        and status = 'ACTIVE'
        and id <> slot_id
        and start_minute < requested_minute + 60
        and start_minute + duration_minutes > requested_minute
  ) then
    raise exception 'This prayer hour is already reserved';
  end if;

  insert into public.prayer_chain_slots (
    id, user_id, author_name, slot_date, start_minute,
    duration_minutes, status, created_at, updated_at, raw_payload
  ) values (
    slot_id,
    requested_user,
    coalesce(nullif(record_payload ->> 'author_name', ''), 'Prayer Warrior'),
    requested_date,
    requested_minute,
    60,
    requested_status,
    coalesce(nullif(record_payload ->> 'created_at', '')::timestamptz, now()),
    coalesce(nullif(record_payload ->> 'updated_at', '')::timestamptz, now()),
    coalesce(record_payload -> 'raw_payload', '{}'::jsonb)
  )
  on conflict (id) do update set
    status = excluded.status,
    updated_at = excluded.updated_at,
    raw_payload = excluded.raw_payload;
end;
$$;

revoke all on function public.sync_prayer_slot(jsonb) from public;
grant execute on function public.sync_prayer_slot(jsonb) to anon, authenticated;
