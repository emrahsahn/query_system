-- Composite primary key migrasyonu:
-- (random_id, number) yapısına geçiş.
-- - hayvan_numarasi (`number`) artık virgülle ayrılmış birden fazla numara içerebilir.
-- - random_id otomatik üretilen kısa rastgele kimlik (varsayılan: gen_random_uuid'in ilk 10 hex karakteri).
-- - phone_number normalize edilerek (sadece 11 haneli, '0' ile başlayan rakamlar) saklanır.
-- Bu migrasyon mevcut verileri güvenle korur.

-- ─── 1) random_id kolonunu ekle ────────────────────────────────────────────────
ALTER TABLE public."kurbanlık_hesap"
  ADD COLUMN IF NOT EXISTS random_id text;

-- 1a) Mevcut satırlar için unique random_id üret
UPDATE public."kurbanlık_hesap"
   SET random_id = substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)
 WHERE random_id IS NULL;

-- 1b) NOT NULL ve DEFAULT garantile
ALTER TABLE public."kurbanlık_hesap"
  ALTER COLUMN random_id SET NOT NULL,
  ALTER COLUMN random_id SET DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);

-- ─── 2) phone_number'ı normalize et ────────────────────────────────────────────
-- Hedef: 11 haneli, '0' ile başlayan, sadece rakamlardan oluşan değer.
-- Boş/null/geçersiz olanlar '00000000000' yer tutucusuyla doldurulur.
UPDATE public."kurbanlık_hesap"
   SET phone_number = CASE
     WHEN phone_number IS NULL THEN '00000000000'
     WHEN length(regexp_replace(phone_number, '\D', '', 'g')) = 11
          AND regexp_replace(phone_number, '\D', '', 'g') ~ '^0'
       THEN regexp_replace(phone_number, '\D', '', 'g')
     WHEN length(regexp_replace(phone_number, '\D', '', 'g')) = 10
       THEN '0' || regexp_replace(phone_number, '\D', '', 'g')
     WHEN length(regexp_replace(phone_number, '\D', '', 'g')) = 12
          AND regexp_replace(phone_number, '\D', '', 'g') ~ '^90'
       THEN '0' || substring(regexp_replace(phone_number, '\D', '', 'g') from 3)
     ELSE '00000000000'
   END;

ALTER TABLE public."kurbanlık_hesap"
  ALTER COLUMN phone_number SET NOT NULL;

-- Telefon formatını uygulama düzeyinde garantiliyoruz (CHECK constraint eklemiyoruz ki
-- yer tutucu '00000000000' değerleri reddedilmesin).

-- ─── 3) Eski PK'yi kaldır ──────────────────────────────────────────────────────
-- Trigger'lar tabloyu lock edebileceğinden önce trigger'ları drop edelim.
DROP TRIGGER IF EXISTS kurbanlik_hesap_history_ud ON public."kurbanlık_hesap";
DROP TRIGGER IF EXISTS kurbanlik_hesap_history_ins ON public."kurbanlık_hesap";

ALTER TABLE public."kurbanlık_hesap"
  DROP CONSTRAINT IF EXISTS "kurbanlık_hesap_pkey";

-- ─── 4) Yeni composite PK ──────────────────────────────────────────────────────
ALTER TABLE public."kurbanlık_hesap"
  ADD CONSTRAINT "kurbanlık_hesap_pkey"
  PRIMARY KEY (random_id, number);

-- ─── 5) History tablosuna random_id ekle ───────────────────────────────────────
ALTER TABLE public.kurbanlik_hesap_history
  ADD COLUMN IF NOT EXISTS random_id text;

CREATE INDEX IF NOT EXISTS kurbanlik_hesap_history_random_id_recorded_at_idx
  ON public.kurbanlik_hesap_history (random_id, recorded_at DESC);

-- ─── 6) Trigger fonksiyonlarını composite key farkındalığıyla yeniden oluştur ──
CREATE OR REPLACE FUNCTION public.log_kurbanlik_hesap_history_ud()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.kurbanlik_hesap_history (hayvan_number, random_id, snapshot, action)
    VALUES (
      OLD.number,
      OLD.random_id,
      to_jsonb(row_to_json(OLD)),
      'update'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.kurbanlik_hesap_history (hayvan_number, random_id, snapshot, action)
    VALUES (
      OLD.number,
      OLD.random_id,
      to_jsonb(row_to_json(OLD)),
      'delete'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER kurbanlik_hesap_history_ud
  BEFORE UPDATE OR DELETE ON public."kurbanlık_hesap"
  FOR EACH ROW
  EXECUTE FUNCTION public.log_kurbanlik_hesap_history_ud();

CREATE OR REPLACE FUNCTION public.log_kurbanlik_hesap_history_ins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.kurbanlik_hesap_history (hayvan_number, random_id, snapshot, action)
  VALUES (
    NEW.number,
    NEW.random_id,
    to_jsonb(row_to_json(NEW)),
    'create'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER kurbanlik_hesap_history_ins
  AFTER INSERT ON public."kurbanlık_hesap"
  FOR EACH ROW
  EXECUTE FUNCTION public.log_kurbanlik_hesap_history_ins();
