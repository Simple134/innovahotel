"use client";

import {
  FileBarChart2,
  Download,
  FileText,
  TrendingUp,
  BedDouble,
  Users,
  DollarSign,
  ChevronRight,
} from "lucide-react";

const reportTypes = [
  {
    id: "ocupacion",
    title: "Ocupación mensual",
    description: "Porcentaje de ocupación por hotel y por habitación durante el mes seleccionado.",
    icon: BedDouble,
    color: "var(--gold)",
    bg: "var(--gold-dim)",
    formats: ["PDF", "Excel"],
  },
  {
    id: "ingresos",
    title: "Ingresos y facturación",
    description: "Resumen de ingresos por reservas, desglosado por hotel, tipo de habitación y período.",
    icon: DollarSign,
    color: "var(--emerald)",
    bg: "var(--emerald-dim)",
    formats: ["PDF", "Excel"],
  },
  {
    id: "gastos",
    title: "Gastos operativos",
    description: "Detalle de gastos por categoría y hotel, con comparativa mensual.",
    icon: TrendingUp,
    color: "var(--rose)",
    bg: "var(--rose-dim)",
    formats: ["PDF", "Excel"],
  },
  {
    id: "huespedes",
    title: "Registro de huéspedes",
    description: "Listado completo de huéspedes con estadías, habitaciones y fechas.",
    icon: Users,
    color: "var(--blue)",
    bg: "var(--blue-dim)",
    formats: ["PDF", "Excel"],
  },
  {
    id: "nomina",
    title: "Nómina mensual",
    description: "Resumen de pagos al personal por período, hotel y categoría de puesto.",
    icon: FileText,
    color: "var(--amber)",
    bg: "var(--amber-dim)",
    formats: ["PDF", "Excel"],
  },
  {
    id: "general",
    title: "Reporte general",
    description: "Visión consolidada de todos los indicadores clave de la cadena hotelera.",
    icon: FileBarChart2,
    color: "var(--gold)",
    bg: "var(--gold-dim)",
    formats: ["PDF", "Excel"],
  },
];

const recentReports = [
  { name: "Ocupación — Marzo 2026",        type: "PDF",   date: "2026-04-01", size: "248 KB" },
  { name: "Ingresos — Q1 2026",            type: "Excel", date: "2026-04-01", size: "512 KB" },
  { name: "Gastos operativos — Marzo 2026",type: "PDF",   date: "2026-03-31", size: "184 KB" },
  { name: "Nómina — Marzo 2026",           type: "PDF",   date: "2026-03-30", size: "96 KB" },
];

export default function ReportesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}
          >
            Reportes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Genera y descarga reportes en PDF o Excel
          </p>
        </div>
      </div>

      {/* Report cards */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          Tipos de reporte
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="rounded-xl p-5 flex flex-col gap-4 group cursor-pointer transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: report.bg, color: report.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {report.title}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  {report.formats.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
                      style={{
                        background: fmt === "PDF" ? "var(--rose-dim)" : "var(--emerald-dim)",
                        color: fmt === "PDF" ? "var(--rose)" : "var(--emerald)",
                        border: `1px solid ${fmt === "PDF" ? "rgba(244,74,107,0.2)" : "rgba(45,212,160,0.2)"}`,
                      }}
                    >
                      <Download size={11} />
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent reports */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Reportes generados recientemente
          </h2>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {recentReports.map((r) => (
            <div key={r.name} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{
                    background: r.type === "PDF" ? "var(--rose-dim)" : "var(--emerald-dim)",
                    color: r.type === "PDF" ? "var(--rose)" : "var(--emerald)",
                  }}
                >
                  {r.type}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {r.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(r.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })} · {r.size}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center gap-1 text-xs shrink-0 transition-opacity hover:opacity-70"
                style={{ color: "var(--gold)" }}
              >
                Descargar <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
