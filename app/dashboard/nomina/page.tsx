"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { Plus, X, Download } from "lucide-react";

type PayrollRecord = Tables<"payroll_records">;
type Employee = Tables<"employees">;
type Hotel = Tables<"hotels">;

type PayrollRow = PayrollRecord & { employee?: Employee; hotel?: Hotel };

const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const now = new Date();

export default function NominaPage() {
  const [records, setRecords] = useState<PayrollRow[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [baseSalary, setBaseSalary] = useState("");
  const [bonuses, setBonuses] = useState("0");
  const [deductions, setDeductions] = useState("0");

  const fetchAll = async () => {
    const { data } = await supabaseBrowser.from("payroll_records").select("*").order("period_year", { ascending: false }).order("period_month", { ascending: false });
    const base = (data ?? []) as PayrollRecord[];

    const [{ data: emps }, { data: htls }] = await Promise.all([
      supabaseBrowser.from("employees").select("*"),
      supabaseBrowser.from("hotels").select("*"),
    ]);

    const empMap = new Map((emps ?? []).map(e => [(e as Employee).id, e as Employee]));
    const htlMap = new Map((htls ?? []).map(h => [(h as Hotel).id, h as Hotel]));

    setRecords(base.map(r => ({ ...r, employee: empMap.get(r.employee_id), hotel: r.hotel_id ? htlMap.get(r.hotel_id) : undefined })));
    setEmployees((emps ?? []) as Employee[]);
    setHotels((htls ?? []) as Hotel[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setEmployeeId(""); setHotelId(""); setMonth(now.getMonth() + 1); setYear(now.getFullYear());
    setBaseSalary(""); setBonuses("0"); setDeductions("0");
    setError(null); setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!employeeId) { setError("Selecciona un empleado."); return; }
    setSaving(true); setError(null);

    const { error: err } = await supabaseBrowser.from("payroll_records").insert({
      employee_id: employeeId,
      hotel_id: hotelId || null,
      period_year: year,
      period_month: month,
      base_salary: parseFloat(baseSalary) || 0,
      bonuses: parseFloat(bonuses) || 0,
      deductions: parseFloat(deductions) || 0,
    });

    if (err) { setError(err.message.includes("unique") ? "Ya existe un registro para este empleado en ese período." : "No se pudo guardar."); setSaving(false); return; }
    await fetchAll();
    resetForm();
    setSaving(false);
  };

  const totalPaid    = records.filter(r => r.status === "paid").reduce((s, r) => s + (r.total ?? 0), 0);
  const totalPending = records.filter(r => r.status === "pending").reduce((s, r) => s + (r.total ?? 0), 0);

  const inputStyle = { background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

  const markPaid = async (id: string) => {
    await supabaseBrowser.from("payroll_records").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "paid" } : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}>Nómina</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Pagos mensuales al personal</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
            <Download size={14} /> Exportar
          </button>
          <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90" style={{ background: "var(--gold)", color: "#0D0F1A" }}>
            <Plus size={14} /> Nuevo registro
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total pagado", value: fmt(totalPaid), color: "var(--emerald)" },
          { label: "Pendiente de pago", value: fmt(totalPending), color: "var(--amber)" },
          { label: "Total registros", value: records.length.toString(), color: "var(--gold)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            <p className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--gold-glow)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Nuevo registro de nómina</h2>
            <button type="button" onClick={resetForm} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
          </div>
          {error && <p className="text-xs rounded-lg px-3 py-2" style={{ background: "var(--rose-dim)", color: "var(--rose)" }}>{error}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Empleado *</label>
              <select className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={employeeId} onChange={e => { setEmployeeId(e.target.value); const emp = employees.find(em => em.id === e.target.value); if (emp) setBaseSalary(emp.base_salary.toString()); }}>
                <option value="">Selecciona empleado</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} — {e.role}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Hotel</label>
              <select className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={hotelId} onChange={e => setHotelId(e.target.value)}>
                <option value="">Sin hotel específico</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Mes</label>
              <select className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={month} onChange={e => setMonth(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Año</label>
              <input type="number" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={year} onChange={e => setYear(parseInt(e.target.value))} onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Salario base</label>
              <input type="number" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={baseSalary} onChange={e => setBaseSalary(e.target.value)} placeholder="0.00" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Bonificaciones</label>
              <input type="number" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={bonuses} onChange={e => setBonuses(e.target.value)} placeholder="0.00" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Deducciones</label>
              <input type="number" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={deductions} onChange={e => setDeductions(e.target.value)} placeholder="0.00" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
              <button type="button" onClick={resetForm} className="rounded-lg px-4 py-2 text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "#0D0F1A", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando..." : "Guardar registro"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Empleado", "Hotel", "Período", "Salario base", "Bonos", "Deducciones", "Total", "Estado"].map((h, i) => (
                <th key={h} className={`px-5 py-3.5 text-xs font-medium uppercase tracking-wide ${i >= 3 && i <= 6 ? "text-right" : "text-left"}`} style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Cargando...</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>No hay registros de nómina aún.</td></tr>}
            {!loading && records.map((r, idx) => (
              <tr key={r.id} style={{ borderBottom: idx < records.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <td className="px-5 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{r.employee?.full_name ?? "—"}</td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{r.hotel?.name ?? "—"}</td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{MONTHS[r.period_month - 1]} {r.period_year}</td>
                <td className="px-5 py-3 text-right text-sm" style={{ color: "var(--text-secondary)" }}>{fmt(r.base_salary)}</td>
                <td className="px-5 py-3 text-right text-sm" style={{ color: "var(--emerald)" }}>+{fmt(r.bonuses)}</td>
                <td className="px-5 py-3 text-right text-sm" style={{ color: "var(--rose)" }}>−{fmt(r.deductions)}</td>
                <td className="px-5 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(r.total ?? 0)}</td>
                <td className="px-5 py-3">
                  {r.status === "paid" ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>Pagado</span>
                  ) : (
                    <button type="button" onClick={() => markPaid(r.id)} className="text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80" style={{ background: "var(--amber-dim)", color: "var(--amber)" }}>
                      Marcar pagado
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
