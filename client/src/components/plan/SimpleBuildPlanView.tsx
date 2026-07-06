import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { BuildPath, BuildPathType, ProjectWithPlan, RefineRequest } from "@shared/types";
import { deriveSimpleBuildPlanSummary } from "@shared/simplePlan";
import { api } from "@/lib/api";
import { moneyRange, titleCase, shortTime, timeDetail } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { Badge, riskTone } from "@/components/ui/Badge";
import { ScoreRing, ScoreBar } from "@/components/ui/ScoreBar";
import { StatTile } from "@/components/ui/StatTile";
import { Spinner } from "@/components/ui/Spinner";
import { TabBar, TabPanel, type TabDef } from "@/components/ui/Tabs";
import { CheckItem } from "@/components/ui/Checklist";
/* reused rich components (progressively disclosed) */
import { PlanPhaseCard } from "@/components/plan/PlanPhaseCard";
import { ExportDocumentCards } from "@/components/plan/ExportDocumentCards";
import { AdvancedDetailsDrawer } from "@/components/plan/AdvancedDetailsDrawer";
import { ShoppingListMode } from "@/components/plan/ShoppingListMode";
import { MaterialsTable } from "@/components/plan/MaterialsTable";
import { MaterialSwapSimulator } from "@/components/plan/MaterialSwapSimulator";
import { ToolsTable } from "@/components/plan/ToolsTable";
import { DifficultyBreakdownCard } from "@/components/plan/DifficultyBreakdownCard";
import { BuildReadinessCard } from "@/components/plan/BuildReadinessCard";
import { ProjectTimelineCard } from "@/components/plan/ProjectTimelineCard";
import { DiagramViewer } from "@/components/plan/DiagramViewer";
import { MiniLessonsSection } from "@/components/plan/MiniLessonsSection";
import { FinishMatchingGuide } from "@/components/plan/FinishMatchingGuide";
import { SafetyDesignReviewCard } from "@/components/plan/SafetyDesignReviewCard";
import { MistakePreventionSection } from "@/components/plan/MistakePreventionSection";
import { BuildPathComparison } from "@/components/plan/BuildPathComparison";
import { VersionComparisonTable } from "@/components/plan/VersionComparisonTable";
import { ProjectAdvisorChat } from "@/components/plan/ProjectAdvisorChat";

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
  { key: "start", label: "Start Here", icon: "🚀" },
  { key: "options", label: "Build Options", icon: "🛤️" },
  { key: "shopping", label: "Shopping List", icon: "🛒" },
  { key: "tools", label: "Tools & Prep", icon: "🛠️" },
  { key: "steps", label: "Build Steps", icon: "🔨" },
  { key: "finish", label: "Finish & Details", icon: "🎨" },
  { key: "safety", label: "Safety & Mistakes", icon: "⚠️" },
  { key: "export", label: "Export", icon: "📤" },
];

/** Pick up to 3 distinct paths for the simplified chooser: cheapest / recommended / closest. */
function pickThreePaths(
  paths: BuildPath[],
  recommendedKey: string
): { role: string; tone: "gray" | "green" | "oak"; highlight?: boolean; path: BuildPath }[] {
  if (paths.length === 0) return [];
  const recommended =
    paths.find((p) => p.name === recommendedKey) ?? paths.find((p) => p.recommended) ?? paths[0];
  const rest = paths.filter((p) => p.name !== recommended.name);
  const cheapest = [...rest].sort((a, b) => a.estimatedCostLow - b.estimatedCostLow)[0];
  const afterCheap = rest.filter((p) => cheapest && p.name !== cheapest.name);
  const closest = [...afterCheap].sort((a, b) => b.visualMatchScore - a.visualMatchScore)[0];

  const cards: { role: string; tone: "gray" | "green" | "oak"; highlight?: boolean; path: BuildPath }[] = [];
  if (cheapest) cards.push({ role: "Cheapest Acceptable", tone: "gray", path: cheapest });
  cards.push({ role: "Recommended", tone: "green", highlight: true, path: recommended });
  if (closest) cards.push({ role: "Closest Match", tone: "oak", path: closest });

  // order: cheapest, recommended, closest — dedupe by path name
  const order = ["Cheapest Acceptable", "Recommended", "Closest Match"];
  const seen = new Set<string>();
  return order
    .map((role) => cards.find((c) => c.role === role))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .filter((c) => (seen.has(c.path.name) ? false : (seen.add(c.path.name), true)));
}

