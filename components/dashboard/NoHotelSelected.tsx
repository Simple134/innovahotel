"use client";

import Link from "next/link";
import { Building2, ChevronRight } from "lucide-react";

export function NoHotelSelected() {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <Building2 size={28} style={{ color: "var(--text-muted)" }} />
      </div>

      <div className="space-y-1.5">
        <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          Ningún hotel seleccionado
        </p>
        <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
          Selecciona un hotel desde la barra lateral para ver y gestionar sus datos.
        </p>
      </div>

      <Link
        href="/dashboard/hoteles"
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
        style={{ background: "var(--gold)", color: "#0D0F1A" }}
      >
        Ir a Hoteles
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
