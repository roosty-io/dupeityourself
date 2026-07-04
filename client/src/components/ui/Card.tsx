import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  title,
  subtitle,
  actions,
  id,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={`card p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h3 className="section-title">{title}</h3>}
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