export function SimpleBuildPlanView({
  project,
  progress,
  onToggleShoppingItem,
  onToggleStep,
  onReload,
  onPrint,
}: {
  project: ProjectWithPlan;
  progress: { checkedShoppingItems: string[]; completedSteps: number[] };
  onToggleShoppingItem: (key: string) => void;
  onToggleStep: (stepNumber: number) => void;
  onReload: () => void;
  onPrint: () => void;
}) {
  const plan = project.plan!;
  const summary = useMemo(() => deriveSimpleBuildPlanSummary(plan), [plan]);

  const [activeTab, setActiveTab] = useState("start");
  const [advanced, setAdvanced] = useState(false);
  const [selectedPath, setSelectedPath] = useState<BuildPathType>(
    project.selectedBuildPath ?? plan.snapshot.selectedBuildPath
  );
  const [refiningKey, setRefiningKey] = useState<PresetKey | null>(null);
  const [refineMessage, setRefineMessage] = useState<string | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);
  const messageTimer = useRef<number | null>(null);

  const projectId = project.id;

  /* progress counts */
  const stepTotal = plan.steps.length;
  const stepDone = plan.steps.filter((s) => progress.completedSteps.includes(s.stepNumber)).length;
  const stepPct = stepTotal > 0 ? Math.round((stepDone / stepTotal) * 100) : 0;
  const shopTotal = plan.shoppingListByDepartment.reduce((n, d) => n + d.items.length, 0);
  const shopDone = progress.checkedShoppingItems.length;
  const shopPct = shopTotal > 0 ? Math.round((shopDone / shopTotal) * 100) : 0;

  const pathCards = useMemo(
    () => pickThreePaths(plan.buildPaths, summary.recommendedPath.key),
    [plan.buildPaths, summary.recommendedPath.key]
  );

  const goTab = (key: string) => {
    setActiveTab(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectPath = async (path: BuildPathType) => {
    setSelectedPath(path);
    try {
      await api.updateProject(projectId, { selectedBuildPath: path });
    } catch {
      /* non-fatal — selection stays in local state */
    }
  };

  const handleRefine = async (preset: { key: PresetKey; label: string }) => {
    if (refiningKey) return;
    setRefiningKey(preset.key);
    setRefineMessage(null);
    setRefineError(null);
    try {
      const result = await api.refinePlan(projectId, { instruction: preset.label, presetKey: preset.key });
      onReload();
      setRefineMessage(`Plan updated — saved as version ${result.version.versionNumber}`);
      if (messageTimer.current) window.clearTimeout(messageTimer.current);
      messageTimer.current = window.setTimeout(() => setRefineMessage(null), 6000);
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : "Refinement failed — please try again.");
    } finally {
      setRefiningKey(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[288px,1fr] items-start">
      {/* ------------------------------ sidebar ----------------------------- */}
      <aside className="no-print lg:sticky lg:top-20 space-y-4">
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <ScoreRing score={summary.worthIt.score} size={64} />
            <div className="min-w-0">
              <div className="text-xs text-muted">Building</div>
              <h2 className="font-bold text-ink leading-snug truncate">{titleCase(summary.recommendedPath.name)}</h2>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <SidebarStat label="Cost" value={summary.recommendedPath.costRange} />
            <SidebarStat label="Time" value={shortTime(summary.estimatedTime)} />
            <SidebarStat label="Difficulty" value={summary.difficulty} />
            <SidebarStat label="Visual" value={`${summary.recommendedPath.visualMatchScore}/100`} />
          </dl>

          <div className="space-y-2 pt-1">
            <ProgressLine label="Shopping" done={shopDone} total={shopTotal} pct={shopPct} />
            <ProgressLine label="Build steps" done={stepDone} total={stepTotal} pct={stepPct} />
          </div>

          <button type="button" className="btn-secondary btn-sm w-full" onClick={() => goTab("export")}>
            📤 Export & print
          </button>
        </div>

        <Accordion title="🪄 Refine this plan" subtitle="Regenerate a new version">
          <div className="space-y-1.5">
            {REFINE_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="btn-secondary btn-sm w-full justify-start"
                onClick={() => handleRefine(preset)}
                disabled={refiningKey !== null}
              >
                {refiningKey === preset.key ? <Spinner className="w-3.5 h-3.5" /> : <span aria-hidden>{preset.icon}</span>}
                {preset.label}
              </button>
            ))}
            {refineMessage && (
              <p className="text-xs font-medium text-pine-700 bg-pine-50 border border-pine-100 rounded-lg px-3 py-2">
                ✅ {refineMessage}
              </p>
            )}
            {refineError && <p className="text-xs text-danger">⚠️ {refineError}</p>}
          </div>
        </Accordion>

        <div className="card p-4 space-y-1">
          <Link to={`/projects/${projectId}/edit`} className="btn-ghost btn-sm w-full justify-start">
            ✏️ Edit constraints
          </Link>
          <Link to={`/projects/${projectId}/troubleshooting`} className="btn-ghost btn-sm w-full justify-start">
            🩺 Troubleshooting
          </Link>
          <button
            type="button"
            className="btn-ghost btn-sm w-full justify-start"
            onClick={() => setAdvanced((a) => !a)}
          >
            {advanced ? "📋 Back to simple plan" : "📚 Full technical details"}
          </button>
        </div>
      </aside>

      {/* ------------------------------- content ---------------------------- */}
      <div className="min-w-0 space-y-5">
        {advanced ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-bold text-ink">📚 Full Technical Details</h1>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setAdvanced(false)}>
                ← Back to simple plan
              </button>
            </div>
            <AdvancedDetailsDrawer project={project} onSelectPath={handleSelectPath} />
          </div>
        ) : (
          <>
            {/* -------------------------- hero header ------------------------ */}
            <div className="card p-6 space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">{summary.projectName}</h1>
                <p className="text-sm text-muted mt-1.5">{summary.plainEnglishDescription}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <StatTile icon="🛤️" label="Recommended" value={titleCase(summary.recommendedPath.name)} />
                <StatTile icon="💰" label="Cost" value={summary.recommendedPath.costRange} />
                <StatTile icon="⏱️" label="Time" value={shortTime(summary.estimatedTime)} sub={timeDetail(summary.estimatedTime)} />
                <StatTile icon="🔨" label="Difficulty" value={summary.difficulty} />
                <StatTile icon="🎯" label="Visual match" value={`${summary.recommendedPath.visualMatchScore}/100`} />
                <StatTile icon="💡" label="Worth-It" value={`${summary.worthIt.score}/100`} />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" className="btn-ember btn-md" onClick={() => goTab("shopping")}>
                  🛒 Start with shopping list
                </button>
                <button type="button" className="btn-secondary btn-md" onClick={() => goTab("steps")}>
                  🔨 View build steps
                </button>
                <button type="button" className="btn-secondary btn-md" onClick={() => goTab("export")}>
                  ✅ Export checklist
                </button>
                <button
                  type="button"
                  className="btn-ghost btn-md"
                  onClick={() => {
                    goTab("start");
                    window.setTimeout(
                      () => document.getElementById("advisor-panel")?.scrollIntoView({ behavior: "smooth" }),
                      120
                    );
                  }}
                >
                  💬 Ask a question
                </button>
              </div>
            </div>

            <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

            {/* ============================ START HERE ====================== */}
            <TabPanel active={activeTab} tabKey="start">
              <div className="space-y-5">
                <Card title="💡 Is this worth building?">
                  <div className="flex items-start gap-4">
                    <ScoreRing score={summary.worthIt.score} size={92} label={titleCase(summary.worthIt.verdict)} />
                    <p className="text-sm text-soot leading-relaxed">{summary.worthIt.oneSentenceVerdict}</p>
                  </div>
                  {summary.cost.savings != null && summary.cost.referencePrice != null && (
                    <div className="mt-4 rounded-xl bg-pine-50 border border-pine-100 px-4 py-3 text-sm text-soot">
                      Reference ≈ <span className="font-semibold text-ink">${summary.cost.referencePrice.toLocaleString()}</span> ·
                      Your build <span className="font-semibold text-ink">{summary.cost.range}</span> · Save about{" "}
                      <span className="font-semibold text-pine-700">
                        ${summary.cost.savings.toLocaleString()}
                        {summary.cost.savingsPct != null ? ` (${summary.cost.savingsPct}%)` : ""}
                      </span>
                    </div>
                  )}
                </Card>

                <Card title="🎯 The 3 things that matter most">
                  <ol className="space-y-2.5">
                    {summary.topThingsToKnow.map((t, i) => (
                      <li key={i} className="flex gap-3 text-sm text-soot">
                        <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-oak-100 text-oak-800 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{t}</span>
                      </li>
                    ))}
                  </ol>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card title="🛤️ Recommended build">
                    <p className="text-sm font-semibold text-ink">{titleCase(summary.recommendedPath.name)}</p>
                    <p className="text-sm text-soot mt-1 leading-relaxed">{summary.recommendedPath.why}</p>
                    <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => goTab("options")}>
                      Compare build options
                    </button>
                  </Card>
                  <Card title={`✅ Are you ready? ${summary.readiness.score}/100`}>
                    <p className="text-sm font-medium text-soot">{summary.readiness.statusLabel}</p>
                    {summary.readiness.topMissingItems.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-sm text-soot">
                        {summary.readiness.topMissingItems.map((m, i) => (
                          <li key={i}>• {m}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-pine-700 mt-2">You have what you need to start.</p>
                    )}
                    <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => goTab("tools")}>
                      See tools & prep
                    </button>
                  </Card>
                </div>

                {summary.assumptionsToConfirm.length > 0 && (
                  <Accordion
                    title="📋 Assumptions to confirm"
                    subtitle="We filled these in — double-check before you build"
                  >
                    <ul className="space-y-1.5">
                      {summary.assumptionsToConfirm.map((a, i) => (
                        <li key={i} className="text-sm text-soot flex gap-2">
                          <span className="text-amber-600 shrink-0">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </Accordion>
                )}

                <div id="advisor-panel">
                  <Card title="💬 Ask about this build" subtitle="Answers use your plan, tools, and constraints.">
                    <ProjectAdvisorChat projectId={projectId} />
                  </Card>
                </div>
              </div>
            </TabPanel>

            {/* ============================ BUILD OPTIONS =================== */}
            <TabPanel active={activeTab} tabKey="options">
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-ink">Choose your build</h2>
                  <p className="text-sm text-muted mt-0.5">
                    Three sensible options. Pick one — you can change it anytime, or see all {plan.buildPaths.length}{" "}
                    paths below.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {pathCards.map(({ role, tone, highlight, path }) => {
                    const isSelected = selectedPath === path.name;
                    return (
                      <div
                        key={path.id}
                        className={`card p-5 flex flex-col gap-2 ${
                          highlight ? "ring-2 ring-pine-300" : ""
                        } ${isSelected ? "ring-2 ring-ember-400" : ""}`}
                      >
                        <Badge tone={tone}>{role}</Badge>
                        <div className="text-xl font-bold text-ink">{path.estimatedCostLow === path.estimatedCostHigh ? `$${path.estimatedCostLow}` : moneyRange(path.estimatedCostLow, path.estimatedCostHigh)}</div>
                        <div className="text-xs text-muted">
                          {titleCase(path.difficulty)} · {path.visualMatchScore}% match · {path.estimatedTime}
                        </div>
                        <p className="text-sm text-soot flex-1">{path.bestFor}</p>
                        <button
                          type="button"
                          className={isSelected ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
                          onClick={() => handleSelectPath(path.name)}
                        >
                          {isSelected ? "✓ Selected" : "Choose this"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <Accordion title={`🛤️ View all ${plan.buildPaths.length} build paths`}>
                  <div className="space-y-6">
                    <BuildPathComparison
                      paths={plan.buildPaths}
                      selected={selectedPath}
                      onSelect={handleSelectPath}
                      recommendedReason={plan.recommendedPathReason}
                    />
                    <VersionComparisonTable versions={project.versions} currentPlanId={plan.id} />
                  </div>
                </Accordion>
              </div>
            </TabPanel>

            {/* ============================ SHOPPING ======================= */}
            <TabPanel active={activeTab} tabKey="shopping">
              <div className="space-y-5">
                <ShoppingListMode
                  departments={plan.shoppingListByDepartment}
                  checkedItems={progress.checkedShoppingItems}
                  onToggle={onToggleShoppingItem}
                />
                <Accordion
                  title="📋 Detailed materials table"
                  subtitle="Why each material matters, plus budget & premium alternatives"
                >
                  <div className="space-y-6">
                    <MaterialsTable materials={plan.materials} />
                    <MaterialsTable materials={plan.hardware} title="🔩 Hardware & Fasteners" />
                    <MaterialSwapSimulator swaps={plan.materialSwaps} />
                  </div>
                </Accordion>
              </div>
            </TabPanel>

            {/* ============================ TOOLS & PREP =================== */}
            <TabPanel active={activeTab} tabKey="tools">
              <div className="space-y-5">
                <Card title={`🛠️ Tools you need · ${summary.readiness.score}/100 ready`}>
                  <p className="text-sm font-medium text-soot mb-4">{summary.readiness.statusLabel}</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <ToolColumn heading="Must have" tone="text-ink" items={summary.mustHaveTools} bullet="🔧" />
                    <ToolColumn heading="Helpful" tone="text-soot" items={summary.helpfulTools} bullet="➕" />
                    <ToolColumn
                      heading="You do not need"
                      tone="text-faint"
                      items={summary.notNeededTools}
                      bullet="🚫"
                      empty="—"
                    />
                  </div>
                </Card>

                {summary.missingToolWorkarounds.length > 0 && (
                  <Card title="🧰 Missing a tool? Here's the workaround">
                    <ul className="space-y-2">
                      {summary.missingToolWorkarounds.map((w, i) => (
                        <li key={i} className="text-sm text-soot flex gap-2">
                          <span className="text-pine-600 shrink-0">→</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {summary.preBuildChecklist.length > 0 && (
                  <Card title="✅ Before the first cut">
                    <ul className="space-y-1.5">
                      {summary.preBuildChecklist.map((p, i) => (
                        <li key={i} className="text-sm text-soot flex gap-2">
                          <span className="shrink-0" aria-hidden>
                            ✅
                          </span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                <Accordion title="🔧 Full tool list & difficulty detail">
                  <div className="space-y-6">
                    <ToolsTable tools={plan.tools} toolAwareNotes={plan.toolAwareNotes} />
                    <DifficultyBreakdownCard difficulty={plan.difficultyBreakdown} />
                    <BuildReadinessCard readiness={plan.buildReadiness} />
                  </div>
                </Accordion>
              </div>
            </TabPanel>

            {/* ============================ BUILD STEPS ==================== */}
            <TabPanel active={activeTab} tabKey="steps">
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-ink">Build steps</h2>
                  <p className="text-sm text-muted mt-0.5">
                    {summary.phases.length} phases · {stepDone}/{stepTotal} steps done. Check off as you go — tap a step
                    for full detail.
                  </p>
                  <ScoreBar score={stepPct} className="mt-2" />
                </div>

                {summary.phases.map((phase) => (
                  <PlanPhaseCard
                    key={phase.phaseNumber}
                    phase={phase}
                    completedSteps={progress.completedSteps}
                    onToggleStep={onToggleStep}
                  />
                ))}

                <Accordion title="🗓️ Project timeline">
                  <ProjectTimelineCard phases={plan.projectTimeline} />
                </Accordion>
                {plan.diagrams.length > 0 && (
                  <Accordion title="📐 Diagrams">
                    <DiagramViewer diagrams={plan.diagrams} />
                  </Accordion>
                )}
              </div>
            </TabPanel>

            {/* ============================ FINISH ========================= */}
            <TabPanel active={activeTab} tabKey="finish">
              <div className="space-y-5">
                <Card title="🎨 Finish goal">
                  {summary.finish.targetLook && (
                    <p className="text-sm text-soot mb-3">
                      <span className="font-semibold text-ink">Target look:</span> {summary.finish.targetLook}
                    </p>
                  )}
                  {summary.finish.steps.length > 0 && (
                    <>
                      <h4 className="text-sm font-semibold text-ink mb-2">Recommended finish</h4>
                      <ol className="space-y-1.5">
                        {summary.finish.steps.map((s, i) => (
                          <li key={i} className="text-sm text-soot flex gap-2">
                            <span className="text-pine-600 font-semibold shrink-0">{i + 1}.</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </>
                  )}
                  {summary.finish.cureNote && (
                    <div className="mt-3 rounded-lg bg-parchment border border-bdr px-3 py-2 text-sm text-soot">
                      ⏳ {summary.finish.cureNote}
                    </div>
                  )}
                </Card>

                <Accordion
                  title="🎨 Full finish & color-matching guide"
                  subtitle="Test process, budget vs premium, and 'what if it looks too orange?'"
                >
                  <FinishMatchingGuide guide={plan.finishGuide} />
                </Accordion>
                <Accordion title="📚 Skill mini-lessons">
                  <MiniLessonsSection lessons={plan.miniLessons} />
                </Accordion>
              </div>
            </TabPanel>

            {/* ============================ SAFETY ========================= */}
            <TabPanel active={activeTab} tabKey="safety">
              <div className="space-y-5">
                <Card title="🚧 Do not skip these" subtitle="The few things you absolutely cannot mess up.">
                  <ul className="space-y-2">
                    {summary.safetyHighlights.map((h, i) => (
                      <li key={`s-${i}`} className="text-sm text-soot flex gap-2">
                        <span className="text-ember-600 shrink-0">⚠️</span>
                        <span>{h}</span>
                      </li>
                    ))}
                    {summary.topMistakes.map((m, i) => (
                      <li key={`m-${i}`} className="text-sm text-soot flex gap-2">
                        <span className="text-ember-600 shrink-0">⚠️</span>
                        <span>
                          <span className="font-medium text-ink">{m.mistake}</span> — {m.avoidBy}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <div className="rounded-xl border border-bdr bg-parchment px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-soot">
                    🩺 <span className="font-semibold">Something already went wrong mid-build?</span>
                  </p>
                  <Link to={`/projects/${projectId}/troubleshooting`} className="btn-secondary btn-sm">
                    Open troubleshooting
                  </Link>
                </div>

                <Accordion title="🛡️ Full safety design review">
                  <SafetyDesignReviewCard review={plan.safetyReview} />
                </Accordion>
                <Accordion title="🚫 All mistakes & common problems">
                  <MistakePreventionSection mistakes={plan.mistakePrevention} commonProblems={plan.commonProblems} />
                </Accordion>
              </div>
            </TabPanel>

            {/* ============================ EXPORT ========================= */}
            <TabPanel active={activeTab} tabKey="export">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-ink">Export & print</h2>
                  <p className="text-sm text-muted mt-0.5">
                    Take your plan off the screen. The Simple Build Checklist is all most builds need.
                  </p>
                </div>
                <ExportDocumentCards
                  projectId={projectId}
                  planTitle={plan.title}
                  hasCutSheet={Boolean(plan.storeCutSheet)}
                  onPrint={onPrint}
                />
              </div>
            </TabPanel>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ small parts ---------------------------- */

function SidebarStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold text-ink leading-snug">{value}</dd>
    </div>
  );
}

function ProgressLine({ label, done, total, pct }: { label: string; done: number; total: number; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1">
        <span>{label}</span>
        <span className="font-semibold text-soot">
          {done}/{total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-sand overflow-hidden">
        <div className="h-full rounded-full bg-pine-600 transition-all" style={{ width: `${Math.max(2, pct)}%` }} />
      </div>
    </div>
  );
}

function ToolColumn({
  heading,
  tone,
  items,
  bullet,
  empty,
}: {
  heading: string;
  tone: string;
  items: string[];
  bullet: string;
  empty?: string;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{heading}</h4>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((t, i) => (
            <li key={i} className={`text-sm flex gap-2 ${tone}`}>
              <span className="shrink-0" aria-hidden>
                {bullet}
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-faint">{empty ?? "None"}</p>
      )}
    </div>
  );
}
