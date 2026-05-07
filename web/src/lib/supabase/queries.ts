import type { SupabaseClient } from "@supabase/supabase-js";
import type { Customer, CustomerKey, HistoryEntry } from "@/lib/types";
import { HISTORY_TABLE, TABLE } from "@/lib/types";
import {
  animalNumbersInclude,
  compareHayvanNumarasi,
  countAnimals,
  normalizePhone,
} from "@/lib/utils";

export async function getCustomers(supabase: SupabaseClient): Promise<Customer[]> {
  const { data, error } = await supabase.from(TABLE).select("*");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Customer[];
  rows.sort((x, y) => compareHayvanNumarasi(x.number, y.number));
  return rows;
}

/**
 * Composite key (random_id + number) ile tek bir kaydı getirir.
 */
export async function getCustomerByCompositeKey(
  supabase: SupabaseClient,
  key: CustomerKey
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("random_id", key.random_id)
    .eq("number", key.number)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Customer | null;
}

/**
 * Hayvan numarasıyla arama: virgülle ayrılmış string içinde tam token eşleşmesi.
 * Örn. "101" → "101, 102" eşleşir; "10" → "101, 102" eşleşmez.
 *
 * Kullanım: tekil bir numara veya virgülle ayrılmış birden fazla numara da
 * verilebilir; her bir token için eşleşen kayıtlar döner.
 */
export async function searchByNumber(
  supabase: SupabaseClient,
  number: string
): Promise<Customer[]> {
  const tokens = number
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (tokens.length === 0) return [];

  // İlk token ile geniş tarama (DB tarafında ILIKE), ardından tam token
  // eşleşmesi için client-side filtre.
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .ilike("number", `%${tokens[0]}%`);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Customer[];
  return rows.filter((c) => tokens.some((t) => animalNumbersInclude(c.number, t)));
}

export async function getCustomerHistory(
  supabase: SupabaseClient,
  hayvanNumber: string,
  randomId?: string | null
): Promise<HistoryEntry[]> {
  // Tercih: random_id ile tarama (composite key'in benzersiz parçası).
  // Geriye dönük uyum: random_id yoksa veya kolon yoksa hayvan_number ile tara.
  if (randomId) {
    const { data, error } = await supabase
      .from(HISTORY_TABLE)
      .select("id, hayvan_number, random_id, snapshot, recorded_at, action")
      .eq("random_id", randomId)
      .order("recorded_at", { ascending: false });
    if (!error) return (data ?? []) as HistoryEntry[];
    if (!isMissingHistoryTableError(error.message) && !isMissingRandomIdError(error.message)) {
      throw new Error(error.message);
    }
    if (isMissingHistoryTableError(error.message)) return [];
    // random_id kolonu yoksa hayvan_number fallback'ine düş.
  }

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
  const byNum = await searchByNumber(supabase, number);
  const w = whose.trim().toLocaleLowerCase("tr-TR");
  return byNum.filter((c) =>
    String(c.whose ?? "").toLocaleLowerCase("tr-TR").includes(w)
  );
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

/**
 * Telefon numarasıyla arama: girdi normalize edilir, tam veya kısmi
 * (ILIKE) eşleşme döner.
 */
export async function searchByPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<Customer[]> {
  const normalized = normalizePhone(phone);
  const target = normalized || String(phone ?? "").replace(/\D/g, "");
  if (!target) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .ilike("phone_number", `%${target}%`);
  if (error) throw new Error(error.message);
  return (data ?? []) as Customer[];
}

function isMissingAgreedTotalError(message: string): boolean {
  return /agreed_total/i.test(message) && /does not exist|column/i.test(message);
}

function isMissingRandomIdError(message: string): boolean {
  return /random_id/i.test(message) && /does not exist|column/i.test(message);
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
  let rows: Array<{
    price?: unknown;
    payment_status?: unknown;
    agreed_total?: unknown;
    number?: unknown;
  }>;
  let count: number | null;

  const full = await supabase
    .from(TABLE)
    .select("price, payment_status, agreed_total, number", { count: "exact" });

  if (full.error && isMissingAgreedTotalError(full.error.message)) {
    const legacy = await supabase
      .from(TABLE)
      .select("price, payment_status, number", { count: "exact" });
    if (legacy.error) throw new Error(legacy.error.message);
    rows = legacy.data ?? [];
    count = legacy.count ?? null;
    const sumPriceAll = rows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
    const unpaidRows = rows.filter((r) => r.payment_status !== "Ödendi");
    const unpaidTotal = unpaidRows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
    const collectedTotal = Math.max(0, sumPriceAll - unpaidTotal);
    const animalCount = rows.reduce((sum, r) => sum + countAnimals(String(r.number ?? "")), 0);
    return {
      count: count ?? 0,
      animalCount,
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
  const total = rows.reduce((sum, r) => sum + agreedOf(r), 0);
  const unpaidRows = rows.filter((r) => r.payment_status !== "Ödendi");
  const unpaidTotal = unpaidRows.reduce((sum, r) => sum + Number(r.price ?? 0), 0);
  const collectedTotal = Math.max(0, total - unpaidTotal);
  /** Toplam hayvan sayısı: her kayıttaki virgülle ayrılmış numaraların toplamı. */
  const animalCount = rows.reduce((sum, r) => sum + countAnimals(String(r.number ?? "")), 0);

  return {
    count: count ?? 0,
    animalCount,
    total,
    unpaidTotal,
    unpaidCount: unpaidRows.length,
    collectedTotal,
  };
}

export async function getGroupStats(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("group_category, price, number");
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const groupMap: Record<string, { count: number; animalCount: number; total: number }> = {};

  for (const row of rows) {
    const key = (row.group_category as string) || "__grupsuz__";
    if (!groupMap[key]) groupMap[key] = { count: 0, animalCount: 0, total: 0 };
    groupMap[key].count += 1;
    groupMap[key].animalCount += countAnimals(String(row.number ?? ""));
    groupMap[key].total += Number(row.price ?? 0);
  }

  return groupMap;
}
