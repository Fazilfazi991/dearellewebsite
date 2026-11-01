-- USER ACTION ONLY: project pvdklulichacdvsjfdqz (Mumbai staging).
-- Edit ONLY the TYPE_NEW_RANDOM_PASSWORD_HERE text on the assignment line below.
-- Use a fresh random password of 16+ characters with letters and numbers.
-- Keep it in your password manager; do not send it in chat.
-- Run this yourself, then clear/discard the completed editor draft. Do not save it.
-- The placeholder is deliberately guarded and cannot enable login.
rollback;
do $setup$
declare
  chosen_password text := $private$TYPE_NEW_RANDOM_PASSWORD_HERE$private$;
begin
  if length(chosen_password)<16 or length(chosen_password)>128
     or chosen_password ~ '^TYPE_'
     or chosen_password !~ '[A-Za-z]' or chosen_password !~ '[0-9]' then
    raise exception 'Replace only the assignment placeholder with a fresh random 16+ character password containing letters and numbers';
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
