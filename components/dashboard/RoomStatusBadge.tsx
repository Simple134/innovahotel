interface RoomStatusBadgeProps {
  status: string;
}

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const normalized = status.toLowerCase();

  let classes = "bg-[#33383E]/80 text-white";
  let label = status;

  if (normalized === "available" || normalized === "disponible") {
    classes =
      "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30";
    label = "Disponible";
  } else if (normalized === "occupied" || normalized === "ocupada") {
    classes = "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30";
    label = "Ocupada";
  } else if (normalized === "cleaning" || normalized === "limpieza") {
    classes = "bg-[#DE9F73]/15 text-[#DE9F73] ring-1 ring-[#DE9F73]/30";
    label = "Limpieza";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-lg font-medium ${classes}`}
    >
      {label}
    </span>
  );
}
