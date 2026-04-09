"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { Users2, Plus, X, Mail, Phone } from "lucide-react";

type Employee = Tables<"employees">;
type Hotel = Tables<"hotels">;

const roleColors: Record<string, { bg: string; color: string }> = {
  Gerente:       { bg: "var(--gold-dim)",    color: "var(--gold)" },
  Recepcionista: { bg: "var(--blue-dim)",    color: "var(--blue)" },
  Conserje:      { bg: "var(--emerald-dim)", color: "var(--emerald)" },
  Limpieza:      { bg: "var(--amber-dim)",   color: "var(--amber)" },
};

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [role, setRole] = useState("Recepcionista");
  const [baseSalary, setBaseSalary] = useState("");
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);

  const fetchAll = async () => {
    const [{ data: emps }, { data: htls }] = await Promise.all([
      supabaseBrowser.from("employees").select("*").order("full_name"),
      supabaseBrowser.from("hotels").select("*").order("name"),
    ]);
    setEmployees((emps ?? []) as Employee[]);
    setHotels((htls ?? []) as Hotel[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setFullName(""); setEmail(""); setPhone(""); setDocumentId("");
    setRole("Recepcionista"); setBaseSalary(""); setSelectedHotels([]);
    setError(null); setShowForm(false);
  };

  const toggleHotel = (id: string) =>
    setSelectedHotels(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("El nombre es obligatorio."); return; }
    setSaving(true); setError(null);

    const { data: emp, error: empErr } = await supabaseBrowser
      .from("employees")
      .insert({ full_name: fullName.trim(), email: email.trim() || null, phone: phone.trim() || null, document_id: documentId.trim() || null, role, base_salary: parseFloat(baseSalary) || 0 })
      .select().single<Employee>();

    if (empErr || !emp) { setError("No se pudo guardar el empleado."); setSaving(false); return; }

    if (selectedHotels.length > 0) {
      await supabaseBrowser.from("employee_hotels").insert(
        selectedHotels.map(hid => ({ employee_id: emp.id, hotel_id: hid }))
      );
    }

    await fetchAll();
    resetForm();
    setSaving(false);
  };

  const inputStyle = { background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}>Empleados</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Personal de toda la cadena hotelera</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90" style={{ background: "var(--gold)", color: "#0D0F1A" }}>
          <Plus size={15} /> Agregar empleado
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total empleados", value: employees.length, color: "var(--gold)" },
          { label: "Activos", value: employees.filter(e => e.status === "active").length, color: "var(--emerald)" },
          { label: "Inactivos", value: employees.filter(e => e.status !== "active").length, color: "var(--text-muted)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            <p className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--gold-glow)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Nuevo empleado</h2>
            <button type="button" onClick={resetForm} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
          </div>
          {error && <p className="text-xs rounded-lg px-3 py-2" style={{ background: "var(--rose-dim)", color: "var(--rose)" }}>{error}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Nombre completo *</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="María González" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input type="email" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="empleado@hotel.com" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Teléfono</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 55 0000 0000" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Documento / ID</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={documentId} onChange={e => setDocumentId(e.target.value)} placeholder="DNI, Pasaporte..." onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Puesto</label>
              <select className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={role} onChange={e => setRole(e.target.value)}>
                {["Gerente", "Recepcionista", "Conserje", "Limpieza", "Seguridad", "Mantenimiento", "Otro"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Salario base mensual</label>
              <input type="number" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={baseSalary} onChange={e => setBaseSalary(e.target.value)} placeholder="8500.00" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            {hotels.length > 0 && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Hoteles asignados</label>
                <div className="flex flex-wrap gap-2">
                  {hotels.map(h => (
                    <button key={h.id} type="button" onClick={() => toggleHotel(h.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all" style={{ background: selectedHotels.includes(h.id) ? "var(--gold-dim)" : "var(--bg-elevated)", color: selectedHotels.includes(h.id) ? "var(--gold)" : "var(--text-secondary)", border: `1px solid ${selectedHotels.includes(h.id) ? "var(--gold)" : "var(--border-default)"}` }}>
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
              <button type="button" onClick={resetForm} className="rounded-lg px-4 py-2 text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "#0D0F1A", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando..." : "Guardar empleado"}
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
              {["Empleado", "Puesto", "Salario base", "Contacto", "Estado"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Cargando empleados...</td></tr>}
            {!loading && employees.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                <Users2 size={28} className="mx-auto mb-2" style={{ opacity: 0.4 }} />
                <p className="text-sm">No hay empleados registrados.</p>
                <button type="button" onClick={() => setShowForm(true)} className="text-sm mt-1 font-medium" style={{ color: "var(--gold)" }}>+ Agregar el primero</button>
              </td></tr>
            )}
            {!loading && employees.map((emp, idx) => {
              const rc = roleColors[emp.role] ?? { bg: "var(--bg-overlay)", color: "var(--text-secondary)" };
              return (
                <tr key={emp.id} style={{ borderBottom: idx < employees.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>
                        {emp.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: rc.bg, color: rc.color }}>{emp.role}</span>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    ${emp.base_salary.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      {emp.email && <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}><Mail size={11} style={{ color: "var(--text-muted)" }} />{emp.email}</div>}
                      {emp.phone && <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}><Phone size={11} style={{ color: "var(--text-muted)" }} />{emp.phone}</div>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: emp.status === "active" ? "var(--emerald-dim)" : "var(--bg-overlay)", color: emp.status === "active" ? "var(--emerald)" : "var(--text-muted)" }}>
                      {emp.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
