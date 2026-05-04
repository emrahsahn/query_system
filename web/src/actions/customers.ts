"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations";
import { parseMoneyTR } from "@/lib/input-format";
import { TABLE } from "@/lib/types";

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
  return d;
}

function isMissingAgreedTotalDbError(message: string): boolean {
  return /agreed_total/i.test(message) && /does not exist|column/i.test(message);
}

export async function addCustomer(formData: unknown) {
  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from(TABLE).select("number").eq("number", data.number).maybeSingle();
  if (existing) return { error: `#${data.number} numaralı kayıt zaten mevcut.` };

  const phone = formatPhone(data.phone_number ?? "");
  const initialPrice = Number(data.price) || 0;
  const row = {
    number: data.number,
    type: data.type,
    special: data.special,
    color_of_earring: data.color_of_earring,
    color_of_animal: data.color_of_animal,
    whose: data.whose,
    from_whom: data.from_whom,
    agreed_total: initialPrice,
    price: initialPrice,
    phone_number: phone,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
    group_category: data.group_category,
    address: data.address,
    spray_paint_color: data.spray_paint_color,
    note: data.note,
  };

  let { error } = await supabase.from(TABLE).insert(row);
  if (error && isMissingAgreedTotalDbError(error.message)) {
    const { agreed_total: _a, ...withoutAgreed } = row;
    ({ error } = await supabase.from(TABLE).insert(withoutAgreed));
  }

  if (error) return { error: error.message };

  revalidatePath("/musteriler");
  revalidatePath("/istatistikler");
  revalidatePath("/");
  return { success: true };
}

const TL = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export async function applyPartialPayment(numberKey: string, paidAmountRaw: string, manualNote?: string) {
  const paidRaw = parseMoneyTR(String(paidAmountRaw).trim());
  const paid = Math.round(paidRaw * 100) / 100;
  if (!Number.isFinite(paid) || paid <= 0) {
    return { error: "Geçerli ve sıfırdan büyük bir ödenen tutar girin." };
  }

  const supabase = await createClient();
  let row: {
    number?: string;
    price?: unknown;
    agreed_total?: unknown;
    payment_status?: unknown;
  } | null = null;
  let fetchErr: { message: string } | null = null;

  const fullFetch = await supabase
    .from(TABLE)
    .select("number, price, agreed_total, payment_status")
    .eq("number", numberKey)
    .maybeSingle();

  if (fullFetch.error && isMissingAgreedTotalDbError(fullFetch.error.message)) {
    const legacyFetch = await supabase
      .from(TABLE)
      .select("number, price, payment_status")
      .eq("number", numberKey)
      .maybeSingle();
    row = legacyFetch.data;
    fetchErr = legacyFetch.error;
  } else {
    row = fullFetch.data;
    fetchErr = fullFetch.error;
  }

  if (fetchErr) return { error: fetchErr.message };
  if (!row) return { error: "Kayıt bulunamadı." };

  const currentPrice = Math.round(Number(row.price ?? 0) * 100) / 100;
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return { error: "Kalan tutar sıfır veya geçersiz; kısmi ödeme uygulanamaz." };
  }
  if (paid > currentPrice + 1e-6) {
    return { error: `Ödenen tutar kalan tutardan (${TL.format(currentPrice)} ₺) fazla olamaz.` };
  }

  /** Anlaşılan tutar: kısmi ödemede sabit kalmalı; eksik/yanlış kayıtları her adımda düzelt. */
  const prevAgreed = Number(row.agreed_total ?? 0);
  let nextAgreed = Math.max(
    Number.isFinite(prevAgreed) ? prevAgreed : 0,
    currentPrice
  );
  if (row.payment_status === "Kısmi Ödeme") {
    nextAgreed = Math.max(nextAgreed, Math.round((currentPrice + paid) * 100) / 100);
  }

  const remaining = Math.round((currentPrice - paid) * 100) / 100;
  const paidFmt = TL.format(paid);
  const remainingFmt = TL.format(Math.max(0, remaining));
  const autoNote = `${paidFmt} ₺ ödendi; kalan borç ${remainingFmt} ₺`;
  
  // Combine manual note and auto note
  const paymentMethod = manualNote ? `${manualNote.trim()} | ${autoNote}` : autoNote;

  const payment_status =
    remaining <= 0 ? ("Ödendi" as const) : ("Kısmi Ödeme" as const);

  const patch: Record<string, unknown> = {
    price: remaining <= 0 ? 0 : remaining,
    payment_method: paymentMethod,
    payment_status,
    agreed_total: nextAgreed,
  };

  let { error } = await supabase.from(TABLE).update(patch).eq("number", numberKey);

  if (error && isMissingAgreedTotalDbError(error.message)) {
    const { agreed_total: _a, ...withoutAgreed } = patch;
    ({ error } = await supabase.from(TABLE).update(withoutAgreed).eq("number", numberKey));
  }

  if (error) return { error: error.message };

  revalidatePath("/musteriler");
  revalidatePath("/guncelle");
  revalidatePath("/istatistikler");
  revalidatePath("/");
  return { success: true };
}

export async function updateCustomerFields(
  number: string,
  updates: Record<string, any>
) {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).update(updates).eq("number", number);

  if (error) return { error: error.message };

  revalidatePath("/musteriler");
  revalidatePath("/guncelle");
  revalidatePath("/istatistikler");
  revalidatePath("/");
  return { success: true };
}

export async function updateCustomerField(
  number: string,
  field: string,
  value: string
) {
  const supabase = await createClient();

  let finalValue: string | number = value;
  if (field === "price") {
    const n = parseMoneyTR(value);
    finalValue = Number.isFinite(n) ? n : 0;
  }
  if (field === "phone_number") finalValue = formatPhone(value);

  const { error } = await supabase
    .from(TABLE)
    .update({ [field]: finalValue })
    .eq("number", number);

  if (error) return { error: error.message };

  revalidatePath("/musteriler");
  revalidatePath("/guncelle");
  revalidatePath("/istatistikler");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCustomer(number: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).delete().eq("number", number);
  if (error) return { error: error.message };

  revalidatePath("/musteriler");
  revalidatePath("/sil");
  revalidatePath("/istatistikler");
  revalidatePath("/");
  return { success: true };
}
