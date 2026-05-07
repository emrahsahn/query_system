import { z } from "zod";
import { parseMoneyTR } from "@/lib/input-format";

/**
 * Telefon: tamamen opsiyonel — boş bırakılabilir. Dolu girildiğinde rakam dışı
 * karakterler temizlenir ve 11 haneli '0' ile başlayan değere normalize edilir.
 * Boş veya sadece boşluklardan oluşuyorsa "" döner (DB'ye boş string yazılır).
 */
const phoneSchema = z
  .string()
  .optional()
  .transform((v) => (v ?? "").replace(/\D/g, ""))
  .transform((d) => {
    if (d.length === 0) return "";
    if (d.length === 10) return "0" + d;
    if (d.length === 12 && d.startsWith("90")) return "0" + d.slice(2);
    return d;
  })
  .refine(
    (v) => v === "" || (v.length === 11 && v.startsWith("0")),
    { message: "Geçerli bir telefon numarası girin. Örn: 0532 123 45 67" }
  );

/**
 * Hayvan numarası: bir veya birden fazla numara virgülle ayrılarak girilebilir
 * (örn. "101" veya "101, 102, 103"). Sadece rakam + virgül + boşluk kabul edilir.
 * Çıktı: "101, 102, 103" formatında normalize edilir.
 */
const animalNumberSchema = z
  .string()
  .min(1, "Hayvan numarası zorunludur.")
  .transform((v) => v.trim())
  .refine(
    (v) => /^\d+(\s*,\s*\d+)*$/.test(v),
    { message: "Hayvan numarası yalnızca rakamlardan oluşmalı; birden fazla için virgülle ayırın (örn. 101, 102, 103)." }
  )
  .transform((v) =>
    v
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(", ")
  );

export const customerSchema = z.object({
  number: animalNumberSchema,
  type: z.string().optional().default(""),
  special: z.string().optional().default(""),
  color_of_earring: z.string().optional().default(""),
  color_of_animal: z.string().optional().default(""),
  whose: z.string().optional().default(""),
  from_whom: z.string().optional().default(""),
  price: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .refine(
      (v) => v === "" || Number.isFinite(parseMoneyTR(v)),
      { message: "Geçerli bir fiyat girin." }
    )
    .transform((v) => {
      if (!v || v === "") return "0";
      const n = parseMoneyTR(v);
      return Number.isFinite(n) ? String(n) : "0";
    }),
  phone_number: phoneSchema,
  payment_method: z.string().optional().default(""),
  payment_status: z
    .enum(["Belirsiz", "Ödendi", "Kısmi Ödeme", "Ödenmedi"])
    .default("Belirsiz"),
  group_category: z.string().optional().default(""),
  address: z.string().optional().default(""),
  spray_paint_color: z.string().optional().default(""),
  note: z.string().max(4000).optional().default(""),
});

export type CustomerFormValues = z.input<typeof customerSchema>;
export type CustomerFormOutput = z.output<typeof customerSchema>;

/**
 * Tek alanlı güncelleme için: composite key (random_id + number) ile
 * kaydı tanımlar.
 */
export const updateFieldSchema = z.object({
  random_id: z.string().min(1),
  number: z.string().min(1),
  field: z.string().min(1),
  value: z.string(),
});
