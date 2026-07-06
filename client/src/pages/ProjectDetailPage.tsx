import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { ProjectWithPlan } from "@shared/types";
import { api } from "@/lib/api";
import { moneyRange } from "@/lib/format";
import { PageSpinner, Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Link } from "react-router-dom";
import { ProcessingPipeline } from "@/components/wizard/ProcessingPipeline";
import { SimpleBuildPlanView } from "@/components/plan/SimpleBuildPlanView";
/* components used only by the print / full-manual view */
import { OverviewTab } from "@/components/plan/OverviewTab";
import { BuildPathComparison } from "@/components/plan/BuildPathComparison";
import { MaterialsTable } from "@/components/plan/MaterialsTable";
import { ToolsTable } from "@/components/plan/ToolsTable";
import { BudgetBreakdownCard } from "@/components/plan/BudgetBreakdownCard";
import { ShoppingListMode } from "@/components/plan/ShoppingListMode";
import { CutOptimizerCard } from "@/components/plan/CutOptimizerCard";
import { StoreCutSheetCard } from "@/components/plan/StoreCutSheetCard";
import { ProjectTimelineCard } from "@/components/plan/ProjectTimelineCard";
import { StepByStepGuide } from "@/components/plan/StepByStepGuide";
import { FinishMatchingGuide } from "@/components/plan/FinishMatchingGuide";
import { SafetyDesignReviewCard } from "@/components/plan/SafetyDesignReviewCard";
import { MistakePreventionSection } from "@/components/plan/MistakePreventionSection";

type PlanProgress = {
  checkedShoppingItems: string[];
  completedSteps: number[];
  notes: string;
};

