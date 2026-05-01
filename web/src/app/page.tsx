import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStats } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { List, Search, Plus, BarChart2, RefreshCw, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const quickLinks = [
  { href: "/musteriler", label: "Müşterileri Göster", icon: List, color: "text-primary" },
  { href: "/sorgula", label: "Müşteri Sorgula", icon: Search, color: "text-blue-400" },
  { href: "/ekle", label: "Müşteri Ekle", icon: Plus, color: "text-green" },
  { href: "/istatistikler", label: "İstatistikler", icon: BarChart2, color: "text-gold" },
  { href: "/guncelle", label: "Müşteri Güncelle", icon: RefreshCw, color: "text-purple-400" },
  { href: "/sil", label: "Müşteri Sil", icon: Trash2, color: "text-red" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  let stats = { count: 0, total: 0, unpaidTotal: 0, unpaidCount: 0 };
  try {
    stats = await getStats(supabase);
  } catch {}

  return (
    <div className="space-y-8">
      {/* Karşılama */}
      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Hoş Geldiniz 👋</h2>
        <p className="text-muted-foreground">
          Bu sistem, kurbanlık hayvanların müşteri takibini kolaylaştırmak için tasarlanmıştır.
          Sol menüden istediğiniz işlemi seçerek başlayabilirsiniz.
        </p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 text-center shadow-sm">
          <p className="text-2xl sm:text-3xl font-extrabold text-green">{stats.count}</p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">📊 Kayıtlı Hayvan</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 text-center shadow-sm">
          <p className="text-xl sm:text-3xl font-extrabold text-gold break-all">{formatPrice(stats.total)} ₺</p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">💰 Toplam Alacak</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 text-center shadow-sm">
          <p className="text-xl sm:text-3xl font-extrabold text-red break-all">{formatPrice(stats.unpaidTotal)} ₺</p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">⏳ Ödenmemiş Tutar</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5 text-center shadow-sm">
          <p className="text-2xl sm:text-3xl font-extrabold text-red">{stats.unpaidCount}</p>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">❗ Bekleyen Kayıt</p>
        </div>
      </div>

      {/* Hızlı menü */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">Hızlı Erişim</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {quickLinks.map(({ href, label, icon: Icon, color }) => (
            <Button key={href} variant="outline" asChild className="h-auto flex-col gap-2 py-5">
              <Link href={href}>
                <Icon className={`h-6 w-6 ${color}`} />
                <span className="text-xs font-medium text-center leading-tight">{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
