"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { CheckCircle2 } from "lucide-react";
import { NoHotelSelected } from "@/components/dashboard/NoHotelSelected";
import { useHotel } from "@/contexts/HotelContext";

type Room = Tables<"rooms">;
type Guest = Tables<"guests">;

export default function RegisterGuestPage() {
  const { selectedHotel } = useHotel();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [checkIn, setCheckIn] = useState(new Date().toISOString().slice(0, 10));
  const [checkOut, setCheckOut] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRooms = async (hotelId: string) => {
    setLoadingRooms(true);
    const { data, error } = await supabaseBrowser
      .from("rooms")
      .select("*")
      .eq("hotel_id", hotelId)
      .eq("status", "available")
      .order("number", { ascending: true });
    if (error) setRoomsError("No se pudieron cargar las habitaciones.");
    else setRooms((data ?? []) as Room[]);
    setLoadingRooms(false);
  };

  useEffect(() => {
    if (!selectedHotel) { setRooms([]); setLoadingRooms(false); return; }
    fetchRooms(selectedHotel.id);
  }, [selectedHotel]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setSuccess(false);

    if (!selectedHotel) return;
    if (!fullName.trim()) { setMessage("El nombre completo es obligatorio."); return; }
    if (!selectedRoomId) { setMessage("Debes seleccionar una habitación disponible."); return; }
    if (!checkIn) { setMessage("La fecha de check-in es obligatoria."); return; }
    if (!checkOut) { setMessage("La fecha de check-out es obligatoria."); return; }
    if (checkOut <= checkIn) { setMessage("El check-out debe ser posterior al check-in."); return; }

    setSaving(true);

    try {
      // 1. Create guest
      const { data: guest, error: guestError } = await supabaseBrowser
        .from("guests")
        .insert({
          full_name: fullName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          document_id: documentId.trim() || null,
        })
        .select()
        .single<Guest>();

      if (guestError || !guest) {
        setMessage("No se pudo registrar el huésped. Intenta de nuevo.");
        setSaving(false);
        return;
      }

      // 2. Mark room as occupied
      const { error: roomError } = await supabaseBrowser
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", selectedRoomId);

      if (roomError) {
        setMessage("Huésped creado, pero no se pudo actualizar la habitación.");
        setSaving(false);
        return;
      }

      // 3. Create booking linked to hotel
      const nights =
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);
      const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
      const totalAmount = selectedRoom ? selectedRoom.price_per_night * nights : null;

      const { error: bookingError } = await supabaseBrowser.from("bookings").insert({
        hotel_id: selectedHotel.id,
        guest_id: guest.id,
        room_id: selectedRoomId,
        check_in: checkIn,
        check_out: checkOut,
        status: "active",
        currency: selectedHotel.currency ?? "MXN",
        total_amount: totalAmount,
      });

      if (bookingError) {
        setMessage("Huésped y habitación actualizados, pero no se pudo crear la reserva.");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setFullName(""); setEmail(""); setPhone(""); setDocumentId("");
      setSelectedRoomId(""); setCheckOut("");
      setCheckIn(new Date().toISOString().slice(0, 10));
      setRooms((prev) => prev.filter((r) => r.id !== selectedRoomId));
    } catch {
      setMessage("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
  };

  const labelStyle = { color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500 };

  if (!selectedHotel) return <NoHotelSelected />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-semibold"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}
        >
          Registrar huésped
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {selectedHotel.name}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Form */}
        <section
          className="lg:col-span-1 rounded-xl p-5 space-y-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Datos del huésped</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Información para el registro de recepción</p>
          </div>

          {success && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
              style={{ background: "var(--emerald-dim)", color: "var(--emerald)", border: "1px solid rgba(45,212,160,0.2)" }}
            >
              <CheckCircle2 size={15} />
              Huésped registrado y reserva creada
            </div>
          )}

          {message && !success && (
            <div
              className="rounded-lg px-3 py-2.5 text-sm"
              style={{ background: "var(--rose-dim)", color: "var(--rose)", border: "1px solid rgba(244,74,107,0.2)" }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="block" style={labelStyle}>Nombre completo *</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                style={inputStyle}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Ana García"
                required
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="block" style={labelStyle}>Email</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ana@mail.com"
                  type="email"
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block" style={labelStyle}>Teléfono</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                  style={inputStyle}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 000 000"
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block" style={labelStyle}>Documento / ID</label>
              <input
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                style={inputStyle}
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="DNI, Pasaporte..."
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="block" style={labelStyle}>Check-in *</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                  style={inputStyle}
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block" style={labelStyle}>Check-out *</label>
                <input
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                  style={inputStyle}
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block" style={labelStyle}>Habitación asignada *</label>
              <select
                className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-all"
                style={{ ...inputStyle, cursor: "pointer" }}
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              >
                <option value="">Selecciona habitación disponible</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.number} — {room.type} (${room.price_per_night}/noche)
                  </option>
                ))}
              </select>
            </div>

            {/* Price preview */}
            {selectedRoomId && checkIn && checkOut && checkOut > checkIn && (() => {
              const nights = Math.round(
                (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
              );
              const room = rooms.find((r) => r.id === selectedRoomId);
              const total = room ? room.price_per_night * nights : 0;
              return (
                <div className="rounded-lg px-3 py-2 text-xs" style={{ background: "var(--gold-dim)", color: "var(--gold-light)" }}>
                  {nights} noche{nights !== 1 ? "s" : ""} · Total estimado:{" "}
                  <span className="font-semibold">${total.toFixed(2)} {selectedHotel.currency ?? "MXN"}</span>
                </div>
              );
            })()}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all mt-1"
              style={{
                background: saving ? "var(--gold-dim)" : "var(--gold)",
                color: saving ? "var(--gold-light)" : "#0D0F1A",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Guardando..." : "Registrar huésped"}
            </button>
          </form>
        </section>

        {/* Room picker */}
        <section
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Habitaciones disponibles</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {loadingRooms ? "Cargando..." : `${rooms.length} habitación${rooms.length !== 1 ? "es" : ""} disponible${rooms.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="p-5">
            {roomsError && (
              <div className="rounded-lg px-3 py-2.5 text-sm mb-4" style={{ background: "var(--rose-dim)", color: "var(--rose)" }}>
                {roomsError}
              </div>
            )}

            {!loadingRooms && rooms.length === 0 && (
              <div className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
                No hay habitaciones disponibles en este hotel.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {!loadingRooms && rooms.map((room) => {
                const selected = selectedRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className="flex flex-col rounded-xl p-4 text-left transition-all"
                    style={{
                      background: selected ? "var(--gold-dim)" : "var(--bg-elevated)",
                      border: selected ? "1px solid var(--gold)" : "1px solid var(--border-default)",
                      cursor: "pointer",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: selected ? "var(--gold-light)" : "var(--text-primary)" }}>
                          Hab. {room.number}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{room.type}</p>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
                        ${room.price_per_night.toFixed(2)}
                      </p>
                    </div>
                    {selected && (
                      <span className="mt-2 text-xs" style={{ color: "var(--gold)" }}>✓ Seleccionada</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
