import { ReactNode } from "react";

export function EmptyState({
  icon = "🪵",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card p-12 text-center">
      <div className="text-4xl mb-3" aria-hidden>{icon}</div>
      <h3 className="font-semibold text-ink text-lg">{title}</h3>
      {description && <p className="text-sm text-muted mt-1.5 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card p-8 text-center border-danger/30">
      <div className="text-3xl mb-2" aria-hidden>⚠️</div>
      <h3 className="font-semibold text-ink">Something went wrong</h3>
      <p className="text-sm text-muted mt-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-md mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
