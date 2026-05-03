import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer, HistoryEntry } from "@/lib/types";
import { HISTORY_TABLE, TABLE } from "@/lib/types";
import { compareHayvanNumarasi } from "@/lib/utils";

export async function getCustomers(supabase: SupabaseClient): Promise<Customer[]> {
  const { data, error } = await supabase.from(TABLE).select("*");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Customer[];
  rows.sort((x, y) => compareHayvanNumarasi(x.number, y.number));
  return rows;
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

export async function getCustomerHistory(
  supabase: SupabaseClient,
  hayvanNumber: string
): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .select("id, hayvan_number, snapshot, recorded_at, action")
    .eq("hayvan_number", hayvanNumber)
    .order("recorded_at", { ascending: false });
  if (error) {
    if (isMissingHistoryTableError(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as HistoryEntry[];
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

function isMissingAgreedTotalError(message: string): boolean {
  return /agreed_total/i.test(message) && /does not exist|column/i.test(message);
}

/** Audit tablosu migrasyonu uygulanmamış remote DB'lerde PostgREST bu hatayı verir. */
function isMissingHistoryTableError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("kurbanlik_hesap_history") &&
    (m.includes("could not find") ||
      m.includes("schema cache") ||
      m.includes("does not exist") ||
      /relation.*does not exist/i.test(m))
  );
}

export async function getStats(supabase: SupabaseClient) {
  let rows: Array<{ price?: unknown; payment_status?: unknown; agreed_total?: unknown }>;
  let count: number | null;

  const full = await supabase
    .from(TABLE)
    .select("price, payment_status, agreed_total", { count: "exact" });

  if (full.error && isMissingAgreedTotalError(full.error.message)) {
    const legacy = await supabase
      .from(TABLE)
      .select("price, payment_status", { count: "exact" });
    if (legacy.error) throw new Error(legacy.error.message);
    rows = legacy.data ?? [];
    count = legacy.count ?? null;
    const sumPriceAll = rows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
    const unpaidRows = rows.filter((r) => r.payment_status !== "Ödendi");
    const unpaidTotal = unpaidRows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
    const collectedTotal = Math.max(0, sumPriceAll - unpaidTotal);
    return {
      count: count ?? 0,
      total: sumPriceAll,
      unpaidTotal,
      unpaidCount: unpaidRows.length,
      collectedTotal,
    };
  }

  if (full.error) throw new Error(full.error.message);

  rows = full.data ?? [];
  count = full.count ?? null;

  const agreedOf = (r: { agreed_total?: unknown; price?: unknown }) =>
    Number(r.agreed_total ?? r.price ?? 0);
  /** Anlaşılan / beklenen toplam alacak */
  const total = rows.reduce((sum, r) => sum + agreedOf(r), 0);
  const unpaidRows = rows.filter((r) => r.payment_status !== "Ödendi");
  const unpaidTotal = unpaidRows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
  /** Tahsil edilen: anlaşılan toplam − yalnızca borçlu kayıtların güncel kalanı */
  const collectedTotal = Math.max(0, total - unpaidTotal);

  return {
    count: count ?? 0,
    total,
    unpaidTotal,
    unpaidCount: unpaidRows.length,
    collectedTotal,
  };
}

export async function getGroupStats(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("group_category, price");
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const groupMap: Record<string, { count: number; total: number }> = {};

  for (const row of rows) {
    const key = (row.group_category as string) || "__grupsuz__";
    if (!groupMap[key]) groupMap[key] = { count: 0, total: 0 };
    groupMap[key].count += 1;
    groupMap[key].total += Number(row.price ?? 0);
  }

  return groupMap;
}
