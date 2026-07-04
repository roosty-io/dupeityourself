import type { BuildStep, MiniLesson } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { ScoreBar } from "@/components/ui/ScoreBar";

function scrollToLesson(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function LessonChips({ related, miniLessons }: { related: string[]; miniLessons: MiniLesson[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {related.map((ref) => {
        const lesson = miniLessons.find((l) => l.id === ref || l.title === ref);
        if (lesson) {
          return (
            <button
              key={ref}
              type="button"
              onClick={() => scrollToLesson(lesson.id)}
              className="chip bg-oak-100 text-oak-800 hover:bg-oak-200 transition-colors"
              title="Jump to this mini lesson"
            >
              📚 {lesson.title}
            </button>
          );
        }
        return (
          <span key={ref} className="chip bg-oak-100 text-oak-800">
            📚 {ref}
          </span>
        );
      })}
    </div>
  );
}

function StepBody({ step, miniLessons }: { step: BuildStep; miniLessons: MiniLesson[] }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-parchment border border-bdr px-3 py-2.5">
        <p className="text-sm text-soot">
          <span className="font-semibold text-ink">🎯 Goal:</span> {step.goal}
        </p>
      </div>

      {(step.toolsNeeded.length > 0 || step.materialsNeeded.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {step.toolsNeeded.map((t) => (
            <span key={`tool-${t}`} className="chip bg-sand text-soot">
              🛠️ {t}
            </span>
          ))}
          {step.materialsNeeded.map((m) => (
            <span key={`mat-${m}`} className="chip bg-oak-50 text-oak-800 border border-oak-100">
              🪵 {m}
            </span>
          ))}
        </div>
      )}

      <ol className="list-decimal pl-5 space-y-1.5 text-sm text-soot marker:font-semibold marker:text-pine-700">
        {step.instructions.map((ins, i) => (
          <li key={i} className="leading-relaxed">
            {ins}
          </li>
        ))}
      </ol>

      {step.measurementNotes && step.measurementNotes.length > 0 && (
        <div className="rounded-lg bg-sand/60 border border-bdr px-3 py-2.5">
          <p className="text-xs font-semibold text-soot mb-1">📏 Measurement notes</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
            {step.measurementNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {step.safetyNotes && step.safetyNotes.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
          <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Safety</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-amber-900">
            {step.safetyNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {step.qualityCheck && (
        <div className="rounded-lg bg-pine-50 border border-pine-100 px-3 py-2.5">
          <p className="text-sm text-pine-800">
            <span className="font-semibold">✅ Quality check:</span> {step.qualityCheck}
          </p>
        </div>
      )}

      {step.commonMistake && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <p className="text-sm text-red-900">
            <span className="font-semibold">🚫 Common mistake:</span> {step.commonMistake}
          </p>
        </div>
      )}

      {step.relatedMiniLessons && step.relatedMiniLessons.length > 0 && (
        <LessonChips related={step.relatedMiniLessons} miniLessons={miniLessons} />
      )}
    </div>
  );
}

export function StepByStepGuide({
  steps,
  completedSteps,
  onToggleStep,
  miniLessons,
}: {
  steps: BuildStep[];
  completedSteps: number[];
  onToggleStep: (n: number) => void;
  miniLessons: MiniLesson[];
}) {
  const doneCount = steps.filter((s) => completedSteps.includes(s.stepNumber)).length;
  const progress = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;

  // group consecutive steps by phase, preserving order
  const groups: { phase?: string; steps: BuildStep[] }[] = [];
  for (const step of steps) {
    const last = groups[groups.length - 1];
    if (last && last.phase === step.phase) last.steps.push(step);
    else groups.push({ phase: step.phase, steps: [step] });
  }

  return (
    <Card title="🔨 Step-by-step build guide" subtitle="Check off each step as you finish it — progress is saved.">
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-medium text-ink">
            {doneCount} of {steps.length} steps complete
          </span>
          <span className="text-muted">{progress}%</span>
        </div>
        <ScoreBar score={progress} />
      </div>

      <div className="space-y-5">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.phase && (
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2 flex items-center gap-1.5">
                <span aria-hidden>🪵</span> {group.phase}
              </h4>
            )}
            <div className="space-y-3">
              {group.steps.map((step) => {
                const done = completedSteps.includes(step.stepNumber);
                return (
                  <div key={step.stepNumber} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => onToggleStep(step.stepNumber)}
                      className="mt-4 w-4 h-4 accent-pine-600 shrink-0 cursor-pointer"
                      aria-label={`Mark step ${step.stepNumber} ${done ? "incomplete" : "complete"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <Accordion
                        defaultOpen={step.stepNumber === steps[0]?.stepNumber}
                        title={
                          <span className={done ? "line-through text-faint" : undefined}>
                            Step {step.stepNumber} — {step.title}
                          </span>
                        }
                        badge={
                          <span className="chip bg-sand text-soot shrink-0">⏱️ {step.estimatedTime}</span>
                        }
                      >
                        <StepBody step={step} miniLessons={miniLessons} />
                      </Accordion>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
