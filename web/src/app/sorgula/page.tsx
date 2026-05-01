"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  searchByNumber, searchByOwner, searchByNumberAndOwner,
  searchByType, searchByPhone,
} from "@/lib/supabase/queries";
import type { Customer } from "@/lib/types";
import { CustomerCard } from "@/components/customer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

type QueryType = "numara" | "sahip" | "numara_sahip" | "tur" | "telefon";

const queryOptions: { value: QueryType; label: string }[] = [
  { value: "numara", label: "Numaraya Göre" },
  { value: "sahip", label: "Sahibe Göre" },
  { value: "numara_sahip", label: "Numara ve Sahibe Göre" },
  { value: "tur", label: "Türe Göre" },
  { value: "telefon", label: "Telefon Numarasına Göre" },
];

export default function SorgulaPage() {
  const [qType, setQType] = useState<QueryType>("numara");
  const [num, setNum] = useState("");
  const [owner, setOwner] = useState("");
  const [kind, setKind] = useState("");
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<Customer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    try {
      let res: Customer[] = [];

      if (qType === "numara") {
        if (!num.trim()) { setError("Hayvan numarasını girin."); setLoading(false); return; }
        res = await searchByNumber(supabase, num.trim());
      } else if (qType === "sahip") {
        if (!owner.trim()) { setError("Sahip adını girin."); setLoading(false); return; }
        res = await searchByOwner(supabase, owner.trim());
      } else if (qType === "numara_sahip") {
        if (!num.trim() || !owner.trim()) { setError("Her iki alanı da doldurun."); setLoading(false); return; }
        res = await searchByNumberAndOwner(supabase, num.trim(), owner.trim());
      } else if (qType === "tur") {
        if (!kind.trim()) { setError("Hayvan türünü girin."); setLoading(false); return; }
        res = await searchByType(supabase, kind.trim());
      } else if (qType === "telefon") {
        const clean = phone.replace(/[\s\-]/g, "");
        const normalized = clean.length === 10 && !clean.startsWith("0") ? "0" + clean : clean;
        if (!/^\d{11}$/.test(normalized)) {
          setError("Geçerli bir telefon numarası girin. Örn: 0532 123 45 67");
          setLoading(false);
          return;
        }
        res = await searchByPhone(supabase, normalized);
      }

      setResults(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">🔍 Müşteri Sorgulama</h1>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label>Sorgulama Yöntemi</Label>
            <Select value={qType} onValueChange={(v) => { setQType(v as QueryType); setResults(null); }}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {queryOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(qType === "numara" || qType === "numara_sahip") && (
              <div className="space-y-2">
                <Label htmlFor="num">🔢 Hayvan Numarası</Label>
                <Input id="num" value={num} onChange={(e) => setNum(e.target.value)} placeholder="Örn: 101" />
              </div>
            )}
            {(qType === "sahip" || qType === "numara_sahip") && (
              <div className="space-y-2">
                <Label htmlFor="owner">👤 Sahip İsmi (kısmi arama)</Label>
                <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Sahip adı" />
              </div>
            )}
            {qType === "tur" && (
              <div className="space-y-2">
                <Label htmlFor="kind">🐑 Hayvan Türü / Cinsi (kısmi arama)</Label>
                <Input id="kind" value={kind} onChange={(e) => setKind(e.target.value)} placeholder="Örn: Koç" />
              </div>
            )}
            {qType === "telefon" && (
              <div className="space-y-2">
                <Label htmlFor="phone">📞 Telefon Numarası</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Örn: 0532 123 45 67" />
              </div>
            )}
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Aranıyor..." : "Sistemi Sorgula"}
          </Button>
        </form>
      </div>

      {results !== null && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>{results.length}</strong> kayıt bulundu.
          </p>
          {results.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Eşleşen kayıt bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((c) => <CustomerCard key={c.number} customer={c} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
