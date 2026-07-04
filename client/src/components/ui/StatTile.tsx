import { ReactNode } from "react";

export function StatTile({
  icon,
  label,
  value,
  sub,
  className = "",
}: {
  icon?: string;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-parchment border border-bdr rounded-xl px-4 py-3 ${className}`}>
      <div className="text-xs text-muted flex items-center gap-1.5">
        {icon && <span aria-hidden>{icon}</span>}
        {label}
      </div>
      <div className="text-lg font-semibold text-ink mt-0.5 leading-snug">{value}</div>
      {sub && <div className="text-xs text-faint mt-0.5">{sub}</div>}
    </div>
  );
}
