"use client";
import { useState, useMemo } from "react";
import type { Customer } from "@/lib/types";
import { CustomerCard } from "@/components/customer-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

const PAGE_SIZE = 12;

type SortField = "default" | "number" | "price" | "type" | "whose" | "from_whom";
type SortDir = "asc" | "desc";

function sortCustomers(list: Customer[], field: SortField, dir: SortDir): Customer[] {
  if (field === "default") return dir === "desc" ? [...list].reverse() : list;

  return [...list].sort((a, b) => {
    let av: string | number, bv: string | number;
    if (field === "number") {
      av = Number(a.number) || 0;
      bv = Number(b.number) || 0;
    } else if (field === "price") {
      av = Number(a.price) || 0;
      bv = Number(b.price) || 0;
    } else {
      av = String((a as unknown as Record<string, unknown>)[field] ?? "").toLowerCase();
      bv = String((b as unknown as Record<string, unknown>)[field] ?? "").toLowerCase();
    }
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

function toCSV(customers: Customer[]): string {
  const headers = [
    "Numara","Cins","Özellik","Küpe Rengi","Hayvan Rengi","Sahip","Kimden",
    "Fiyat (TL)","Telefon","Ödeme Detayı","Ödeme Durumu",
  ];
  const rows = customers.map((c) => [
    c.number, c.type, c.special, c.color_of_earring, c.color_of_animal,
    c.whose, c.from_whom, c.price, c.phone_number, c.payment_method, c.payment_status,
  ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
  return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
}

interface Props { initialCustomers: Customer[] }

export function CustomersClient({ initialCustomers }: Props) {
  const [sortField, setSortField] = useState<SortField>("default");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  const sorted = useMemo(
    () => sortCustomers(initialCustomers, sortField, sortDir),
    [initialCustomers, sortField, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSortField(v: string) {
    setSortField(v as SortField);
    setPage(1);
  }
  function handleSortDir(v: string) {
    setSortDir(v as SortDir);
    setPage(1);
  }

  function downloadCSV() {
    const blob = new Blob([toCSV(sorted)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "musteriler.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Kontroller */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex gap-2 flex-1">
          <Select value={sortField} onValueChange={handleSortField}>
            <SelectTrigger className="flex-1 sm:flex-none sm:w-48">
              <SelectValue placeholder="Sıralama ölçütü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Varsayılan</SelectItem>
              <SelectItem value="number">Numara</SelectItem>
              <SelectItem value="price">Fiyat</SelectItem>
              <SelectItem value="type">Cins</SelectItem>
              <SelectItem value="whose">Kime Ait</SelectItem>
              <SelectItem value="from_whom">Kimden Alındı</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortDir} onValueChange={handleSortDir}>
            <SelectTrigger className="w-28 sm:w-36 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Artan ↑</SelectItem>
              <SelectItem value="desc">Azalan ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={downloadCSV} className="w-full sm:w-auto sm:ml-auto">
          <Download className="h-4 w-4 mr-2" />
          CSV İndir
        </Button>
      </div>

      {/* Kartlar */}
      {paginated.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Kayıtlı müşteri bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((c) => (
            <CustomerCard key={c.number} customer={c} />
          ))}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline" size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Sayfa {page} / {totalPages}
          </span>
          <Button
            variant="outline" size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
