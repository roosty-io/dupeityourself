import type { ProjectTimelinePhase } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function ProjectTimelineCard({ phases }: { phases: ProjectTimelinePhase[] }) {
  if (phases.length === 0) return null;

  return (
    <Card
      title="🗓️ Project Timeline"
      subtitle="Realistic pacing, including glue and finish cure times you can't rush."
    >
      <ol className="relative border-l-2 border-pine-200 ml-3 space-y-6">
        {phases.map((phase, i) => (
          <li key={`${phase.phase}-${i}`} className="relative pl-6">
            <span
              className="absolute -left-[11px] top-0.5 w-5 h-5 rounded-full bg-pine-600 text-white text-[10px] font-bold grid place-items-center ring-4 ring-cream"
              aria-hidden
            >
              {i + 1}
            </span>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h4 className="font-semibold text-ink">{phase.phase}</h4>
              <Badge tone="oak">{phase.dayOrSession}</Badge>
              <span className="text-xs text-muted">⏱️ {phase.estimatedDuration}</span>
              {phase.waitTime && (
                <span className="chip bg-amber-100 text-amber-800">⏳ wait: {phase.waitTime}</span>
              )}
            </div>
            <ul className="space-y-1">
              {phase.tasks.map((task, j) => (
                <li key={j} className="text-sm text-soot flex gap-2">
                  <span className="text-pine-600 shrink-0" aria-hidden>
                    •
                  </span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
            {phase.dependencies && phase.dependencies.length > 0 && (
              <p className="text-xs text-muted mt-1.5">
                <span className="font-semibold">Depends on:</span> {phase.dependencies.join(", ")}
              </p>
            )}
            {phase.notes && <p className="text-xs text-muted mt-1.5">💬 {phase.notes}</p>}
          </li>
        ))}
      </ol>
    </Card>
  );
}
