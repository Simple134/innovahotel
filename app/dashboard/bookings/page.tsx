"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { NoHotelSelected } from "@/components/dashboard/NoHotelSelected";
import { useHotel } from "@/contexts/HotelContext";

type Booking = Tables<"bookings">;
type Room = Tables<"rooms">;
type Guest = Tables<"guests">;
type BookingRow = Booking & { room?: Room; guest?: Guest };

const statusStyle = (status: string) => {
  const s = status.toLowerCase();
  if (s === "active" || s === "confirmed")
    return { background: "var(--emerald-dim)", color: "var(--emerald)" };
  if (s === "completed" || s === "checked_out")
    return { background: "var(--bg-overlay)", color: "var(--text-muted)" };
  return { background: "var(--amber-dim)", color: "var(--amber)" };
};

export default function BookingsPage() {
  const { selectedHotel } = useHotel();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedHotel) { setBookings([]); setLoading(false); return; }

    const hotelId = selectedHotel.id;
    setLoading(true);

    const fetchBookings = async () => {
      const { data, error } = await supabaseBrowser
        .from("bookings")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) { setError("No se pudieron cargar las reservas."); setLoading(false); return; }

      const base = (data ?? []) as Booking[];
      if (base.length === 0) { setBookings([]); setLoading(false); return; }

      const roomIds = [...new Set(base.map((b) => b.room_id))];
      const guestIds = [...new Set(base.map((b) => b.guest_id))];

      const [{ data: rooms }, { data: guests }] = await Promise.all([
        supabaseBrowser.from("rooms").select("*").in("id", roomIds as string[]),
        supabaseBrowser.from("guests").select("*").in("id", guestIds as string[]),
      ]);

      const roomsById = new Map((rooms ?? []).map((r) => [(r as Room).id, r as Room]));
      const guestsById = new Map((guests ?? []).map((g) => [(g as Guest).id, g as Guest]));

      setBookings(base.map((b) => ({ ...b, room: roomsById.get(b.room_id), guest: guestsById.get(b.guest_id) })));
      setLoading(false);
    };

    fetchBookings();
  }, [selectedHotel]);

  const today = new Date().toISOString().slice(0, 10);
  const checkInsToday = bookings.filter((b) => b.check_in === today).length;
  const checkOutsToday = bookings.filter((b) => b.check_out === today).length;

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
            Reservas
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {selectedHotel.name}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
            Total: {bookings.length}
          </span>
          <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
            Check-ins hoy: {checkInsToday}
          </span>
          <span className="px-3 py-1.5 rounded-full" style={{ background: "var(--amber-dim)", color: "var(--amber)" }}>
            Check-outs hoy: {checkOutsToday}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "var(--rose-dim)", color: "var(--rose)", border: "1px solid rgba(244,74,107,0.2)" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Huésped", "Habitación", "Check-in", "Check-out", "Estado", "Registrado"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Cargando reservas...
                </td>
              </tr>
            )}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No hay reservas en este hotel.
                </td>
              </tr>
            )}
            {!loading && bookings.map((b, idx) => (
              <tr key={b.id} style={{ borderBottom: idx < bookings.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <td className="px-5 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                  {b.guest?.full_name ?? "—"}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                  {b.room ? `Hab. ${b.room.number}` : "—"}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>{b.check_in}</td>
                <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>{b.check_out}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize" style={statusStyle(b.status)}>
                    {b.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(b.created_at).toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
