import { createClient } from "@/lib/supabase/server";
import { getStats, getGroupStats } from "@/lib/supabase/queries";
import { StatCard } from "@/components/stat-card";
import { formatPrice } from "@/lib/utils";
import { GROUP_CATEGORIES } from "@/lib/types";

export const dynamic = "force-dynamic";

const GROUP_ICONS: Record<string, string> = {
  "1.Gün Kesilecek Küçük Mallar": "🔪",
  "1.Gün Kesilecek Büyük Mallar": "🔪",
  "2.Gün Kesilecek Küçük Mallar": "✂️",
  "2.Gün Kesilecek Büyük Mallar": "✂️",
  "Pazardan Kendi Alacaklar": "🛒",
  "Köyden Kendi Alacaklar": "🏘️",
  "Çarşıya Dağıtılacaklar": "🏪",
  "Köye Dağıtılacaklar": "🚚",
  "Kesilip Dükkana Gönderilecekler": "🏬",
};

export default async function IstatistiklerPage() {
  const supabase = await createClient();
  const [stats, groupStats] = await Promise.all([
    getStats(supabase),
    getGroupStats(supabase),
  ]);

  const grupsuzCount = groupStats["__grupsuz__"]?.count ?? 0;
  const grupsuzTotal = groupStats["__grupsuz__"]?.total ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">📊 İstatistikler</h1>

      {/* Genel istatistikler */}
      <div>
        <h2 className="text-base font-semibold text-muted-foreground mb-4 border-b border-border pb-2">
          📈 Genel Özet
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <StatCard
            label="📊 Kayıtlı Toplam Müşteri"
            value={stats.count}
            sub="Kişi / Hayvan"
            colorClass="text-green"
            borderClass="border-primary"
          />
          <StatCard
            label="💰 Anlaşılan Toplam Alacak"
            value={`${formatPrice(stats.total)} ₺`}
            sub="Sözleşme / beklenen tutarların toplamı"
            colorClass="text-gold"
            borderClass="border-gold"
          />
          <StatCard
            label="⏳ Ödenmemiş Tutar (Kalan Borç)"
            value={`${formatPrice(stats.unpaidTotal)} ₺`}
            sub={`${stats.unpaidCount} kayıt: Ödendi dışı (kısmi dahil)`}
            colorClass="text-red"
            borderClass="border-red"
          />
          <StatCard
            label="✅ Tahsil Edilen Tutar"
            value={`${formatPrice(stats.collectedTotal)} ₺`}
            sub={`Anlaşılan toplam − güncel kalan tutarlar`}
            colorClass="text-green"
            borderClass="border-green"
          />
        </div>
      </div>

      {/* Grup bazlı istatistikler */}
      <div>
        <h2 className="text-base font-semibold text-muted-foreground mb-4 border-b border-border pb-2">
          📂 Gruplara Göre Dağılım
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {GROUP_CATEGORIES.map((group) => {
            const info = groupStats[group];
            const count = info?.count ?? 0;
            const total = info?.total ?? 0;
            const icon = GROUP_ICONS[group] ?? "📂";
            return (
              <div
                key={group}
                className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-1"
              >
                <p className="text-xs font-semibold text-muted-foreground leading-tight">
                  {icon} {group}
                </p>
                <p className="text-2xl font-extrabold text-primary mt-1">{count}</p>
                <p className="text-xs text-muted-foreground">hayvan</p>
                <p className="text-sm font-bold text-gold mt-1">
                  {formatPrice(total)} ₺
                </p>
              </div>
            );
          })}

          {/* Grupsuz kayıtlar */}
          {grupsuzCount > 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-4 shadow-sm flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground leading-tight">
                ❓ Grupsuz Kayıtlar
              </p>
              <p className="text-2xl font-extrabold text-muted-foreground mt-1">{grupsuzCount}</p>
              <p className="text-xs text-muted-foreground">hayvan</p>
              <p className="text-sm font-bold text-gold mt-1">
                {formatPrice(grupsuzTotal)} ₺
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
