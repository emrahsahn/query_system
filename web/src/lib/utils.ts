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

// ─── Hayvan numarası (composite + virgülle ayrılmış) yardımcıları ──────────────

/**
 * "101, 102, 103" → ["101", "102", "103"].
 * Boş / null / boşluk-only girdiler için boş dizi döner.
 */
export function parseAnimalNumbers(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Bir kayıt içindeki hayvan sayısı. */
export function countAnimals(raw: string | null | undefined): number {
  return parseAnimalNumbers(raw).length;
}

/** Numaraları "101, 102, 103" formatına normalize eder. */
export function formatAnimalNumbers(raw: string | null | undefined): string {
  return parseAnimalNumbers(raw).join(", ");
}

/**
 * Tekil bir hayvan numarasının (örn. "102") composite kayıt içinde
 * tam token olarak bulunup bulunmadığını döner. "1020" gibi yarım eşleşmeleri
 * ayıklamak için kullanılır.
 */
export function animalNumbersInclude(raw: string | null | undefined, target: string): boolean {
  const t = target.trim();
  if (!t) return false;
  return parseAnimalNumbers(raw).includes(t);
}

// ─── Telefon normalize ────────────────────────────────────────────────────────

/**
 * Telefon numarasını storage formatına normalize eder: 11 haneli, '0' ile başlayan,
 * sadece rakamlardan oluşan değer. Geçersizse boş string döner.
 *
 * - "0532 123 45 67" → "05321234567"
 * - "(0532) 123-45-67" → "05321234567"
 * - "5321234567" → "05321234567"
 * - "+90 532 123 45 67" → "05321234567"
 */
export function normalizePhone(raw: string | null | undefined): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("0")) return d;
  if (d.length === 10) return "0" + d;
  if (d.length === 12 && d.startsWith("90")) return "0" + d.slice(2);
  if (d.length === 13 && d.startsWith("090")) return d.slice(2);
  return "";
}

/**
 * Storage'deki normalize telefonu kullanıcıya gösterilecek şekilde formatlar:
 * "05321234567" → "0532 123 45 67". Geçersizse olduğu gibi döndürür.
 */
export function formatPhoneDisplay(raw: string | null | undefined): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.length !== 11) return raw ?? "";
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
}

// ─── Composite key üretici (sadece client-side rastgelelik gereksinimleri için) ─

/**
 * 10 hex karakterlik rastgele kimlik. DB tarafında DEFAULT zaten üretir;
 * client-side import gibi durumlarda yedek olarak kullanılır.
 */
export function generateRandomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  }
  return Math.random().toString(36).slice(2, 12).padEnd(10, "0");
}