const EMPTY_PROGRESS: PlanProgress = { checkedShoppingItems: [], completedSteps: [], notes: "" };

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProjectWithPlan | null>(null);
  const [progress, setProgress] = useState<PlanProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const persistTimer = useRef<number | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [project, planProgress] = await Promise.all([
        api.getProject(id),
        api.getPlanProgress(id).catch(() => EMPTY_PROGRESS),
      ]);
      setData(project);
      setProgress(planProgress);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
    };
  }, []);

  /* auto-open the browser print dialog shortly after entering print view */
  useEffect(() => {
    if (!printMode) return;
    const t = window.setTimeout(() => window.print(), 150);
    return () => window.clearTimeout(t);
  }, [printMode]);

  const schedulePersist = useCallback(
    (next: PlanProgress) => {
      if (!id) return;
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
      persistTimer.current = window.setTimeout(() => {
        api
          .updatePlanProgress(id, {
            checkedShoppingItems: next.checkedShoppingItems,
            completedSteps: next.completedSteps,
          })
          .catch(() => {
            /* non-fatal — progress stays in local state */
          });
      }, 600);
    },
    [id]
  );

  const toggleShoppingItem = useCallback(
    (key: string) => {
      setProgress((prev) => {
        const has = prev.checkedShoppingItems.includes(key);
        const next: PlanProgress = {
          ...prev,
          checkedShoppingItems: has
            ? prev.checkedShoppingItems.filter((k) => k !== key)
            : [...prev.checkedShoppingItems, key],
        };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  const toggleStep = useCallback(
    (stepNumber: number) => {
      setProgress((prev) => {
        const has = prev.completedSteps.includes(stepNumber);
        const next: PlanProgress = {
          ...prev,
          completedSteps: has
            ? prev.completedSteps.filter((n) => n !== stepNumber)
            : [...prev.completedSteps, stepNumber],
        };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  const startGeneration = useCallback(async () => {
    if (!id) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      await api.generatePlan(id);
      await load();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Could not start plan generation.");
    } finally {
      setGenerating(false);
    }
  }, [id, load]);

  if (!id) return <ErrorState message="No project id in the URL." />;
  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <ErrorState message="Project not found." />;

  const plan = data.plan;

  /* ------------------------- generation in flight ------------------------ */
  if (data.generation.status === "running") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">{data.title}</h1>
          <p className="text-sm text-muted mt-1">Our workshop crew of AI agents is drafting your build manual.</p>
        </div>
        <ProcessingPipeline projectId={id} onComplete={load} />
      </div>
    );
  }

  /* --------------------------- generation error -------------------------- */
  if (data.generation.status === "error" && !plan) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-ink">{data.title}</h1>
        <ErrorState
          message={data.generation.error ?? "Plan generation failed. You can regenerate it below."}
          onRetry={startGeneration}
        />
        {generateError && <p className="text-sm text-danger text-center">⚠️ {generateError}</p>}
      </div>
    );
  }

  /* ------------------------------ no plan yet ---------------------------- */
  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-ink">{data.title}</h1>
        <EmptyState
          icon="🔨"
          title="No build plan yet"
          description="Run the plan generator to turn this project's reference and constraints into a full build manual — materials, cut list, budget, steps, and more."
          action={
            <div className="flex flex-col items-center gap-3">
              <button type="button" className="btn-ember btn-lg" onClick={startGeneration} disabled={generating}>
                {generating && <Spinner className="w-4 h-4 text-white" />}
                🔨 Generate plan
              </button>
              {generateError && <p className="text-sm text-danger">⚠️ {generateError}</p>}
              <Link to={`/projects/${id}/edit`} className="btn-ghost btn-sm">
                ✏️ Edit constraints first
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const snap = plan.snapshot;
  const selectedPath = data.selectedBuildPath ?? snap.selectedBuildPath;

  /* ------------------------------ print view ----------------------------- */
  if (printMode) {
    return (
      <div className="space-y-6">
        <div className="no-print sticky top-16 z-30 card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-soot">
            🖨️ Print view — the full technical manual, stacked for paper.
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn-primary btn-sm" onClick={() => window.print()}>
              🖨️ Print now
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setPrintMode(false)}>
              Back to plan
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-ink">{plan.title}</h1>
          <p className="text-sm text-muted">
            Inspired by {snap.inspiredBy} · {moneyRange(snap.estimatedCostLow, snap.estimatedCostHigh)} ·{" "}
            {snap.estimatedTime} · {snap.difficulty}
          </p>
        </div>

        <OverviewTab plan={plan} />
        <BuildPathComparison paths={plan.buildPaths} selected={selectedPath} recommendedReason={plan.recommendedPathReason} />
        <MaterialsTable materials={plan.materials} />
        <MaterialsTable materials={plan.hardware} title="🔩 Hardware & Fasteners" />
        <ToolsTable tools={plan.tools} toolAwareNotes={plan.toolAwareNotes} />
        <BudgetBreakdownCard budget={plan.budgetBreakdown} />
        <ShoppingListMode
          departments={plan.shoppingListByDepartment}
          checkedItems={progress.checkedShoppingItems}
          onToggle={toggleShoppingItem}
        />
        <CutOptimizerCard cutList={plan.cutList} plans={plan.cutOptimizationPlans} />
        {plan.storeCutSheet && <StoreCutSheetCard sheet={plan.storeCutSheet} />}
        <ProjectTimelineCard phases={plan.projectTimeline} />
        <StepByStepGuide
          steps={plan.steps}
          completedSteps={progress.completedSteps}
          onToggleStep={toggleStep}
          miniLessons={plan.miniLessons}
        />
        <FinishMatchingGuide guide={plan.finishGuide} />
        <SafetyDesignReviewCard review={plan.safetyReview} />
        <MistakePreventionSection mistakes={plan.mistakePrevention} commonProblems={plan.commonProblems} />
      </div>
    );
  }

  /* ---------------------------- simple plan view ------------------------- */
  return (
    <div className="space-y-4">
      {data.generation.status === "error" && (
        <div className="no-print rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-amber-800">
            ⚠️ The last regeneration hit a problem — you're viewing the previous saved plan.
          </p>
          <button type="button" className="btn-secondary btn-sm" onClick={startGeneration} disabled={generating}>
            {generating && <Spinner className="w-3.5 h-3.5" />}
            Regenerate
          </button>
        </div>
      )}

      <SimpleBuildPlanView
        project={data}
        progress={progress}
        onToggleShoppingItem={toggleShoppingItem}
        onToggleStep={toggleStep}
        onReload={load}
        onPrint={() => setPrintMode(true)}
      />
    </div>
  );
}
