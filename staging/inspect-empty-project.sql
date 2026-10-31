select current_database() as database_name,
       (select count(*) from auth.users) as auth_user_count,
       exists(select 1 from pg_namespace where nspname='commerce') as commerce_schema_exists,
       (select count(*) from pg_tables where schemaname='public') as public_table_count,
       exists(select 1 from pg_roles where rolname='dearelle_app') as runtime_role_exists;
-- Aggregate-only inspection. This file performs no DDL, DML or identity changes.
