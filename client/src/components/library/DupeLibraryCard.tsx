import { Link } from "react-router-dom";
import type { DupeLibraryEntry } from "@shared/types";
import { Badge } from "@/components/ui/Badge";
import type { BadgeTone } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreBar";
import { titleCase } from "@/lib/format";

function worthItTone(score: number): BadgeTone {
  if (score >= 70) return "green";
  if (score >= 50) return "yellow";
  return "orange";
}

export function DupeLibraryCard({ entry }: { entry: DupeLibraryEntry }) {
  return (
    <Link
      to={`/library/${entry.slug}`}
      className="card p-5 flex flex-col gap-4 h-full hover:shadow-lift transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-pine-400"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-16 h-16 rounded-xl bg-parchment border border-bdr grid place-items-center text-4xl shrink-0" aria-hidden>
          {entry.heroEmoji}
        </div>
        <ScoreRing score={entry.worthItScore} size={56} label="Worth-it" />
      </div>

      <div className="min-w-0">
        <h3 className="font-semibold text-ink leading-snug">{entry.title}</h3>
        <p className="text-sm text-muted mt-1 line-clamp-2">{entry.styleTagline}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-sand/60 rounded-lg px-2 py-2">
          <div className="text-[11px] text-muted">Retail</div>
          <div className="text-sm font-semibold text-soot line-through decoration-danger/60">
            {entry.referencePriceLabel}
          </div>
        </div>
        <div className="bg-pine-50 rounded-lg px-2 py-2">
          <div className="text-[11px] text-muted">DIY cost</div>
          <div className="text-sm font-semibold text-pine-700">{entry.diyCostLabel}</div>
        </div>
        <div className="bg-ember-50 rounded-lg px-2 py-2">
          <div className="text-[11px] text-muted">You save</div>
          <div className="text-sm font-semibold text-ember-700">{entry.savingsLabel}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge tone={worthItTone(entry.worthItScore)}>💰 {entry.worthItScore}/100</Badge>
        <Badge tone="oak">🛠️ {entry.difficulty}</Badge>
        <Badge tone="gray">⏱️ {entry.time}</Badge>
        <Badge tone="gray">{titleCase(entry.category)}</Badge>
      </div>

      {entry.highlights.length > 0 && (
        <ul className="space-y-1 mt-auto">
          {entry.highlights.slice(0, 3).map((h) => (
            <li key={h} className="text-xs text-soot flex items-start gap-1.5">
              <span aria-hidden>✅</span>
              <span className="min-w-0">{h}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
