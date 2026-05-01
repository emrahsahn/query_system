import { createClient } from "@/lib/supabase/server";
import { getCustomers } from "@/lib/supabase/queries";
import { CustomersClient } from "./customers-client";

export const dynamic = "force-dynamic";

export default async function MusterilerPage() {
  const supabase = await createClient();
  const customers = await getCustomers(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">📋 Kayıtlı Tüm Müşteriler</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Toplam <strong>{customers.length}</strong> kayıt
        </p>
      </div>
      <CustomersClient initialCustomers={customers} />
    </div>
  );
}
