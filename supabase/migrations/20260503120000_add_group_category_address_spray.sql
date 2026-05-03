-- Yeni alanlar: grup kategorisi, adres, sıkılan boya rengi.
-- Supabase Dashboard > SQL Editor veya `supabase db push`.

ALTER TABLE public."kurbanlık_hesap"
  ADD COLUMN IF NOT EXISTS group_category text DEFAULT '';

ALTER TABLE public."kurbanlık_hesap"
  ADD COLUMN IF NOT EXISTS address text DEFAULT '';

ALTER TABLE public."kurbanlık_hesap"
  ADD COLUMN IF NOT EXISTS spray_paint_color text DEFAULT '';
