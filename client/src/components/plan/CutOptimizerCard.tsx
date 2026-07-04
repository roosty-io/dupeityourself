import type { CutListItem, CutOptimizationPlan } from "@shared/types";
import { pct } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

function wasteTone(wastePct: number): BadgeTone {
  if (wastePct <= 10) return "green";
  if (wastePct <= 20) return "yellow";
  return "orange";
}

export function CutOptimizerCard({ cutList, plans }: { cutList: CutListItem[]; plans: CutOptimizationPlan[] }) {
  return (
    <div className="space-y-4">
      <Card
        title="📏 Cut List"
        subtitle="Every part, sized and counted. Measure twice — the lumber doesn't grow back."
      >
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Part</th>
                <th>Qty</th>
                <th>Material</th>
                <th>Dimensions</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {cutList.map((item, i) => (
                <tr key={`${item.partName}-${i}`}>
                  <td className="font-medium text-ink min-w-[9rem]">{item.partName}</td>
                  <td className="whitespace-nowrap">×{item.quantity}</td>
                  <td className="min-w-[8rem]">{item.material}</td>
                  <td className="whitespace-nowrap font-mono text-xs text-soot">{item.dimensions}</td>
                  <td className="min-w-[10rem] text-muted">{item.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {plans.length > 0 && (
        <Card
          title="🪵 Cut Optimization"
          subtitle="How to lay out cuts on each board or sheet to minimize waste."
        >
          <div className="space-y-5">
            {plans.map((plan, i) => (
              <div key={`${plan.material}-${i}`} className="rounded-xl border border-bdr bg-parchment p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="font-semibold text-ink">{plan.material}</h4>
                    <p className="text-xs text-muted mt-0.5">Buy: {plan.sourceSize}</p>
                  </div>
                  <Badge tone={wasteTone(plan.estimatedWastePercent)}>
                    ~{pct(plan.estimatedWastePercent)} waste
                  </Badge>
                </div>

                <ul className="space-y-1.5">
                  {plan.cuts.map((cut, j) => (
                    <li key={`${cut.partName}-${j}`} className="text-sm text-soot flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">
                        ×{cut.quantity} {cut.partName}
                      </span>
                      <span className="font-mono text-xs">{cut.dimensions}</span>
                      <span
                        className={`chip ${
                          cut.precision === "finish" ? "bg-pine-100 text-pine-800" : "bg-sand text-soot"
                        }`}
                      >
                        {cut.precision === "finish" ? "🎯 finish cut" : "🪚 rough cut"}
                      </span>
                      {cut.notes && <span className="text-xs text-muted">{cut.notes}</span>}
                    </li>
                  ))}
                </ul>

                {plan.grainDirectionNotes && plan.grainDirectionNotes.length > 0 && (
                  <div className="mt-3 text-xs text-soot">
                    <span className="font-semibold">🪵 Grain direction:</span>{" "}
                    {plan.grainDirectionNotes.join(" ")}
                  </div>
                )}
                {plan.sequenceNotes.length > 0 && (
                  <div className="mt-2 text-xs text-soot">
                    <span className="font-semibold">🔢 Cut sequence:</span> {plan.sequenceNotes.join(" ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
