-- USER ACTION ONLY: project pvdklulichacdvsjfdqz (Mumbai staging).
-- Replace the placeholder yourself with a fresh password from your password manager.
-- Use at least 24 characters. Keep it private; do not send it in chat.
-- Run this yourself, then clear/discard the completed editor draft. Do not save it.
-- The placeholder is deliberately guarded and cannot enable login.
rollback;
do $setup$
declare
  chosen_password text := $private$REPLACE_WITH_YOUR_PRIVATE_PASSWORD$private$;
begin
  if length(chosen_password)<24
     or chosen_password='REPLACE_WITH_YOUR_PRIVATE_PASSWORD' then
    raise exception 'Enter a fresh private password of at least 24 characters before running';
  end if;
  if not exists(select 1 from pg_roles where rolname='dearelle_app'
    and not rolsuper and not rolbypassrls and not rolcreatedb and not rolcreaterole) then
    raise exception 'Restricted app role is missing or has unexpected privileges';
  end if;
  execute format('alter role dearelle_app login password %L',chosen_password);
end
$setup$;
select rolname,rolcanlogin,rolsuper,rolbypassrls,rolcreatedb,rolcreaterole
from pg_roles where rolname='dearelle_app';
