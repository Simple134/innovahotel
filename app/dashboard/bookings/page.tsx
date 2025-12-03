"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";

type Booking = Tables<"bookings">;
type Room = Tables<"rooms">;
type Guest = Tables<"guests">;

type BookingRow = Booking & {
  room?: Room;
  guest?: Guest;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseBrowser
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("No se pudieron cargar las reservas.");
        setLoading(false);
        return;
      }

      const base = (data ?? []) as Booking[];

      if (base.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const roomIds = Array.from(new Set(base.map((b) => b.room_id)));
      const guestIds = Array.from(new Set(base.map((b) => b.guest_id)));

      const [{ data: rooms }, { data: guests }] = await Promise.all([
        supabaseBrowser
          .from("rooms")
          .select("*")
          .in("id", roomIds as string[]),
        supabaseBrowser
          .from("guests")
          .select("*")
          .in("id", guestIds as string[]),
      ]);

      const roomsById = new Map<string, Room>();
      (rooms ?? []).forEach((r) => roomsById.set((r as Room).id, r as Room));

      const guestsById = new Map<string, Guest>();
      (guests ?? []).forEach((g) => guestsById.set((g as Guest).id, g as Guest));

      const joined: BookingRow[] = base.map((b) => ({
        ...b,
        room: roomsById.get(b.room_id),
        guest: guestsById.get(b.guest_id),
      }));

      setBookings(joined);
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todaysCheckIns = bookings.filter((b) => b.check_in === today).length;
  const todaysCheckOuts = bookings.filter((b) => b.check_out === today).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-black">Reservas</h1>
          <p className="text-lg text-black">
            Control de check-ins, check-outs y estado de reservas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-black">
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Total: {bookings.length}
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
            Check-ins hoy: {todaysCheckIns}
          </span>
          <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
            Check-outs hoy: {todaysCheckOuts}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-lg text-rose-100">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#33383E] bg-[#33383E]/60">
        <table className="min-w-full divide-y divide-[#33383E]/80 text-lg text-white">
          <thead className="bg-[#33383E]/80">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Huésped</th>
              <th className="px-3 py-2 text-left font-medium">Habitación</th>
              <th className="px-3 py-2 text-left font-medium">Fechas</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
              <th className="px-3 py-2 text-left font-medium">Creada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#33383E]/60 bg-[#33383E]/40">
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-lg text-white"
                >
                  Cargando reservas...
                </td>
              </tr>
            )}
            {!loading && bookings.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-lg text-white"
                >
                  Aún no hay reservas registradas.
                </td>
              </tr>
            )}
            {!loading &&
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#33383E]/60">
                  <td className="px-3 py-2 text-sm font-medium text-white">
                    {booking.guest?.full_name ?? "—"}
                  </td>
                  <td className="px-3 py-2 align-middle text-lg text-white">
                    {booking.room
                      ? `Hab. ${booking.room.number}`
                      : booking.room_id}
                  </td>
                  <td className="px-3 py-2 align-middle text-lg text-white">
                    {booking.check_in} → {booking.check_out}
                  </td>
                  <td className="px-3 py-2 align-middle text-lg text-white">
                    {booking.status}
                  </td>
                  <td className="px-3 py-2 align-middle text-lg text-white">
                    {new Date(booking.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


