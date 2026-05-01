-- Ödeme durumu kolonunu kurbanlık_hesap tablosuna ekler.
-- Supabase Dashboard > SQL Editor'e yapıştırarak veya
-- `supabase db push` komutuyla çalıştırın.

ALTER TABLE public."kurbanlık_hesap"
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Belirsiz';
