import type { ConfidenceBreakdown } from "@shared/types";
import { planQualityLabel } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";

type ConfidenceKey = Exclude<keyof ConfidenceBreakdown, "overall" | "uncertaintyNotes" | "howToImproveConfidence">;

const CONFIDENCE_AREAS: { key: ConfidenceKey; label: string }[] = [
  { key: "referenceImage", label: "Reference image reading" },
  { key: "materials", label: "Material identification" },
  { key: "dimensions", label: "Dimensions" },
  { key: "finish", label: "Finish match" },
  { key: "construction", label: "Construction method" },
  { key: "cost", label: "Cost estimate" },
  { key: "safety", label: "Safety assessment" },
  { key: "visualMatch", label: "Visual match" },
];

export function ConfidenceBreakdownCard({ confidence }: { confidence: ConfidenceBreakdown }) {
  return (
    <Card
      title="🔍 Confidence Breakdown"
      subtitle={`Overall confidence: ${confidence.overall}/100 — ${planQualityLabel(confidence.overall)}`}
    >
      <ScoreBar score={confidence.overall} label="Overall plan confidence" className="mb-4" />

      <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {CONFIDENCE_AREAS.map((a) => (
          <ScoreBar key={a.key} score={confidence[a.key]} label={a.label} />
        ))}
      </div>

      {confidence.uncertaintyNotes.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-soot mb-2">⚠️ Where we're less certain</h4>
          <ul className="space-y-1.5">
            {confidence.uncertaintyNotes.map((note, i) => (
              <li key={i} className="text-sm text-soot flex gap-2">
                <span className="text-amber-600 shrink-0" aria-hidden>
                  •
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {confidence.howToImproveConfidence.length > 0 && (
        <div className="mt-4 rounded-xl bg-pine-50 border border-pine-100 px-4 py-3">
          <h4 className="text-sm font-semibold text-pine-800 mb-1.5">📏 How to tighten these numbers</h4>
          <ul className="space-y-1">
            {confidence.howToImproveConfidence.map((tip, i) => (
              <li key={i} className="text-sm text-pine-800 flex gap-2">
                <span className="shrink-0" aria-hidden>
                  ✅
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
