import type { MaterialItem } from "@shared/types";
import { moneyRange } from "@/lib/format";
import { Card } from "@/components/ui/Card";

export function MaterialsTable({ materials, title = "🪵 Materials" }: { materials: MaterialItem[]; title?: string }) {
  if (materials.length === 0) return null;

  const totalLow = materials.reduce((sum, m) => sum + m.estimatedCostLow, 0);
  const totalHigh = materials.reduce((sum, m) => sum + m.estimatedCostHigh, 0);

  return (
    <Card title={title} subtitle={`${materials.length} items · est. ${moneyRange(totalLow, totalHigh)}`}>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Spec</th>
              <th>Purpose</th>
              <th>Est. cost</th>
              <th>Alternatives</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <tr key={`${m.name}-${i}`}>
                <td className="min-w-[11rem]">
                  <div className="font-medium text-ink">{m.name}</div>
                  {m.notes && <div className="text-xs text-muted mt-0.5">{m.notes}</div>}
                  {m.existingInventorySubstitution && (
                    <div className="mt-1.5">
                      <span className="chip bg-pine-100 text-pine-800">
                        ✅ You have this: {m.existingInventorySubstitution}
                      </span>
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap">{m.quantity}</td>
                <td className="min-w-[10rem] text-soot">{m.specification}</td>
                <td className="min-w-[10rem] text-muted">{m.purpose}</td>
                <td className="whitespace-nowrap font-medium text-pine-700">
                  {moneyRange(m.estimatedCostLow, m.estimatedCostHigh)}
                </td>
                <td className="min-w-[12rem]">
                  {m.budgetAlternative || m.premiumAlternative ? (
                    <div className="space-y-1 text-xs">
                      {m.budgetAlternative && (
                        <div className="text-soot">
                          <span className="font-semibold text-pine-700">💰 Budget:</span> {m.budgetAlternative}
                        </div>
                      )}
                      {m.premiumAlternative && (
                        <div className="text-soot">
                          <span className="font-semibold text-oak-600">✨ Premium:</span> {m.premiumAlternative}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
