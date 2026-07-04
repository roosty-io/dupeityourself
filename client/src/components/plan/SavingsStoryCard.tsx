import type { SavingsStory } from "@shared/types";
import { money, moneyRange, pct } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function SavingsStoryCard({ story }: { story: SavingsStory }) {
  const diyRange = moneyRange(story.estimatedDiyCostLow, story.estimatedDiyCostHigh);

  return (
    <Card title="💰 The Savings Story" subtitle={story.referenceLabel ? `vs. ${story.referenceLabel}` : undefined}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {story.referencePrice != null && (
          <>
            <span className="text-2xl sm:text-3xl font-semibold text-faint line-through decoration-ember-500/70 decoration-2">
              {money(story.referencePrice)}
            </span>
            <span className="text-2xl text-muted" aria-hidden>
              →
            </span>
          </>
        )}
        <span className="text-2xl sm:text-3xl font-bold text-pine-700">{diyRange}</span>
        {story.savingsPercentage != null && story.savingsPercentage > 0 && (
          <Badge tone="green" className="text-sm">
            Save ~{pct(story.savingsPercentage)}
          </Badge>
        )}
      </div>

      {story.estimatedSavings != null && story.estimatedSavings > 0 && (
        <p className="text-sm text-pine-700 font-medium mt-2">
          That's roughly {money(story.estimatedSavings)} kept in your pocket.
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-parchment border border-bdr px-4 py-3">
          <div className="text-xs font-semibold text-soot flex items-center gap-1.5">
            <span aria-hidden>🛠️</span> Tool costs
          </div>
          <p className="text-sm text-soot mt-1">
            {story.toolCostsIncluded
              ? "Estimate includes any tools you'd need to buy."
              : "Estimate covers materials only — tools you'd buy or rent are extra."}
          </p>
        </div>
        <div className="rounded-xl bg-parchment border border-bdr px-4 py-3">
          <div className="text-xs font-semibold text-soot flex items-center gap-1.5">
            <span aria-hidden>⏱️</span> Your time tradeoff
          </div>
          <p className="text-sm text-soot mt-1">{story.laborTimeTradeoff}</p>
        </div>
      </div>

      <p className="text-sm text-soot leading-relaxed mt-4">{story.explanation}</p>
    </Card>
  );
}
