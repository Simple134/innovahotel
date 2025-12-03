 "use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (session) {
        router.replace("/dashboard");
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error: signInError } =
          await supabaseBrowser.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          setError(signInError.message ?? "No se pudo iniciar sesión.");
          setLoading(false);
          return;
        }
      } else {
        const { error: signUpError } = await supabaseBrowser.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message ?? "No se pudo crear la cuenta.");
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard");
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="flex min-h-screen items-center justify-center text-sm">
          Verificando sesión...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center rounded-full bg-[#33383E]/60 px-3 py-1 text-xs font-medium text-[#DE9F73] ring-1 ring-[#DE9F73]/30">
            InnovaHotel · Acceso al panel
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Entra a tu dashboard InnovaHotel
          </h1>
          <p className="max-w-md text-sm text-white">
            Inicia sesión o crea tu cuenta para gestionar habitaciones, reservas
            y huéspedes en tiempo real desde un solo lugar.
          </p>
          <ul className="space-y-2 text-xs text-white">
            <li>• Seguridad gestionada por Supabase Auth.</li>
            <li>• Acceso rápido para el equipo de recepción.</li>
          </ul>
        </div>

        <div className="flex-1">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-[#33383E] bg-[#33383E]/70 p-6 shadow-xl shadow-[#DE9F73]/20">
            <div className="mb-4 flex items-center justify-between text-xs text-white">
              <p className="font-medium">
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </p>
              <button
                type="button"
                onClick={() =>
                  setMode((prev) => (prev === "login" ? "signup" : "login"))
                }
                className="text-[11px] text-[#DE9F73] hover:underline"
              >
                {mode === "login"
                  ? "¿Aún no tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>

            {error && (
              <div className="mb-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-white">
                  Correo electrónico
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recepcion@tuhotel.com"
                    className="mt-1 w-full rounded-lg border border-[#33383E] bg-[#33383E] px-3 py-2 text-xs text-white outline-none placeholder:text-white focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                  />
                </label>
              </div>
              <div>
                <label className="block text-white">
                  Contraseña
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-lg border border-[#33383E] bg-[#33383E] px-3 py-2 text-xs text-white outline-none placeholder:text-white focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#DE9F73] px-4 py-2 text-xs font-medium text-white shadow-sm shadow-[#DE9F73]/30 transition hover:bg-[#DE9F73]/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Procesando..."
                  : mode === "login"
                    ? "Entrar al dashboard"
                    : "Crear cuenta y entrar"}
              </button>

              <p className="mt-3 text-[11px] text-white/80">
                Al continuar aceptas que InnovaHotel gestione tus datos de
                acceso de forma segura mediante Supabase.
              </p>
            </form>

            <div className="mt-4 text-[11px] text-white/70">
              <p>
                ¿Problemas para entrar? Contacta al administrador de tu hotel
                para restablecer el acceso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
