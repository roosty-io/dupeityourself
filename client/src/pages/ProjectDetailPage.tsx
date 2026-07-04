import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { BuildPathType, ProjectWithPlan, RefineRequest } from "@shared/types";
import { api } from "@/lib/api";
import { moneyRange, titleCase } from "@/lib/format";
import { PageSpinner, Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge, riskTone } from "@/components/ui/Badge";
import { ScoreBar, ScoreRing } from "@/components/ui/ScoreBar";
import { TabBar, TabPanel, type TabDef } from "@/components/ui/Tabs";
import { ProcessingPipeline } from "@/components/wizard/ProcessingPipeline";
/* Group A plan components */
import { OverviewTab } from "@/components/plan/OverviewTab";
import { BuildPathComparison } from "@/components/plan/BuildPathComparison";
import { VersionComparisonTable } from "@/components/plan/VersionComparisonTable";
import { MaterialsTable } from "@/components/plan/MaterialsTable";
import { MaterialSwapSimulator } from "@/components/plan/MaterialSwapSimulator";
import { ToolsTable } from "@/components/plan/ToolsTable";
import { BuildReadinessCard } from "@/components/plan/BuildReadinessCard";
import { SavingsStoryCard } from "@/components/plan/SavingsStoryCard";
import { BudgetBreakdownCard } from "@/components/plan/BudgetBreakdownCard";
import { ShoppingListMode } from "@/components/plan/ShoppingListMode";
import { CutOptimizerCard } from "@/components/plan/CutOptimizerCard";
import { StoreCutSheetCard } from "@/components/plan/StoreCutSheetCard";
import { ProjectTimelineCard } from "@/components/plan/ProjectTimelineCard";
/* Group B plan components (per CONTRACT.md) */
import { StepByStepGuide } from "@/components/plan/StepByStepGuide";
import { DiagramViewer } from "@/components/plan/DiagramViewer";
import { FinishMatchingGuide } from "@/components/plan/FinishMatchingGuide";
import { MiniLessonsSection } from "@/components/plan/MiniLessonsSection";
import { MistakePreventionSection } from "@/components/plan/MistakePreventionSection";
import { SafetyDesignReviewCard } from "@/components/plan/SafetyDesignReviewCard";
import { AlternativesPanel } from "@/components/plan/AlternativesPanel";
import { ProjectAdvisorChat } from "@/components/plan/ProjectAdvisorChat";
import { BuilderHandoffBriefCard } from "@/components/plan/BuilderHandoffBriefCard";
import { ExportCenter } from "@/components/plan/ExportCenter";

type PlanProgress = {
  checkedShoppingItems: string[];
  completedSteps: number[];
  notes: string;
};

const EMPTY_PROGRESS: PlanProgress = { checkedShoppingItems: [], completedSteps: [], notes: "" };

type PresetKey = NonNullable<RefineRequest["presetKey"]>;

const REFINE_PRESETS: { key: PresetKey; icon: string; label: string }[] = [
  { key: "cheaper", icon: "💸", label: "Make it cheaper" },
  { key: "easier", icon: "🙂", label: "Make it easier" },
  { key: "own_tools_only", icon: "🧰", label: "Use only tools I own" },
  { key: "closer_match", icon: "🎯", label: "Closer to reference" },
  { key: "more_durable", icon: "💪", label: "More durable" },
  { key: "faster", icon: "⚡", label: "Weekend version" },
  { key: "home_depot_list", icon: "🛒", label: "Home Depot list" },
  { key: "lowes_list", icon: "🏬", label: "Lowe's list" },
  { key: "minimum_viable_dupe", icon: "✂️", label: "Minimum viable dupe" },
];

const TABS: TabDef[] = [
  { key: "overview", label: "Overview", icon: "📋" },
  { key: "paths", label: "Build Paths", icon: "🛤️" },
  { key: "materials", label: "Materials", icon: "🪵" },
  { key: "tools", label: "Tools", icon: "🛠️" },
  { key: "budget", label: "Budget", icon: "💰" },
  { key: "shopping", label: "Shopping", icon: "🛒" },
  { key: "cuts", label: "Cut List", icon: "📏" },
  { key: "steps", label: "Build Steps", icon: "🔨" },
  { key: "finish", label: "Finish", icon: "🎨" },
  { key: "safety", label: "Safety", icon: "⚠️" },
  { key: "alternatives", label: "Alternatives", icon: "🔀" },
  { key: "assistant", label: "Advisor", icon: "💬" },
  { key: "handoff", label: "Handoff", icon: "📦" },
];

