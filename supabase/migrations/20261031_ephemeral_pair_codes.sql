-- GraceOS Mobile App Relay online fallback.
-- Apply this migration in the configured Supabase project before using PIN pairing.
create table if not exists public.ephemeral_pair_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null check (code ~ '^[0-9]{6}$'),
  church_id text not null,
  relay_payload text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists ephemeral_pair_codes_active_code_idx
  on public.ephemeral_pair_codes (code)
  where used_at is null;

alter table public.ephemeral_pair_codes enable row level security;

-- The desktop uses the configured anon client to insert a PIN and the mobile
-- client reads one PIN. Deploy this with a tightly scoped RLS policy appropriate
-- to the project's auth model before production use.
create policy "authenticated clients create ephemeral pair codes"
  on public.ephemeral_pair_codes for insert
  to authenticated
  with check (expires_at > now() and expires_at <= now() + interval '5 minutes');

create policy "clients read unexpired ephemeral pair codes"
  on public.ephemeral_pair_codes for select
  to authenticated
  using (used_at is null and expires_at > now());

create policy "clients consume ephemeral pair codes"
  on public.ephemeral_pair_codes for update
  to authenticated
  using (used_at is null and expires_at > now())
  with check (used_at is not null);

create index if not exists ephemeral_pair_codes_expiry_idx
  on public.ephemeral_pair_codes (expires_at);