import type { SavedPlanVersion } from "@shared/types";
import { BUILD_PATH_LABELS } from "@shared/constants";
import { formatDate, moneyRange } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function VersionComparisonTable({
  versions,
  currentPlanId,
}: {
  versions: SavedPlanVersion[];
  currentPlanId?: string;
}) {
  if (versions.length === 0) {
    return (
      <Card title="🗂️ Plan Versions">
        <p className="text-sm text-muted">
          No saved versions yet. Every refinement (cheaper, easier, closer match…) is saved here so you can compare
          them side by side.
        </p>
      </Card>
    );
  }

  const sorted = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <Card title="🗂️ Plan Versions" subtitle="Every refinement is saved — compare them before you buy lumber.">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Version</th>
              <th>Build path</th>
              <th>Cost</th>
              <th>Visual match</th>
              <th>Time</th>
              <th>Saved</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((version) => {
              const isCurrent = currentPlanId != null && version.plan.id === currentPlanId;
              const snap = version.plan.snapshot;
              return (
                <tr key={version.id} className={isCurrent ? "bg-pine-50/60" : undefined}>
                  <td className="min-w-[14rem]">
                    <div className="font-medium text-ink">
                      {isCurrent && (
                        <span className="mr-1.5" aria-label="Current version">
                          ⭐
                        </span>
                      )}
                      {version.versionName}
                      <span className="ml-1.5 text-xs text-faint">v{version.versionNumber}</span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">{version.changeSummary}</div>
                  </td>
                  <td className="whitespace-nowrap">
                    <Badge tone={isCurrent ? "green" : "oak"}>{BUILD_PATH_LABELS[version.buildPathType]}</Badge>
                  </td>
                  <td className="whitespace-nowrap font-medium text-pine-700">
                    {moneyRange(snap.estimatedCostLow, snap.estimatedCostHigh)}
                  </td>
                  <td className="whitespace-nowrap">{snap.visualMatchScore}/100</td>
                  <td className="whitespace-nowrap">{snap.estimatedTime}</td>
                  <td className="whitespace-nowrap text-muted">{formatDate(version.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
