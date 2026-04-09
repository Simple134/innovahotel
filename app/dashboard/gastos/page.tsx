"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { Plus, X, Download } from "lucide-react";

type Expense = Tables<"expenses">;
type Category = Tables<"expense_categories">;
type Hotel = Tables<"hotels">;
type ExpenseRow = Expense & { category?: Category; hotel?: Hotel };

const fmt = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export default function GastosPage() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("MXN");

  const fetchAll = async () => {
    const [{ data: exps }, { data: cats }, { data: htls }] = await Promise.all([
      supabaseBrowser.from("expenses").select("*").order("date", { ascending: false }),
      supabaseBrowser.from("expense_categories").select("*").order("name"),
      supabaseBrowser.from("hotels").select("*").order("name"),
    ]);

    const catMap = new Map((cats ?? []).map(c => [(c as Category).id, c as Category]));
    const htlMap = new Map((htls ?? []).map(h => [(h as Hotel).id, h as Hotel]));
    const base = (exps ?? []) as Expense[];

    setExpenses(base.map(e => ({ ...e, category: e.category_id ? catMap.get(e.category_id) : undefined, hotel: e.hotel_id ? htlMap.get(e.hotel_id) : undefined })));
    setCategories((cats ?? []) as Category[]);
    setHotels((htls ?? []) as Hotel[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setDescription(""); setAmount(""); setCategoryId(""); setHotelId("");
    setDate(new Date().toISOString().slice(0, 10)); setCurrency("MXN");
    setError(null); setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) { setError("Descripción y monto son obligatorios."); return; }
    setSaving(true); setError(null);

    const { error: err } = await supabaseBrowser.from("expenses").insert({
      description: description.trim(), amount: parseFloat(amount),
      category_id: categoryId || null, hotel_id: hotelId || null,
      date, currency,
    });

    if (err) { setError("No se pudo guardar el gasto."); setSaving(false); return; }
    await fetchAll();
    resetForm();
    setSaving(false);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const approved = expenses.filter(e => e.status === "approved").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);

  const inputStyle = { background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}>Gastos</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Seguimiento de gastos operativos</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
            <Download size={14} /> Exportar
          </button>
          <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90" style={{ background: "var(--gold)", color: "#0D0F1A" }}>
            <Plus size={14} /> Registrar gasto
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total del mes", value: fmt(total), color: "var(--gold)" },
          { label: "Aprobados", value: fmt(approved), color: "var(--emerald)" },
          { label: "Pendientes", value: fmt(pending), color: "var(--amber)" },
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
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Registrar gasto</h2>
            <button type="button" onClick={resetForm} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
          </div>
          {error && <p className="text-xs rounded-lg px-3 py-2" style={{ background: "var(--rose-dim)", color: "var(--rose)" }}>{error}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Descripción *</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. Reparación plomería hab. 203" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Monto *</label>
              <input type="number" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Categoría</label>
              <select className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Fecha</label>
              <input type="date" className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Moneda</label>
              <select className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="DOP">DOP</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
              <button type="button" onClick={resetForm} className="rounded-lg px-4 py-2 text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "#0D0F1A", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando..." : "Guardar gasto"}
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
              {["Descripción", "Categoría", "Hotel", "Fecha", "Monto", "Estado"].map((h, i) => (
                <th key={h} className={`px-5 py-3.5 text-xs font-medium uppercase tracking-wide ${i === 4 ? "text-right" : "text-left"}`} style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Cargando gastos...</td></tr>}
            {!loading && expenses.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>No hay gastos registrados.</td></tr>}
            {!loading && expenses.map((exp, idx) => (
              <tr key={exp.id} style={{ borderBottom: idx < expenses.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <td className="px-5 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{exp.description}</td>
                <td className="px-5 py-3">
                  {exp.category ? (
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${exp.category.color}20`, color: exp.category.color }}>{exp.category.name}</span>
                  ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{exp.hotel?.name ?? "—"}</td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{new Date(exp.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td className="px-5 py-3 text-right font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(exp.amount)} <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>{exp.currency}</span></td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: exp.status === "approved" ? "var(--emerald-dim)" : "var(--amber-dim)", color: exp.status === "approved" ? "var(--emerald)" : "var(--amber)" }}>
                    {exp.status === "approved" ? "Aprobado" : "Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
