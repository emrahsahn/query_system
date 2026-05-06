"use client";

import { useEffect, useMemo, useState } from "react";
import type { Customer, PaymentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCustomerField, applyPartialPayment, updateCustomerFields } from "@/actions/customers";
import { PAYMENT_OPTIONS, GROUP_CATEGORIES } from "@/lib/types";
import { formatMoneyInputTR, formatPhoneInputTR, parseMoneyTR, phoneToTelHref } from "@/lib/input-format";

function splitPaymentMethod(value: string | null | undefined) {
  const raw = value || "";
  const separatorIdx = raw.indexOf(" | ");
  if (separatorIdx === -1) return { manualNote: raw, autoNote: "" };
  return {
    manualNote: raw.slice(0, separatorIdx),
    autoNote: raw.slice(separatorIdx + 3),
  };
}

function buildAutoRows(currentAuto: string, historyRows: string[]) {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const row of [currentAuto, ...historyRows]) {
    const line = row.trim();
    if (!line || seen.has(line)) continue;
    seen.add(line);
    rows.push(line);
  }
  const extractRemainingDebt = (line: string) => {
    const match = line.match(/kalan borç\s+(.+?)\s*₺/i);
    if (!match?.[1]) return Number.POSITIVE_INFINITY;
    const amount = parseMoneyTR(match[1]);
    return Number.isFinite(amount) ? amount : Number.POSITIVE_INFINITY;
  };

  // Kartta aşağı doğru gidildikçe kalan borç büyüsün.
  return rows.sort((a, b) => extractRemainingDebt(a) - extractRemainingDebt(b));
}

function paymentBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, "odendi" | "kismi" | "odenmedi" | "belirsiz"> = {
    "Ödendi": "odendi",
    "Kısmi Ödeme": "kismi",
    "Ödenmedi": "odenmedi",
    "Belirsiz": "belirsiz",
  };
  return <Badge variant={map[status] ?? "belirsiz"}>{status}</Badge>;
}

function printReceipt(customer: Customer, title: string) {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const content = `
    <html>
      <head>
        <title>Fiş</title>
        <style>
          @page { margin: 0; size: 58mm auto; }
          body { 
            background: white;
            color: black;
            width: 58mm;
            padding: 3mm;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
            -webkit-print-color-adjust: exact;
          }
          .title { text-align: center; font-weight: bold; font-size: 13px; margin-bottom: 12px; border-bottom: 1px solid black; padding-bottom: 8px; word-break: break-word; line-height: 1.2; }
          .center { text-align: center; }
          .mb-3 { margin-bottom: 12px; }
          .text-10 { font-size: 10px; }
          .uppercase { text-transform: uppercase; }
          .font-black { font-weight: 900; }
          .text-40 { font-size: 40px; margin: 4px 0; line-height: 1; }
          .flex { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px;}
          .font-bold { font-weight: bold; }
          .border-b { border-bottom: 1px dashed black; padding-bottom: 12px; margin-bottom: 12px; }
          .italic { font-style: italic; }
          .mt-2 { margin-top: 8px; }
          .break-words { word-break: break-word; }
        </style>
      </head>
      <body>
        <div class="title">${title}</div>
        <div class="center mb-3">
          <div class="text-10 uppercase font-bold" style="letter-spacing: 1px; color: #333;">HAYVAN NO</div>
          <div class="text-40 font-black">${customer.number}</div>
        </div>
        <div class="border-b">
          <div class="flex"><span class="font-bold">Sahip:</span> <span class="uppercase break-words" style="text-align: right;">${customer.whose || "-"}</span></div>
          <div class="flex"><span class="font-bold">Telefon:</span> <span>${customer.phone_number || "-"}</span></div>
        </div>
        <div class="border-b">
          <div class="flex"><span class="font-bold">Tür/Cins:</span> <span>${customer.type || "-"}</span></div>
          <div class="flex"><span class="font-bold">Küpe No:</span> <span>${customer.color_of_earring || "-"}</span></div>
          <div class="flex"><span class="font-bold">Renk:</span> <span>${customer.color_of_animal || "-"}</span></div>
          <div class="flex"><span class="font-bold">Boya:</span> <span>${customer.spray_paint_color || "-"}</span></div>
          ${customer.special
      ? `<div class="mt-2" style="font-size: 11px; background: #f0f0f0; padding: 4px; border-radius: 2px;">
                   <div class="font-bold" style="margin-bottom: 2px;">Özellik:</div>
                   <div class="break-words" style="line-height: 1.2;">${customer.special}</div>
                 </div>`
      : ""
    }
        </div>
        <div class="center text-10 italic font-bold" style="margin-top: 16px; opacity: 0.9;">
          Bizi tercih ettiğiniz için<br>teşekkür ederiz.
        </div>
      </body>
    </html>
  `;

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(content);
    doc.close();
  }

  // document.write renders synchronously for simple HTML.
  // We use a small timeout to ensure browser paints before print.
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Temizlik
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 100);
}

