import { z } from "zod";
import { parseMoneyTR } from "@/lib/input-format";

const phoneSchema = z
  .string()
  .optional()
  .transform((v) => (v ?? "").replace(/[\s\-]/g, ""))
  .refine(
    (v) => v === "" || (v.length === 11 && /^\d+$/.test(v) && v.startsWith("0")),
    { message: "Geçerli bir telefon numarası girin. Örn: 0532 123 45 67" }
  );

export const customerSchema = z.object({
  number: z
    .string()
    .min(1, "Hayvan numarası zorunludur.")
    .regex(/^\d+$/, "Hayvan numarası yalnızca rakamlardan oluşmalıdır."),
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
});

export type CustomerFormValues = z.input<typeof customerSchema>;
export type CustomerFormOutput = z.output<typeof customerSchema>;

export const updateFieldSchema = z.object({
  number: z.string().min(1),
  field: z.string().min(1),
  value: z.string(),
});
