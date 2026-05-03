"use client";

import { useState } from "react";
import type { Customer, PaymentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
        <title>Fiş Yazdır</title>
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
          ${
            customer.special
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

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const c = customer;
  const [printTitle, setPrintTitle] = useState("2026 Kurbanlık Organizasyonu");
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    printReceipt(c, printTitle);
    setOpen(false); // Modal'ı kapat
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3 gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-destructive shrink-0">#{c.number}</span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {c.group_category && (
              <span className="rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] font-semibold text-primary truncate max-w-[140px]" title={c.group_category}>
                📂 {c.group_category}
              </span>
            )}
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground truncate max-w-[100px]">
              {c.type || "—"}
            </span>
            {paymentBadge(c.payment_status as PaymentStatus)}
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          {[
            ["✨ Özellik", c.special],
            ["🏷️ Küpe", c.color_of_earring],
            ["🎨 Hayvan Rengi", c.color_of_animal],
            ["🎨 Sıkılan Boya", c.spray_paint_color],
            ["👤 Sahip", c.whose],
            ["📦 Kimden", c.from_whom],
            ["📞 Telefon", c.phone_number],
            ["💳 Ödeme", c.payment_method],
            ["📍 Adres", c.address],
          ]
            .filter(([label, val]) => val || label !== "📍 Adres")
            .map(([label, val]) => (
              <div key={label} className="flex justify-between gap-2 border-b border-dashed border-border pb-1 last:border-0">
                <span className="text-green font-semibold shrink-0">{label}</span>
                <span className="text-muted-foreground text-right truncate">{val || "—"}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Footer - fiyat ve fiş */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 font-bold text-sm sm:text-base transition-colors flex items-center gap-1.5"
              title="Termal yazıcıdan fiş çıkarmak için tıklayın"
            >
              🖨️ Fiş Yazdır
            </button>
          </DialogTrigger>
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
                    <div className="text-[40px] font-black leading-none my-1">{c.number}</div>
                  </div>
                  <div className="space-y-1 border-b border-dashed border-black pb-3 mb-3">
                    <div className="flex justify-between gap-2">
                      <span className="font-bold">Sahip:</span>
                      <span className="text-right uppercase font-semibold break-words">{c.whose || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="font-bold">Telefon:</span>
                      <span className="text-right">{c.phone_number || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-1 border-b border-dashed border-black pb-3 mb-3">
                    <div className="flex justify-between gap-1">
                      <span className="font-bold">Tür/Cins:</span>
                      <span className="text-right">{c.type || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-1">
                      <span className="font-bold">Küpe No:</span>
                      <span className="text-right">{c.color_of_earring || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-1">
                      <span className="font-bold">Renk:</span>
                      <span className="text-right truncate">{c.color_of_animal || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-1">
                      <span className="font-bold">Boya:</span>
                      <span className="text-right truncate">{c.spray_paint_color || "-"}</span>
                    </div>
                    {c.special && (
                      <div className="mt-1.5 bg-neutral-100 p-1 rounded-sm">
                        <div className="font-bold mb-0.5">Özellik:</div>
                        <div className="break-words">{c.special}</div>
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

        <div className="rounded-lg bg-accent px-3 py-2 text-right font-extrabold text-gold text-base sm:text-lg shrink-0">
          💰 {formatPrice(Number(c.price))} ₺
        </div>
      </div>
    </div>
  );
}
