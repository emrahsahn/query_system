"use client";
import { useTheme } from "@/components/theme-context";
import { Moon, Sun, Crown, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme, visualStyle, setVisualStyle } = useTheme();
  const mounted = useIsClient();
  if (!mounted) return null;

  return (
    <div className="flex items-center gap-1">
      {/* Stil Seçici */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setVisualStyle(visualStyle === "premium" ? "modern" : "premium")}
        title={visualStyle === "premium" ? "Modern Temaya Geç" : "Premium Temaya Geç"}
      >
        {visualStyle === "premium" ? (
          <Crown className="h-4 w-4 text-primary" />
        ) : (
          <Layout className="h-4 w-4" />
        )}
      </Button>

      {/* Gece/Gündüz Seçici */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setTheme((theme ?? "dark") === "dark" ? "light" : "dark")}
        title={(theme ?? "dark") === "dark" ? "Gündüz Moduna Geç" : "Gece Moduna Geç"}
      >
        {(theme ?? "dark") === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
