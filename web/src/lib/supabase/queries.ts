import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer } from "@/lib/types";
import { TABLE } from "@/lib/types";

export async function getCustomers(supabase: SupabaseClient): Promise<Customer[]> {
  const { data, error } = await supabase.from(TABLE).select("*").order("number");
  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
}

export async function getCustomerByNumber(
  supabase: SupabaseClient,
  number: string
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("number", number)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Customer | null;
}

export async function searchByNumber(
  supabase: SupabaseClient,
  number: string
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("number", number);
  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
}

export async function searchByOwner(
  supabase: SupabaseClient,
  whose: string
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .ilike("whose", `%${whose}%`);
  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
}

export async function searchByNumberAndOwner(
  supabase: SupabaseClient,
  number: string,
  whose: string
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("number", number)
    .ilike("whose", `%${whose}%`);
  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
}

export async function searchByType(
  supabase: SupabaseClient,
  kind: string
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .ilike("type", `%${kind}%`);
  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
}

export async function searchByPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .ilike("phone_number", `%${phone}%`);
  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
}

export async function getStats(supabase: SupabaseClient) {
  const { data, error, count } = await supabase
    .from(TABLE)
    .select("price, payment_status", { count: "exact" });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const total = rows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
  const unpaidRows = rows.filter((r) => r.payment_status !== "Ödendi");
  const unpaidTotal = unpaidRows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);

  return {
    count: count ?? 0,
    total,
    unpaidTotal,
    unpaidCount: unpaidRows.length,
  };
}
