create table if not exists public.prayer_requests (
  id text primary key,
  member_id text,
  requester_name text not null default 'Anonymous Believer',
  phone text,
  category text not null default 'GENERAL'
    check (category in ('NATION', 'HEALING', 'FAMILY', 'SALVATION', 'GENERAL')),
  request_text text not null,
  is_confidential boolean not null default false,
  prayer_count integer not null default 0 check (prayer_count >= 0),
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'ANSWERED', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb
);

alter table public.prayer_requests enable row level security;

drop policy if exists "Public prayer requests are visible" on public.prayer_requests;
create policy "Public prayer requests are visible"
  on public.prayer_requests for select
  to anon, authenticated
  using (not is_confidential);

drop policy if exists "Pastoral staff can view confidential prayer requests" on public.prayer_requests;
create policy "Pastoral staff can view confidential prayer requests"
  on public.prayer_requests for select
  to authenticated
  using (
    is_confidential
    and (
      auth.jwt() -> 'app_metadata' ->> 'role' in ('pastor', 'admin', 'Senior Pastor / Super Admin')
      or auth.jwt() -> 'app_metadata' ->> 'pastoralCare' = 'true'
    )
  );

revoke insert, update, delete on public.prayer_requests from anon, authenticated;

create or replace function public.sync_prayer_request(request_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  request_id text;
  actor_role text;
  is_pastoral boolean;
  existing_confidential boolean;
  existing_member_id text;
  incoming_confidential boolean;
  incoming_count integer;
begin
  request_id := nullif(request_payload ->> 'id', '');
  if request_id is null then
    raise exception 'Prayer request id is required';
  end if;

  actor_role := auth.jwt() -> 'app_metadata' ->> 'role';
  is_pastoral := actor_role in ('pastor', 'admin', 'Senior Pastor / Super Admin')
    or auth.jwt() -> 'app_metadata' ->> 'pastoralCare' = 'true';
  incoming_confidential := coalesce((request_payload ->> 'is_confidential')::boolean, false);
  incoming_count := greatest(coalesce((request_payload ->> 'prayer_count')::integer, 0), 0);

  select is_confidential, member_id
    into existing_confidential, existing_member_id
    from public.prayer_requests
    where id = request_id
    for update;

  if not found then
    insert into public.prayer_requests (
      id, member_id, requester_name, phone, category, request_text,
      is_confidential, prayer_count, status, created_at, updated_at, raw_payload
    ) values (
      request_id,
      nullif(request_payload ->> 'member_id', ''),
      coalesce(nullif(request_payload ->> 'requester_name', ''), 'Anonymous Believer'),
      case when incoming_confidential then nullif(request_payload ->> 'phone', '') else null end,
      case when request_payload ->> 'category' in ('NATION', 'HEALING', 'FAMILY', 'SALVATION', 'GENERAL')
        then request_payload ->> 'category' else 'GENERAL' end,
      coalesce(request_payload ->> 'request_text', ''),
      incoming_confidential,
      incoming_count,
      case when request_payload ->> 'status' in ('ANSWERED', 'ARCHIVED')
        then request_payload ->> 'status' else 'ACTIVE' end,
      coalesce(nullif(request_payload ->> 'created_at', '')::timestamptz, now()),
      coalesce(nullif(request_payload ->> 'updated_at', '')::timestamptz, now()),
      coalesce(request_payload -> 'raw_payload', '{}'::jsonb)
    )
    on conflict (id) do nothing;
    return;
  end if;

  if is_pastoral or (
    existing_confidential
    and existing_member_id is not null
    and existing_member_id = auth.uid()::text
  ) then
    update public.prayer_requests set
      member_id = nullif(request_payload ->> 'member_id', ''),
      requester_name = coalesce(nullif(request_payload ->> 'requester_name', ''), 'Anonymous Believer'),
      phone = case when incoming_confidential then nullif(request_payload ->> 'phone', '') else null end,
      category = case when request_payload ->> 'category' in ('NATION', 'HEALING', 'FAMILY', 'SALVATION', 'GENERAL')
        then request_payload ->> 'category' else 'GENERAL' end,
      request_text = coalesce(request_payload ->> 'request_text', ''),
      is_confidential = incoming_confidential,
      prayer_count = incoming_count,
      status = case when request_payload ->> 'status' in ('ACTIVE', 'ANSWERED', 'ARCHIVED')
        then request_payload ->> 'status' else 'ACTIVE' end,
      updated_at = coalesce(nullif(request_payload ->> 'updated_at', '')::timestamptz, now()),
      raw_payload = coalesce(request_payload -> 'raw_payload', '{}'::jsonb)
    where id = request_id;
  elsif not existing_confidential and not incoming_confidential then
    update public.prayer_requests
      set prayer_count = greatest(prayer_count, least(incoming_count, prayer_count + 1)),
          updated_at = case
            when incoming_count > prayer_count then now()
            else updated_at
          end
      where id = request_id;
  end if;
end;
$$;

revoke all on function public.sync_prayer_request(jsonb) from public;
grant execute on function public.sync_prayer_request(jsonb) to anon, authenticated;
