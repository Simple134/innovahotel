"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { NoHotelSelected } from "@/components/dashboard/NoHotelSelected";
import { useHotel } from "@/contexts/HotelContext";

type Guest = Tables<"guests">;

export default function GuestsPage() {
  const { selectedHotel } = useHotel();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedHotel) { setGuests([]); setLoading(false); return; }

    const hotelId = selectedHotel.id;
    setLoading(true);

    const fetchGuests = async () => {
      // Guests don't have hotel_id — we find them through bookings
      const { data: bookings, error: bErr } = await supabaseBrowser
        .from("bookings")
        .select("guest_id")
        .eq("hotel_id", hotelId);

      if (bErr) { setError("No se pudieron cargar los huéspedes."); setLoading(false); return; }

      const guestIds = [...new Set((bookings ?? []).map((b) => b.guest_id))];

      if (guestIds.length === 0) { setGuests([]); setLoading(false); return; }

      const { data, error } = await supabaseBrowser
        .from("guests")
        .select("*")
        .in("id", guestIds)
        .order("created_at", { ascending: false });

      if (error) setError("No se pudieron cargar los huéspedes.");
      else setGuests((data ?? []) as Guest[]);
      setLoading(false);
    };

    fetchGuests();
  }, [selectedHotel]);

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
            Huéspedes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {selectedHotel.name}
          </p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
          Total: {guests.length}
        </span>
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
              {["Huésped", "Email", "Teléfono", "Documento", "Registrado"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  Cargando huéspedes...
                </td>
              </tr>
            )}
            {!loading && guests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No hay huéspedes en este hotel aún.
                </td>
              </tr>
            )}
            {!loading && guests.map((guest, idx) => (
              <tr key={guest.id} style={{ borderBottom: idx < guests.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
                    >
                      {guest.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {guest.full_name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                  {guest.email ?? "—"}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                  {guest.phone ?? "—"}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                  {guest.document_id ?? "—"}
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(guest.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
