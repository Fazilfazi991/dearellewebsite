-- Owner-confirmed small black digital model is INR 699. Existing prices stay valid.
-- Catalogue content is seeded separately; this change never alters stock or orders.
begin;
alter table commerce.skus drop constraint skus_price_paise_check;
alter table commerce.skus add constraint skus_price_paise_check
  check (price_paise in (39900, 59900, 69900, 79900));
commit;
