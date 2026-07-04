import type { WorthItScore } from "@shared/types";
import { scoreBandLabel, titleCase } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ScoreBar, ScoreRing } from "@/components/ui/ScoreBar";

function verdictTone(verdict: WorthItScore["verdict"]): BadgeTone {
  switch (verdict) {
    case "excellent":
      return "green";
    case "good":
      return "green";
    case "mixed":
      return "yellow";
    case "poor":
      return "orange";
    case "not_recommended":
      return "red";
  }
}

type SubscoreKey =
  | "savingsPotential"
  | "difficultyFit"
  | "toolAccessibility"
  | "materialAvailability"
  | "visualMatchPotential"
  | "safetyRisk"
  | "timeCommitment";

const SUBSCORES: { key: SubscoreKey; label: string; hint: string }[] = [
  { key: "savingsPotential", label: "Savings potential", hint: "How much you save vs. buying" },
  { key: "difficultyFit", label: "Difficulty fit", hint: "Match to your skill level" },
  { key: "toolAccessibility", label: "Tool accessibility", hint: "Buildable with tools you own or can get" },
  { key: "materialAvailability", label: "Material availability", hint: "Easy to source at common stores" },
  { key: "visualMatchPotential", label: "Visual match potential", hint: "How close the look can get" },
  { key: "safetyRisk", label: "Safety", hint: "Higher = safer build" },
  { key: "timeCommitment", label: "Time commitment", hint: "Higher = less of your time" },
];

export function WorthItScoreCard({ score }: { score: WorthItScore }) {
  return (
    <Card title="🏆 DIY Worth-It Score" subtitle="Should you build this yourself?">
      <div className="grid gap-6 md:grid-cols-[auto,1fr] items-start">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <ScoreRing score={score.score} size={128} />
          <Badge tone={verdictTone(score.verdict)}>{titleCase(score.verdict)}</Badge>
          <p className="text-xs text-muted text-center max-w-[10rem]">{scoreBandLabel(score.score)}</p>
        </div>

        <div className="space-y-2.5 min-w-0">
          {SUBSCORES.map((s) => (
            <ScoreBar key={s.key} score={score[s.key]} label={s.label} />
          ))}
        </div>
      </div>

      <p className="text-sm text-soot leading-relaxed mt-5">{score.explanation}</p>

      <div className="mt-4 rounded-xl bg-pine-50 border border-pine-100 px-4 py-3">
        <p className="text-sm text-pine-800">
          <span className="font-semibold">✅ Our recommendation:</span> {score.recommendation}
        </p>
      </div>
    </Card>
  );
}
