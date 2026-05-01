import { createClient } from "@/lib/supabase/server";
import { getCustomers } from "@/lib/supabase/queries";
import { DeleteClient } from "./delete-client";

export const dynamic = "force-dynamic";

export default async function SilPage() {
  const supabase = await createClient();
  const customers = await getCustomers(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground text-center">🗑️ Müşteri Kaydı Sil</h1>
      <DeleteClient customers={customers} />
    </div>
  );
}
