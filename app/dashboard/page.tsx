"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { StatCard } from "@/components/dashboard/StatCard";
import { RoomStatusBadge } from "@/components/dashboard/RoomStatusBadge";
import { NoHotelSelected } from "@/components/dashboard/NoHotelSelected";
import { useHotel } from "@/contexts/HotelContext";
import {
  Activity,
  BedDouble,
  CalendarCheck2,
  Users,
  ArrowRight,
  LogIn,
  LogOut,
} from "lucide-react";
import Link from "next/link";

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
  const { selectedHotel, loadingHotels } = useHotel();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error: sessionError } = await supabaseBrowser.auth.getSession();
      if (sessionError || !session) { router.replace("/"); return; }
      setCheckingSession(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    if (!selectedHotel) { setData(null); setLoading(false); return; }

    setLoading(true);
    const hotelId = selectedHotel.id;

    const fetchData = async () => {
      const [roomsRes, bookingsRes] = await Promise.all([
        supabaseBrowser.from("rooms").select("*").eq("hotel_id", hotelId).order("number", { ascending: true }),
        supabaseBrowser.from("bookings").select("*").eq("hotel_id", hotelId).order("created_at", { ascending: false }).limit(8),
      ]);

      if (roomsRes.error || bookingsRes.error) {
        setError("No se pudieron cargar los datos del dashboard.");
        setLoading(false);
        return;
      }

      const bookings = (bookingsRes.data ?? []) as Booking[];
      const guestIds = [...new Set(bookings.map((b) => b.guest_id))];

      let guests: Guest[] = [];
      if (guestIds.length > 0) {
        const { data: guestData } = await supabaseBrowser.from("guests").select("*").in("id", guestIds);
        guests = (guestData ?? []) as Guest[];
      }

      setData({
        rooms: (roomsRes.data ?? []) as Room[],
        bookings,
        guests,
      });
      setLoading(false);
    };

    fetchData();
  }, [selectedHotel]);

  const totalRooms = data?.rooms.length ?? 0;
  const availableRooms = data?.rooms.filter((r) => r.status === "available").length ?? 0;
  const occupiedRooms = data?.rooms.filter((r) => r.status === "occupied").length ?? 0;
  const totalGuests = data?.guests.length ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  const todaysCheckIns = data?.bookings.filter((b) => b.check_in === today).length ?? 0;
  const todaysCheckOuts = data?.bookings.filter((b) => b.check_out === today).length ?? 0;

  if (checkingSession) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        Verificando sesión...
      </div>
    );
  }

  if (loadingHotels) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        Cargando...
      </div>
    );
  }

  if (!selectedHotel) return <NoHotelSelected />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-semibold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", letterSpacing: "0.01em" }}
          >
            {selectedHotel.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <Link
          href="/dashboard/register"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: "var(--gold)", color: "#0D0F1A" }}
        >
          Registrar huésped
          <ArrowRight size={14} />
        </Link>
      </div>

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--rose-dim)", color: "var(--rose)", border: "1px solid rgba(244,74,107,0.2)" }}
        >
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Habitaciones totales"
          value={loading ? "—" : totalRooms}
          description="En este hotel"
          accent="gold"
          icon={<BedDouble size={16} />}
        />
        <StatCard
          label="Disponibles"
          value={loading ? "—" : availableRooms}
          description="Listas para asignar"
          accent="emerald"
          icon={<Activity size={16} />}
        />
        <StatCard
          label="Ocupadas"
          value={loading ? "—" : occupiedRooms}
          description="En uso ahora"
          accent="amber"
          icon={<CalendarCheck2 size={16} />}
        />
        <StatCard
          label="Huéspedes"
          value={loading ? "—" : totalGuests}
          description="En reservas recientes"
          accent="blue"
          icon={<Users size={16} />}
        />
      </div>

      {/* Today summary + rooms table */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Room list */}
        <section
          className="lg:col-span-2 rounded-xl overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Estado de habitaciones</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Vista en tiempo real</p>
            </div>
            <span
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
              style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--emerald)" }} />
              En vivo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Habitación", "Tipo", "Estado", "Precio / noche"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-medium uppercase tracking-wide ${i === 3 ? "text-right" : "text-left"}`}
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
                    <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                      Cargando habitaciones...
                    </td>
                  </tr>
                )}
                {!loading && data?.rooms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                      No hay habitaciones en este hotel.{" "}
                      <Link href="/dashboard/rooms" style={{ color: "var(--gold)" }}>Agregar habitaciones</Link>
                    </td>
                  </tr>
                )}
                {!loading && data?.rooms.map((room, idx) => (
                  <tr
                    key={room.id}
                    style={{
                      borderBottom: idx < (data.rooms.length - 1) ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    <td className="px-5 py-3 font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {room.number}
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                      {room.type}
                    </td>
                    <td className="px-5 py-3">
                      <RoomStatusBadge status={room.status} />
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      ${room.price_per_night.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right column */}
        <div className="space-y-4">
          {/* Today's movements */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Movimientos de hoy
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-4 text-center" style={{ background: "var(--emerald-dim)", border: "1px solid rgba(45,212,160,0.15)" }}>
                <LogIn size={16} className="mx-auto mb-2" style={{ color: "var(--emerald)" }} />
                <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--emerald)" }}>
                  {loading ? "—" : todaysCheckIns}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--emerald)" }}>Check-ins</p>
              </div>
              <div className="rounded-lg p-4 text-center" style={{ background: "var(--amber-dim)", border: "1px solid rgba(245,166,35,0.15)" }}>
                <LogOut size={16} className="mx-auto mb-2" style={{ color: "var(--amber)" }} />
                <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--amber)" }}>
                  {loading ? "—" : todaysCheckOuts}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--amber)" }}>Check-outs</p>
              </div>
            </div>
          </div>

          {/* Recent guests */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Últimos huéspedes</h2>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {loading && (
                <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>Cargando...</div>
              )}
              {!loading && data?.guests.length === 0 && (
                <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>Sin huéspedes aún.</div>
              )}
              {!loading && data?.guests.slice(0, 5).map((guest) => (
                <div key={guest.id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: "var(--gold-dim)", color: "var(--gold)" }}
                  >
                    {guest.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {guest.full_name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {guest.email ?? guest.phone ?? "Sin contacto"}
                    </p>
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    {new Date(guest.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <section
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Reservas recientes</h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--gold)" }}
          >
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {loading && (
            <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>Cargando reservas...</div>
          )}
          {!loading && data?.bookings.length === 0 && (
            <div className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>No hay reservas en este hotel.</div>
          )}
          {!loading && data?.bookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{
                    background:
                      booking.status === "active" ? "var(--emerald)"
                      : booking.status === "completed" ? "var(--text-muted)"
                      : "var(--amber)",
                  }}
                />
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                    Reserva #{booking.id.slice(0, 8)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {booking.check_in} → {booking.check_out}
                  </p>
                </div>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                style={{
                  background: booking.status === "active" ? "var(--emerald-dim)" : "var(--bg-overlay)",
                  color: booking.status === "active" ? "var(--emerald)" : "var(--text-muted)",
                }}
              >
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
