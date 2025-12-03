"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Tables } from "@/database.types";

type Room = Tables<"rooms">;
type Guest = Tables<"guests">;

type RoomWithStatus = Room;

export default function RegisterGuestPage() {
  const [rooms, setRooms] = useState<RoomWithStatus[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setRoomsError(null);

      const { data, error } = await supabaseBrowser
        .from("rooms")
        .select("*")
        .eq("status", "available")
        .order("number", { ascending: true });

      if (error) {
        console.error(error);
        setRoomsError("No se pudieron cargar las habitaciones disponibles.");
      } else {
        setRooms((data ?? []) as RoomWithStatus[]);
      }

      setLoadingRooms(false);
    };

    fetchRooms();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!fullName.trim()) {
      setMessage("El nombre completo es obligatorio.");
      return;
    }

    if (!selectedRoomId) {
      setMessage("Debes seleccionar una habitación disponible.");
      return;
    }

    setSaving(true);

    try {
      // 1) Crear huésped
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
        console.error(guestError);
        setMessage("No se pudo registrar el huésped. Intenta de nuevo.");
        setSaving(false);
        return;
      }

      // 2) Marcar habitación como ocupada
      const { error: roomError } = await supabaseBrowser
        .from("rooms")
        .update({ status: "occupied" })
        .eq("id", selectedRoomId);

      if (roomError) {
        console.error(roomError);
        setMessage(
          "Huésped creado, pero no se pudo actualizar el estado de la habitación."
        );
      } else {
        setMessage("Huésped y habitación registrados correctamente.");

        // limpiar formulario y actualizar lista de habitaciones disponibles
        setFullName("");
        setEmail("");
        setPhone("");
        setDocumentId("");
        setSelectedRoomId("");
        setRooms((prev) => prev.filter((room) => room.id !== selectedRoomId));
      }
    } catch {
      setMessage("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-black">
            Registrar huésped
          </h1>
          <p className="text-xs text-black">
            Añade un nuevo huésped y asigna una habitación disponible.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="space-y-4 rounded-2xl border border-[#33383E] bg-[#33383E]/60 p-4 text-sm lg:col-span-1">
          <div>
            <h2 className="text-sm font-medium text-white">
              Datos del huésped
            </h2>
            <p className="text-xs text-white">
              Información básica para el registro.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 text-xs">
            <div className="space-y-1">
              <label className="block text-white">
                Nombre completo
                <input
                  className="mt-1 w-full rounded-lg border border-[#33383E] bg-[#33383E] px-2 py-1.5 text-xs text-white outline-none ring-0 placeholder:text-white focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Ana Pérez"
                  required
                />
              </label>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-white">
                Email
                <input
                  className="mt-1 w-full rounded-lg border border-[#33383E] bg-[#33383E] px-2 py-1.5 text-xs text-white outline-none ring-0 placeholder:text-white focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ana@hotel.com"
                  type="email"
                />
              </label>
              <label className="block text-white">
                Teléfono
                <input
                  className="mt-1 w-full rounded-lg border border-[#33383E] bg-[#33383E] px-2 py-1.5 text-xs text-white outline-none ring-0 placeholder:text-white focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                />
              </label>
            </div>
            <div className="space-y-1">
              <label className="block text-white">
                Documento / ID
                <input
                  className="mt-1 w-full rounded-lg border border-[#33383E] bg-[#33383E] px-2 py-1.5 text-xs text-white outline-none ring-0 placeholder:text-white focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="DNI, Pasaporte..."
                />
              </label>
            </div>
            <div className="space-y-1">
              <label className="block text-white">
                Habitación asignada
                <select
                  className="mt-1 w-full rounded-lg border border-[#33383E] bg-[#33383E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  <option value="">Selecciona una habitación disponible</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.number} — {room.type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#DE9F73] px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-[#DE9F73]/30 transition hover:bg-[#DE9F73]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Guardando..." : "Registrar huésped"}
            </button>

            {message && (
              <p className="pt-1 text-xs text-white">{message}</p>
            )}
          </form>
        </section>

        <section className="space-y-3 rounded-2xl border border-[#33383E] bg-[#33383E]/60 p-4 text-sm lg:col-span-2">
          <div>
            <h2 className="text-sm font-medium text-white">
              Habitaciones disponibles
            </h2>
            <p className="text-xs text-white">
              Elige una habitación en función del piso, tipo y comodidades.
            </p>
          </div>

          {roomsError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {roomsError}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {loadingRooms && (
              <div className="col-span-2 text-xs text-white">
                Cargando habitaciones...
              </div>
            )}
            {!loadingRooms && rooms.length === 0 && (
              <div className="col-span-2 text-xs text-white">
                No hay habitaciones disponibles en este momento.
              </div>
            )}
            {!loadingRooms &&
              rooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`flex flex-col rounded-xl border px-3 py-2 text-left text-xs transition ${
                    selectedRoomId === room.id
                      ? "border-[#DE9F73] bg-[#33383E]"
                      : "border-[#33383E] bg-[#33383E]/70 hover:bg-[#33383E]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      Hab. {room.number}
                    </p>
                    <p className="text-xs font-medium text-[#DE9F73]">
                      ${room.price_per_night.toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-white">{room.type}</p>
                </button>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}


