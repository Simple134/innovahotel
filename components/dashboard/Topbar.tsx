 "use client";

import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { User } from "lucide-react";

export function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.replace("/");
  };

  return (
    <header className="flex items-center justify-between border-b border-[#33383E] bg-[#33383E]/60 px-4 py-3 text-sm text-white">
      <div className="flex flex-col">
        <span className="text-lg text-white">Panel principal</span>
        <span className="font-medium">Dashboard</span>
      </div>
      <div className="flex items-center gap-3 text-lg text-white">
        <button
          type="button"
          onClick={handleLogout}
          className="hidden rounded-full px-2 py-1 text-lg text-white transition hover:bg-[#33383E] sm:inline cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
