import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return price
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Hayvan numarası metnindeki ilk sayıyı alır (örn. "14,15,16" → 14). */
function firstNumberToken(s: string): number {
  const m = s.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/**
 * Doğal sayısal sıra: 1, 2, 12, 15, 23… (düz metin sırası değil).
 * Aynı baş sayıda tam string ile ikincil sıra (deterministik).
 */
export function compareHayvanNumarasi(a: string, b: string): number {
  const na = firstNumberToken(a);
  const nb = firstNumberToken(b);
  if (na !== nb) return na - nb;
  return a.localeCompare(b, "tr", { sensitivity: "base" });
}
