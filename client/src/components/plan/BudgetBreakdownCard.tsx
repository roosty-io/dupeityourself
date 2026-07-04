import type { BudgetBreakdown } from "@shared/types";
import { money, moneyRange } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";

export function BudgetBreakdownCard({ budget }: { budget: BudgetBreakdown }) {
  return (
    <Card title="💰 Budget Breakdown" subtitle="Line-by-line estimate — real store prices vary by region and season.">
      <div className="space-y-5">
        {budget.lines.map((line, i) => (
          <div key={`${line.category}-${i}`}>
            <h4 className="text-sm font-semibold text-ink mb-1.5">{line.category}</h4>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="text-right">Est. cost</th>
                  </tr>
                </thead>
                <tbody>
                  {line.items.map((item, j) => (
                    <tr key={`${item.name}-${j}`}>
                      <td>
                        {item.name}
                        {item.optional && <span className="chip bg-sand text-soot ml-2">Optional</span>}
                      </td>
                      <td className="text-right whitespace-nowrap">{moneyRange(item.costLow, item.costHigh)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="font-semibold text-soot border-b-0">Subtotal</td>
                    <td className="text-right font-semibold text-soot whitespace-nowrap border-b-0">
                      {moneyRange(line.subtotalLow, line.subtotalHigh)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="rounded-xl bg-parchment border border-bdr p-4 space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-soot">Materials & hardware</span>
            <span className="font-medium text-ink whitespace-nowrap">
              {moneyRange(budget.materialsTotalLow, budget.materialsTotalHigh)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-soot">Optional tools</span>
            <span className="font-medium text-ink whitespace-nowrap">
              {moneyRange(budget.optionalToolsLow, budget.optionalToolsHigh)}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-bdr pt-2 mt-2">
            <span className="font-semibold text-ink">Grand total</span>
            <span className="font-bold text-pine-700 text-base whitespace-nowrap">
              {moneyRange(budget.grandTotalLow, budget.grandTotalHigh)}
            </span>
          </div>
          {budget.referencePrice != null && (
            <div className="flex justify-between gap-4">
              <span className="text-soot">Reference piece</span>
              <span className="font-medium text-faint line-through whitespace-nowrap">
                {money(budget.referencePrice)}
              </span>
            </div>
          )}
          {budget.estimatedSavingsLow != null && budget.estimatedSavingsHigh != null && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-pine-700">Estimated savings</span>
              <span className="font-bold text-pine-700 whitespace-nowrap">
                {moneyRange(budget.estimatedSavingsLow, budget.estimatedSavingsHigh)}
              </span>
            </div>
          )}
        </div>

        <ScoreBar score={budget.confidence} label="Cost estimate confidence" />

        {budget.notes.length > 0 && (
          <ul className="space-y-1.5">
            {budget.notes.map((note, i) => (
              <li key={i} className="text-xs text-muted flex gap-2">
                <span className="shrink-0" aria-hidden>
                  💬
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
