"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations";
import { TABLE } from "@/lib/types";

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
  return d;
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
  const { error } = await supabase.from(TABLE).insert({
    number: data.number,
    type: data.type,
    special: data.special,
    color_of_earring: data.color_of_earring,
    color_of_animal: data.color_of_animal,
    whose: data.whose,
    from_whom: data.from_whom,
    price: Number(data.price) || 0,
    phone_number: phone,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
  });

  if (error) return { error: error.message };

  revalidatePath("/musteriler");
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
  if (field === "price") finalValue = Number(value.replace(",", ".")) || 0;
  if (field === "phone_number") finalValue = formatPhone(value);

  const { error } = await supabase
    .from(TABLE)
    .update({ [field]: finalValue })
    .eq("number", number);

  if (error) return { error: error.message };

  revalidatePath("/musteriler");
  revalidatePath("/guncelle");
  revalidatePath("/");
  return { success: true };
}

export async function deleteCustomer(number: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(TABLE).delete().eq("number", number);
  if (error) return { error: error.message };

  revalidatePath("/musteriler");
  revalidatePath("/sil");
  revalidatePath("/");
  return { success: true };
}
