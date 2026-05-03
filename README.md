# Kurbanlik Takip Sistemi

Bu proje, kurbanlik kayitlarini yonetmek icin **Next.js + Supabase** tabanli web uygulamasidir.
Streamlit/Python yapisindan tamamen cikarilip modern web mimarisine gecmistir.

## Ozellikler

- Dashboard: toplam kayit, toplam alacak, odenmemis tutar
- Musteri listeleme: siralama, sayfalama, CSV indirme
- Gelismis sorgulama: numara, sahip, tur, telefon
- CRUD: ekle, guncelle, sil
- Giris sistemi: sabit admin kullanicisi
- Dark/light tema

## Teknolojiler

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL)
- react-hook-form + zod

## Proje Yapisi

```text
new_query_system/
├─ web/                 # Next.js uygulamasi
├─ supabase/            # migration ve seed dosyalari
├─ data/                # lokal notlar/eski kaynaklar
├─ doc/                 # dokumanlar
└─ test/                # test dosyalari
```

## Gereksinimler

- Node.js 20+
- npm 10+
- Supabase projesi

## Kurulum

```bash
cd web
npm install
```

## Ortam Degiskenleri

`web/.env.local` dosyasini olusturun:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

ADMIN_USERNAME=admin
ADMIN_PASSWORD=33admin12345
SESSION_SECRET=super-secret-string
```

Not: Ornek dosya olarak `web/.env.local.example` bulunur.

## Veritabani Kurulumu

Migration dosyalarini degistirip uzak projeye yeniden `db push` edecekseniz, once CLI'nin
tuttugu kayitlari temizleyin (yoksa eski migration ozetiyle cakisma olur):

```sql
-- Supabase SQL Editor veya psql; dosya: supabase/clear_migration_history.sql
DELETE FROM supabase_migrations.schema_migrations;
```

Ardindan migration dosyalarini Supabase'e uygulayin:

```bash
supabase db push
```

veya SQL Editor ile `supabase/migrations` altindaki SQL dosyalarini **sirayla** calistirin.
Test verisini yuklemek icin: `supabase/seed.sql`

RLS acik oldugu icin policy migration'larinin da uygulanmis oldugundan emin olun.

## Gelistirme

```bash
cd web
npm run dev
```

Uygulama: [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
cd web
npm run build
npm run start
```

## Vercel Deploy

- Root Directory: `web`
- Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD`
  - `SESSION_SECRET`

## Notlar

- Bu repo artik Streamlit/Python runtime bagimliligi icermez.
- Eski kodlar temizlenmistir, aktif uygulama `web/` altindadir.
