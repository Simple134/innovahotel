"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";

type Guest = Tables<"guests">;

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabaseBrowser
        .from("guests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("No se pudieron cargar los huéspedes.");
      } else {
        setGuests((data ?? []) as Guest[]);
      }

      setLoading(false);
    };

    fetchGuests();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-black">Huéspedes</h1>
          <p className="text-xs text-black">
            Listado de huéspedes registrados recientemente.
          </p>
        </div>
        <p className="text-[11px] text-black">
          Total registrados: {guests.length}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#33383E] bg-[#33383E]/60">
        <table className="min-w-full divide-y divide-[#33383E]/80 text-xs text-white">
          <thead className="bg-[#33383E]/80">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Nombre</th>
              <th className="px-3 py-2 text-left font-medium">Contacto</th>
              <th className="px-3 py-2 text-left font-medium">Documento</th>
              <th className="px-3 py-2 text-left font-medium">Fecha registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#33383E]/60 bg-[#33383E]/40">
            {loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-xs text-white"
                >
                  Cargando huéspedes...
                </td>
              </tr>
            )}
            {!loading && guests.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-xs text-white"
                >
                  Aún no hay huéspedes registrados.
                </td>
              </tr>
            )}
            {!loading &&
              guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-[#33383E]/60">
                  <td className="px-3 py-2 text-sm font-medium text-white">
                    {guest.full_name}
                  </td>
                  <td className="px-3 py-2 align-middle text-xs text-white">
                    {guest.email || guest.phone || "Sin datos de contacto"}
                  </td>
                  <td className="px-3 py-2 align-middle text-xs text-white">
                    {guest.document_id || "—"}
                  </td>
                  <td className="px-3 py-2 align-middle text-xs text-white">
                    {new Date(guest.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


