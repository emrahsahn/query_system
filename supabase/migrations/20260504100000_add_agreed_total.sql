-- Anlaşılan toplam tutar (kısmi ödemede price düşer; agreed_total sabit kalır).

ALTER TABLE public."kurbanlık_hesap"
  ADD COLUMN IF NOT EXISTS agreed_total double precision;

UPDATE public."kurbanlık_hesap"
SET agreed_total = price
WHERE agreed_total IS NULL;
