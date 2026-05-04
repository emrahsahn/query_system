-- Serbest metin müşteri notu (kart + formlar).
ALTER TABLE public."kurbanlık_hesap"
  ADD COLUMN IF NOT EXISTS note text DEFAULT '';
