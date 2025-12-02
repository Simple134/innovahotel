import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-16 px-6 py-10 md:flex-row md:items-center">
        <div className="flex-1 space-y-8">
          <span className="inline-flex items-center rounded-full bg-[#33383E]/60 px-3 py-1 text-xs font-medium text-[#DE9F73] ring-1 ring-[#DE9F73]/30">
            InnovaHotel · Panel inteligente para tu hotel
          </span>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Gestiona tu hotel en tiempo real,{" "}
            <span className="bg-gradient-to-r from-[#DE9F73] to-[#DE9F73]/80 bg-clip-text text-transparent">
              sin complicaciones.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white">
            Controla disponibilidad, check-in, check-out y reservas desde un
            solo dashboard moderno. Diseñado para recepciones ocupadas y
            equipos que necesitan ver todo de un vistazo.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#DE9F73] px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-[#DE9F73]/30 transition hover:bg-[#DE9F73]/90"
            >
              Entrar al dashboard
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-[#33383E] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#33383E]/60"
            >
              Ver características
            </a>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-white sm:max-w-md">
            <div>
              <dt className="font-semibold text-white">
                Estado en vivo
              </dt>
              <dd>Habitaciones disponibles y ocupadas en tiempo real.</dd>
            </div>
            <div>
              <dt className="font-semibold text-white">
                Pensado para recepción
              </dt>
              <dd>Flujo rápido para check-in y check-out.</dd>
            </div>
          </dl>
        </div>

        <div className="flex-1">
          <div className="relative mx-auto max-w-md rounded-3xl border border-[#33383E] bg-gradient-to-b from-[#33383E]/80 to-[#0a0a0a] p-5 shadow-xl shadow-[#DE9F73]/20">
            <div className="mb-4 flex items-center justify-between text-xs text-white">
              <span>Vista previa del dashboard</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#33383E] px-2 py-0.5 text-[10px] text-[#DE9F73]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                En línea
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-2">
                <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/80 p-3">
                  <p className="text-[11px] text-white">
                    Habitaciones disponibles
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-300">
                    18
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-400/80">
                    +3 hoy
                  </p>
                </div>
                <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/80 p-3">
                  <p className="text-[11px] text-white">
                    Check-ins del día
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[#DE9F73]">12</p>
                  <p className="mt-1 text-[11px] text-white">
                    Próximo a las 15:00
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/80 p-3">
                  <p className="text-[11px] text-white">
                    Ocupación actual
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-amber-300">
                    78%
                  </p>
                  <p className="mt-1 text-[11px] text-amber-400/80">
                    Fin de semana alto
                  </p>
                </div>
                <div className="rounded-2xl border border-dashed border-[#33383E] bg-[#33383E]/60 p-3">
                  <p className="text-[11px] text-white">
                    Registro rápido
                  </p>
                  <p className="mt-1 text-[11px] text-white">
                    Guarda huéspedes frecuentes y agiliza el check-in.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#33383E] bg-[#33383E]/80 p-3 text-[11px] text-white">
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7 overflow-hidden rounded-lg border border-[#33383E] bg-[#33383E]">
                  <Image
                    src="/window.svg"
                    alt="Ilustración InnovaHotel"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-white">
                    InnovaHotel Dashboard
                  </p>
                  <p className="text-[10px] text-white">
                    Diseñado para hoteles modernos
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#33383E] px-2 py-0.5 text-[10px] text-white">
                Listo para usar
              </span>
            </div>
          </div>
        </div>
      </div>

      <section
        id="features"
        className="border-t border-[#33383E] bg-[#33383E]/60 py-10"
      >
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-lg font-semibold text-white">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white">
            InnovaHotel centraliza la información crítica de tu hotel para que
            tu equipo pueda enfocarse en la experiencia del huésped.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-white md:grid-cols-3">
            <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/80 p-4">
              <p className="text-xs font-semibold text-[#DE9F73]">
                Disponibilidad clara
              </p>
              <p className="mt-2 text-sm text-white">
                Mapa de habitaciones con estados visuales para saber qué está
                libre, ocupado o en limpieza.
              </p>
            </div>
            <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/80 p-4">
              <p className="text-xs font-semibold text-emerald-300">
                Registro ágil
              </p>
              <p className="mt-2 text-sm text-white">
                Guarda huéspedes frecuentes, datos de contacto y documentos en
                segundos.
              </p>
            </div>
            <div className="rounded-2xl border border-[#33383E] bg-[#33383E]/80 p-4">
              <p className="text-xs font-semibold text-amber-300">
                Métricas en vivo
              </p>
              <p className="mt-2 text-sm text-white">
                Ocupación, check-ins y check-outs del día siempre visibles en el
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
