"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";
import { RoomStatusBadge } from "@/components/dashboard/RoomStatusBadge";

type Room = Tables<"rooms">;

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseBrowser
        .from("rooms")
        .select("*")
        .order("number", { ascending: true });

      if (error) {
        console.error(error);
        setError("No se pudieron cargar las habitaciones.");
      } else {
        setRooms((data ?? []) as Room[]);
      }

      setLoading(false);
    };

    fetchRooms();
  }, []);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-black">Habitaciones</h1>
          <p className="text-lg text-black">
            Vista detallada de las 20 habitaciones del hotel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-black">
          <span className="rounded-full bg-gray-100 px-2 py-1">
            Totales: {totalRooms}
          </span>
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
            Disponibles: {availableRooms}
          </span>
          <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
            Ocupadas: {occupiedRooms}
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
              <th className="px-3 py-2 text-left font-medium">Habitación</th>
              <th className="px-3 py-2 text-left font-medium">Descripción</th>
              <th className="px-3 py-2 text-left font-medium">Piso</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
              <th className="px-3 py-2 text-right font-medium">
                Precio / noche
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#33383E]/60 bg-[#33383E]/40">
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-lg text-white"
                >
                  Cargando habitaciones...
                </td>
              </tr>
            )}
            {!loading && rooms.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-lg text-white"
                >
                  No hay habitaciones registradas.
                </td>
              </tr>
            )}
            {!loading &&
              rooms.map((room) => {
                const floor =
                  room.number.startsWith("1") || room.number.startsWith("0")
                    ? "Primer piso"
                    : "Segundo piso";
                return (
                  <tr key={room.id} className="hover:bg-[#33383E]/60">
                    <td className="px-3 py-2 text-sm font-medium text-white">
                      {room.number}
                    </td>
                    <td className="px-3 py-2 align-middle text-lg text-white">
                      {room.type}
                    </td>
                    <td className="px-3 py-2 align-middle text-lg text-white">
                      {floor}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <RoomStatusBadge status={room.status} />
                    </td>
                    <td className="px-3 py-2 text-right align-middle text-lg text-white">
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


