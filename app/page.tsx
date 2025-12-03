 "use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      <main className="min-h-screen bg-white text-[#0a0a0a]">
        <div className="flex min-h-screen items-center justify-center text-sm">
          Verificando sesión...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-md">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              <Image
                src="/logo.jpeg"
                alt="InnovaHotel"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">
                InnovaHotel
              </h1>
              <p className="mt-1 text-lg text-gray-500">
                Acceso al panel de recepción
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between text-lg text-gray-700">
            <p className="font-medium">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </p>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-lg text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-lg">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Correo electrónico
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recepcion@tuhotel.com"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg text-[#0a0a0a] outline-none placeholder:text-gray-400 focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                />
              </label>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Contraseña
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-lg text-[#0a0a0a] outline-none placeholder:text-gray-400 focus:border-[#DE9F73] focus:ring-1 focus:ring-[#DE9F73]/60"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#DE9F73] px-4 py-2 text-lg font-medium text-white shadow-sm shadow-[#DE9F73]/30 transition hover:bg-[#DE9F73]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Procesando..."
                : mode === "login"
                  ? "Entrar al dashboard"
                  : "Crear cuenta y entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
