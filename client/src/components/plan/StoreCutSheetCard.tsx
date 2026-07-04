import type { StoreCutSheet } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function StoreCutSheetCard({ sheet }: { sheet: StoreCutSheet }) {
  return (
    <Card
      title={`🛒 Store Cut Sheet — ${sheet.storeName}`}
      subtitle="Hand this to the store associate at the panel saw."
      actions={<Badge tone="oak">🖨️ Print-friendly</Badge>}
    >
      <div className="rounded-xl border-2 border-dashed border-oak-300 bg-parchment p-4 sm:p-5 space-y-5">
        <p className="text-sm text-soot leading-relaxed">{sheet.intro}</p>

        {sheet.requests.map((request, i) => (
          <div key={`${request.material}-${i}`} className="bg-surface border border-bdr rounded-xl p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2.5">
              <h4 className="font-semibold text-ink">
                {i + 1}. {request.material}
              </h4>
              <span className="text-sm text-soot">
                <span className="font-semibold">Buy:</span> {request.buySize}
              </span>
            </div>
            <ol className="space-y-2">
              {request.requestedCuts.map((cut, j) => (
                <li key={`${cut.label}-${j}`} className="text-sm text-soot flex flex-wrap items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-pine-100 text-pine-800 text-xs font-bold grid place-items-center shrink-0">
                    {j + 1}
                  </span>
                  <span className="font-medium text-ink">{cut.label}:</span>
                  <span className="font-mono text-xs">{cut.cutTo}</span>
                  {cut.oversizedBy && (
                    <span className="chip bg-amber-100 text-amber-800">📏 oversized by {cut.oversizedBy}</span>
                  )}
                  {cut.finalTrimAtHome && (
                    <span className="chip bg-pine-100 text-pine-800">🏠 final trim at home</span>
                  )}
                  {cut.notes && <span className="text-xs text-muted w-full pl-8">{cut.notes}</span>}
                </li>
              ))}
            </ol>
          </div>
        ))}

        {sheet.warnings.length > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <h4 className="text-sm font-semibold text-amber-800 mb-1.5">⚠️ Before you leave the store</h4>
            <ul className="space-y-1">
              {sheet.warnings.map((warning, i) => (
                <li key={i} className="text-sm text-amber-800 flex gap-2">
                  <span className="shrink-0" aria-hidden>
                    •
                  </span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sheet.homeTrimNotes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-1.5">🏠 Finishing the cuts at home</h4>
            <ul className="space-y-1">
              {sheet.homeTrimNotes.map((note, i) => (
                <li key={i} className="text-sm text-soot flex gap-2">
                  <span className="text-faint shrink-0" aria-hidden>
                    •
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
