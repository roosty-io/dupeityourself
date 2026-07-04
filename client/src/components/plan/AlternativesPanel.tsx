import type { AlternativeOption, DesignSimplifierNotes, MinimumViableDupe } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { moneyRange, titleCase } from "@/lib/format";

function focusTone(focus: AlternativeOption["focus"]): BadgeTone {
  switch (focus) {
    case "cheapest":
      return "green";
    case "beginner":
      return "green";
    case "premium":
      return "oak";
    case "tool_limited":
      return "gray";
    case "weekend":
      return "yellow";
    case "durable":
      return "oak";
    case "minimum_viable_dupe":
      return "orange";
    default:
      return "gray";
  }
}

function ChipColumn({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return (
    <div>
      <h5 className="text-xs font-semibold text-soot mb-1.5">{title}</h5>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-xs text-faint">None</span>
        ) : (
          items.map((el) => (
            <span key={el} className={`chip ${tone}`}>
              {el}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export function AlternativesPanel({
  alternatives,
  minimumViableDupe,
  designSimplifier,
}: {
  alternatives: AlternativeOption[];
  minimumViableDupe: MinimumViableDupe;
  designSimplifier: DesignSimplifierNotes;
}) {
  return (
    <div className="space-y-6">
      {/* -------------------- design simplifier -------------------- */}
      <Card
        title="✂️ Design simplifier"
        subtitle="What we changed from the reference piece to keep this buildable — and what it costs you visually."
      >
        {designSimplifier.difficultOriginalDetails.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-ink mb-2">Hard-to-build details in the original</h4>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Detail</th>
                    <th>Why it's difficult</th>
                  </tr>
                </thead>
                <tbody>
                  {designSimplifier.difficultOriginalDetails.map((d, i) => (
                    <tr key={i}>
                      <td className="font-medium text-ink">{d.detail}</td>
                      <td className="text-soot">{d.whyDifficult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {designSimplifier.simplifications.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-ink mb-2">Simplifications made</h4>
            <div className="space-y-2.5">
              {designSimplifier.simplifications.map((s, i) => (
                <div key={i} className="rounded-lg border border-bdr bg-parchment px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-soot line-through decoration-faint">{s.original}</span>
                    <span className="text-muted" aria-hidden>
                      →
                    </span>
                    <span className="font-medium text-ink">{s.simplified}</span>
                  </div>
                  <p className="text-xs text-muted mt-1">Fidelity impact: {s.fidelityImpact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3 mb-5">
          <ChipColumn title="✅ Preserved" tone="bg-pine-100 text-pine-800" items={designSimplifier.preservedElements} />
          <ChipColumn title="🔁 Changed" tone="bg-amber-100 text-amber-800" items={designSimplifier.changedElements} />
          <ChipColumn title="🗑️ Removed" tone="bg-sand text-soot" items={designSimplifier.removedElements} />
        </div>

        <div className="rounded-lg bg-sand/60 border border-bdr px-3 py-2.5 space-y-1.5">
          <p className="text-sm text-soot leading-relaxed">
            <span className="font-medium text-ink">Fidelity loss:</span> {designSimplifier.fidelityLossSummary}
          </p>
          <p className="text-sm text-soot leading-relaxed">
            <span className="font-medium text-ink">Why:</span> {designSimplifier.rationale}
          </p>
        </div>
      </Card>

      {/* -------------------- minimum viable dupe -------------------- */}
      <Card
        title="⚡ Minimum viable dupe"
        subtitle="The fastest, cheapest build that still reads as the same piece."
        className="border-2 border-ember-300"
      >
        <p className="text-sm text-soot leading-relaxed">{minimumViableDupe.summary}</p>

        <div className="grid gap-4 sm:grid-cols-3 mt-4">
          <ChipColumn
            title="Must preserve"
            tone="bg-ember-100 text-ember-800"
            items={minimumViableDupe.mustPreserveElements}
          />
          <ChipColumn
            title="Can simplify"
            tone="bg-amber-100 text-amber-800"
            items={minimumViableDupe.canSimplifyElements}
          />
          <ChipColumn title="Can remove" tone="bg-sand text-soot" items={minimumViableDupe.canRemoveElements} />
        </div>

        <p className="text-sm text-soot mt-4 leading-relaxed">
          <span className="font-medium text-ink">Construction approach:</span> {minimumViableDupe.constructionApproach}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="chip bg-ember-100 text-ember-800">
            💰 {moneyRange(minimumViableDupe.estimatedCostLow, minimumViableDupe.estimatedCostHigh)}
          </span>
          <span className="chip bg-sand text-soot">⏱️ {minimumViableDupe.estimatedTime}</span>
        </div>

        <p className="text-xs text-muted mt-3 leading-relaxed">
          <span className="font-medium">Tradeoff:</span> {minimumViableDupe.fidelityTradeoff}
        </p>
      </Card>

      {/* -------------------- alternative versions -------------------- */}
      <div>
        <h3 className="section-title mb-3">🔀 Alternative versions</h3>
        <div className="grid gap-5 md:grid-cols-2">
          {alternatives.map((alt) => (
            <Card key={alt.id} className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-ink">{alt.name}</h4>
                <Badge tone={focusTone(alt.focus)}>{titleCase(alt.focus)}</Badge>
              </div>
              <p className="text-sm text-soot leading-relaxed">{alt.description}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="chip bg-sand text-soot">
                  💰 {moneyRange(alt.estimatedCostLow, alt.estimatedCostHigh)}
                </span>
                <span className="chip bg-sand text-soot">⏱️ {alt.estimatedTime}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                <div>
                  <h5 className="text-xs font-semibold text-pine-700 mb-1">Pros</h5>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
                    {alt.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-ember-700 mb-1">Cons</h5>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
                    {alt.cons.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {alt.keyChanges.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-xs font-semibold text-soot mb-1.5">Key changes</h5>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
                    {alt.keyChanges.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
