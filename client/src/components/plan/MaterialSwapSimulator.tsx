import type { MaterialSwapOption } from "@shared/types";
import { Card } from "@/components/ui/Card";

type Impact = "lower" | "similar" | "higher";
type DifficultyImpact = "easier" | "similar" | "harder";

function arrow(impact: Impact | DifficultyImpact): string {
  if (impact === "lower" || impact === "easier") return "↓";
  if (impact === "higher" || impact === "harder") return "↑";
  return "≈";
}

/** Tone depends on whether "more" of the attribute is good or bad. */
function impactChipClass(impact: Impact | DifficultyImpact, higherIsBetter: boolean): string {
  if (impact === "similar") return "bg-sand text-soot";
  const isUp = impact === "higher" || impact === "harder";
  const good = higherIsBetter ? isUp : !isUp;
  return good ? "bg-pine-100 text-pine-800" : "bg-ember-100 text-ember-800";
}

function ImpactChip({
  icon,
  label,
  impact,
  higherIsBetter,
}: {
  icon: string;
  label: string;
  impact: Impact | DifficultyImpact;
  higherIsBetter: boolean;
}) {
  return (
    <span className={`chip ${impactChipClass(impact, higherIsBetter)}`}>
      <span aria-hidden>{icon}</span> {label} {arrow(impact)} {impact}
    </span>
  );
}

export function MaterialSwapSimulator({ swaps }: { swaps: MaterialSwapOption[] }) {
  if (swaps.length === 0) {
    return (
      <Card title="🔄 Material Swap Simulator">
        <p className="text-sm text-muted">No material swaps were generated for this plan.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="section-title">🔄 Material Swap Simulator</h3>
        <p className="text-sm text-muted mt-1">
          What changes if you swap a key material — cost, durability, look, and difficulty, before you commit.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {swaps.map((swap, i) => (
          <div key={i} className="card p-5 flex flex-col gap-3">
            <div>
              {swap.originalMaterial ? (
                <h4 className="font-semibold text-ink leading-snug">
                  <span className="text-muted font-normal">{swap.originalMaterial}</span>{" "}
                  <span aria-hidden>→</span> {swap.alternativeMaterial}
                </h4>
              ) : (
                <h4 className="font-semibold text-ink leading-snug">{swap.alternativeMaterial}</h4>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {/* lower cost is good; higher durability/visual is good; easier is good */}
              <ImpactChip icon="💰" label="Cost" impact={swap.costImpact} higherIsBetter={false} />
              <ImpactChip icon="💪" label="Durability" impact={swap.durabilityImpact} higherIsBetter />
              <ImpactChip icon="🎯" label="Visual" impact={swap.visualMatchImpact} higherIsBetter />
              <ImpactChip icon="🔨" label="Difficulty" impact={swap.difficultyImpact} higherIsBetter={false} />
            </div>

            <div className="grid gap-2 text-sm">
              {swap.pros.length > 0 && (
                <ul className="space-y-1">
                  {swap.pros.map((pro, j) => (
                    <li key={j} className="flex gap-1.5 text-soot">
                      <span className="text-pine-600 font-semibold shrink-0" aria-hidden>
                        ✓
                      </span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              )}
              {swap.cons.length > 0 && (
                <ul className="space-y-1">
                  {swap.cons.map((con, j) => (
                    <li key={j} className="flex gap-1.5 text-muted">
                      <span className="text-ember-600 font-semibold shrink-0" aria-hidden>
                        ✗
                      </span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {swap.notes && <p className="text-xs text-muted border-t border-bdr/70 pt-2.5 mt-auto">{swap.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
