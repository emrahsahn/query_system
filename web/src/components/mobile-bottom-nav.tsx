"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, List, Search, Plus, BarChart2, RefreshCw, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/actions/auth";
import { LogOut } from "lucide-react";

const primaryTabs = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/musteriler", label: "Müşteriler", icon: List },
  { href: "/sorgula", label: "Sorgula", icon: Search },
  { href: "/ekle", label: "Ekle", icon: Plus },
];

const moreTabs = [
  { href: "/istatistikler", label: "İstatistikler", icon: BarChart2 },
  { href: "/guncelle", label: "Güncelle", icon: RefreshCw },
  { href: "/sil", label: "Müşteri Sil", icon: Trash2 },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreTabs.some((t) => t.href === pathname);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t border-border bg-sidebar safe-bottom">
      {primaryTabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "text-primary")} />
            <span>{label}</span>
          </Link>
        );
      })}

      {/* Daha Fazla */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetTrigger asChild>
          <button
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
              isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Daha fazla seçenek"
          >
            <MoreHorizontal className={cn("h-5 w-5", isMoreActive && "text-primary")} />
            <span>Daha Fazla</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-0">
          <SheetHeader className="px-6 pb-2">
            <SheetTitle>Diğer İşlemler</SheetTitle>
          </SheetHeader>
          <div className="px-3 pb-6 space-y-1">
            {moreTabs.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Çıkış Yap
                </button>
              </form>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
