import { ReactNode, useState } from "react";

export function Accordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
  badge,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-bdr rounded-xl bg-surface overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-sand/50 transition-colors"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="font-medium text-ink flex items-center gap-2">{title}{badge}</div>
          {subtitle && <div className="text-xs text-muted mt-0.5">{subtitle}</div>}
        </div>
        <span className={`text-muted transition-transform shrink-0 ${open ? "rotate-180" : ""}`} aria-hidden>
          ▾
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 text-sm text-soot">{children}</div>}
    </div>
  );
}
