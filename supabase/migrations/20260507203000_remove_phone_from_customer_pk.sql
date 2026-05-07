-- Telefon numarasını composite primary key'den çıkarır.
-- Nihai PK: (random_id, number)

ALTER TABLE public."kurbanlık_hesap"
  DROP CONSTRAINT IF EXISTS "kurbanlık_hesap_pkey";

ALTER TABLE public."kurbanlık_hesap"
  ADD CONSTRAINT "kurbanlık_hesap_pkey"
  PRIMARY KEY (random_id, number);
