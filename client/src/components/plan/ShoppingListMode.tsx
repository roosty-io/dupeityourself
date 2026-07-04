import type { ShoppingListDepartment } from "@shared/types";
import { moneyRange } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckItem } from "@/components/ui/Checklist";

export function ShoppingListMode({
  departments,
  checkedItems,
  onToggle,
}: {
  departments: ShoppingListDepartment[];
  checkedItems: string[];
  onToggle: (key: string) => void;
}) {
  const checked = new Set(checkedItems);
  const allItems = departments.flatMap((d) => d.items.map((item) => `${d.department}::${item.name}`));
  const gathered = allItems.filter((key) => checked.has(key)).length;
  const progressPct = allItems.length > 0 ? Math.round((gathered / allItems.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="section-title">🛒 Shopping List</h3>
            <p className="text-sm text-muted mt-0.5">
              Organized by store department — check items off as you load the cart.
            </p>
          </div>
          <div className="text-sm font-semibold text-soot whitespace-nowrap">
            {gathered} of {allItems.length} gathered
          </div>
        </div>
        <div
          className="h-2.5 rounded-full bg-sand overflow-hidden mt-3"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Shopping progress"
        >
          <div
            className="h-full rounded-full bg-pine-600 transition-all duration-300"
            style={{ width: `${Math.max(2, progressPct)}%` }}
          />
        </div>
      </Card>

      {departments.map((dept, i) => {
        const subtotalLow = dept.items.reduce((sum, item) => sum + item.estimatedCostLow, 0);
        const subtotalHigh = dept.items.reduce((sum, item) => sum + item.estimatedCostHigh, 0);
        const deptGathered = dept.items.filter((item) => checked.has(`${dept.department}::${item.name}`)).length;
        return (
          <Card
            key={`${dept.department}-${i}`}
            title={
              <span>
                📦 {dept.department}
                {dept.store && <span className="text-sm font-normal text-muted ml-2">@ {dept.store}</span>}
              </span>
            }
            subtitle={`${deptGathered}/${dept.items.length} gathered · est. ${moneyRange(subtotalLow, subtotalHigh)}`}
          >
            <div className="divide-y divide-bdr/60">
              {dept.items.map((item) => {
                const key = `${dept.department}::${item.name}`;
                return (
                  <CheckItem
                    key={key}
                    checked={checked.has(key)}
                    onToggle={() => onToggle(key)}
                    sub={
                      <>
                        {item.quantity} · {item.spec} · {moneyRange(item.estimatedCostLow, item.estimatedCostHigh)}
                        {item.notes ? ` — ${item.notes}` : ""}
                      </>
                    }
                  >
                    <span className="inline-flex items-center gap-2 flex-wrap">
                      {item.name}
                      {item.required ? (
                        <Badge tone="green">Required</Badge>
                      ) : (
                        <Badge tone="gray">Optional</Badge>
                      )}
                    </span>
                  </CheckItem>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
