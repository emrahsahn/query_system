import Image from "next/image";
import { LoginForm } from "./login-form";
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Başlık */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo.jpeg"
              alt="Kurban Yönetim Sistemi"
              width={112}
              height={112}
              className="h-28 w-28 object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kurban Yönetim Sistemi</h1>
          <p className="mt-2 text-sm text-muted-foreground">Devam etmek için giriş yapın</p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
