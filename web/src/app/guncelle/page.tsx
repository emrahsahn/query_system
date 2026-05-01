"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { searchByNumber } from "@/lib/supabase/queries";
import { updateCustomerField } from "@/actions/customers";
import type { Customer } from "@/lib/types";
import { PAYMENT_OPTIONS } from "@/lib/types";
import { CustomerCard } from "@/components/customer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Search } from "lucide-react";

const UPDATE_FIELDS = [
  { value: "number", label: "Numara" },
  { value: "type", label: "Cins" },
  { value: "special", label: "Özellik" },
  { value: "color_of_earring", label: "Küpe Rengi" },
  { value: "color_of_animal", label: "Hayvan Rengi" },
  { value: "whose", label: "Sahip" },
  { value: "from_whom", label: "Kimden" },
  { value: "price", label: "Fiyat (TL)" },
  { value: "phone_number", label: "Telefon Numarası" },
  { value: "payment_method", label: "Ödeme Yöntemi" },
  { value: "payment_status", label: "Ödeme Durumu" },
];

export default function GuncelledPage() {
  const [searchNum, setSearchNum] = useState("");
  const [preview, setPreview] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [field, setField] = useState("type");
  const [newValue, setNewValue] = useState("");
  const [payStatus, setPayStatus] = useState("Belirsiz");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!searchNum.trim()) return;
    setSearching(true);
    setError("");
    setPreview(null);
    const supabase = createClient();
    try {
      const res = await searchByNumber(supabase, searchNum.trim());
      setPreview(res[0] ?? null);
      if (!res[0]) setError(`#${searchNum} numaralı kayıt bulunamadı.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hata oluştu.");
    } finally {
      setSearching(false);
    }
  }

  async function handleUpdate() {
    if (!preview) return;
    setError("");
    setSubmitting(true);

    const value = field === "payment_status" ? payStatus : newValue.trim();
    if (!value) { setError("Yeni değer boş olamaz."); setSubmitting(false); return; }

    if (field === "number" && !/^\d+$/.test(value)) {
      setError("Numara yalnızca rakamlardan oluşmalıdır."); setSubmitting(false); return;
    }
    if (field === "price" && isNaN(Number(value.replace(",", ".")))) {
      setError("Geçerli bir fiyat girin."); setSubmitting(false); return;
    }
    if (field === "phone_number") {
      const clean = value.replace(/[\s\-]/g, "");
      const norm = clean.length === 10 && !clean.startsWith("0") ? "0" + clean : clean;
      if (!/^\d{11}$/.test(norm)) {
        setError("Geçerli bir telefon girin. Örn: 0532 123 45 67"); setSubmitting(false); return;
      }
    }

    try {
      const result = await updateCustomerField(preview.number, field, value);
      if (result?.error) { setError(result.error); } else {
        setSuccess(true);
        setNewValue("");
        // Güncellenen kartı yenile
        const supabase = createClient();
        const res = await searchByNumber(supabase, field === "number" ? value : preview.number);
        setPreview(res[0] ?? null);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Güncelleme hatası.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground text-center">🔄 Müşteri Bilgisi Güncelle</h1>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Sol panel - arama + güncelleme */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm space-y-5">
          <h2 className="font-semibold text-foreground">🎯 İşlem Detayları</h2>

          {/* Kayıt ara */}
          <div className="space-y-2">
            <Label>🔑 Mevcut Hayvan Numarası</Label>
            <div className="flex gap-2">
              <Input
                value={searchNum}
                onChange={(e) => setSearchNum(e.target.value)}
                placeholder="Hayvan numarası"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button variant="outline" size="icon" onClick={handleSearch} disabled={searching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Alan seçimi */}
          <div className="space-y-2">
            <Label>Güncellenecek Alan</Label>
            <Select value={field} onValueChange={(v) => { setField(v); setNewValue(""); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UPDATE_FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Yeni değer */}
          <div className="space-y-2">
            <Label>✏️ Yeni Değer</Label>
            {field === "payment_status" ? (
              <Select value={payStatus} onValueChange={setPayStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={field === "price" ? "Örn: 15400.50" : field === "phone_number" ? "Örn: 0532 123 45 67" : "Yeni değer"}
              />
            )}
          </div>

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-700/20 border border-green-700 px-4 py-3 text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Güncelleme başarılı!
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button className="w-full" onClick={handleUpdate} disabled={submitting || !preview}>
            {submitting ? "Güncelleniyor..." : "🔄 Bilgileri Güncelle"}
          </Button>
        </div>

        {/* Sağ panel - mevcut kayıt önizleme */}
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">👁️ Mevcut Kayıt</h2>
          {preview ? (
            <CustomerCard customer={preview} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Numarayı arayarak kaydı görüntüleyin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
