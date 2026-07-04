import { useState } from "react";
import type { TroubleshootingResponse } from "@shared/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { titleCase } from "@/lib/format";

const EXAMPLE_PROBLEMS = [
  "My table wobbles",
  "The stain looks blotchy",
  "My boards don't line up",
  "Pocket screws split the wood",
];

function severityTone(severity: TroubleshootingResponse["severity"]): BadgeTone {
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

type HistoryEntry = {
  problem: string;
  response: TroubleshootingResponse;
};

function DiagnosticChecks({ checks }: { checks: string[] }) {
  const [done, setDone] = useState<number[]>([]);
  const toggle = (i: number) =>
    setDone((prev) => (prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]));
  return (
    <ul className="space-y-1">
      {checks.map((check, i) => (
        <li key={i}>
          <label className="flex items-start gap-2.5 py-1 px-1.5 rounded-lg hover:bg-sand/50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={done.includes(i)}
              onChange={() => toggle(i)}
              className="mt-0.5 w-4 h-4 accent-pine-600 shrink-0"
            />
            <span className={`text-sm ${done.includes(i) ? "line-through text-faint" : "text-soot"}`}>{check}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function TroubleshootingResult({ entry }: { entry: HistoryEntry }) {
  const r = entry.response;
  const isStop = r.severity === "safety_stop";
  return (
    <div className="rounded-xl border border-bdr bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink">💬 “{entry.problem}”</p>
        <Badge tone={severityTone(r.severity)}>
          {isStop ? "🛑 Safety stop" : `${titleCase(r.severity)} issue`}
        </Badge>
      </div>

      {isStop && (
        <div className="mt-3 rounded-xl bg-red-50 border-2 border-red-300 p-4">
          <p className="text-lg font-bold text-red-800">🛑 STOP — do not keep building</p>
          {r.safetyWarning && <p className="text-sm text-red-900 mt-1.5 leading-relaxed">{r.safetyWarning}</p>}
        </div>
      )}

      <p className="text-sm text-soot mt-3 leading-relaxed">{r.problemSummary}</p>

      {r.likelyCauses.length > 0 && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-ink mb-1.5">Likely causes</h5>
          <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
            {r.likelyCauses.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {r.diagnosticChecks.length > 0 && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-ink mb-1.5">🔍 Check these first</h5>
          <DiagnosticChecks checks={r.diagnosticChecks} />
        </div>
      )}

      {r.recommendedFixes.length > 0 && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-ink mb-1.5">🛠️ Recommended fixes (in order)</h5>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm text-soot marker:font-semibold marker:text-pine-700">
            {r.recommendedFixes.map((f, i) => (
              <li key={i} className="leading-relaxed">
                {f}
              </li>
            ))}
          </ol>
        </div>
      )}

      {r.preventionTips.length > 0 && (
        <div className="mt-4 rounded-lg bg-pine-50 border border-pine-100 px-3 py-2.5">
          <p className="text-xs font-semibold text-pine-800 mb-1">✅ Next time</p>
          <ul className="list-disc pl-4 space-y-1 text-sm text-pine-900">
            {r.preventionTips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TroubleshootingPanel({ projectId }: { projectId: string }) {
  const [problem, setProblem] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const submit = async () => {
    const trimmed = problem.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await api.troubleshoot(projectId, trimmed);
      setHistory((prev) => [{ problem: trimmed, response }, ...prev]);
      setProblem("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get troubleshooting help.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card
      title="🔧 Mid-build troubleshooting"
      subtitle="Something not going to plan? Describe it and get a diagnosis specific to this project."
    >
      <textarea
        className="input min-h-[6rem] resize-y"
        placeholder="Describe the problem… (e.g. “The tabletop rocks about 1/8 inch when I press on one corner”)"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        aria-label="Describe the problem"
      />

      <div className="flex flex-wrap gap-2 mt-3">
        {EXAMPLE_PROBLEMS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setProblem(p)}
            className="chip bg-sand text-soot hover:bg-linen transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          type="button"
          className="btn-primary btn-md"
          onClick={submit}
          disabled={pending || problem.trim() === ""}
        >
          {pending && <Spinner className="w-4 h-4 text-white" />}
          {pending ? "Diagnosing…" : "Diagnose the problem"}
        </button>
        {error && (
          <span className="text-sm text-danger flex items-center gap-1.5">
            <span aria-hidden>⚠️</span> {error}
          </span>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-6 space-y-4">
          {history.map((entry, i) => (
            <TroubleshootingResult key={history.length - i} entry={entry} />
          ))}
        </div>
      )}
    </Card>
  );
}
