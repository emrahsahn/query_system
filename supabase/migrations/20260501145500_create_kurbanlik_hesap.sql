-- Generated from current Supabase project for account migration
create table if not exists public."kurbanlık_hesap" (
  number text primary key,
  type text,
  special text,
  color_of_earring text,
  color_of_animal text,
  whose text,
  from_whom text,
  price double precision,
  phone_number text,
  payment_method text
);

alter table public."kurbanlık_hesap" enable row level security;
