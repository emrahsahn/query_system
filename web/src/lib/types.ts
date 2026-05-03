export type PaymentStatus = "Belirsiz" | "Ödendi" | "Kısmi Ödeme" | "Ödenmedi";

export interface Customer {
  number: string;
  type: string;
  special: string;
  color_of_earring: string;
  color_of_animal: string;
  whose: string;
  from_whom: string;
  /** Anlaşılan / sözleşme tutarı; kısmi ödemede sabit kalır. */
  agreed_total?: number | null;
  price: number;
  phone_number: string;
  payment_method: string;
  payment_status: PaymentStatus;
  group_category: string;
  address: string;
  spray_paint_color: string;
}

export const PAYMENT_OPTIONS: PaymentStatus[] = [
  "Belirsiz",
  "Ödendi",
  "Kısmi Ödeme",
  "Ödenmedi",
];

export const GROUP_CATEGORIES = [
  "1.Gün Kesilecek Küçük Mallar",
  "1.Gün Kesilecek Büyük Mallar",
  "2.Gün Kesilecek Küçük Mallar",
  "2.Gün Kesilecek Büyük Mallar",
  "Pazardan Kendi Alacaklar",
  "Köyden Kendi Alacaklar",
  "Çarşıya Dağıtılacaklar",
  "Köye Dağıtılacaklar",
  "Kesilip Dükkana Gönderilecekler",
] as const;

export type GroupCategory = typeof GROUP_CATEGORIES[number];

export const TABLE = "kurbanlık_hesap";

export const HISTORY_TABLE = "kurbanlik_hesap_history";

export type HistoryAction = "create" | "update" | "delete";

/** Tetikleyicide kaydedilen jsonb snapshot (alanlar DB ile uyumlu). */
export interface CustomerSnapshot {
  number?: string;
  type?: string | null;
  special?: string | null;
  color_of_earring?: string | null;
  color_of_animal?: string | null;
  whose?: string | null;
  from_whom?: string | null;
  price?: number | null;
  agreed_total?: number | null;
  phone_number?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  group_category?: string | null;
  address?: string | null;
  spray_paint_color?: string | null;
}

export interface HistoryEntry {
  id: string;
  hayvan_number: string;
  snapshot: CustomerSnapshot;
  recorded_at: string;
  action: HistoryAction;
}
