"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { searchByNumber } from "@/lib/supabase/queries";
import { applyPartialPayment, updateCustomerField, updateCustomerFields } from "@/actions/customers";
import type { Customer } from "@/lib/types";
import { PAYMENT_OPTIONS, GROUP_CATEGORIES } from "@/lib/types";
import { CustomerCard } from "@/components/customer-card";
import { CustomerHistoryPanel } from "@/components/customer-history-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { formatMoneyInputTR, formatPhoneInputTR, parseMoneyTR } from "@/lib/input-format";

const UPDATE_FIELDS = [
  { value: "number", label: "Numara" },
  { value: "type", label: "Cins" },
  { value: "special", label: "Özellik" },
  { value: "color_of_earring", label: "Küpe Rengi" },
  { value: "color_of_animal", label: "Hayvan Rengi" },
  { value: "spray_paint_color", label: "Sıkılan Boya" },
  { value: "whose", label: "Sahip" },
  { value: "from_whom", label: "Kimden" },
  { value: "price", label: "Fiyat (TL)" },
  { value: "phone_number", label: "Telefon Numarası" },
  { value: "payment_method", label: "Ödeme Yöntemi" },
  { value: "payment_status", label: "Ödeme Durumu" },
  { value: "group_category", label: "Grup Kategorisi" },
  { value: "address", label: "Adres" },
  { value: "note", label: "Not" },
];

