"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { searchByNumber } from "@/lib/supabase/queries";
import type { Customer } from "@/lib/types";
import { deleteCustomer } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerCard } from "@/components/customer-card";
import { AlertTriangle, Search, Trash2 } from "lucide-react";

export function DeleteClient() {
  const router = useRouter();
  const [searchNum, setSearchNum] = useState("");
  const [preview, setPreview] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!searchNum.trim()) return;
    setSearching(true);
    setError("");
    setPreview(null);
    const supabase = createClient();
    try {
      const res = await searchByNumber(supabase, searchNum.trim());
      setPreview(res[0] ?? null);
      if (!res[0]) setError(`#${searchNum.trim()} numaralı kayıt bulunamadı.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Arama sırasında hata oluştu.");
    } finally {
      setSearching(false);
    }
  }

  async function handleDelete() {
    if (!preview) return;
    setDeleting(true);
    setError("");
    const result = await deleteCustomer(preview.number);
    if (result?.error) {
      setError(result.error);
      setDeleting(false);
    } else {
      setOpen(false);
      setPreview(null);
      setSearchNum("");
      router.refresh();
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-foreground">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          Önce hayvan numarasını arayın; doğru kaydı gördükten sonra silebilirsiniz.{" "}
          <strong className="text-destructive">Bu işlem geri alınamaz!</strong>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sil-search-num">Hayvan numarası</Label>
          <div className="flex gap-2">
            <Input
              id="sil-search-num"
              value={searchNum}
              onChange={(e) => setSearchNum(e.target.value)}
              placeholder="Örn: 101"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button variant="outline" size="icon" onClick={handleSearch} disabled={searching}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {preview && (
          <>
            <p className="text-xs text-muted-foreground">Silinecek kayıt özeti:</p>
            <CustomerCard customer={preview} />
          </>
        )}

        {!preview && !error && !searching && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Numarayı girip arama yapın.
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="button"
          variant="destructive"
          className="w-full"
          disabled={!preview}
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Kaydı Sil
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Emin misiniz?</DialogTitle>
            <DialogDescription>
              {preview && (
                <>
                  <strong>#{preview.number}</strong> numaralı kayıt kalıcı olarak silinecektir.
                  Bu işlem geri alınamaz.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting || !preview}>
              {deleting ? "Siliniyor..." : "Evet, Kalıcı Olarak Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
