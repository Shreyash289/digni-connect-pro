-- Grants the 'admin' role to a reserved email address, both retroactively
-- (if the account already exists) and automatically going forward (if they
-- sign up later). Safe to re-run.

-- 1) One-time backfill: grant admin now if the account already exists
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'shreym171@gmail.com'
on conflict (user_id, role) do nothing;

-- 2) Auto-grant admin whenever this email signs up in the future
create or replace function public.grant_admin_for_reserved_emails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'shreym171@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_admin on auth.users;
create trigger on_auth_user_created_grant_admin
  after insert on auth.users
  for each row execute function public.grant_admin_for_reserved_emails();