interface CustomerCardInnerProps {
  c: Customer;
  onFieldClick?: (label: string, key: string, value: string) => void;
  onPrintClick?: () => void;
  isPreview?: boolean;
  autoHistoryRows?: string[];
}

function CustomerCardInner({ c, onFieldClick, onPrintClick, isPreview, autoHistoryRows = [] }: CustomerCardInnerProps) {
  const { manualNote, autoNote } = splitPaymentMethod(c.payment_method);
  const autoRows = buildAutoRows(autoNote, autoHistoryRows);

  const CardContent = (
    <div className={`flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-all duration-300 ${!isPreview ? "hover:-translate-y-1 hover:shadow-lg hover:border-primary" : ""}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3 gap-2">
          <span
            className={`text-lg sm:text-xl font-extrabold text-destructive shrink-0 ${onFieldClick ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={() => onFieldClick?.("Numara", "number", c.number)}
          >
            #{c.number}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {c.group_category && (
              <span
                className={`rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] font-semibold text-primary truncate max-w-[140px] ${onFieldClick ? "cursor-pointer hover:opacity-80" : ""}`}
                title={c.group_category}
                onClick={() => onFieldClick?.("Grup Kategorisi", "group_category", c.group_category ?? "")}
              >
                📂 {c.group_category}
              </span>
            )}
            <span
              className={`rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground truncate max-w-[200px] ${onFieldClick ? "cursor-pointer hover:opacity-80" : ""}`}
              onClick={() => onFieldClick?.("Cins", "type", c.type || "")}
            >
              {c.type || "—"}
            </span>
            <div
              className={onFieldClick ? "cursor-pointer hover:opacity-80" : ""}
              onClick={() => onFieldClick?.("Ödeme Durumu", "payment_status", c.payment_status)}
            >
              {paymentBadge(c.payment_status as PaymentStatus)}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          {[
            ["✨ Özellik", "special", c.special],
            ["🏷️ Küpe", "color_of_earring", c.color_of_earring],
            ["🎨 Hayvan Rengi", "color_of_animal", c.color_of_animal],
            ["🎨 Sıkılan Boya", "spray_paint_color", c.spray_paint_color],
            ["👤 Sahip", "whose", c.whose],
            ["📦 Kimden", "from_whom", c.from_whom],
            ["📞 Telefon", "phone_number", c.phone_number],
          ].map(([label, key, val]) => {
            const str = val || "";
            const tel = key === "phone_number" ? phoneToTelHref(str) : null;
            return (
            <div
              key={key}
              className={`flex justify-between gap-2 border-b border-dashed border-border pb-1 last:border-0 ${onFieldClick ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded px-1 -mx-1" : ""}`}
              onClick={() => onFieldClick?.(label, key, str)}
            >
              <span className="text-green font-semibold shrink-0">{label}</span>
              {tel && str ? (
                <a
                  href={tel}
                  className="text-primary text-right truncate underline-offset-2 hover:underline min-w-0 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {str}
                </a>
              ) : (
                <span className="text-muted-foreground text-right truncate">{str || "—"}</span>
              )}
            </div>
            );
          })}

          {/* Payment Notes */}
          <div
            className={`flex justify-between gap-2 border-b border-dashed border-border pb-1 ${onFieldClick ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded px-1 -mx-1" : ""}`}
            onClick={() => onFieldClick?.("Ödeme", "payment_method", c.payment_method || "")}
          >
            <span className="text-green font-semibold shrink-0">💳 Ödeme Notu</span>
            <span className="text-muted-foreground text-right min-w-0 flex-1 break-words whitespace-pre-wrap">
              {manualNote || "—"}
            </span>
          </div>
          
          {autoRows.length > 0 && (
            <div
              className={`flex justify-between gap-2 border-b border-dashed border-border pb-1 ${onFieldClick ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded px-1 -mx-1" : ""}`}
              onClick={() => onFieldClick?.("Ödeme", "payment_method", c.payment_method || "")}
            >
              <span className="text-green font-semibold shrink-0 text-[11px] opacity-80 italic">💳 Bakiye Detayı</span>
              <span className="text-muted-foreground text-right min-w-0 flex-1 break-words whitespace-pre-wrap text-[11px] italic">
                {autoRows.map((row, index) => (
                  <span key={`${row}-${index}`} className="block">
                    {row}
                  </span>
                ))}
              </span>
            </div>
          )}

          {(c.address || onFieldClick) && (c.group_category === "Köye Dağıtılacaklar" || c.group_category === "Çarşıya Dağıtılacaklar") ? (
            <div
              className={`flex justify-between gap-2 border-b border-dashed border-border pb-1 ${onFieldClick ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded px-1 -mx-1" : ""}`}
              onClick={() => onFieldClick?.("📍 Adres", "address", c.address || "")}
            >
              <span className="text-green font-semibold shrink-0">📍 Adres</span>
              <span className="text-muted-foreground text-right min-w-0 flex-1 break-words whitespace-pre-wrap line-clamp-6">
                {c.address || "—"}
              </span>
            </div>
          ) : null}
        </div>

        <div
          className={`mt-3 border-t border-border pt-3 space-y-1 ${onFieldClick ? "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded px-1 -mx-1" : ""}`}
          onClick={() => onFieldClick?.("📝 Not", "note", c.note || "")}
        >
          <div className="text-green font-semibold text-sm shrink-0">📝 Not</div>
          <p className="text-sm text-muted-foreground text-right break-words whitespace-pre-wrap line-clamp-6 min-w-0">
            {(c.note ?? "").trim() || "—"}
          </p>
        </div>
      </div>

      {/* Footer - fiyat ve fiş */}
      <div className="mt-3 flex items-center justify-between gap-3">
        {onPrintClick ? (
          <button
            className="rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 font-bold text-sm sm:text-base transition-colors flex items-center gap-1.5"
            title="Termal yazıcıdan fiş çıkarmak için tıklayın"
            onClick={(e) => { e.stopPropagation(); onPrintClick(); }}
          >
            🖨️ Fiş Yazdır
          </button>
        ) : (
          <div className="rounded-lg bg-primary/10 text-primary px-3 py-2 font-bold text-sm sm:text-base flex items-center gap-1.5 opacity-50 cursor-not-allowed">
            🖨️ Fiş Yazdır
          </div>
        )}

        <div
          className={`rounded-lg bg-accent px-3 py-2 text-right font-extrabold text-gold text-base sm:text-lg shrink-0 ${onFieldClick ? "cursor-pointer hover:opacity-80" : ""}`}
          onClick={() => onFieldClick?.("Ödeme", "payment_method", c.payment_method || "")}
          title="Ödeme notu ve ödeme durumu"
        >
          💰 {formatPrice(Number(c.price))} ₺
        </div>
      </div>
    </div>
  );

  return CardContent;
}


interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const [printOpen, setPrintOpen] = useState(false);
  const [printTitle, setPrintTitle] = useState("2026 Kurbanlık Organizasyonu");

  // Edit State
  const [editOpen, setEditOpen] = useState(false);
  const [editField, setEditField] = useState<{ label: string, key: string, value: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [autoHistoryRows, setAutoHistoryRows] = useState<string[]>([]);
  const autoHistoryStorageKey = useMemo(() => `payment-auto-history:${customer.number}`, [customer.number]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(autoHistoryStorageKey);
      if (!stored) {
        setAutoHistoryRows([]);
        return;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        setAutoHistoryRows([]);
        return;
      }
      setAutoHistoryRows(parsed.filter((item): item is string => typeof item === "string"));
    } catch {
      setAutoHistoryRows([]);
    }
  }, [autoHistoryStorageKey]);

  useEffect(() => {
    try {
      if (autoHistoryRows.length === 0) {
        window.localStorage.removeItem(autoHistoryStorageKey);
        return;
      }
      window.localStorage.setItem(autoHistoryStorageKey, JSON.stringify(autoHistoryRows));
    } catch {
      // localStorage erişim hataları UI akışını bozmamalı
    }
  }, [autoHistoryRows, autoHistoryStorageKey]);

  const handlePrint = () => {
    printReceipt(customer, printTitle);
    setPrintOpen(false); // Modal'ı kapat
  };

  const handleFieldClick = (label: string, key: string, value: string) => {
    if (key === "payment_method" || key === "payment_status") {
      setEditField({ label: "Ödeme Bilgileri", key: "payment_combined", value: customer.payment_method });
      const { manualNote: existingManualNote } = splitPaymentMethod(customer.payment_method);
      setManualNote(existingManualNote || "");
      setEditValue(customer.payment_status);
      setPaidAmount("");
    } else {
      setEditField({ label, key, value });
      setEditValue(value);
      setManualNote("");
      setPaidAmount("");
    }
    setError("");
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editField) return;
    setError("");
    setSubmitting(true);
    try {
      if (editField.key === "payment_combined") {
        if (editValue === "Kısmi Ödeme") {
          if (!paidAmount.trim()) {
            setError("Kısmi ödeme için ödenen tutarı girin.");
            setSubmitting(false);
            return;
          }
          const result = await applyPartialPayment(customer.number, paidAmount, manualNote);
          if (result?.error) setError(result.error);
          else {
            const { autoNote: previousAutoNote } = splitPaymentMethod(customer.payment_method);
            if (previousAutoNote.trim()) {
              setAutoHistoryRows((prev) => [...prev, previousAutoNote.trim()]);
            }
            setEditOpen(false);
          }
        } else {
          // Non-partial case: update status and manual note
          const result = await updateCustomerFields(customer.number, {
            payment_status: editValue,
            payment_method: manualNote.trim()
          });
          if (result?.error) setError(result.error);
          else setEditOpen(false);
        }
        setSubmitting(false);
        return;
      }

      // Standard field update logic
      let val = editValue.trim();
      const allowEmpty = editField.key === "group_category" || editField.key === "note" || editField.key === "address";

      if (!val && !allowEmpty) {
        setError("Yeni değer boş olamaz.");
        setSubmitting(false);
        return;
      }

      if (editField.key === "number" && !/^\d+$/.test(val)) {
        setError("Numara yalnızca rakamlardan oluşmalıdır.");
        setSubmitting(false);
        return;
      }
      if (editField.key === "price" && !Number.isFinite(parseMoneyTR(val))) {
        setError("Geçerli bir fiyat girin.");
        setSubmitting(false);
        return;
      }
      if (editField.key === "phone_number") {
        const clean = val.replace(/[\s\-]/g, "");
        const norm = clean.length === 10 && !clean.startsWith("0") ? "0" + clean : clean;
        if (!/^\d{11}$/.test(norm)) {
          setError("Geçerli bir telefon girin. Örn: 0532 123 45 67");
          setSubmitting(false);
          return;
        }
      }

      const result = await updateCustomerField(customer.number, editField.key, val);
      if (result?.error) setError(result.error);
      else setEditOpen(false);
    } catch (err: any) {
      setError(err.message || "Güncelleme hatası");
    } finally {
      setSubmitting(false);
    }
  };

  // Preview object for the popup
  const previewCustomer = { ...customer };
  if (editField) {
    if (editField.key === "payment_combined") {
      previewCustomer.payment_status = editValue as any;
      if (editValue === "Kısmi Ödeme") {
        // Mock automation note for preview
        const paid = parseMoneyTR(paidAmount) || 0;
        const remaining = Math.max(0, (customer.price || 0) - paid);
        const auto = `${formatPrice(paid)} ₺ ödendi; kalan borç ${formatPrice(remaining)} ₺`;
        previewCustomer.payment_method = manualNote ? `${manualNote} | ${auto}` : auto;
        previewCustomer.price = remaining;
      } else {
        previewCustomer.payment_method = manualNote;
      }
    } else {
      (previewCustomer as any)[editField.key] = editValue;
    }
  }

  return (
    <>
      <CustomerCardInner
        c={customer}
        onFieldClick={handleFieldClick}
        onPrintClick={() => setPrintOpen(true)}
        autoHistoryRows={autoHistoryRows}
      />

      {/* Fiş Yazdır Dialog */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>🖨️ Fiş Yazdır</DialogTitle>
            <DialogDescription>
              Fiş başlığını düzenleyin. Sağ tarafta fişin nasıl görüneceğini görebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-6 py-4">
            {/* Sol Taraf - Ayarlar */}
            <div className="flex-1 space-y-4 flex flex-col justify-center">
              <div className="space-y-2">
                <Label htmlFor="printTitle" className="text-base font-semibold">Fiş Başlığı</Label>
                <Input
                  id="printTitle"
                  value={printTitle}
                  onChange={(e) => setPrintTitle(e.target.value)}
                  placeholder="Başlık girin..."
                  className="text-center font-bold"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Bu başlık sadece bu fiş için geçerli olacaktır.
                </p>
              </div>
              <Button onClick={handlePrint} size="lg" className="w-full font-bold text-base">
                🖨️ Yazdır
              </Button>
            </div>

            {/* Sağ Taraf - Önizleme */}
            <div className="flex justify-center bg-neutral-200/50 dark:bg-neutral-900 p-4 rounded-xl border border-border">
              <div className="w-[220px] bg-white text-black p-[12px] font-mono text-[11px] leading-tight shadow-sm border border-neutral-300 shrink-0">
                <div className="text-center font-bold text-[13px] mb-3 border-b border-black pb-2 break-words">
                  {printTitle}
                </div>
                <div className="text-center mb-3">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-800">HAYVAN NO</div>
                  <div className="text-[40px] font-black leading-none my-1">{customer.number}</div>
                </div>
                <div className="space-y-1 border-b border-dashed border-black pb-3 mb-3">
                  <div className="flex justify-between gap-2">
                    <span className="font-bold">Sahip:</span>
                    <span className="text-right uppercase font-semibold break-words">{customer.whose || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-bold">Telefon:</span>
                    <span className="text-right">{customer.phone_number || "-"}</span>
                  </div>
                </div>
                <div className="space-y-1 border-b border-dashed border-black pb-3 mb-3">
                  <div className="flex justify-between gap-1">
                    <span className="font-bold">Tür/Cins:</span>
                    <span className="text-right">{customer.type || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-1">
                    <span className="font-bold">Küpe Rengi:</span>
                    <span className="text-right">{customer.color_of_earring || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-1">
                    <span className="font-bold">Hayvan Rengi:</span>
                    <span className="text-right truncate">{customer.color_of_animal || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-1">
                    <span className="font-bold">Boya:</span>
                    <span className="text-right truncate">{customer.spray_paint_color || "-"}</span>
                  </div>
                  {customer.special && (
                    <div className="mt-1.5 bg-neutral-100 p-1 rounded-sm">
                      <div className="font-bold mb-0.5">Özellik:</div>
                      <div className="break-words">{customer.special}</div>
                    </div>
                  )}
                </div>
                <div className="text-center text-[10px] mt-4 mb-2 font-bold italic opacity-90">
                  Bizi tercih ettiğiniz için<br />teşekkür ederiz.
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alan Güncelleme Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ {editField?.label} Güncelle</DialogTitle>
            <DialogDescription>
              Değişikliği kaydederek müşteri kartını anında güncelleyebilirsiniz. Sağ tarafta değişikliğin kart üzerindeki yansımasını görebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6 py-4 items-stretch">
            {/* Form */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                {editField?.key === "payment_combined" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>💳 Ödeme Notu (Manuel)</Label>
                      <Textarea
                        value={manualNote}
                        onChange={(e) => setManualNote(e.target.value)}
                        placeholder="Örn: Nakit alındı, yarın ödenecek..."
                        maxLength={4000}
                        className="min-h-[40px] resize-none overflow-hidden"
                        rows={1}
                        onInput={(e) => {
                          const target = e.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>📊 Ödeme Durumu (Otomasyon)</Label>
                      <Select value={editValue} onValueChange={(v) => {
                        setEditValue(v);
                        if (v !== "Kısmi Ödeme") setPaidAmount("");
                      }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PAYMENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {editValue === "Kısmi Ödeme" && (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">
                          Mevcut kalan tutar (fiyat):{" "}
                          <span className="font-semibold text-foreground">
                            {formatPrice(Number(customer.price ?? 0))} ₺
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
                ) : (
                  <>
                    <Label>{editField?.label}</Label>
                    {editField?.key === "group_category" ? (
                      <Select value={editValue || "__none__"} onValueChange={(v) => setEditValue(v === "__none__" ? "" : v)}>
                        <SelectTrigger><SelectValue placeholder="Grup Seçin" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Grup Seçilmedi —</SelectItem>
                          {GROUP_CATEGORIES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : editField?.key === "note" || editField?.key === "address" ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder={editField?.key === "address" ? "Adres" : "Not"}
                        rows={1}
                        maxLength={editField?.key === "note" ? 4000 : undefined}
                        className="min-h-[40px] resize-none overflow-hidden"
                        onInput={(e) => {
                          const target = e.currentTarget;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (editField?.key === "price") setEditValue(formatMoneyInputTR(v));
                          else if (editField?.key === "phone_number") setEditValue(formatPhoneInputTR(v));
                          else setEditValue(v);
                        }}
                        inputMode={editField?.key === "price" ? "decimal" : editField?.key === "phone_number" ? "tel" : undefined}
                        placeholder={
                          editField?.key === "price" ? "Örn: 15.400,50" :
                            editField?.key === "phone_number" ? "Örn: 0532 123 45 67" : "Yeni değer"
                        }
                      />
                    )}
                  </>
                )}
              </div>

              {error && <p className="text-sm text-destructive font-medium">{error}</p>}

              <Button onClick={handleSave} disabled={submitting} className="w-full mt-4">
                {submitting ? "Kaydediliyor..." : "💾 Kaydet"}
              </Button>
            </div>

            {/* Preview */}
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-900/50 p-4 rounded-xl border border-border flex items-center justify-center">
              <div className="w-full pointer-events-none">
                <CustomerCardInner c={previewCustomer} isPreview autoHistoryRows={autoHistoryRows} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
