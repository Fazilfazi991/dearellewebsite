begin read only;
-- Run through an actual dearelle_app connection after credential provisioning.
-- Managed postgres cannot SET ROLE to this role; do not broaden membership to bypass that.
do $$ begin
 if current_user<>'dearelle_app' or (select count(*) from commerce.skus)<>18 or (select sum(on_hand-reserved) from commerce.inventory)<>54 then raise exception 'Restricted catalogue read failed'; end if;
 if has_table_privilege(current_user,'commerce.skus','UPDATE') or has_table_privilege(current_user,'commerce.owner_accounts','INSERT') or has_function_privilege(current_user,'commerce.anonymize_closed_orders()','EXECUTE') then raise exception 'Excess runtime privilege'; end if;
 if commerce.auth_session_valid('00000000-0000-0000-0000-000000000000','00000000-0000-0000-0000-000000000000') then raise exception 'Invalid session accepted'; end if;
end $$;
commit;
select 'PASS: restricted role reads all 18 SKUs; 54 available units; protected writes denied by grants; invalid Auth session rejected' as runtime_verification;