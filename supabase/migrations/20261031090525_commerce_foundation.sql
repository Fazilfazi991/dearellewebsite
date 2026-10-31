-- Private commerce schema: never add to the Supabase Data API exposed schemas.
create schema commerce;
revoke all on schema commerce from public, anon, authenticated;
do $$begin if not exists(select 1 from pg_roles where rolname='dearelle_app') then create role dearelle_app nologin; end if; end$$;
grant usage on schema commerce to dearelle_app;
create table commerce.settings (
 id boolean primary key default true check(id), public_intake boolean not null default false check(not public_intake),
 reservation_hours integer not null default 24 check(reservation_hours between 1 and 168),
 live_expiry_approved boolean not null default false check(not live_expiry_approved),
 contact text, advance_instructions text, return_window_days integer, cancellation_policy text, invoice_policy text,
 retention_days integer check(retention_days >= 30), retention_approved boolean not null default false
);
insert into commerce.settings(id) values(true);
create table commerce.products(id text primary key, name text not null, brand text not null, category text not null);
create table commerce.skus(sku text primary key, variant_id text unique not null, product_id text not null references commerce.products,
 color text not null, price_paise integer not null check(price_paise in (39900,59900,79900)), images jsonb not null, enabled boolean not null default true);
create table commerce.inventory(sku text primary key references commerce.skus, on_hand integer not null default 3 check(on_hand>=0),
 reserved integer not null default 0 check(reserved>=0 and reserved<=on_hand));
create table commerce.owner_accounts(id uuid primary key references auth.users(id), singleton boolean not null unique default true check(singleton));
create table commerce.owner_sessions(id uuid primary key, owner_id uuid not null references commerce.owner_accounts,
 created_at timestamptz not null default now(), last_seen timestamptz not null default now(), revoked_at timestamptz);
create table commerce.orders(id uuid primary key default gen_random_uuid(), guest_hash text not null check(length(guest_hash)=64),
 customer jsonb not null, quote jsonb not null, mode text not null default 'test' check(mode='test'),
 subtotal integer not null check(subtotal>0), shipping integer not null default 0 check(shipping=0),
 total integer not null check(total=subtotal+shipping), advance integer not null check(advance=least(5000,total)),
 cod_balance integer not null check(cod_balance=total-advance),
 payment text not null default 'advance_pending' check(payment in ('advance_pending','advance_verified','cod_collected')),
 fulfilment text not null default 'awaiting_contact' check(fulfilment in ('awaiting_contact','confirmed','packed','shipped','delivered','cancelled','expired')),
 tracking text not null default '', version integer not null default 1 check(version>0),
 created_at timestamptz not null default now(), expires_at timestamptz not null);
create index on commerce.orders(guest_hash,id);
create index on commerce.orders(expires_at) where payment='advance_pending' and fulfilment in ('awaiting_contact','confirmed');
create table commerce.order_lines(order_id uuid not null references commerce.orders, sku text not null references commerce.skus,
 snapshot jsonb not null, quantity integer not null check(quantity between 1 and 10), unit_price integer not null check(unit_price>0),
 line_total integer generated always as (quantity*unit_price) stored, primary key(order_id,sku));
create table commerce.idempotency(guest_hash text not null, key uuid not null, payload_hash text not null, order_id uuid not null unique references commerce.orders,
 primary key(guest_hash,key), created_at timestamptz not null default now());
create table commerce.reservations(order_id uuid not null references commerce.orders, sku text not null references commerce.inventory,
 quantity integer not null check(quantity>0), state text not null default 'active' check(state in ('active','released','consumed')),
 expires_at timestamptz not null, primary key(order_id,sku));
create table commerce.advance_verifications(order_id uuid primary key references commerce.orders, amount integer not null check(amount=5000),
 external_reference text not null unique check(length(external_reference) between 3 and 120), internal_note text not null check(length(internal_note) between 1 and 1000),
 verified_by uuid not null references commerce.owner_accounts, verified_at timestamptz not null default now());
create table commerce.cod_collections(order_id uuid primary key references commerce.orders, amount integer not null check(amount>=0),
 external_reference text not null unique check(length(external_reference) between 3 and 120), internal_note text not null check(length(internal_note) between 1 and 1000),
 verified_by uuid not null references commerce.owner_accounts, verified_at timestamptz not null default now());
create table commerce.history(id bigint generated always as identity primary key, order_id uuid not null references commerce.orders,
 at timestamptz not null default now(), message text not null);
create table commerce.owner_audit(id bigint generated always as identity primary key, actor uuid references commerce.owner_accounts,
 action text not null, order_id uuid references commerce.orders, at timestamptz not null default now(), detail jsonb not null default '{}');
create table commerce.inventory_audit(id bigint generated always as identity primary key, sku text not null, at timestamptz not null default now(),
 old_on_hand integer, new_on_hand integer not null, old_reserved integer, new_reserved integer not null, transaction_id bigint not null default txid_current());
