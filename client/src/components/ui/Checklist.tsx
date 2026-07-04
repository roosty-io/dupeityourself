import { ReactNode } from "react";

export function CheckItem({
  checked,
  onToggle,
  children,
  sub,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-sand/50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 w-4 h-4 accent-pine-600 shrink-0"
      />
      <span className="min-w-0">
        <span className={`text-sm ${checked ? "line-through text-faint" : "text-ink"}`}>{children}</span>
        {sub && <span className="block text-xs text-muted mt-0.5">{sub}</span>}
      </span>
    </label>
  );
}
