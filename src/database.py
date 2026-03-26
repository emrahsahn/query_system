# src/database.py
import json
from supabase import create_client, Client
from src.backbone import SUPABASE_URL, SUPABASE_KEY
from src.models import Describe

class Library:
    """Supabase‑tabanlı veri katmanı. SQLite yerine Supabase kullanır."""

    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase URL / KEY tanımlı değil. .env dosyasını kontrol et.")
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # --------------------------------------------------------------
    # CRUD – CREATE
    # --------------------------------------------------------------
    def add(self, customer: Describe):
        """Yeni müşteri kaydını Supabase'e ekler."""
        # Telefonu DB’ye kaydederken aynı formatı koruyoruz
        phone = f"{customer.phone_number[:4]} {customer.phone_number[4:7]} " \
                f"{customer.phone_number[7:9]} {customer.phone_number[9:]}"
        data = {
            "number":           customer.number,
            "type":             customer.type,
            "special":          customer.special,
            "color_of_earring": customer.color_of_earring,
            "color_of_animal":  customer.color_of_animal,
            "whose":            customer.whose,
            "from_whom":        customer.from_whom,
            "price":            float(customer.price) if customer.price else 0,
            "phone_number":     phone,
            "payment_method":   getattr(customer, "payment_method", "")
        }
        resp = self.supabase.table("kurbanlık_hesap").insert(data).execute()
        if resp.error:
            raise RuntimeError(f"Supabase INSERT hatası: {resp.error.message}")

    # --------------------------------------------------------------
    # READ – SELECT
    # --------------------------------------------------------------
    def _fetch(self, query):
        """Supabase response → Describe objeleri listesi."""
        rows = query.data
        return [Describe(**row) for row in rows]

    def exhibit_customer(self):
        """Tüm kayıtları getir."""
        resp = self.supabase.table("kurbanlık_hesap").select("*").execute()
        return self._fetch(resp)

    # Tek tek sorgular (numara, whose, vs.) ------------------------------------------------
    def query_animal_number(self, number, return_objects=False):
        resp = self.supabase.table("kurbanlık_hesap")\
                .select("*").eq("number", number).execute()
        if return_objects:
            return self._fetch(resp)
        return "\n".join(str(Describe(**r)) for r in resp.data)

    def query_animal_whose(self, whose, return_objects=False):
        resp = self.supabase.table("kurbanlık_hesap")\
                .select("*").eq("whose", whose).execute()
        if return_objects:
            return self._fetch(resp)
        return "\n".join(str(Describe(**r)) for r in resp.data)

    def query_animal_whose_and_number(self, whose, number, return_objects=False):
        resp = self.supabase.table("kurbanlık_hesap")\
                .select("*").eq("whose", whose).eq("number", number).execute()
        if return_objects:
            return self._fetch(resp)
        return "\n".join(str(Describe(**r)) for r in resp.data)

    def query_animal_type(self, kind, return_objects=False):
        resp = self.supabase.table("kurbanlık_hesap")\
                .select("*").eq("type", kind).execute()
        if return_objects:
            return self._fetch(resp)
        return "\n".join(str(Describe(**r)) for r in resp.data)

    def query_animal_phone_number(self, phone, return_objects=False):
        resp = self.supabase.table("kurbanlık_hesap")\
                .select("*").eq("phone_number", phone).execute()
        if return_objects:
            return self._fetch(resp)
        return "\n".join(str(Describe(**r)) for r in resp.data)

    # --------------------------------------------------------------
    # UPDATE – PATCH
    # --------------------------------------------------------------
    def _update_field(self, pk, field, new_val):
        resp = self.supabase.table("kurbanlık_hesap")\
                .update({field: new_val})\
                .eq("number", pk).execute()
        if resp.error:
            raise RuntimeError(f"Supabase UPDATE hatası: {resp.error.message}")

    def upgrade_data_number(self, number_to_update, new_number):
        self._update_field(number_to_update, "number", new_number)

    def upgrade_data_type(self, number_to_update, new_kind):
        self._update_field(number_to_update, "type", new_kind)

    def upgrade_data_feature(self, number_to_update, new_special):
        self._update_field(number_to_update, "special", new_special)

    def upgrade_data_color_of_earring(self, number_to_update, new_color):
        self._update_field(number_to_update, "color_of_earring", new_color)

    def upgrade_data_color_of_animal(self, number_to_update, new_color):
        self._update_field(number_to_update, "color_of_animal", new_color)

    def upgrade_data_whose(self, number_to_update, new_whose):
        self._update_field(number_to_update, "whose", new_whose)

    def upgrade_data_from_whom(self, number_to_update, new_from):
        self._update_field(number_to_update, "from_whom", new_from)

    def upgrade_data_price(self, number_to_update, new_price):
        self._update_field(number_to_update, "price", float(new_price))

    def upgrade_data_phone_number(self, number_to_update, new_phone):
        # aynı formatlama (4‑3‑2‑2) uygulanır
        formatted = f"{new_phone[:4]} {new_phone[4:7]} {new_phone[7:9]} {new_phone[9:]}"
        self._update_field(number_to_update, "phone_number", formatted)

    def upgrade_data_payment_method(self, number_to_update, new_payment):
        self._update_field(number_to_update, "payment_method", new_payment)

    # --------------------------------------------------------------
    # DELETE
    # --------------------------------------------------------------
    def delete_data_from_ID(self, personelID):
        resp = self.supabase.table("kurbanlık_hesap")\
                .delete().eq("number", personelID).execute()
        if resp.error:
            raise RuntimeError(f"Supabase DELETE hatası: {resp.error.message}")

    # --------------------------------------------------------------
    # İSTATİSTİKLER
    # --------------------------------------------------------------
    def count_data(self):
        resp = self.supabase.table("kurbanlık_hesap").select("number", count="exact").execute()
        return resp.count  # PostgreSQL‑den gelen toplam satır sayısı

    def sum_price(self):
        """Toplam alacak (price) değerini döndürür."""
        resp = self.supabase.table("kurbanlık_hesap").select("price").execute()
        total = 0.0
        for row in resp.data:
            try:
                total += float(row["price"])
            except (TypeError, ValueError):
                continue
        return total
