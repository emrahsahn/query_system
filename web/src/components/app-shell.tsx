"use client";
import { usePathname } from "next/navigation";
import { NavSidebar } from "@/components/nav-sidebar";
import { MobileTopbar } from "@/components/mobile-topbar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Masaüstü sidebar — sabit, lg ve üzeri */}
      <NavSidebar className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64" />

      {/* Mobil üst bar */}
      <MobileTopbar />

      {/* İçerik alanı */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Mobil alt navigasyon */}
      <MobileBottomNav />
    </div>
  );
}
