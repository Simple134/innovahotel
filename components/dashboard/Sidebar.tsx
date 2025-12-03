import Link from "next/link";
import {
  BedDouble,
  CalendarCheck2,
  LayoutDashboard,
  Users,
  UserPlus,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/dashboard/rooms", label: "Habitaciones", icon: BedDouble },
  { href: "/dashboard/bookings", label: "Reservas", icon: CalendarCheck2 },
  { href: "/dashboard/guests", label: "Huéspedes", icon: Users },
  { href: "/dashboard/register", label: "Registrar", icon: UserPlus },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-[#33383E] bg-[#33383E]/60 p-4 text-sm text-white md:flex">
      <div className="mb-6 flex items-center gap-2">
        <Image src="/logo.jpeg" alt="InnovaHotel" width={32} height={32} />
        <div>
          <p className="text-lg font-semibold">InnovaHotel</p>
          <p className="text-sm text-white">Panel de administración</p>
        </div>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-white transition-colors hover:bg-[#33383E] hover:text-[#DE9F73]"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
