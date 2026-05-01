import type { Customer, PaymentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

function paymentBadge(status: PaymentStatus) {
  const map: Record<PaymentStatus, "odendi" | "kismi" | "odenmedi" | "belirsiz"> = {
    "Ödendi": "odendi",
    "Kısmi Ödeme": "kismi",
    "Ödenmedi": "odenmedi",
    "Belirsiz": "belirsiz",
  };
  return <Badge variant={map[status] ?? "belirsiz"}>{status}</Badge>;
}

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const c = customer;
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3 gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-destructive shrink-0">#{c.number}</span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
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
            ["🎨 Renk", c.color_of_animal],
            ["👤 Sahip", c.whose],
            ["📦 Kimden", c.from_whom],
            ["📞 Telefon", c.phone_number],
            ["💳 Ödeme", c.payment_method],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between gap-2 border-b border-dashed border-border pb-1 last:border-0">
              <span className="text-green font-semibold shrink-0">{label}</span>
              <span className="text-muted-foreground text-right truncate">{val || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - fiyat */}
      <div className="mt-3 rounded-lg bg-accent px-3 py-2 text-right font-extrabold text-gold text-base sm:text-lg">
        💰 {formatPrice(Number(c.price))} ₺
      </div>
    </div>
  );
}
