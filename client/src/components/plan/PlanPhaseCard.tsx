import type { SimpleBuildPhase } from "@shared/simplePlan";
import { Accordion } from "@/components/ui/Accordion";

/**
 * One build phase, rendered as a scannable card: a big title, time estimate,
 * a one-line goal, a short checklist of steps (each expandable for the full
 * instructions), and the phase-level mistake + quality gate.
 */
export function PlanPhaseCard({
  phase,
  completedSteps,
  onToggleStep,
}: {
  phase: SimpleBuildPhase;
  completedSteps: number[];
  onToggleStep: (stepNumber: number) => void;
}) {
  const done = new Set(completedSteps);
  const doneCount = phase.steps.filter((s) => done.has(s.stepNumber)).length;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-pine-600 text-white text-sm font-bold">
            {phase.phaseNumber}
          </span>
          <h3 className="text-lg font-bold text-ink leading-tight">{phase.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {phase.estimatedTime && <span className="chip bg-sand text-soot">⏱️ {phase.estimatedTime}</span>}
          <span className="text-xs text-muted">
            {doneCount}/{phase.steps.length} done
          </span>
        </div>
      </div>

      {phase.goal && (
        <p className="text-sm text-soot mb-4">
          <span className="font-semibold text-ink">Goal:</span> {phase.goal}
        </p>
      )}

      <div className="space-y-2.5">
        {phase.steps.map((step) => {
          const isDone = done.has(step.stepNumber);
          const hasDetail =
            step.detailedInstructions.length > 1 ||
            (step.measurementNotes?.length ?? 0) > 0 ||
            (step.safetyNotes?.length ?? 0) > 0 ||
            Boolean(step.qualityCheck) ||
            Boolean(step.commonMistake) ||
            step.toolsNeeded.length > 0;

          return (
            <div key={step.stepNumber} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => onToggleStep(step.stepNumber)}
                className="mt-3.5 w-4 h-4 accent-pine-600 shrink-0 cursor-pointer"
                aria-label={`Mark "${step.title}" ${isDone ? "incomplete" : "complete"}`}
              />
              <div className="flex-1 min-w-0">
                {hasDetail ? (
                  <Accordion
                    title={
                      <span className={isDone ? "line-through text-faint" : "text-ink font-medium"}>{step.title}</span>
                    }
                    subtitle={step.shortInstruction}
                    badge={<span className="chip bg-sand text-soot shrink-0 ml-2">⏱️ {step.estimatedTime}</span>}
                  >
                    <StepDetail step={step} />
                  </Accordion>
                ) : (
                  <div className="border border-bdr rounded-xl bg-surface px-4 py-3">
                    <div className={`font-medium ${isDone ? "line-through text-faint" : "text-ink"}`}>{step.title}</div>
                    <div className="text-xs text-muted mt-0.5">{step.shortInstruction}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(phase.commonMistake || phase.qualityCheck) && (
        <div className="mt-4 space-y-2">
          {phase.commonMistake && (
            <div className="rounded-lg bg-ember-50 border border-ember-100 px-3 py-2 text-sm text-soot">
              <span className="font-semibold text-ember-800">⚠️ Common mistake:</span> {phase.commonMistake}
            </div>
          )}
          {phase.qualityCheck && (
            <div className="rounded-lg bg-pine-50 border border-pine-100 px-3 py-2 text-sm text-soot">
              <span className="font-semibold text-pine-800">✅ Before moving on:</span> {phase.qualityCheck}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StepDetail({ step }: { step: SimpleBuildPhase["steps"][number] }) {
  return (
    <div className="space-y-3">
      {(step.toolsNeeded.length > 0 || step.materialsNeeded.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {step.toolsNeeded.map((t) => (
            <span key={`t-${t}`} className="chip bg-sand text-soot">
              🛠️ {t}
            </span>
          ))}
          {step.materialsNeeded.map((m) => (
            <span key={`m-${m}`} className="chip bg-oak-50 text-oak-800 border border-oak-100">
              🪵 {m}
            </span>
          ))}
        </div>
      )}

      <div>
        <h5 className="text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">Detailed instructions</h5>
        <ol className="space-y-1.5">
          {step.detailedInstructions.map((ins, i) => (
            <li key={i} className="text-sm text-soot flex gap-2">
              <span className="text-pine-600 font-semibold shrink-0">{i + 1}.</span>
              <span>{ins}</span>
            </li>
          ))}
        </ol>
      </div>

      {step.measurementNotes && step.measurementNotes.length > 0 && (
        <div className="rounded-lg bg-parchment border border-bdr px-3 py-2">
          <span className="text-xs font-semibold text-soot">📐 Measurements</span>
          <ul className="mt-1 space-y-1">
            {step.measurementNotes.map((n, i) => (
              <li key={i} className="text-sm text-soot">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.safetyNotes && step.safetyNotes.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <span className="text-xs font-semibold text-amber-800">⚠️ Safety</span>
          <ul className="mt-1 space-y-1">
            {step.safetyNotes.map((n, i) => (
              <li key={i} className="text-sm text-soot">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {step.qualityCheck && (
        <p className="text-sm text-soot">
          <span className="font-semibold text-pine-800">✅ Quality check:</span> {step.qualityCheck}
        </p>
      )}
      {step.commonMistake && (
        <p className="text-sm text-soot">
          <span className="font-semibold text-ember-800">⚠️ Avoid:</span> {step.commonMistake}
        </p>
      )}

      {step.relatedMiniLessons && step.relatedMiniLessons.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {step.relatedMiniLessons.map((l) => (
            <span key={l} className="chip bg-oak-100 text-oak-800">
              📚 {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
