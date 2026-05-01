import { login } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Başlık */}
        <div className="text-center">
          <div className="text-6xl mb-4">🐐</div>
          <h1 className="text-2xl font-bold text-foreground">Kurbanlık Takip Sistemi</h1>
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
