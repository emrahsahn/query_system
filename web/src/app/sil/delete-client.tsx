"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Customer } from "@/lib/types";
import { deleteCustomer } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerCard } from "@/components/customer-card";
import { AlertTriangle, Trash2 } from "lucide-react";

interface Props { customers: Customer[] }

export function DeleteClient({ customers }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(customers[0]?.number ?? "");
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const customer = customers.find((c) => c.number === selected);

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    setError("");
    const result = await deleteCustomer(selected);
    if (result?.error) {
      setError(result.error);
      setDeleting(false);
    } else {
      setOpen(false);
      router.refresh();
    }
  }

  if (customers.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">Kayıtlı hiçbir müşteri bulunamadı.</p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Uyarı */}
      <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-foreground">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          Sistemden silmek istediğiniz kaydı aşağıdan seçin.{" "}
          <strong className="text-destructive">Bu işlem geri alınamaz!</strong>
        </div>
      </div>

      {/* Seçim */}
      <div className="space-y-2">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Silinecek kaydı seçin" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.number} value={c.number} className="truncate max-w-xs">
                #{c.number} — {c.whose || "—"} — {c.type || "—"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Seçilen kaydın önizlemesi */}
      {customer && <CustomerCard customer={customer} />}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Silme dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full" disabled={!selected}>
            <Trash2 className="h-4 w-4 mr-2" />
            Kaydı Sil
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Emin misiniz?</DialogTitle>
            <DialogDescription>
              <strong>#{selected}</strong> numaralı kayıt kalıcı olarak silinecektir.
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Siliniyor..." : "Evet, Kalıcı Olarak Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
