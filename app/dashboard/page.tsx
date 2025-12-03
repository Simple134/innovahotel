"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoomStatusBadge } from "@/components/dashboard/RoomStatusBadge";
import {
  Activity,
  BedDouble,
  CalendarCheck2,
  Users,
} from "lucide-react";

type Room = Tables<"rooms">;
type Booking = Tables<"bookings">;
type Guest = Tables<"guests">;

type DashboardData = {
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      const [roomsResult, bookingsResult, guestsResult] = await Promise.all([
        supabaseBrowser.from("rooms").select("*").order("number", {
          ascending: true,
        }),
        supabaseBrowser
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8),
        supabaseBrowser
          .from("guests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      if (roomsResult.error || bookingsResult.error || guestsResult.error) {
        console.error(
          roomsResult.error || bookingsResult.error || guestsResult.error,
        );
        setError("No se pudieron cargar los datos del dashboard.");
      } else {
        setData({
          rooms: (roomsResult.data ?? []) as Room[],
          bookings: (bookingsResult.data ?? []) as Booking[],
          guests: (guestsResult.data ?? []) as Guest[],
        });
      }

      setLoading(false);
    };

    const checkSessionAndFetch = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabaseBrowser.auth.getSession();

      if (sessionError || !session) {
        router.replace("/");
        return;
      }

      await fetchAll();
      setCheckingSession(false);
    };

    checkSessionAndFetch();
  }, [router]);

  const totalRooms = data?.rooms.length ?? 0;
  const availableRooms = data?.rooms.filter((r) => r.status === "available")
    .length ?? 0;
  const occupiedRooms = data?.rooms.filter((r) => r.status === "occupied")
    .length ?? 0;
  const totalGuests = data?.guests.length ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const todaysCheckIns = data?.bookings.filter(
    (b) => b.check_in === today,
  ).length; // dates are stored as YYYY-MM-DD
  const todaysCheckOuts = data?.bookings.filter(
    (b) => b.check_out === today,
  ).length;

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-white">
        Verificando sesión...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-black">
            Dashboard InnovaHotel
          </h1>
          <p className="text-xs text-black">
            Estado general de habitaciones, reservas y huéspedes.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Habitaciones totales"
          value={loading ? "—" : totalRooms}
          description="Todas las habitaciones registradas en el sistema."
          accent="primary"
          icon={<BedDouble className="h-4 w-4" />}
        />
        <StatCard
          label="Disponibles"
          value={loading ? "—" : availableRooms}
          description="Listas para asignar a nuevos huéspedes."
          accent="emerald"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Ocupadas"
          value={loading ? "—" : occupiedRooms}
          description="Actualmente en uso."
          accent="amber"
          icon={<CalendarCheck2 className="h-4 w-4" />}
        />
        <StatCard
          label="Huéspedes recientes"
          value={loading ? "—" : totalGuests}
          description="Últimos registros en recepción."
          accent="rose"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-[#33383E] bg-[#33383E]/60 p-4">
          <div className="mb-3 flex items-center justify-between gap-2 text-sm">
            <div>
              <h2 className="font-medium text-white">Mapa rápido</h2>
              <p className="text-xs text-white">
                Lista de habitaciones con estado actual.
              </p>
            </div>
            <span className="rounded-full bg-[#33383E] px-2 py-0.5 text-[10px] text-white">
              Tiempo real
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#33383E]/80">
            <table className="min-w-full divide-y divide-[#33383E]/80 text-xs">
              <thead className="bg-[#33383E]/80 text-white">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Habitación</th>
                  <th className="px-3 py-2 text-left font-medium">Tipo</th>
                  <th className="px-3 py-2 text-left font-medium">Estado</th>
                  <th className="px-3 py-2 text-right font-medium">
                    Precio / noche
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#33383E]/60 bg-[#33383E]/40 text-white">
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-white"
                    >
                      Cargando habitaciones...
                    </td>
                  </tr>
                )}
                {!loading && data && data.rooms.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-6 text-center text-white"
                    >
                      Aún no hay habitaciones registradas.
                    </td>
                  </tr>
                )}
                {!loading &&
                  data &&
                  data.rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-[#33383E]/60">
                      <td className="px-3 py-2 align-middle text-sm font-medium">
                        {room.number}
                      </td>
                      <td className="px-3 py-2 align-middle text-xs text-white">
                        {room.type}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <RoomStatusBadge status={room.status} />
                      </td>
                      <td className="px-3 py-2 text-right align-middle text-xs text-white">
                        ${room.price_per_night.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[#33383E] bg-[#33383E]/60 p-4 text-sm">
          <div className="text-xs">
            <p className="mb-1 font-medium text-white">
              Registros de huéspedes
            </p>
            <p className="text-xs text-white">
              Vista rápida de los últimos huéspedes añadidos al sistema.
            </p>
          </div>

          <div className="pt-2 text-xs">
            <h3 className="mb-1 font-medium text-white">
              Últimos huéspedes
            </h3>
            <ul className="space-y-1 text-white">
              {loading && <li>Cargando huéspedes...</li>}
              {!loading && data && data.guests.length === 0 && (
                <li>Aún no hay huéspedes registrados.</li>
              )}
              {!loading &&
                data &&
                data.guests.map((guest) => (
                  <li
                    key={guest.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-[#33383E]/70 px-2 py-1.5"
                  >
                    <div className="truncate">
                      <p className="truncate text-xs font-medium text-white">
                        {guest.full_name}
                      </p>
                      <p className="truncate text-[11px] text-white">
                        {guest.email || guest.phone || "Sin datos de contacto"}
                      </p>
                    </div>
                    <span className="text-[10px] text-white">
                      {new Date(guest.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/60 p-4 text-sm">
          <h2 className="text-sm font-medium text-white">
            Check-ins y check-outs de hoy
          </h2>
          <p className="mt-1 text-xs text-white">
            Resumen rápido de movimientos del día actual.
          </p>
          <div className="mt-4 flex gap-3 text-xs">
            <div className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-[11px] font-medium text-emerald-300">
                Check-ins
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-100">
                {loading || todaysCheckIns === undefined ? "—" : todaysCheckIns}
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-[11px] font-medium text-amber-300">
                Check-outs
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-100">
                {loading || todaysCheckOuts === undefined
                  ? "—"
                  : todaysCheckOuts}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/60 p-4 text-sm">
          <h2 className="text-sm font-medium text-white">
            Reservas recientes
          </h2>
          <p className="mt-1 text-xs text-white">
            Últimas reservas creadas en el sistema.
          </p>
          <ul className="mt-3 space-y-2 text-xs text-white">
            {loading && <li>Cargando reservas...</li>}
            {!loading && data && data.bookings.length === 0 && (
              <li>Aún no hay reservas registradas.</li>
            )}
            {!loading &&
              data &&
              data.bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#33383E]/70 px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-medium text-white">
                      Reserva
                    </p>
                    <p className="text-[11px] text-white">
                      {booking.check_in} → {booking.check_out}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#33383E] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
                    {booking.status}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
