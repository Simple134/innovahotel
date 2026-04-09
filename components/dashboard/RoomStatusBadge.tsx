interface RoomStatusBadgeProps {
  status: string;
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const normalized = status.toLowerCase();

  let bg = "var(--bg-overlay)";
  let color = "var(--text-secondary)";
  let dot = "var(--text-muted)";
  let label = status;

  if (normalized === "available" || normalized === "disponible") {
    bg = "var(--emerald-dim)";
    color = "var(--emerald)";
    dot = "var(--emerald)";
    label = "Disponible";
  } else if (normalized === "occupied" || normalized === "ocupada") {
    bg = "var(--amber-dim)";
    color = "var(--amber)";
    dot = "var(--amber)";
    label = "Ocupada";
  } else if (normalized === "cleaning" || normalized === "limpieza") {
    bg = "var(--blue-dim)";
    color = "var(--blue)";
    dot = "var(--blue)";
    label = "Limpieza";
  } else if (normalized === "maintenance" || normalized === "mantenimiento") {
    bg = "var(--rose-dim)";
    color = "var(--rose)";
    dot = "var(--rose)";
    label = "Mantenimiento";
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: bg, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={{ background: dot }}
      />
      {label}
    </span>
  );
}
