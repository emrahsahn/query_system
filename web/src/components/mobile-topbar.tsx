"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavSidebar } from "@/components/nav-sidebar";

export function MobileTopbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Topbar — sadece mobilde görünür */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 safe-top">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menüyü aç">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavSidebar onNavClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Image
            src="/logo.jpeg"
            alt="Kurbanlık Takip Sistemi"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 object-contain"
          />
          <span className="text-sm font-bold text-sidebar-foreground">Kurbanlık Takip</span>
        </div>

        <ThemeToggle />
      </header>
    </>
  );
}
