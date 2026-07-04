const DEFAULT_STEPS = ["Inspiration", "Project type", "Constraints", "Smart questions", "Generate"];

export function WizardSteps({ current, steps = DEFAULT_STEPS }: { current: number; steps?: string[] }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 no-print" aria-label="Wizard progress">
      {steps.map((label, i) => {
        const stepNumber = i + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={label} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-7 h-7 rounded-full grid place-items-center text-xs font-semibold shrink-0 transition-colors ${
                  done
                    ? "bg-pine-100 text-pine-800"
                    : active
                      ? "bg-pine-600 text-white"
                      : "bg-sand text-faint"
                }`}
                aria-hidden
              >
                {done ? "✓" : stepNumber}
              </span>
              <span
                className={`hidden md:block text-xs font-medium truncate ${
                  active ? "text-ink" : done ? "text-soot" : "text-faint"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={`h-px flex-1 min-w-2 ${done ? "bg-pine-300" : "bg-bdr"}`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
