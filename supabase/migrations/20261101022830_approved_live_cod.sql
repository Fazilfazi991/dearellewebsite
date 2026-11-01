-- Explicitly authorized public COD launch. Intake stays OFF until owner activation.
alter table commerce.settings drop constraint settings_public_intake_check;
alter table commerce.orders drop constraint orders_mode_check;
alter table commerce.orders add constraint orders_mode_check check(mode in ('test','live'));
alter table commerce.orders alter column expires_at drop not null;
alter table commerce.reservations alter column expires_at drop not null;

create function commerce.guard_live_intake() returns trigger language plpgsql set search_path='' as $$begin
 if new.mode='live' then
  if not (select public_intake from commerce.settings) or not exists(select 1 from commerce.owner_accounts) then
   raise exception 'Public ordering is not open';
  end if;
  if new.expires_at is not null then raise exception 'Live reservation timeout is not approved'; end if;
 elsif new.expires_at is null then raise exception 'Test reservation expiry required'; end if;
 return new;
end$$;
create trigger guard_live_intake before insert on commerce.orders for each row execute function commerce.guard_live_intake();
revoke all on function commerce.guard_live_intake() from public,anon,authenticated;

create or replace function commerce.reserve_stock() returns trigger language plpgsql set search_path='' as $$declare status text; begin
 select fulfilment into status from commerce.orders where id=new.order_id for update;
 if TG_OP='INSERT' then
  if new.state<>'active' or status<>'awaiting_contact' then raise exception 'Invalid reservation'; end if;
  update commerce.inventory set reserved=reserved+new.quantity where sku=new.sku and on_hand-reserved>=new.quantity;
  if not found then raise exception 'Stock unavailable' using errcode='P0001'; end if;
 elsif old.state<>'active' or new.order_id<>old.order_id or new.sku<>old.sku or new.quantity<>old.quantity or new.expires_at is distinct from old.expires_at then
  raise exception 'Reservation is immutable';
 elsif new.state='released' and status in ('cancelled','expired') then
  update commerce.inventory set reserved=reserved-new.quantity where sku=new.sku;
 elsif new.state='consumed' and status='shipped' then
  update commerce.inventory set reserved=reserved-new.quantity,on_hand=on_hand-new.quantity where sku=new.sku;
 else raise exception 'Invalid reservation transition'; end if;
 return new; end$$;

create or replace function commerce.guard_order() returns trigger language plpgsql set search_path='' as $$begin
 if ((new.guest_hash<>old.guest_hash or new.customer<>old.customer) and not (current_user=(select pg_get_userbyid(nspowner) from pg_namespace where nspname='commerce') and coalesce(current_setting('commerce.retention',true),'')='approved')) or new.quote<>old.quote or new.subtotal<>old.subtotal or new.total<>old.total or new.advance<>old.advance or new.cod_balance<>old.cod_balance or new.created_at<>old.created_at or new.expires_at is distinct from old.expires_at or new.mode<>old.mode then raise exception 'Order snapshots are immutable'; end if;
 if new.version<>old.version+1 then raise exception 'Order version must advance once'; end if;
 if new.fulfilment<>old.fulfilment then
  if not ((old.fulfilment='awaiting_contact' and new.fulfilment in ('confirmed','cancelled','expired')) or (old.fulfilment='confirmed' and new.fulfilment in ('packed','cancelled','expired')) or (old.fulfilment='packed' and new.fulfilment in ('shipped','cancelled')) or (old.fulfilment='shipped' and new.fulfilment='delivered')) then raise exception 'Invalid fulfilment transition'; end if;
  if new.fulfilment in ('packed','shipped','delivered') and new.payment<>'advance_verified' then raise exception 'Verified advance required'; end if;
  if new.fulfilment='expired' and (old.mode='live' or old.expires_at is null or old.payment<>'advance_pending' or old.expires_at>now()) then raise exception 'Order cannot expire'; end if;
  if new.fulfilment='shipped' and length(trim(new.tracking))=0 then raise exception 'Tracking required'; end if;
 end if;
 if new.payment<>old.payment and not ((old.payment='advance_pending' and new.payment='advance_verified' and exists(select 1 from commerce.advance_verifications where order_id=new.id)) or (old.payment='advance_verified' and new.payment='cod_collected' and exists(select 1 from commerce.cod_collections where order_id=new.id))) then raise exception 'Immutable payment record required'; end if;
 return new; end$$;