create table commerce.rate_limits(key text not null, bucket bigint not null, count integer not null check(count>0), primary key(key,bucket));

create function commerce.immutable() returns trigger language plpgsql set search_path='' as $$begin raise exception 'Immutable commerce record'; end$$;
create function commerce.inventory_log() returns trigger language plpgsql set search_path='' as $$begin
 insert into commerce.inventory_audit(sku,old_on_hand,new_on_hand,old_reserved,new_reserved) values(new.sku,old.on_hand,new.on_hand,old.reserved,new.reserved); return new; end$$;
create trigger inventory_log after insert or update on commerce.inventory for each row execute function commerce.inventory_log();
create function commerce.reserve_stock() returns trigger language plpgsql set search_path='' as $$declare status text; begin
 select fulfilment into status from commerce.orders where id=new.order_id for update;
 if TG_OP='INSERT' then
  if new.state<>'active' or status<>'awaiting_contact' then raise exception 'Invalid reservation'; end if;
  update commerce.inventory set reserved=reserved+new.quantity where sku=new.sku and on_hand-reserved>=new.quantity;
  if not found then raise exception 'Stock unavailable' using errcode='P0001'; end if;
 elsif old.state<>'active' or new.order_id<>old.order_id or new.sku<>old.sku or new.quantity<>old.quantity or new.expires_at<>old.expires_at then
  raise exception 'Reservation is immutable';
 elsif new.state='released' and status in ('cancelled','expired') then
  update commerce.inventory set reserved=reserved-new.quantity where sku=new.sku;
 elsif new.state='consumed' and status='shipped' then
  update commerce.inventory set reserved=reserved-new.quantity,on_hand=on_hand-new.quantity where sku=new.sku;
 else raise exception 'Invalid reservation transition'; end if;
 return new; end$$;
create trigger reserve_stock before insert or update on commerce.reservations for each row execute function commerce.reserve_stock();
create function commerce.check_lines() returns trigger language plpgsql set search_path='' as $$declare oid uuid; expected integer; actual bigint; begin
 oid:=new.order_id; select subtotal into expected from commerce.orders where id=oid;
 select sum(line_total) into actual from commerce.order_lines where order_id=oid;
 if actual is distinct from expected then raise exception 'Order total does not match immutable lines'; end if; return null; end$$;
create constraint trigger check_lines after insert on commerce.order_lines deferrable initially deferred for each row execute function commerce.check_lines();
create function commerce.check_payment() returns trigger language plpgsql set search_path='' as $$declare o commerce.orders; begin
 select * into o from commerce.orders where id=new.order_id for update;
 if TG_TABLE_NAME='advance_verifications' then
  if o.fulfilment<>'confirmed' or o.payment<>'advance_pending' or new.amount<>o.advance or o.expires_at<=now() then raise exception 'Advance verification not allowed'; end if;
 else
  if o.fulfilment<>'delivered' or o.payment<>'advance_verified' or new.amount<>o.cod_balance then raise exception 'COD collection not allowed'; end if;
 end if; return new; end$$;
create trigger check_payment before insert on commerce.advance_verifications for each row execute function commerce.check_payment();
create trigger check_payment before insert on commerce.cod_collections for each row execute function commerce.check_payment();
-- Narrow definer: auth.sessions is otherwise inaccessible to the runtime role.
create function commerce.auth_session_valid(sid uuid, uid uuid) returns boolean language plpgsql security definer stable set search_path='' as $$begin
 return exists(select 1 from auth.sessions where id=sid and user_id=uid and (not_after is null or not_after>now())); end$$;
revoke all on function commerce.auth_session_valid(uuid,uuid) from public, anon, authenticated;
grant execute on function commerce.auth_session_valid(uuid,uuid) to dearelle_app;

do $$declare t text; begin
 foreach t in array array['settings','products','skus','inventory','owner_accounts','owner_sessions','orders','order_lines','idempotency','reservations','advance_verifications','cod_collections','history','owner_audit','inventory_audit','rate_limits'] loop
 execute format('alter table commerce.%I enable row level security',t);
 execute format('create policy server_only on commerce.%I to dearelle_app using (true) with check (true)',t);
 execute format('revoke all on commerce.%I from public,anon,authenticated',t);
 end loop;
 foreach t in array array['order_lines','advance_verifications','cod_collections','history','owner_audit','inventory_audit','idempotency'] loop
 execute format('create trigger immutable before update or delete on commerce.%I for each row execute function commerce.immutable()',t);
 end loop;
