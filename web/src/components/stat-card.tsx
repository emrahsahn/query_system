import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  colorClass?: string;
  borderClass?: string;
}

export function StatCard({ label, value, sub, colorClass, borderClass }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border-2 bg-card p-8 text-center shadow-md",
        borderClass ?? "border-primary"
      )}
    >
      <p className="mb-2 text-xl text-muted-foreground">{label}</p>
      <p className={cn("text-5xl font-extrabold leading-none", colorClass ?? "text-green")}>
        {value}
      </p>
      {sub && <p className="mt-3 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}
