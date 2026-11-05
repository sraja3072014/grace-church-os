create or replace function public.resolve_staff_login_email(
  p_identifier_type text,
  p_identifier_value text
)
returns table(email text)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select lower(trim(s.email))
  from public.staff as s
  where s.email is not null
    and trim(s.email) <> ''
    and (
      (
        p_identifier_type = 'USERNAME'
        and lower(trim(s.username)) = lower(trim(p_identifier_value))
      )
      or (
        p_identifier_type = 'PHONE'
        and (
          regexp_replace(coalesce(s.phone, ''), '[^0-9]', '', 'g') = p_identifier_value
          or (
            length(p_identifier_value) >= 10
            and right(regexp_replace(coalesce(s.phone, ''), '[^0-9]', '', 'g'), 10)
              = right(p_identifier_value, 10)
          )
        )
      )
    );
$$;

revoke all on function public.resolve_staff_login_email(text, text) from public, anon, authenticated;
grant execute on function public.resolve_staff_login_email(text, text) to service_role;
