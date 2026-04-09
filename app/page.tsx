"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
      else setCheckingSession(false);
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error: e } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (e) { setError(e.message ?? "No se pudo iniciar sesión."); setLoading(false); return; }
      } else {
        const { error: e } = await supabaseBrowser.auth.signUp({ email, password });
        if (e) { setError(e.message ?? "No se pudo crear la cuenta."); setLoading(false); return; }
      }
      router.push("/dashboard");
    } catch {
      setError("Ocurrió un error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm"
        style={{ background: "var(--bg-base)", color: "var(--text-muted)" }}
      >
        Verificando sesión...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-base)", fontFamily: "var(--font-body)" }}
    >
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border-default)" }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--gold) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow blob */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: "var(--gold)" }}
        />

        <div className="relative z-10 max-w-sm text-center space-y-6">
          <div
            className="inline-flex h-20 w-20 items-center justify-center rounded-2xl mx-auto overflow-hidden"
            style={{ border: "1px solid var(--border-strong)", background: "var(--bg-elevated)" }}
          >
            <Image src="/logo.jpeg" alt="InnovaHotel" width={80} height={80} className="object-cover" />
          </div>

          <div>
            <h1
              className="text-5xl font-semibold leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
                letterSpacing: "0.02em",
              }}
            >
              InnovaHotel
            </h1>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Plataforma de gestión integral para cadenas hoteleras. Control completo desde recepción.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {["Multi-hotel", "Nómina", "Reservas", "Reportes", "Gastos"].map((f) => (
              <span
                key={f}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: "var(--gold-dim)",
                  color: "var(--gold-light)",
                  border: "1px solid var(--gold-glow)",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--border-strong)" }}>
              <Image src="/logo.jpeg" alt="InnovaHotel" width={36} height={36} className="object-cover" />
            </div>
            <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
              InnovaHotel
            </span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {mode === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              {mode === "login"
                ? "Ingresa tus credenciales para acceder al panel"
                : "Completa el formulario para registrarte"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: "var(--rose-dim)",
                color: "var(--rose)",
                border: "1px solid rgba(244,74,107,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recepcion@hotel.com"
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all pr-10"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all mt-2"
              style={{
                background: loading ? "var(--gold-dim)" : "var(--gold)",
                color: loading ? "var(--gold-light)" : "#0D0F1A",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? "Procesando..."
                : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
              className="font-medium underline underline-offset-2 cursor-pointer"
              style={{ color: "var(--gold)" }}
            >
              {mode === "login" ? "Crear una cuenta" : "Iniciar sesión"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
