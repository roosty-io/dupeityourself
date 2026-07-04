import type { FinishGuide } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";

export function FinishMatchingGuide({ guide }: { guide: FinishGuide }) {
  return (
    <Card title="🎨 Finish matching guide" subtitle="How to get the reference look — always test on scrap first.">
      <div className="space-y-6">
        <div>
          <p className="text-sm text-soot leading-relaxed">{guide.referenceFinishDescription}</p>
          <ScoreBar score={guide.confidence} label="Finish match confidence" className="mt-3 max-w-md" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-ink mb-2">Recommended finish system</h4>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-soot marker:font-semibold marker:text-pine-700">
            {guide.recommendedFinishSystem.map((s, i) => (
              <li key={i} className="leading-relaxed">
                {s}
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-parchment border border-bdr p-4">
            <h4 className="text-sm font-semibold text-ink mb-2">💰 Budget option</h4>
            <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
              {guide.budgetOption.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-oak-50 border border-oak-100 p-4">
            <h4 className="text-sm font-semibold text-ink mb-2">✨ Premium option</h4>
            <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
              {guide.premiumOption.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        {guide.stainPaintOptions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-2">Stain & paint options</h4>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.stainPaintOptions.map((o, i) => (
                    <tr key={i}>
                      <td className="font-medium text-ink whitespace-nowrap">{o.name}</td>
                      <td className="whitespace-nowrap">{o.type}</td>
                      <td className="text-soot">{o.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {guide.topcoatOptions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-2">Topcoat options</h4>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Topcoat</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.topcoatOptions.map((o, i) => (
                    <tr key={i}>
                      <td className="font-medium text-ink whitespace-nowrap">{o.name}</td>
                      <td className="text-soot">{o.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {guide.colorMatchingTips.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-2">Color matching tips</h4>
            <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
              {guide.colorMatchingTips.map((t, i) => (
                <li key={i} className="leading-relaxed">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {guide.testBoardInstructions.length > 0 && (
          <div className="rounded-xl bg-pine-50 border border-pine-100 p-4">
            <h4 className="text-sm font-semibold text-pine-800 mb-2">🧪 Make a test board first</h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-pine-900 marker:font-semibold">
              {guide.testBoardInstructions.map((s, i) => (
                <li key={i} className="leading-relaxed">
                  {s}
                </li>
              ))}
            </ol>
          </div>
        )}

        {guide.applicationSteps.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-2">Application steps</h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-sm text-soot marker:font-semibold marker:text-pine-700">
              {guide.applicationSteps.map((s, i) => (
                <li key={i} className="leading-relaxed">
                  {s}
                </li>
              ))}
            </ol>
          </div>
        )}

        {guide.commonProblems.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-ink mb-2">Common finish problems</h4>
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Fix</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.commonProblems.map((p, i) => (
                    <tr key={i}>
                      <td className="font-medium text-ink">{p.problem}</td>
                      <td className="text-soot">{p.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {guide.curingNotes.length > 0 && (
          <div className="rounded-lg bg-sand/60 border border-bdr px-3 py-2.5">
            <p className="text-xs font-semibold text-soot mb-1">⏳ Curing notes</p>
            <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
              {guide.curingNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
