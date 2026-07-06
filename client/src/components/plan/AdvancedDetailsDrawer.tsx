import type { BuildPathType, ProjectWithPlan } from "@shared/types";
import { Accordion } from "@/components/ui/Accordion";
import { BuildPathComparison } from "@/components/plan/BuildPathComparison";
import { VersionComparisonTable } from "@/components/plan/VersionComparisonTable";
import { ConfidenceBreakdownCard } from "@/components/plan/ConfidenceBreakdownCard";
import { DifficultyBreakdownCard } from "@/components/plan/DifficultyBreakdownCard";
import { BuildReadinessCard } from "@/components/plan/BuildReadinessCard";
import { MaterialsTable } from "@/components/plan/MaterialsTable";
import { MaterialSwapSimulator } from "@/components/plan/MaterialSwapSimulator";
import { SavingsStoryCard } from "@/components/plan/SavingsStoryCard";
import { BudgetBreakdownCard } from "@/components/plan/BudgetBreakdownCard";
import { CutOptimizerCard } from "@/components/plan/CutOptimizerCard";
import { StoreCutSheetCard } from "@/components/plan/StoreCutSheetCard";
import { AlternativesPanel } from "@/components/plan/AlternativesPanel";
import { MiniLessonsSection } from "@/components/plan/MiniLessonsSection";

/**
 * The full expert reasoning and technical appendix — everything the Simple Plan
 * intentionally hides. Rendered as stacked accordions so nothing is lost, but
 * nothing competes with the action-first default view either.
 */
export function AdvancedDetailsDrawer({
  project,
  onSelectPath,
}: {
  project: ProjectWithPlan;
  onSelectPath?: (path: BuildPathType) => void;
}) {
  const plan = project.plan;
  if (!plan) return null;
  const selectedPath = project.selectedBuildPath ?? plan.snapshot.selectedBuildPath;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-bdr bg-parchment px-4 py-3">
        <p className="text-sm text-soot">
          📚 <span className="font-semibold text-ink">Full expert details.</span> This is the complete reasoning,
          assumptions, and technical appendix behind your Simple Plan. Everything here is optional reading.
        </p>
      </div>

      <Accordion title="🔍 Reference analysis & confidence" defaultOpen>
        <div className="space-y-4">
          <p className="text-sm text-soot leading-relaxed">{plan.referenceAnalysis}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {plan.referenceAnalysisDetails.visible.length > 0 && (
              <div className="rounded-lg bg-surface border border-bdr px-3 py-2.5">
                <h5 className="text-xs font-semibold text-pine-800 mb-1.5">✅ Visible in the reference</h5>
                <ul className="space-y-1 text-sm text-soot">
                  {plan.referenceAnalysisDetails.visible.map((v, i) => (
                    <li key={i}>• {v}</li>
                  ))}
                </ul>
              </div>
            )}
            {plan.referenceAnalysisDetails.uncertain.length > 0 && (
              <div className="rounded-lg bg-surface border border-bdr px-3 py-2.5">
                <h5 className="text-xs font-semibold text-amber-800 mb-1.5">❓ Uncertain / not visible</h5>
                <ul className="space-y-1 text-sm text-soot">
                  {plan.referenceAnalysisDetails.uncertain.map((v, i) => (
                    <li key={i}>• {v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <ConfidenceBreakdownCard confidence={plan.confidenceBreakdown} />
          {plan.measurementCalibration && plan.measurementCalibration.estimatedDimensions.length > 0 && (
            <div className="rounded-lg bg-surface border border-bdr px-4 py-3">
              <h5 className="text-sm font-semibold text-ink mb-2">📏 Measurement calibration</h5>
              <ul className="space-y-1.5">
                {plan.measurementCalibration.estimatedDimensions.map((d, i) => (
                  <li key={i} className="text-sm text-soot">
                    <span className="font-medium text-ink">
                      {d.label}: {d.value} {d.unit}
                    </span>{" "}
                    <span className="text-faint">({d.confidence}/100)</span> — {d.reasoning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Accordion>

      <Accordion title="🛤️ All build paths & saved versions">
        <div className="space-y-6">
          <BuildPathComparison
            paths={plan.buildPaths}
            selected={selectedPath}
            onSelect={onSelectPath}
            recommendedReason={plan.recommendedPathReason}
          />
          <VersionComparisonTable versions={project.versions} currentPlanId={plan.id} />
        </div>
      </Accordion>

      <Accordion title="🪵 Detailed materials table & swap simulator">
        <div className="space-y-6">
          <MaterialsTable materials={plan.materials} />
          <MaterialsTable materials={plan.hardware} title="🔩 Hardware & Fasteners" />
          <MaterialSwapSimulator swaps={plan.materialSwaps} />
        </div>
      </Accordion>

      <Accordion title="💰 Full budget & savings story">
        <div className="space-y-6">
          <SavingsStoryCard story={plan.savingsStory} />
          <BudgetBreakdownCard budget={plan.budgetBreakdown} />
        </div>
      </Accordion>

      <Accordion title="🎚️ Difficulty & readiness detail">
        <div className="space-y-6">
          <DifficultyBreakdownCard difficulty={plan.difficultyBreakdown} />
          <BuildReadinessCard readiness={plan.buildReadiness} />
        </div>
      </Accordion>

      <Accordion title="📐 Cut list, optimization & store cut sheet">
        <div className="space-y-6">
          <CutOptimizerCard cutList={plan.cutList} plans={plan.cutOptimizationPlans} />
          {plan.storeCutSheet && <StoreCutSheetCard sheet={plan.storeCutSheet} />}
        </div>
      </Accordion>

      <Accordion title="🔀 Design simplifier, minimum viable dupe & alternatives">
        <AlternativesPanel
          alternatives={plan.alternatives}
          minimumViableDupe={plan.minimumViableDupe}
          designSimplifier={plan.designSimplifier}
        />
      </Accordion>

      <Accordion title="📚 Skill mini-lessons">
        <MiniLessonsSection lessons={plan.miniLessons} />
      </Accordion>

      {plan.qaNotes.length > 0 && (
        <Accordion title="🔎 QA & internal review notes">
          <ul className="space-y-1.5">
            {plan.qaNotes.map((note, i) => (
              <li key={i} className="text-sm text-soot flex gap-2">
                <span className="text-faint shrink-0">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </Accordion>
      )}
    </div>
  );
}
