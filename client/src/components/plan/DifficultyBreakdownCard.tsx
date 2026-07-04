import type { DifficultyBreakdown, SkillLevel } from "@shared/types";
import { titleCase } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const LEVEL_TONE: Record<SkillLevel, BadgeTone> = {
  beginner: "green",
  intermediate: "yellow",
  advanced: "orange",
  professional: "red",
};

type DimensionKey = Exclude<keyof DifficultyBreakdown, "overall" | "notes">;

const DIMENSIONS: { key: DimensionKey; icon: string; label: string }[] = [
  { key: "cuttingAccuracy", icon: "📏", label: "Cutting accuracy" },
  { key: "assembly", icon: "🔨", label: "Assembly" },
  { key: "joinery", icon: "🪵", label: "Joinery" },
  { key: "finishMatching", icon: "🎨", label: "Finish matching" },
  { key: "toolComplexity", icon: "🛠️", label: "Tool complexity" },
  { key: "physicalHandling", icon: "💪", label: "Physical handling" },
  { key: "safetyRisk", icon: "⚠️", label: "Safety risk" },
  { key: "timeCommitment", icon: "⏱️", label: "Time commitment" },
  { key: "repairability", icon: "🔧", label: "Repairability" },
  { key: "beginnerTolerance", icon: "🙂", label: "Beginner tolerance" },
];

export function DifficultyBreakdownCard({ difficulty }: { difficulty: DifficultyBreakdown }) {
  const dims = DIMENSIONS.filter((d) => difficulty[d.key]);

  return (
    <Card
      title="🎚️ Difficulty Breakdown"
      subtitle="Where the challenge actually is on this build"
      actions={<Badge tone={LEVEL_TONE[difficulty.overall]}>Overall: {titleCase(difficulty.overall)}</Badge>}
    >
      {dims.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {dims.map((d) => (
            <div key={d.key} className="rounded-xl bg-parchment border border-bdr px-4 py-3">
              <div className="text-xs font-semibold text-soot flex items-center gap-1.5">
                <span aria-hidden>{d.icon}</span> {d.label}
              </div>
              <p className="text-sm text-soot mt-1">{difficulty[d.key]}</p>
            </div>
          ))}
        </div>
      )}

      {difficulty.notes.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {difficulty.notes.map((note, i) => (
            <li key={i} className="text-sm text-soot flex gap-2">
              <span className="text-faint shrink-0" aria-hidden>
                •
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
