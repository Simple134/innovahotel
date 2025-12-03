import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  accent?: "primary" | "emerald" | "amber" | "rose";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-[#DE9F73]/15 text-[#DE9F73]",
  emerald: "bg-emerald-500/15 text-emerald-300",
  amber: "bg-amber-500/15 text-amber-300",
  rose: "bg-rose-500/15 text-rose-300",
};

export function StatCard({
  label,
  value,
  description,
  icon,
  accent = "primary",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/60 p-4 text-sm text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg text-white">{label}</p>
          <p className="mt-1 text-xl font-semibold">{value}</p>
        </div>
        {icon && (
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-lg ${accentClasses[accent]}`}
          >
            {icon}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-2 text-lg text-white">{description}</p>
      )}
    </div>
  );
}
