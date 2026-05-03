-- Müşteri kartları için tam snapshot geçmişi (audit).
-- Ana tabloda UPDATE/DELETE öncesi ve INSERT sonrası kayıt yazılır.

CREATE TABLE public.kurbanlik_hesap_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hayvan_number text NOT NULL,
  snapshot jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete'))
);

CREATE INDEX kurbanlik_hesap_history_hayvan_number_recorded_at_idx
  ON public.kurbanlik_hesap_history (hayvan_number, recorded_at DESC);

COMMENT ON TABLE public.kurbanlik_hesap_history IS
  'kurbanlık_hesap satırlarının geçmiş snapshotları; tetikleyici ile dolar.';

-- Önceki hal / silinen satır (UPDATE ve DELETE)
CREATE OR REPLACE FUNCTION public.log_kurbanlik_hesap_history_ud()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.kurbanlik_hesap_history (hayvan_number, snapshot, action)
    VALUES (
      OLD.number,
      to_jsonb(row_to_json(OLD)),
      'update'
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.kurbanlik_hesap_history (hayvan_number, snapshot, action)
    VALUES (
      OLD.number,
      to_jsonb(row_to_json(OLD)),
      'delete'
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS kurbanlik_hesap_history_ud ON public."kurbanlık_hesap";
CREATE TRIGGER kurbanlik_hesap_history_ud
  BEFORE UPDATE OR DELETE ON public."kurbanlık_hesap"
  FOR EACH ROW
  EXECUTE FUNCTION public.log_kurbanlik_hesap_history_ud();

-- İlk oluşturma kaydı
CREATE OR REPLACE FUNCTION public.log_kurbanlik_hesap_history_ins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.kurbanlik_hesap_history (hayvan_number, snapshot, action)
  VALUES (
    NEW.number,
    to_jsonb(row_to_json(NEW)),
    'create'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS kurbanlik_hesap_history_ins ON public."kurbanlık_hesap";
CREATE TRIGGER kurbanlik_hesap_history_ins
  AFTER INSERT ON public."kurbanlık_hesap"
  FOR EACH ROW
  EXECUTE FUNCTION public.log_kurbanlik_hesap_history_ins();

ALTER TABLE public.kurbanlik_hesap_history ENABLE ROW LEVEL SECURITY;

-- Uygulama bu tabloya doğrudan yazmaz; yalnızca tetikleyici (SECURITY DEFINER) yazar.
CREATE POLICY "Anon geçmişi okuyabilir"
  ON public.kurbanlik_hesap_history
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated geçmişi okuyabilir"
  ON public.kurbanlik_hesap_history
  FOR SELECT
  TO authenticated
  USING (true);

GRANT SELECT ON public.kurbanlik_hesap_history TO anon;
GRANT SELECT ON public.kurbanlik_hesap_history TO authenticated;
