"use client";
import { useTheme } from "@/components/theme-context";
import { Moon, Sun } from "lucide-react";
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
  const { theme, setTheme } = useTheme();
  const mounted = useIsClient();
  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme((theme ?? "dark") === "dark" ? "light" : "dark")}
      title={(theme ?? "dark") === "dark" ? "Gündüz Moduna Geç" : "Gece Moduna Geç"}
    >
      {(theme ?? "dark") === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
