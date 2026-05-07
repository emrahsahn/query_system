-- Telefon numarasını opsiyonel hale getirir.
-- - phone_number üzerindeki NOT NULL kısıtı kaldırılır.
-- - Önceki migrasyondaki yer tutucu '00000000000' değerleri boş string'e (`''`)
--   dönüştürülür ki listelerde "geçerli bir telefon" gibi görünmesin.

UPDATE public."kurbanlık_hesap"
   SET phone_number = ''
 WHERE phone_number = '00000000000';

ALTER TABLE public."kurbanlık_hesap"
  ALTER COLUMN phone_number DROP NOT NULL;
