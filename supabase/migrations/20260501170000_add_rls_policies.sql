-- kurbanlık_hesap tablosu için RLS policy'leri
-- Uygulama anon key ile tüm CRUD işlemlerini yapabilsin
-- Aynı isimli policy tekrar oluşturulacaksa önce kaldırılır (SQL Editor / yeniden push).

DROP POLICY IF EXISTS "Anon okuyabilir" ON public."kurbanlık_hesap";
DROP POLICY IF EXISTS "Anon ekleyebilir" ON public."kurbanlık_hesap";
DROP POLICY IF EXISTS "Anon güncelleyebilir" ON public."kurbanlık_hesap";
DROP POLICY IF EXISTS "Anon silebilir" ON public."kurbanlık_hesap";

create policy "Anon okuyabilir"
  on public."kurbanlık_hesap"
  for select
  to anon
  using (true);

create policy "Anon ekleyebilir"
  on public."kurbanlık_hesap"
  for insert
  to anon
  with check (true);

create policy "Anon güncelleyebilir"
  on public."kurbanlık_hesap"
  for update
  to anon
  using (true)
  with check (true);

create policy "Anon silebilir"
  on public."kurbanlık_hesap"
  for delete
  to anon
  using (true);
