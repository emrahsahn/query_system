import { createClient } from "@/lib/supabase/server";
import { getStats } from "@/lib/supabase/queries";
import { StatCard } from "@/components/stat-card";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IstatistiklerPage() {
  const supabase = await createClient();
  const stats = await getStats(supabase);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">📊 İstatistikler</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          label="📊 Kayıtlı Toplam Müşteri"
          value={stats.count}
          sub="Kişi / Hayvan"
          colorClass="text-green"
          borderClass="border-primary"
        />
        <StatCard
          label="💰 Beklenen Toplam Alacak"
          value={`${formatPrice(stats.total)} ₺`}
          sub="Türk Lirası (TL)"
          colorClass="text-gold"
          borderClass="border-gold"
        />
        <StatCard
          label="⏳ Ödenmemiş Tutar"
          value={`${formatPrice(stats.unpaidTotal)} ₺`}
          sub={`${stats.unpaidCount} kayıt henüz ödenmedi / belirsiz`}
          colorClass="text-red"
          borderClass="border-red"
        />
        <StatCard
          label="✅ Tahsil Edilen Tutar"
          value={`${formatPrice(stats.total - stats.unpaidTotal)} ₺`}
          sub={`${stats.count - stats.unpaidCount} kayıt ödendi`}
          colorClass="text-green"
          borderClass="border-green"
        />
      </div>
    </div>
  );
}
