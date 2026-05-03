-- Supabase CLI (`supabase db push`) ile uzak projede migration kayitlarini sifirlamak icin.
-- Migration dosyalarini degistirip veya yeniden adlandirip tekrar push edecekseniz,
-- once bu sorguyu SQL Editor'de calistirin; aksi halde CLI eski version hash'leriyle
-- uyusmazlik verebilir.
--
-- NOT: Tablo yalnizca en az bir kez `db push` veya `migration up` calismis projelerde
-- bulunur. SQL Editor ile sadece elle SQL calistirdiysaniz bos donebilir.

DELETE FROM supabase_migrations.schema_migrations;