export default function GuncelledPage() {
  const [searchNum, setSearchNum] = useState("");
  const [preview, setPreview] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [field, setField] = useState("type");
  const [newValue, setNewValue] = useState("");
  const [payStatus, setPayStatus] = useState("Belirsiz");
  const [groupCat, setGroupCat] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);

  function syncFormFromCustomer(c: Customer | null) {
    if (!c) {
      setPayStatus("Belirsiz");
      setGroupCat("");
      return;
    }
    setPayStatus(c.payment_status);
    setGroupCat(c.group_category ?? "");
  }

  useEffect(() => {
    if (!preview) return;
    if (field === "note") setNewValue(preview.note ?? "");
    else if (field === "address") setNewValue(preview.address ?? "");
  }, [preview, field]);

  async function handleSearch() {
    if (!searchNum.trim()) return;
    setSearching(true);
    setError("");
    setPreview(null);
    syncFormFromCustomer(null);
    const supabase = createClient();
    try {
      const res = await searchByNumber(supabase, searchNum.trim());
      const next = res[0] ?? null;
      setPreview(next);
      syncFormFromCustomer(next);
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

    try {
      if (field === "payment_status" && payStatus === "Kısmi Ödeme") {
        if (!paidAmount.trim()) {
          setError("Kısmi ödeme için ödenen tutarı girin.");
          return;
        }
        const result = await applyPartialPayment(preview.number, paidAmount);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setSuccess(true);
        setPaidAmount("");
        const supabase = createClient();
        const res = await searchByNumber(supabase, preview.number);
        const next = res[0] ?? null;
        setPreview(next);
        syncFormFromCustomer(next);
        setHistoryRefresh((k) => k + 1);
        setTimeout(() => setSuccess(false), 2000);
        return;
      }

      const value = field === "payment_status" ? payStatus
        : field === "group_category" ? (groupCat === "__none__" ? "" : groupCat)
        : newValue.trim();
      const allowEmpty = field === "group_category" || field === "note" || field === "address";
      if (!value && !allowEmpty) {
        setError("Yeni değer boş olamaz.");
        return;
      }

      if (field === "number" && !/^\d+$/.test(value)) {
        setError("Numara yalnızca rakamlardan oluşmalıdır.");
        return;
      }
      if (field === "price" && !Number.isFinite(parseMoneyTR(value))) {
        setError("Geçerli bir fiyat girin.");
        return;
      }
      if (field === "phone_number") {
        const clean = value.replace(/[\s\-]/g, "");
        const norm = clean.length === 10 && !clean.startsWith("0") ? "0" + clean : clean;
        if (!/^\d{11}$/.test(norm)) {
          setError("Geçerli bir telefon girin. Örn: 0532 123 45 67");
          return;
        }
      }

      const result = field === "payment_status" && value === "Ödendi"
        ? await (() => {
            const rawPaymentMethod = preview.payment_method || "";
            const separatorIdx = rawPaymentMethod.indexOf(" | ");
            const existingManual = separatorIdx === -1 ? rawPaymentMethod : rawPaymentMethod.slice(0, separatorIdx);
            const paidAllAmount = Math.max(0, Number(preview.price ?? 0));
            const autoNote = `${formatPrice(paidAllAmount)} ₺ ödendi; kalan borç ${formatPrice(0)} ₺`;
            const payment_method = existingManual.trim()
              ? `${existingManual.trim()} | ${autoNote}`
              : autoNote;
            return updateCustomerFields(preview.number, {
              payment_status: value,
              price: 0,
              payment_method,
            });
          })()
        : await updateCustomerField(preview.number, field, value);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setNewValue("");
        const supabase = createClient();
        const res = await searchByNumber(supabase, field === "number" ? value : preview.number);
        const next = res[0] ?? null;
        setPreview(next);
        syncFormFromCustomer(next);
        setHistoryRefresh((k) => k + 1);
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

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Sol panel - arama + güncelleme (yükseklik sağ panele bağlı büyümesin) */}
        <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm space-y-5 h-fit w-full min-w-0 self-start">
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
            <Select
              value={field}
              onValueChange={(v) => {
                setField(v);
                setPaidAmount("");
                if (preview && (v === "note" || v === "address")) {
                  setNewValue(v === "note" ? (preview.note ?? "") : (preview.address ?? ""));
                } else {
                  setNewValue("");
                }
              }}
            >
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
              <div className="space-y-3">
                <Select
                  value={payStatus}
                  onValueChange={(v) => {
                    setPayStatus(v);
                    if (v !== "Kısmi Ödeme") setPaidAmount("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
                {payStatus === "Kısmi Ödeme" && preview && (
                  <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Mevcut kalan tutar (fiyat):{" "}
                      <span className="font-semibold text-foreground">
                        {formatPrice(Number(preview.price ?? 0))} ₺
                      </span>
                    </p>
                    <Label htmlFor="paid-partial">Ödenen miktar (TL)</Label>
                    <Input
                      id="paid-partial"
                      inputMode="decimal"
                      autoComplete="off"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(formatMoneyInputTR(e.target.value))}
                      placeholder="Örn: 5.000,50"
                    />
                  </div>
                )}
              </div>
            ) : field === "group_category" ? (
              <Select value={groupCat || "__none__"} onValueChange={setGroupCat}>
                <SelectTrigger>
                  <SelectValue placeholder="Grup Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Grup Seçilmedi —</SelectItem>
                  {GROUP_CATEGORIES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : field === "note" || field === "address" ? (
              <Textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={field === "address" ? "Adres" : "Not (en fazla 2000 karakter)"}
                rows={5}
                maxLength={field === "note" ? 2000 : undefined}
                className="resize-y min-h-[100px]"
              />
            ) : (
              <Input
                value={newValue}
                onChange={(e) => {
                  const v = e.target.value;
                  if (field === "price") setNewValue(formatMoneyInputTR(v));
                  else if (field === "phone_number") setNewValue(formatPhoneInputTR(v));
                  else setNewValue(v);
                }}
                inputMode={field === "price" ? "decimal" : field === "phone_number" ? "tel" : undefined}
                placeholder={
                  field === "price"
                    ? "Örn: 15.400,50"
                    : field === "phone_number"
                      ? "Örn: 0532 123 45 67"
                      : "Yeni değer"
                }
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
        <div className="space-y-4 min-w-0">
          <h2 className="font-semibold text-foreground">👁️ Mevcut Kayıt</h2>
          {preview ? (
            <>
              <CustomerCard customer={preview} />
              <CustomerHistoryPanel
                key={`${preview.number}-${historyRefresh}`}
                hayvanNumber={preview.number}
                currentCustomer={preview}
              />
            </>
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
