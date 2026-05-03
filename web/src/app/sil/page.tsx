import { DeleteClient } from "./delete-client";

export const dynamic = "force-dynamic";

export default function SilPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground text-center">🗑️ Müşteri Kaydı Sil</h1>
      <DeleteClient />
    </div>
  );
}
