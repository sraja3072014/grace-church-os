alter table if exists public.finance
  add column if not exists member_id text,
  add column if not exists status text,
  add column if not exists transaction_reference text;
