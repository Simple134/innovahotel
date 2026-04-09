import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { HotelProvider } from "@/contexts/HotelContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <HotelProvider>
      <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-6 py-6">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </HotelProvider>
  );
}
