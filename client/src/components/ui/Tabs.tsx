import { ReactNode } from "react";

export type TabDef = { key: string; label: string; icon?: string };

export function TabBar({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-1 overflow-x-auto pb-1 no-print ${className}`} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === t.key ? "bg-pine-600 text-white shadow-sm" : "text-soot hover:bg-sand"
          }`}
        >
          {t.icon && <span className="mr-1.5" aria-hidden>{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ active, tabKey, children }: { active: string; tabKey: string; children: ReactNode }) {
  if (active !== tabKey) return null;
  return <div role="tabpanel">{children}</div>;
}