function PreBuildChecklistCard({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Card title="✅ Pre-Build Checklist" subtitle="Knock these out before the first cut.">
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-soot flex gap-2">
            <span className="shrink-0" aria-hidden>
              ✅
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProjectWithPlan | null>(null);
  const [progress, setProgress] = useState<PlanProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [printMode, setPrintMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [refiningKey, setRefiningKey] = useState<PresetKey | null>(null);
  const [refineMessage, setRefineMessage] = useState<string | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);

  const persistTimer = useRef<number | null>(null);
  const messageTimer = useRef<number | null>(null);

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
      if (messageTimer.current) window.clearTimeout(messageTimer.current);
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

  const handleRefine = useCallback(
    async (preset: { key: PresetKey; label: string }) => {
      if (!id || refiningKey) return;
      setRefiningKey(preset.key);
      setRefineMessage(null);
      setRefineError(null);
      try {
        const result = await api.refinePlan(id, { instruction: preset.label, presetKey: preset.key });
        await load();
        setRefineMessage(`Plan updated — saved as version ${result.version.versionNumber}`);
        if (messageTimer.current) window.clearTimeout(messageTimer.current);
        messageTimer.current = window.setTimeout(() => setRefineMessage(null), 6000);
      } catch (err) {
        setRefineError(err instanceof Error ? err.message : "Refinement failed — please try again.");
      } finally {
        setRefiningKey(null);
      }
    },
    [id, refiningKey, load]
  );

  const handleSelectPath = useCallback(
    async (path: BuildPathType) => {
      if (!id) return;
      setData((prev) => (prev ? { ...prev, selectedBuildPath: path } : prev));
      try {
        await api.updateProject(id, { selectedBuildPath: path });
      } catch {
        /* non-fatal — selection stays in local state */
      }
    },
    [id]
  );

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
          <span className="text-sm font-medium text-soot">🖨️ Print view — the full manual, stacked for paper.</span>
          <div className="flex gap-2">
            <button type="button" className="btn-primary btn-sm" onClick={() => window.print()}>
              🖨️ Print now
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setPrintMode(false)}>
              Back to tabs
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

  /* ----------------------------- full manual ----------------------------- */
  return (
    <div className="grid gap-6 lg:grid-cols-[300px,1fr] items-start">
      {/* ------------------------------ sidebar ----------------------------- */}
      <aside className="no-print lg:sticky lg:top-20 space-y-4">
        <div className="card p-5 space-y-4">
          <div>
            <h1 className="text-lg font-bold text-ink leading-snug">{plan.title}</h1>
            <p className="text-sm text-muted mt-1">Inspired by {snap.inspiredBy}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge tone="oak">🔨 {snap.difficulty}</Badge>
            <Badge tone="gray">{titleCase(data.category)}</Badge>
            <Badge tone={riskTone(plan.safetyReview.overallRisk)}>⚠️ {snap.safetyRiskLabel}</Badge>
          </div>

          <div className="flex items-center gap-4">
            <ScoreRing score={plan.worthItScore.score} size={84} label="Worth-It Score" />
            <div className="text-sm space-y-1 min-w-0">
              <div className="font-semibold text-pine-700">
                💰 {moneyRange(snap.estimatedCostLow, snap.estimatedCostHigh)}
              </div>
              <div className="text-soot">⏱️ {snap.estimatedTime}</div>
            </div>
          </div>

          <div className="space-y-2">
            <ScoreBar score={snap.visualMatchScore} label="Visual match" />
            <ScoreBar score={snap.durabilityScore} label="Durability" />
            <ScoreBar score={plan.buildReadiness.score} label="Build readiness" />
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">🪄 Refine this plan</h2>
          <div className="space-y-1.5">
            {REFINE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="btn-secondary btn-sm w-full justify-start"
                onClick={() => handleRefine(preset)}
                disabled={refiningKey !== null}
              >
                {refiningKey === preset.key ? (
                  <Spinner className="w-3.5 h-3.5" />
                ) : (
                  <span aria-hidden>{preset.icon}</span>
                )}
                {preset.label}
              </button>
            ))}
          </div>
          {refineMessage && (
            <p className="text-xs font-medium text-pine-700 bg-pine-50 border border-pine-100 rounded-lg px-3 py-2">
              ✅ {refineMessage}
            </p>
          )}
          {refineError && <p className="text-xs text-danger">⚠️ {refineError}</p>}
        </div>

        <div className="card p-5 space-y-1">
          <Link to={`/projects/${id}/edit`} className="btn-ghost btn-sm w-full justify-start">
            ✏️ Edit constraints
          </Link>
          <Link to={`/projects/${id}/troubleshooting`} className="btn-ghost btn-sm w-full justify-start">
            🩺 Troubleshooting
          </Link>
          <Link to={`/projects/${id}/handoff`} className="btn-ghost btn-sm w-full justify-start">
            📦 Builder handoff
          </Link>
          <Link to={`/projects/${id}/export`} className="btn-ghost btn-sm w-full justify-start">
            📤 Export center
          </Link>
          <button
            type="button"
            className="btn-ghost btn-sm w-full justify-start"
            onClick={() => setPrintMode(true)}
          >
            🖨️ Print
          </button>
        </div>
      </aside>

      {/* ------------------------------- content ---------------------------- */}
      <div className="min-w-0 space-y-5">
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

        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

        <TabPanel active={activeTab} tabKey="overview">
          <OverviewTab plan={plan} />
        </TabPanel>

        <TabPanel active={activeTab} tabKey="paths">
          <div className="space-y-6">
            <BuildPathComparison
              paths={plan.buildPaths}
              selected={selectedPath}
              onSelect={handleSelectPath}
              recommendedReason={plan.recommendedPathReason}
            />
            <VersionComparisonTable versions={data.versions} currentPlanId={plan.id} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="materials">
          <div className="space-y-6">
            <MaterialsTable materials={plan.materials} />
            <MaterialsTable materials={plan.hardware} title="🔩 Hardware & Fasteners" />
            <MaterialSwapSimulator swaps={plan.materialSwaps} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="tools">
          <div className="space-y-6">
            <ToolsTable tools={plan.tools} toolAwareNotes={plan.toolAwareNotes} />
            <BuildReadinessCard readiness={plan.buildReadiness} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="budget">
          <div className="space-y-6">
            <SavingsStoryCard story={plan.savingsStory} />
            <BudgetBreakdownCard budget={plan.budgetBreakdown} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="shopping">
          <ShoppingListMode
            departments={plan.shoppingListByDepartment}
            checkedItems={progress.checkedShoppingItems}
            onToggle={toggleShoppingItem}
          />
        </TabPanel>

        <TabPanel active={activeTab} tabKey="cuts">
          <div className="space-y-6">
            <CutOptimizerCard cutList={plan.cutList} plans={plan.cutOptimizationPlans} />
            {plan.storeCutSheet && <StoreCutSheetCard sheet={plan.storeCutSheet} />}
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="steps">
          <div className="space-y-6">
            <PreBuildChecklistCard items={plan.preBuildChecklist} />
            <ProjectTimelineCard phases={plan.projectTimeline} />
            <StepByStepGuide
              steps={plan.steps}
              completedSteps={progress.completedSteps}
              onToggleStep={toggleStep}
              miniLessons={plan.miniLessons}
            />
            <DiagramViewer diagrams={plan.diagrams} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="finish">
          <div className="space-y-6">
            <FinishMatchingGuide guide={plan.finishGuide} />
            <MiniLessonsSection lessons={plan.miniLessons} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="safety">
          <div className="space-y-6">
            <SafetyDesignReviewCard review={plan.safetyReview} />
            <MistakePreventionSection mistakes={plan.mistakePrevention} commonProblems={plan.commonProblems} />
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="alternatives">
          <AlternativesPanel
            alternatives={plan.alternatives}
            minimumViableDupe={plan.minimumViableDupe}
            designSimplifier={plan.designSimplifier}
          />
        </TabPanel>

        <TabPanel active={activeTab} tabKey="assistant">
          <div className="space-y-6">
            <ProjectAdvisorChat projectId={id} />
            <Card>
              <p className="text-sm text-soot">
                🩺 <span className="font-semibold">Mid-build problem?</span> Something split, wobbles, or the stain
                went blotchy? The troubleshooting assistant walks you through diagnosis and fixes.
              </p>
              <Link to={`/projects/${id}/troubleshooting`} className="btn-secondary btn-sm mt-3">
                Open troubleshooting
              </Link>
            </Card>
          </div>
        </TabPanel>

        <TabPanel active={activeTab} tabKey="handoff">
          <div className="space-y-6">
            <BuilderHandoffBriefCard brief={plan.builderHandoff} projectId={id} />
            <ExportCenter projectId={id} planTitle={plan.title} hasCutSheet={!!plan.storeCutSheet} />
          </div>
        </TabPanel>
      </div>
    </div>
  );
}
