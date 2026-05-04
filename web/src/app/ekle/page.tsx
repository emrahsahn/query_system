"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "@/lib/validations";
import { addCustomer } from "@/actions/customers";
import { PAYMENT_OPTIONS, GROUP_CATEGORIES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { formatMoneyInputTR, formatPhoneInputTR } from "@/lib/input-format";

export default function EklePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { payment_status: "Belirsiz", group_category: "" },
  });

  const payStatus = watch("payment_status");
  const groupCategory = watch("group_category");
  const showAddress = groupCategory === "Köye Dağıtılacaklar" || groupCategory === "Çarşıya Dağıtılacaklar";

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
              <Input id="color_of_animal" placeholder="Örn: Siyah" {...register("color_of_animal")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spray_paint_color">🎨 Sıkılan Boya</Label>
              <Input id="spray_paint_color" placeholder="Örn: Boynuza Kırmızı" {...register("spray_paint_color")} />
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
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <Input
                    id="price"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Örn: 15.400,50"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(formatMoneyInputTR(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">📞 Telefon Numarası</Label>
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <Input
                    id="phone_number"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Örn: 0532 123 45 67"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(formatPhoneInputTR(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">💳 Nasıl / Ne Kadar Ödendi?</Label>
              <Input id="payment_method" placeholder="Örn: Nakit 5000 TL" {...register("payment_method")} />
            </div>
            
            <div className="space-y-2">
              <Label>📋 Ödeme Durumu</Label>
              <Select value={payStatus} onValueChange={(v) => setValue("payment_status", v as CustomerFormValues["payment_status"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.payment_status && (
                <p className="text-xs text-destructive">{errors.payment_status.message}</p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>📂 Grup Kategorisi</Label>
              <Select value={groupCategory ?? ""} onValueChange={(v) => setValue("group_category", v === "__none__" ? "" : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Grup Seçin (Opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Grup Seçilmedi —</SelectItem>
                  {GROUP_CATEGORIES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {showAddress && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">📍 Teslimat Adresi</Label>
                <Input id="address" placeholder="Açık adres giriniz..." {...register("address")} />
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="note">📝 Not</Label>
              <Textarea
                id="note"
                placeholder="Önemli notlarınızı buraya yazabilirsiniz..."
                rows={4}
                maxLength={2000}
                className="resize-y min-h-[88px]"
                {...register("note")}
              />
              {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
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
