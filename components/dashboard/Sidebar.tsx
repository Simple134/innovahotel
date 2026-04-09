"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck2,
  Users,
  UserPlus,
  Building2,
  Users2,
  Wallet,
  Receipt,
  LogOut,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useHotel } from "@/contexts/HotelContext";

const navSections = [
  {
    label: "Operaciones",
    items: [
      { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/rooms", label: "Habitaciones", icon: BedDouble },
      { href: "/dashboard/bookings", label: "Reservas", icon: CalendarCheck2 },
      { href: "/dashboard/guests", label: "Huéspedes", icon: Users },
      { href: "/dashboard/register", label: "Registrar huésped", icon: UserPlus },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/dashboard/hoteles", label: "Hoteles", icon: Building2 },
      { href: "/dashboard/empleados", label: "Empleados", icon: Users2 },
      { href: "/dashboard/nomina", label: "Nómina", icon: Wallet },
      { href: "/dashboard/gastos", label: "Gastos", icon: Receipt },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { hotels, selectedHotel, setSelectedHotel, loadingHotels } = useHotel();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href) && href !== "/dashboard";

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <aside
      className="hidden md:flex w-[240px] flex-shrink-0 flex-col"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
        minHeight: "100vh",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="relative h-9 w-9 overflow-hidden rounded-xl flex-shrink-0"
          style={{ border: "1px solid var(--border-strong)" }}
        >
          <Image src="/logo.jpeg" alt="InnovaHotel" fill className="object-cover" />
        </div>
        <div>
          <p
            className="text-base font-semibold leading-tight tracking-wide"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
              letterSpacing: "0.04em",
            }}
          >
            InnovaHotel
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Cadena hotelera
          </p>
        </div>
      </div>

      {/* Hotel selector */}
      <div className="px-3 py-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
        <p
          className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          Hotel activo
        </p>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-all"
            style={{
              background: selectedHotel ? "var(--gold-dim)" : "var(--bg-elevated)",
              border: selectedHotel
                ? "1px solid var(--gold-glow)"
                : "1px solid var(--border-default)",
            }}
          >
            <Building2
              size={14}
              style={{ color: selectedHotel ? "var(--gold)" : "var(--text-muted)", flexShrink: 0 }}
            />
            <span
              className="flex-1 text-left truncate text-xs font-medium"
              style={{ color: selectedHotel ? "var(--gold-light)" : "var(--text-muted)" }}
            >
              {loadingHotels
                ? "Cargando..."
                : selectedHotel
                ? selectedHotel.name
                : "Seleccionar hotel"}
            </span>
            <ChevronDown
              size={12}
              style={{
                color: "var(--text-muted)",
                flexShrink: 0,
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.15s",
              }}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              {hotels.length === 0 ? (
                <div className="px-3 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  No hay hoteles registrados
                </div>
              ) : (
                hotels.map((hotel, idx) => {
                  const active = selectedHotel?.id === hotel.id;
                  return (
                    <button
                      key={hotel.id}
                      type="button"
                      onClick={() => {
                        setSelectedHotel(hotel);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all"
                      style={{
                        background: active ? "var(--gold-dim)" : "transparent",
                        borderBottom:
                          idx < hotels.length - 1
                            ? "1px solid var(--border-subtle)"
                            : "none",
                      }}
                    >
                      <Building2
                        size={12}
                        style={{
                          color: active ? "var(--gold)" : "var(--text-muted)",
                          flexShrink: 0,
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: active ? "var(--gold-light)" : "var(--text-secondary)" }}
                        >
                          {hotel.name}
                        </p>
                        {hotel.city && (
                          <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                            {hotel.city}
                          </p>
                        )}
                      </div>
                      {active && (
                        <Check size={11} style={{ color: "var(--gold)", flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })
              )}

              <Link
                href="/dashboard/hoteles"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-opacity hover:opacity-80"
                style={{
                  color: "var(--gold)",
                  borderTop: "1px solid var(--border-default)",
                }}
              >
                <Plus size={11} /> Gestionar hoteles
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p
              className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150"
                    style={{
                      color: active ? "var(--gold-light)" : "var(--text-secondary)",
                      background: active ? "var(--gold-dim)" : "transparent",
                      borderLeft: active
                        ? "2px solid var(--gold)"
                        : "2px solid transparent",
                    }}
                  >
                    <Icon
                      size={15}
                      style={{ color: active ? "var(--gold)" : "var(--text-muted)" }}
                    />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom — logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--rose)";
            (e.currentTarget as HTMLButtonElement).style.background = "var(--rose-dim)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <LogOut size={15} />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
