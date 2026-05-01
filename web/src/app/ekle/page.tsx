"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "@/lib/validations";
import { addCustomer } from "@/actions/customers";
import { PAYMENT_OPTIONS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";

export default function EklePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { payment_status: "Belirsiz" },
  });

  const payStatus = watch("payment_status");

  async function onSubmit(values: CustomerFormValues) {
    setServerError("");
    const result = await addCustomer(values);
    if (result?.error) {
      setServerError(result.error);
    } else {
      setSuccess(true);
      reset();
      setTimeout(() => { setSuccess(false); router.push("/musteriler"); }, 1500);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground text-center">✨ Yeni Müşteri Kaydı</h1>

      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm max-w-3xl mx-auto">
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-700/20 border border-green-700 px-4 py-3 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            Müşteri başarıyla eklendi! Yönlendiriliyor...
          </div>
        )}
        {serverError && (
          <p className="mb-4 text-sm font-medium text-destructive rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-base font-semibold text-muted-foreground border-b border-border pb-2">
            Hayvan ve Müşteri Bilgileri
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="number">🔢 Hayvan Numarası *</Label>
              <Input id="number" placeholder="Örn: 101" {...register("number")} />
              {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">🐑 Cinsi</Label>
              <Input id="type" placeholder="Örn: Koç, Koyun, Keçi" {...register("type")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special">✨ Ekstra Özellik</Label>
              <Input id="special" placeholder="Örn: Çift boynuz" {...register("special")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_of_earring">🏷️ Küpe Rengi</Label>
              <Input id="color_of_earring" placeholder="Örn: Sarı" {...register("color_of_earring")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color_of_animal">🎨 Hayvan Rengi</Label>
              <Input id="color_of_animal" placeholder="Örn: Beyaz" {...register("color_of_animal")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whose">👤 Kime Ait (Müşteri)</Label>
              <Input id="whose" placeholder="Ad Soyad" {...register("whose")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_whom">📦 Kimden Alındı</Label>
              <Input id="from_whom" placeholder="Tedarikçi adı" {...register("from_whom")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">💰 Fiyat (TL)</Label>
              <Input id="price" placeholder="Örn: 15400.50" {...register("price")} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">📞 Telefon Numarası</Label>
              <Input id="phone_number" placeholder="Örn: 0532 123 45 67" {...register("phone_number")} />
              {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">💳 Nasıl / Ne Kadar Ödendi?</Label>
              <Input id="payment_method" placeholder="Örn: Nakit 5000 TL" {...register("payment_method")} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>📋 Ödeme Durumu</Label>
              <Select value={payStatus} onValueChange={(v) => setValue("payment_status", v as CustomerFormValues["payment_status"])}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "✅ Sisteme Ekle"}
          </Button>
        </form>
      </div>
    </div>
  );
}
