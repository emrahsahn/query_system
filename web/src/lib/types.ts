export type PaymentStatus = "Belirsiz" | "Ödendi" | "Kısmi Ödeme" | "Ödenmedi";

export interface Customer {
  number: string;
  type: string;
  special: string;
  color_of_earring: string;
  color_of_animal: string;
  whose: string;
  from_whom: string;
  price: number;
  phone_number: string;
  payment_method: string;
  payment_status: PaymentStatus;
}

export const PAYMENT_OPTIONS: PaymentStatus[] = [
  "Belirsiz",
  "Ödendi",
  "Kısmi Ödeme",
  "Ödenmedi",
];

export const TABLE = "kurbanlık_hesap";
