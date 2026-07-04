import type { BuildReadiness } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";

const STATUS_META: Record<BuildReadiness["readyStatus"], { label: string; tone: BadgeTone; icon: string }> = {
  ready: { label: "Ready to build", tone: "green", icon: "✅" },
  mostly_ready: { label: "Mostly ready", tone: "green", icon: "🛠️" },
  needs_prep: { label: "Needs prep", tone: "yellow", icon: "📦" },
  not_ready: { label: "Not ready yet", tone: "orange", icon: "⚠️" },
};

function GapSection({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl bg-parchment border border-bdr px-4 py-3">
      <h4 className="text-xs font-semibold text-soot flex items-center gap-1.5 mb-1.5">
        <span aria-hidden>{icon}</span> {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-soot flex gap-2">
            <span className="text-faint shrink-0" aria-hidden>
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BuildReadinessCard({ readiness }: { readiness: BuildReadiness }) {
  const meta = STATUS_META[readiness.readyStatus];
  const hasGaps =
    readiness.missingTools.length > 0 ||
    readiness.missingMaterials.length > 0 ||
    readiness.skillGaps.length > 0 ||
    readiness.workspaceConcerns.length > 0 ||
    readiness.budgetConcerns.length > 0 ||
    readiness.safetyConcerns.length > 0;

  return (
    <Card
      title="🧰 Build Readiness"
      subtitle="How prepared you are to start this build today"
      actions={
        <Badge tone={meta.tone}>
          {meta.icon} {meta.label}
        </Badge>
      }
    >
      <ScoreBar score={readiness.score} label="Readiness score" className="mb-4" />

      {hasGaps ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <GapSection icon="🛠️" title="Tools to line up" items={readiness.missingTools} />
          <GapSection icon="🪵" title="Materials to source" items={readiness.missingMaterials} />
          <GapSection icon="📏" title="Skills to practice first" items={readiness.skillGaps} />
          <GapSection icon="📦" title="Workspace considerations" items={readiness.workspaceConcerns} />
          <GapSection icon="💰" title="Budget considerations" items={readiness.budgetConcerns} />
          <GapSection icon="⚠️" title="Safety prep" items={readiness.safetyConcerns} />
        </div>
      ) : (
        <p className="text-sm text-pine-700 font-medium">✅ No gaps found — you have what this build needs.</p>
      )}

      <div className="mt-4 rounded-xl bg-pine-50 border border-pine-100 px-4 py-3">
        <p className="text-sm text-pine-800">
          <span className="font-semibold">Next move:</span> {readiness.recommendation}
        </p>
      </div>
    </Card>
  );
}
