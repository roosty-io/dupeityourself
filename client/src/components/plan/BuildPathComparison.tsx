import type { BuildPath, BuildPathType } from "@shared/types";
import { moneyRange } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/ui/ScoreBar";

function PathCard({
  path,
  selected,
  onSelect,
}: {
  path: BuildPath;
  selected: boolean;
  onSelect?: (p: BuildPathType) => void;
}) {
  return (
    <div
      className={`card p-5 flex flex-col gap-3 transition-shadow ${
        selected ? "ring-2 ring-pine-500" : path.recommended ? "border-pine-200" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-ink leading-snug">{path.label}</h4>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {path.recommended && <Badge tone="green">⭐ Recommended</Badge>}
          {selected && <Badge tone="oak">✅ Selected</Badge>}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold text-pine-700">
          💰 {moneyRange(path.estimatedCostLow, path.estimatedCostHigh)}
        </span>
        <span className="text-soot">⏱️ {path.estimatedTime}</span>
        <span className="text-soot">🔨 {path.difficulty}</span>
      </div>

      <div className="space-y-2">
        <ScoreBar score={path.visualMatchScore} label="Visual match" />
        <ScoreBar score={path.durabilityScore} label="Durability" />
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm">
        <ul className="space-y-1">
          {path.pros.map((pro, i) => (
            <li key={i} className="flex gap-1.5 text-soot">
              <span className="text-pine-600 font-semibold shrink-0" aria-hidden>
                ✓
              </span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {path.cons.map((con, i) => (
            <li key={i} className="flex gap-1.5 text-muted">
              <span className="text-ember-600 font-semibold shrink-0" aria-hidden>
                ✗
              </span>
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-muted space-y-1.5 mt-auto">
        <p>
          <span className="font-semibold text-soot">Best for:</span> {path.bestFor}
        </p>
        {path.compromises.length > 0 && (
          <p>
            <span className="font-semibold text-soot">Compromises:</span> {path.compromises.join("; ")}
          </p>
        )}
        {path.recommendationReason && (
          <p className="text-pine-700">
            <span className="font-semibold">Why we like it:</span> {path.recommendationReason}
          </p>
        )}
      </div>

      {onSelect && (
        <button
          type="button"
          className={`${selected ? "btn-secondary" : "btn-primary"} btn-sm w-full mt-1`}
          onClick={() => onSelect(path.name)}
          disabled={selected}
        >
          {selected ? "Current path" : "Select this path"}
        </button>
      )}
    </div>
  );
}

export function BuildPathComparison({
  paths,
  selected,
  onSelect,
  recommendedReason,
}: {
  paths: BuildPath[];
  selected?: BuildPathType;
  onSelect?: (p: BuildPathType) => void;
  recommendedReason?: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="section-title">🛤️ Build Paths</h3>
        <p className="text-sm text-muted mt-1">
          Same inspiration, different tradeoffs — pick the version that fits your budget, tools, and patience.
        </p>
        {recommendedReason && (
          <div className="mt-3 rounded-xl bg-pine-50 border border-pine-100 px-4 py-3">
            <p className="text-sm text-pine-800">
              <span className="font-semibold">⭐ Why we recommend one path:</span> {recommendedReason}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paths.map((path) => (
          <PathCard key={path.id} path={path} selected={selected === path.name} onSelect={onSelect} />
        ))}
      </div>

      <Card title="Side-by-side comparison" subtitle="All paths at a glance">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Path</th>
                <th>Cost</th>
                <th>Time</th>
                <th>Difficulty</th>
                <th>Visual match</th>
                <th>Durability</th>
                <th>Key tools</th>
                <th>Best for</th>
              </tr>
            </thead>
            <tbody>
              {paths.map((path) => (
                <tr key={path.id} className={selected === path.name ? "bg-pine-50/60" : undefined}>
                  <td className="font-medium text-ink whitespace-nowrap">
                    {path.label}
                    {path.recommended && (
                      <span className="ml-1.5" aria-label="Recommended">
                        ⭐
                      </span>
                    )}
                    {selected === path.name && (
                      <span className="ml-1.5" aria-label="Selected">
                        ✅
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap font-medium text-pine-700">
                    {moneyRange(path.estimatedCostLow, path.estimatedCostHigh)}
                  </td>
                  <td className="whitespace-nowrap">{path.estimatedTime}</td>
                  <td className="whitespace-nowrap">{path.difficulty}</td>
                  <td>{path.visualMatchScore}/100</td>
                  <td>{path.durabilityScore}/100</td>
                  <td className="min-w-[10rem] text-muted">{path.requiredTools.join(", ")}</td>
                  <td className="min-w-[12rem] text-muted">{path.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
