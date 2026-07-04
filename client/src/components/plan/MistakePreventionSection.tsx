import type { CommonProblem, MistakeWarning } from "@shared/types";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { titleCase } from "@/lib/format";

function severityTone(severity: CommonProblem["severity"]): BadgeTone {
  switch (severity) {
    case "minor":
      return "gray";
    case "moderate":
      return "yellow";
    case "serious":
      return "orange";
    case "safety_stop":
      return "red";
  }
}

export function MistakePreventionSection({
  mistakes,
  commonProblems,
}: {
  mistakes: MistakeWarning[];
  commonProblems: CommonProblem[];
}) {
  return (
    <Card
      title="🚫 Where people usually mess this up"
      subtitle="Read these before you cut anything — most of them are cheap to avoid and expensive to fix."
    >
      <div className="space-y-4">
        {mistakes.map((m, i) => (
          <div key={i} className="rounded-xl border border-bdr bg-parchment p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-semibold text-ink">⚠️ {m.mistake}</h4>
              {m.affectedSteps && m.affectedSteps.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.affectedSteps.map((n) => (
                    <span key={n} className="chip bg-sand text-soot">
                      Step {n}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-soot mt-2 leading-relaxed">
              <span className="font-medium text-ink">Why it happens:</span> {m.whyItHappens}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 mt-3">
              <div className="rounded-lg bg-pine-50 border border-pine-100 px-3 py-2.5">
                <p className="text-sm text-pine-900">
                  <span className="font-semibold text-pine-800">✅ How to avoid:</span> {m.howToAvoid}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold text-amber-800">🛠️ If it happens:</span> {m.howToFix}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {commonProblems.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-ink mb-2">Common problems & fixes</h4>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Likely causes</th>
                  <th>Fix</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {commonProblems.map((p, i) => (
                  <tr key={i}>
                    <td className="font-medium text-ink">{p.problem}</td>
                    <td>
                      <ul className="list-disc pl-4 space-y-0.5 text-soot">
                        {p.likelyCauses.map((c, ci) => (
                          <li key={ci}>{c}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="text-soot">{p.fix}</td>
                    <td>
                      <Badge tone={severityTone(p.severity)}>
                        {p.severity === "safety_stop" ? "🛑 Safety stop" : titleCase(p.severity)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
