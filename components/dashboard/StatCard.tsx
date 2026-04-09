import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: { value: string; up: boolean };
  accent?: "gold" | "emerald" | "amber" | "rose" | "blue";
}

const accentMap: Record<
  NonNullable<StatCardProps["accent"]>,
  { icon: string; badge: string; border: string }
> = {
  gold:    { icon: "var(--gold-dim)",    badge: "var(--gold)",    border: "var(--gold-glow)" },
  emerald: { icon: "var(--emerald-dim)", badge: "var(--emerald)", border: "rgba(45,212,160,0.25)" },
  amber:   { icon: "var(--amber-dim)",   badge: "var(--amber)",   border: "rgba(245,166,35,0.25)" },
  rose:    { icon: "var(--rose-dim)",    badge: "var(--rose)",    border: "rgba(244,74,107,0.25)" },
  blue:    { icon: "var(--blue-dim)",    badge: "var(--blue)",    border: "rgba(108,135,234,0.25)" },
};

export function StatCard({
  label,
  value,
  description,
  icon,
  trend,
  accent = "gold",
}: StatCardProps) {
  const colors = accentMap[accent];

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        {icon && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: colors.icon, color: colors.badge }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <p
          className="text-3xl font-semibold leading-none"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </p>
        {trend && (
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{
              color: trend.up ? "var(--emerald)" : "var(--rose)",
              background: trend.up ? "var(--emerald-dim)" : "var(--rose-dim)",
            }}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
