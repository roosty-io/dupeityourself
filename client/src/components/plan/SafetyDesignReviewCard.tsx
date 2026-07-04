import type { SafetyDesignReview } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Badge, riskTone } from "@/components/ui/Badge";
import { titleCase } from "@/lib/format";

function NoteBlock({ icon, title, notes }: { icon: string; title: string; notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <div className="rounded-xl border border-bdr bg-parchment p-4">
      <h4 className="text-sm font-semibold text-ink mb-2">
        <span aria-hidden>{icon}</span> {title}
      </h4>
      <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
        {notes.map((n, i) => (
          <li key={i} className="leading-relaxed">
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SafetyDesignReviewCard({ review }: { review: SafetyDesignReview }) {
  return (
    <Card
      title="⚠️ Safety design review"
      subtitle="An honest look at the risks in this build — read this before you start."
      actions={<Badge tone={riskTone(review.overallRisk)}>{titleCase(review.overallRisk)} risk</Badge>}
    >
      <p className="text-sm text-soot leading-relaxed">{review.summary}</p>

      {review.professionalReviewRecommended && (
        <div className="mt-4 rounded-xl bg-amber-50 border-2 border-amber-300 p-4">
          <p className="text-sm font-semibold text-amber-900">
            🛑 Professional review recommended before building
          </p>
          {review.professionalReviewReason && (
            <p className="text-sm text-amber-900 mt-1.5 leading-relaxed">{review.professionalReviewReason}</p>
          )}
          <p className="text-xs text-amber-800 mt-2">
            This plan is guidance, not an engineering sign-off. Have a qualified professional check structural or
            load-bearing details before anyone relies on them.
          </p>
        </div>
      )}

      {review.hazards.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-ink mb-2">Hazards & mitigations</h4>
          <ul className="space-y-2.5">
            {review.hazards.map((h, i) => (
              <li key={i} className="rounded-lg border border-bdr bg-surface px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={riskTone(h.level)}>{titleCase(h.level)}</Badge>
                  <span className="text-xs text-muted">{h.category}</span>
                </div>
                <p className="text-sm text-ink font-medium mt-1.5">{h.issue}</p>
                <p className="text-sm text-soot mt-1">
                  <span className="font-medium text-pine-700">Mitigation:</span> {h.mitigation}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {review.ppe.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-ink mb-2">🥽 Wear this — every session</h4>
          <div className="flex flex-wrap gap-1.5">
            {review.ppe.map((p) => (
              <span key={p} className="chip bg-pine-100 text-pine-800">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3 mt-5">
        <NoteBlock icon="🧒" title="Kids & pets" notes={review.childPetNotes} />
        <NoteBlock icon="🏗️" title="Structural" notes={review.structuralNotes} />
        <NoteBlock icon="🎨" title="Finish toxicity" notes={review.finishToxicityNotes} />
      </div>
    </Card>
  );
}
