"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard": "Resumen",
  "/dashboard/rooms": "Habitaciones",
  "/dashboard/bookings": "Reservas",
  "/dashboard/guests": "Huéspedes",
  "/dashboard/register": "Registrar huésped",
  "/dashboard/hoteles": "Hoteles",
  "/dashboard/empleados": "Empleados",
  "/dashboard/nomina": "Nómina",
  "/dashboard/gastos": "Gastos",
  "/dashboard/reportes": "Reportes",
};

export function Topbar() {
  const pathname = usePathname();
  const currentLabel = routeLabels[pathname] ?? "Dashboard";

  return (
    <header
      className="flex items-center justify-between px-6 py-3.5"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-default)",
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span style={{ color: "var(--text-muted)" }}>InnovaHotel</span>
        <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {currentLabel}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification placeholder */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell size={15} />
        </button>

        {/* User avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
          style={{
            background: "var(--gold-dim)",
            color: "var(--gold)",
            border: "1px solid var(--gold-glow)",
          }}
        >
          AD
        </div>
      </div>
    </header>
  );
}
