export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-[#33383E] bg-[#33383E]/60 px-4 py-3 text-sm text-white">
      <div className="flex flex-col">
        <span className="text-xs text-white">Panel principal</span>
        <span className="font-medium">Dashboard</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-white">
        <span className="hidden sm:inline">Recepción</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DE9F73] text-xs font-semibold text-white">
          RS
        </div>
      </div>
    </header>
  );
}
