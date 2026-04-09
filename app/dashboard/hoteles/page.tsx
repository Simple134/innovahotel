"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { Building2, MapPin, Phone, Plus, X, BedDouble } from "lucide-react";

type Hotel = Tables<"hotels">;

export default function HotelesPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("MXN");

  const fetchHotels = async () => {
    const { data } = await supabaseBrowser.from("hotels").select("*").order("created_at");
    setHotels((data ?? []) as Hotel[]);
    setLoading(false);
  };

  useEffect(() => { fetchHotels(); }, []);

  const resetForm = () => {
    setName(""); setCity(""); setAddress(""); setPhone(""); setEmail(""); setCurrency("MXN");
    setError(null); setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("El nombre es obligatorio."); return; }
    setSaving(true); setError(null);

    const { error: err } = await supabaseBrowser.from("hotels").insert({
      name: name.trim(), city: city.trim() || null, address: address.trim() || null,
      phone: phone.trim() || null, email: email.trim() || null, currency,
    });

    if (err) { setError("No se pudo guardar el hotel."); setSaving(false); return; }
    await fetchHotels();
    resetForm();
    setSaving(false);
  };

  const inputStyle = {
    background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}>
            Hoteles
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Gestión de la cadena hotelera</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ background: "var(--gold)", color: "#0D0F1A" }}
        >
          <Plus size={15} /> Agregar hotel
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total de hoteles", value: hotels.length, color: "var(--gold)" },
          { label: "Activos", value: hotels.filter(h => h.status === "active").length, color: "var(--emerald)" },
          { label: "Inactivos", value: hotels.filter(h => h.status !== "active").length, color: "var(--text-muted)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            <p className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-display)", color: s.color }}>
              {loading ? "—" : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Add hotel form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--gold-glow)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Nuevo hotel</h2>
            <button type="button" onClick={resetForm} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
          </div>
          {error && <p className="text-xs rounded-lg px-3 py-2" style={{ background: "var(--rose-dim)", color: "var(--rose)" }}>{error}</p>}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Nombre *</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="InnovaHotel Centro" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Ciudad</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad de México" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Dirección</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={address} onChange={e => setAddress(e.target.value)} placeholder="Av. Reforma 123" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Teléfono</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+52 55 0000 0000" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Email</label>
              <input className="w-full rounded-lg px-3 py-2 text-sm outline-none" type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="hotel@innova.com" onFocus={e => (e.target.style.borderColor = "var(--gold)")} onBlur={e => (e.target.style.borderColor = "var(--border-default)")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Moneda</label>
              <select className="w-full rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="MXN">MXN — Peso mexicano</option>
                <option value="USD">USD — Dólar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="DOP">DOP — Peso dominicano</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
              <button type="button" onClick={resetForm} className="rounded-lg px-4 py-2 text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--gold)", color: "#0D0F1A", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Guardando..." : "Guardar hotel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hotels grid */}
      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Cargando hoteles...</p>
      ) : hotels.length === 0 ? (
        <div className="rounded-xl p-12 flex flex-col items-center gap-3" style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-strong)" }}>
          <Building2 size={32} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No hay hoteles registrados aún.</p>
          <button type="button" onClick={() => setShowForm(true)} className="text-sm font-medium" style={{ color: "var(--gold)" }}>+ Agregar el primero</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="rounded-xl p-5 space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--gold-dim)", color: "var(--gold)" }}>
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{hotel.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{hotel.currency ?? "MXN"}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: hotel.status === "active" ? "var(--emerald-dim)" : "var(--bg-overlay)", color: hotel.status === "active" ? "var(--emerald)" : "var(--text-muted)" }}>
                  {hotel.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="space-y-1.5">
                {hotel.city && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <MapPin size={12} style={{ color: "var(--text-muted)" }} />{hotel.address ? `${hotel.address}, ` : ""}{hotel.city}
                  </div>
                )}
                {hotel.phone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Phone size={12} style={{ color: "var(--text-muted)" }} />{hotel.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setShowForm(true)} className="rounded-xl p-5 flex flex-col items-center justify-center gap-2 min-h-[140px] cursor-pointer" style={{ background: "transparent", border: "1px dashed var(--border-strong)", color: "var(--text-muted)" }}>
            <Plus size={20} />
            <span className="text-sm">Agregar hotel</span>
          </button>
        </div>
      )}
    </div>
  );
}