end$$;
grant select on all tables in schema commerce to dearelle_app;
grant insert on commerce.orders,commerce.order_lines,commerce.idempotency,commerce.reservations,commerce.advance_verifications,commerce.cod_collections,commerce.history,commerce.owner_audit,commerce.inventory_audit,commerce.owner_sessions,commerce.rate_limits to dearelle_app;
grant update on commerce.orders,commerce.reservations,commerce.inventory,commerce.owner_sessions,commerce.rate_limits to dearelle_app;
grant usage,select on all sequences in schema commerce to dearelle_app;
revoke all on all functions in schema commerce from public,anon,authenticated;
-- Guard durable state even if a future server caller bypasses the repository.
create or replace function commerce.guard_order() returns trigger language plpgsql set search_path='' as $$begin
 if ((new.guest_hash<>old.guest_hash or new.customer<>old.customer) and not (current_user=(select pg_get_userbyid(nspowner) from pg_namespace where nspname='commerce') and coalesce(current_setting('commerce.retention',true),'')='approved')) or new.quote<>old.quote or new.subtotal<>old.subtotal or new.total<>old.total or new.advance<>old.advance or new.cod_balance<>old.cod_balance or new.created_at<>old.created_at or new.expires_at<>old.expires_at or new.mode<>old.mode then raise exception 'Order snapshots are immutable'; end if;
 if new.version<>old.version+1 then raise exception 'Order version must advance once'; end if;
 if new.fulfilment<>old.fulfilment then
  if not ((old.fulfilment='awaiting_contact' and new.fulfilment in ('confirmed','cancelled','expired')) or (old.fulfilment='confirmed' and new.fulfilment in ('packed','cancelled','expired')) or (old.fulfilment='packed' and new.fulfilment in ('shipped','cancelled')) or (old.fulfilment='shipped' and new.fulfilment='delivered')) then raise exception 'Invalid fulfilment transition'; end if;
  if new.fulfilment in ('packed','shipped','delivered') and new.payment<>'advance_verified' then raise exception 'Verified advance required'; end if;
  if new.fulfilment='expired' and (old.payment<>'advance_pending' or old.expires_at>now()) then raise exception 'Order cannot expire'; end if;
  if new.fulfilment='shipped' and length(trim(new.tracking))=0 then raise exception 'Tracking required'; end if;
 end if;
 if new.payment<>old.payment and not ((old.payment='advance_pending' and new.payment='advance_verified' and exists(select 1 from commerce.advance_verifications where order_id=new.id)) or (old.payment='advance_verified' and new.payment='cod_collected' and exists(select 1 from commerce.cod_collections where order_id=new.id))) then raise exception 'Immutable payment record required'; end if;
 return new; end$$;
create trigger guard_order before update on commerce.orders for each row execute function commerce.guard_order();
create function commerce.check_order_complete() returns trigger language plpgsql set search_path='' as $$begin
 if new.subtotal is distinct from (select sum(line_total) from commerce.order_lines where order_id=new.id) then raise exception 'Order lines required'; end if;
 if exists(select 1 from commerce.order_lines l left join commerce.reservations r using(order_id,sku) where l.order_id=new.id and (r.quantity is null or l.quantity<>r.quantity)) then raise exception 'Matching reservations required'; end if;
 return null; end$$;
create constraint trigger check_order_complete after insert on commerce.orders deferrable initially deferred for each row execute function commerce.check_order_complete();
revoke all on function commerce.guard_order(),commerce.check_order_complete() from public,anon,authenticated;

-- Administrative, opt-in privacy maintenance. Not callable by the application or Data API.
create function commerce.anonymize_closed_orders() returns integer language plpgsql set search_path='' as $$
declare days integer; approved boolean; affected integer:=0; r record;
begin
 if current_user<>(select pg_get_userbyid(nspowner) from pg_namespace where nspname='commerce') then raise exception 'Schema owner required'; end if;
 select retention_days,retention_approved into days,approved from commerce.settings;
 if not approved or days is null then raise exception 'Retention policy is not approved'; end if;
 perform set_config('commerce.retention','approved',true);
 for r in select id from commerce.orders where created_at<now()-days*interval '1 day'
  and customer->>'name'<>'Customer details removed'
  and ((fulfilment in ('cancelled','expired') and payment='advance_pending') or (fulfilment='delivered' and payment='cod_collected'))
  for update skip locked loop
  update commerce.orders set customer='{"name":"Customer details removed","email":"","phone":"","address":"","city":"","state":"","pin":"","country":"India"}'::jsonb,
   guest_hash=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),version=version+1 where id=r.id;
  insert into commerce.owner_audit(action,order_id,detail) values('pii_anonymized',r.id,jsonb_build_object('approved_retention_days',days));
  insert into commerce.history(order_id,message) values(r.id,'Customer contact details removed under the approved retention policy; financial snapshots preserved.');
  affected:=affected+1;
 end loop;
 perform set_config('commerce.retention','',true);
 return affected;
end$$;
revoke all on function commerce.anonymize_closed_orders() from public,anon,authenticated,dearelle_app;
