"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { RoomStatusBadge } from "@/components/dashboard/RoomStatusBadge";
import { NoHotelSelected } from "@/components/dashboard/NoHotelSelected";
import { useHotel } from "@/contexts/HotelContext";
import { Plus, X } from "lucide-react";

type Room = Tables<"rooms">;

const ROOM_TYPES = ["Individual", "Doble", "Suite", "Junior Suite", "Familiar", "Deluxe"];

export default function RoomsPage() {
  const { selectedHotel } = useHotel();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [number, setNumber] = useState("");
  const [type, setType] = useState("Doble");
  const [price, setPrice] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRooms = async (hotelId: string) => {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from("rooms")
      .select("*")
      .eq("hotel_id", hotelId)
      .order("number", { ascending: true });
    if (error) setError("No se pudieron cargar las habitaciones.");
    else setRooms((data ?? []) as Room[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedHotel) { setRooms([]); setLoading(false); return; }
    fetchRooms(selectedHotel.id);
  }, [selectedHotel]);

  const resetForm = () => {
    setNumber(""); setType("Doble"); setPrice(""); setFormError(null); setShowForm(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedHotel) return;
    if (!number.trim()) { setFormError("El número de habitación es obligatorio."); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setFormError("El precio por noche debe ser un número mayor a 0."); return;
    }

    setSaving(true); setFormError(null);

    const { error: err } = await supabaseBrowser.from("rooms").insert({
      hotel_id: selectedHotel.id,
      number: number.trim(),
      type,
      price_per_night: Number(price),
      status: "available",
    });

    if (err) {
      setFormError("No se pudo guardar la habitación. Verifica que el número no esté repetido.");
      setSaving(false);
      return;
    }

    await fetchRooms(selectedHotel.id);
    resetForm();
    setSaving(false);
  };

  const available = rooms.filter((r) => r.status === "available").length;
  const occupied = rooms.filter((r) => r.status === "occupied").length;

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
  };

  if (!selectedHotel) return <NoHotelSelected />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}
          >
            Habitaciones
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {selectedHotel.name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
              Total: {rooms.length}
            </span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
              Disponibles: {available}
            </span>
            <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--amber-dim)", color: "var(--amber)" }}>
              Ocupadas: {occupied}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: "var(--gold)", color: "#0D0F1A" }}
          >
            <Plus size={14} /> Agregar habitación
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "var(--rose-dim)", color: "var(--rose)", border: "1px solid rgba(244,74,107,0.2)" }}>
          {error}
        </div>
      )}

      {/* Add room form */}
      {showForm && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--gold-glow)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Nueva habitación</h2>
            <button type="button" onClick={resetForm} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
          </div>
          {formError && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ background: "var(--rose-dim)", color: "var(--rose)" }}>
              {formError}
            </p>
          )}
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Número *</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="101, 202, A1..."
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Tipo *</label>
              <select
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Precio / noche *</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={inputStyle}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500.00"
                type="number"
                min="0"
                step="0.01"
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg px-4 py-2 text-sm"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ background: "var(--gold)", color: "#0D0F1A", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Guardando..." : "Guardar habitación"}
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
              {["Habitación", "Tipo", "Piso", "Estado", "Precio / noche"].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-3.5 text-xs font-medium uppercase tracking-wide ${i === 4 ? "text-right" : "text-left"}`}
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Cargando habitaciones...
                </td>
              </tr>
            )}
            {!loading && rooms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Este hotel no tiene habitaciones aún.{" "}
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    style={{ color: "var(--gold)" }}
                  >
                    Agregar la primera
                  </button>
                </td>
              </tr>
            )}
            {!loading && rooms.map((room, idx) => {
              const floorNum = parseInt(room.number[0] ?? "1", 10);
              const floor = isNaN(floorNum) ? "—" : `Piso ${floorNum}`;
              return (
                <tr
                  key={room.id}
                  style={{ borderBottom: idx < rooms.length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                >
                  <td className="px-5 py-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {room.number}
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                    {room.type}
                  </td>
                  <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                    {floor}
                  </td>
                  <td className="px-5 py-3">
                    <RoomStatusBadge status={room.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium" style={{ color: "var(--gold)" }}>
                    ${room.price_per_night.toFixed(2)}
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
