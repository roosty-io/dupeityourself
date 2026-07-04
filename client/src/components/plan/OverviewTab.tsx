import type { BuildPlan } from "@shared/types";
import { moneyRange, titleCase } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { WorthItScoreCard } from "./WorthItScoreCard";
import { SavingsStoryCard } from "./SavingsStoryCard";
import { ConfidenceBreakdownCard } from "./ConfidenceBreakdownCard";
import { BuildReadinessCard } from "./BuildReadinessCard";
import { DifficultyBreakdownCard } from "./DifficultyBreakdownCard";

const DIMENSION_SOURCE_META: Record<string, { label: string; tone: BadgeTone }> = {
  user: { label: "You provided", tone: "green" },
  product_page: { label: "Product page", tone: "oak" },
  estimated: { label: "Estimated", tone: "yellow" },
  standard: { label: "Standard size", tone: "gray" },
};

function ReferenceAnalysisCard({ plan }: { plan: BuildPlan }) {
  const d = plan.referenceAnalysisDetails;
  const facts: { icon: string; label: string; value: string }[] = [
    { icon: "📐", label: "Shape & form", value: d.shapeForm },
    { icon: "📏", label: "Approx. dimensions", value: d.approxDimensions },
    { icon: "🪵", label: "Materials", value: d.materials },
    { icon: "🎨", label: "Finish & color", value: d.finishColor },
    { icon: "🔨", label: "Construction style", value: d.constructionStyle },
    { icon: "✨", label: "Decorative details", value: d.decorativeDetails },
  ];

  return (
    <Card title="🔎 Reference Analysis" subtitle="What we read from your inspiration piece — and what we couldn't.">
      <p className="text-sm text-soot leading-relaxed">{plan.referenceAnalysis}</p>

      <div className="grid gap-3 sm:grid-cols-2 mt-4">
        {facts
          .filter((f) => f.value)
          .map((f) => (
            <div key={f.label} className="rounded-xl bg-parchment border border-bdr px-4 py-3">
              <div className="text-xs font-semibold text-soot flex items-center gap-1.5">
                <span aria-hidden>{f.icon}</span> {f.label}
              </div>
              <p className="text-sm text-soot mt-1">{f.value}</p>
            </div>
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div className="rounded-xl border border-pine-100 bg-pine-50 px-4 py-3">
          <h4 className="text-sm font-semibold text-pine-800 mb-1.5">✅ Clearly visible</h4>
          <ul className="space-y-1">
            {d.visible.map((item, i) => (
              <li key={i} className="text-sm text-pine-800 flex gap-2">
                <span className="shrink-0" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <h4 className="text-sm font-semibold text-amber-800 mb-1.5">⚠️ Uncertain — we made a judgment call</h4>
          <ul className="space-y-1">
            {d.uncertain.map((item, i) => (
              <li key={i} className="text-sm text-amber-800 flex gap-2">
                <span className="shrink-0" aria-hidden>
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {plan.dimensions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-ink mb-2">📏 Working dimensions</h4>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>Value</th>
                  <th>Source</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {plan.dimensions.map((dim, i) => {
                  const meta = DIMENSION_SOURCE_META[dim.source] ?? {
                    label: titleCase(dim.source),
                    tone: "gray" as BadgeTone,
                  };
                  return (
                    <tr key={`${dim.label}-${i}`}>
                      <td className="font-medium text-ink">{dim.label}</td>
                      <td className="whitespace-nowrap font-mono text-xs">{dim.value}</td>
                      <td>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap">
                        {dim.confidence != null ? `${dim.confidence}/100` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}

function AssumptionsCard({ assumptions }: { assumptions: string[] }) {
  if (assumptions.length === 0) return null;
  return (
    <Card
      title="⚠️ Assumptions to Confirm"
      subtitle="The plan works if these hold. Double-check them before buying materials."
      className="border-amber-200"
    >
      <ol className="space-y-2.5">
        {assumptions.map((assumption, i) => (
          <li key={i} className="flex gap-3 text-sm text-soot">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold grid place-items-center shrink-0">
              {i + 1}
            </span>
            <span className="pt-0.5">{assumption}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function OverviewTab({ plan }: { plan: BuildPlan }) {
  const snap = plan.snapshot;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <StatTile icon="💰" label="Est. cost" value={moneyRange(snap.estimatedCostLow, snap.estimatedCostHigh)} />
        <StatTile icon="⏱️" label="Est. time" value={snap.estimatedTime} />
        <StatTile icon="🔨" label="Difficulty" value={snap.difficulty} />
        <StatTile icon="🎯" label="Visual match" value={`${snap.visualMatchScore}/100`} />
        <StatTile icon="💪" label="Durability" value={`${snap.durabilityScore}/100`} />
        <StatTile icon="⚠️" label="Safety risk" value={snap.safetyRiskLabel} />
      </div>

      <WorthItScoreCard score={plan.worthItScore} />
      <SavingsStoryCard story={plan.savingsStory} />
      <ReferenceAnalysisCard plan={plan} />
      <ConfidenceBreakdownCard confidence={plan.confidenceBreakdown} />
      <AssumptionsCard assumptions={plan.assumptions} />
      <DifficultyBreakdownCard difficulty={plan.difficultyBreakdown} />
      <BuildReadinessCard readiness={plan.buildReadiness} />
    </div>
  );
}
