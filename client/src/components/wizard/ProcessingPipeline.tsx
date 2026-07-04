import { useEffect, useRef, useState } from "react";
import { AGENT_STAGES } from "@shared/constants";
import type { AgentStageStatus, GenerationState } from "@shared/types";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

const POLL_INTERVAL_MS = 700;
const TIP_INTERVAL_MS = 4500;

const TIPS = [
  "A “2×4” actually measures 1-1/2″ × 3-1/2″ — your plan already accounts for nominal vs. actual lumber sizes.",
  "Most Home Depot and Lowe's stores will cross-cut plywood and lumber at the panel saw — often free for the first few cuts.",
  "A properly glued wood joint is usually stronger than the surrounding wood once fully cured (give it 24 hours).",
  "Pre-drilling pilot holes prevents most splitting, especially near board ends and in hardwoods.",
  "Sanding through the grits — 80, then 120, then 220 — matters more for finish quality than which stain you buy.",
  "The only reliable stain preview is a test board cut from your actual project lumber.",
  "Renting a specialty tool for a day often beats a workaround that costs you accuracy on visible parts.",
  "Kiln-dried lumber moves less with the seasons — worth asking for on tabletops and wide panels.",
  "Buy 10–15% extra lumber. One warped or knotty board shouldn't stall your whole weekend.",
  "Let boards acclimate in your workspace for a few days before final cuts — wood moves as it settles.",
];

function StageIcon({ status }: { status: AgentStageStatus["status"] }) {
  switch (status) {
    case "running":
      return <Spinner className="w-4 h-4" />;
    case "complete":
      return (
        <span className="text-sm leading-none" aria-label="Complete">
          ✅
        </span>
      );
    case "error":
      return (
        <span className="text-sm leading-none" aria-label="Error">
          ⚠️
        </span>
      );
    default:
      return (
        <span className="text-faint text-sm leading-none" aria-label="Pending">
          ○
        </span>
      );
  }
}

export function ProcessingPipeline({
  projectId,
  onComplete,
}: {
  projectId: string;
  onComplete: () => void;
}) {
  const [state, setState] = useState<GenerationState | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const tick = async () => {
      if (inFlight || completedRef.current) return;
      inFlight = true;
      try {
        const next = await api.getGenerationStatus(projectId);
        if (cancelled) return;
        setState(next);
        if (next.status === "complete" && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
      } catch {
        // transient poll failure — keep polling
      } finally {
        inFlight = false;
      }
    };

    tick();
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId]);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), TIP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const stages: AgentStageStatus[] =
    state && state.stages.length > 0
      ? state.stages
      : AGENT_STAGES.map((s) => ({ key: s.key, label: s.label, status: "pending" as const }));

  const completeCount = stages.filter((s) => s.status === "complete").length;
  const progressPct = Math.round((completeCount / Math.max(1, stages.length)) * 100);
  const hasError = state?.status === "error";
  const runningStage = stages.find((s) => s.status === "running");

  const retry = async () => {
    setRetrying(true);
    setRetryError(null);
    try {
      await api.generatePlan(projectId);
      completedRef.current = false;
      setState(null);
    } catch (err) {
      setRetryError(err instanceof Error ? err.message : "Could not restart generation.");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="card p-5 sm:p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="section-title">🔨 Building your plan</h2>
          <p className="text-sm text-muted mt-1">
            {hasError
              ? "Generation hit a problem — you can retry below."
              : runningStage
                ? runningStage.label
                : state?.status === "complete"
                  ? "Done! Opening your plan…"
                  : "Warming up the pipeline…"}
          </p>
        </div>
        <span className="text-sm font-semibold text-soot shrink-0">
          {completeCount}/{stages.length}
        </span>
      </div>

      <div
        className="h-2.5 rounded-full bg-sand overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${hasError ? "bg-ember-500" : "bg-pine-600"}`}
          style={{ width: `${Math.max(2, progressPct)}%` }}
        />
      </div>

      {hasError ? (
        <div className="rounded-xl border border-danger/30 bg-ember-50 p-4 text-center space-y-3">
          <div className="text-2xl" aria-hidden>
            ⚠️
          </div>
          <p className="text-sm text-ink font-medium">Plan generation failed</p>
          <p className="text-sm text-muted">{state?.error ?? "An unexpected error stopped the pipeline."}</p>
          {retryError && <p className="text-xs text-danger">{retryError}</p>}
          <button type="button" className="btn-primary btn-md" onClick={retry} disabled={retrying}>
            {retrying && <Spinner className="w-4 h-4 text-white" />}
            Retry generation
          </button>
        </div>
      ) : (
        <div className="rounded-xl bg-parchment border border-bdr px-4 py-3">
          <p className="text-xs text-muted">
            <span className="font-semibold text-soot">💡 Did you know?</span> {TIPS[tipIndex]}
          </p>
        </div>
      )}

      <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        {stages.map((stage) => (
          <li
            key={stage.key}
            className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
              stage.status === "running"
                ? "bg-pine-50 text-ink font-medium"
                : stage.status === "complete"
                  ? "text-soot"
                  : stage.status === "error"
                    ? "text-danger"
                    : "text-faint"
            }`}
          >
            <span className="w-5 grid place-items-center shrink-0">
              <StageIcon status={stage.status} />
            </span>
            <span className="min-w-0 truncate">{stage.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
