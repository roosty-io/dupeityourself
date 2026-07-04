/**
 * Compose stage: assembles the final BuildPlan from the adapted template plus
 * every agent's output, then runs a deterministic consistency pass so the
 * shipped plan is internally coherent regardless of which agents contributed.
 */
import type { BuildPlan } from "../../shared/types";
import { newId, nowIso } from "../storage";
import type { AgentContext } from "./generators";
import { deepClone, recomputeBudget } from "./generators";
import type { ClassificationResult } from "./agents/projectClassificationAgent";
import type { BuildPathResult } from "./agents/buildPathAgent";
import type { MaterialsResult } from "./agents/materialsAgent";
import type { EngineeringResult } from "./agents/engineeringAgent";
import type { ToolsSkillResult } from "./agents/toolsSkillAgent";
import type { ToolAdaptationResult } from "./agents/toolAdaptationAgent";
import type { CostResult } from "./agents/costAgent";
import type { CutOptimizationResult } from "./agents/cutOptimizationAgent";
import type { InstructionsResult } from "./agents/instructionsAgent";
import type { QaResult } from "./agents/qaAgent";
import type {
  AlternativeOption,
  BuilderHandoffBrief,
  CommonProblem,
  DiagramSpec,
  FeasibilityQuestion,
  FinishGuide,
  MaterialSwapOption,
  MiniLesson,
  MistakeWarning,
  SafetyDesignReview,
  ShoppingListDepartment,
  WorthItScore,
} from "../../shared/types";

function pick<T>(outputs: Record<string, unknown>, key: string): T | undefined {
  const v = outputs[key];
  return v === undefined || v === null ? undefined : (v as T);
}

/** Assemble + QA the final plan from the pipeline context. */
export function composeBuildPlan(ctx: AgentContext): BuildPlan {
  const plan = deepClone(ctx.template);
  const o = ctx.outputs;

  plan.id = newId("plan");
  plan.projectId = ctx.project.id;
  plan.createdAt = nowIso();
  plan.updatedAt = plan.createdAt;

  const classification = pick<ClassificationResult>(o, "projectClassificationAgent");
  if (classification) {
    plan.snapshot.projectType = classification.projectType;
    const base = classification.title.replace(/\s*\(inspired-by\)\s*$/i, "");
    const suffix = plan.title.match(/ - [^-]*$/)?.[0] ?? "";
    plan.title = `${base}${suffix}`;
  }

  const worthIt = pick<WorthItScore>(o, "worthItScoringAgent");
  if (worthIt) plan.worthItScore = worthIt;

  const paths = pick<BuildPathResult>(o, "buildPathAgent");
  if (paths) {
    plan.buildPaths = paths.buildPaths;
    plan.recommendedPathReason = paths.recommendedPathReason;
  }

  const materials = pick<MaterialsResult>(o, "materialsAgent");
  if (materials) {
    plan.materials = materials.materials;
    plan.hardware = materials.hardware;
  }

  const swaps = pick<MaterialSwapOption[]>(o, "materialSwapAgent");
  if (swaps) plan.materialSwaps = swaps;

  const engineering = pick<EngineeringResult>(o, "engineeringAgent");
  if (engineering) {
    plan.designSimplifier = engineering.designSimplifier;
    plan.minimumViableDupe = engineering.minimumViableDupe;
    plan.dimensions = engineering.dimensions;
  }

  const toolsSkill = pick<ToolsSkillResult>(o, "toolsSkillAgent");
  if (toolsSkill) {
    plan.tools = toolsSkill.tools;
    plan.difficultyBreakdown = toolsSkill.difficultyBreakdown;
  }

  const toolAdaptation = pick<ToolAdaptationResult>(o, "toolAdaptationAgent");
  if (toolAdaptation) {
    plan.toolAwareNotes = toolAdaptation.toolAwareNotes;
    plan.buildReadiness = toolAdaptation.buildReadiness;
  }

  const cost = pick<CostResult>(o, "costAgent");
  if (cost) {
    plan.budgetBreakdown = cost.budgetBreakdown;
    plan.savingsStory = cost.savingsStory;
  }

  const shopping = pick<ShoppingListDepartment[]>(o, "shoppingAgent");
  if (shopping) plan.shoppingListByDepartment = shopping;

  const cuts = pick<CutOptimizationResult>(o, "cutOptimizationAgent");
  if (cuts) {
    plan.cutList = cuts.cutList;
    plan.cutOptimizationPlans = cuts.cutOptimizationPlans;
    plan.storeCutSheet = cuts.storeCutSheet;
  }

  const finish = pick<FinishGuide>(o, "finishMatchingAgent");
  if (finish) plan.finishGuide = finish;

  const instructions = pick<InstructionsResult>(o, "instructionsAgent");
  if (instructions) {
    plan.steps = instructions.steps;
    plan.projectTimeline = instructions.projectTimeline;
    plan.preBuildChecklist = instructions.preBuildChecklist;
  }

  const diagrams = pick<DiagramSpec[]>(o, "diagramAgent");
  if (diagrams) plan.diagrams = diagrams;

  const safetyReview = pick<SafetyDesignReview>(o, "safetyDesignReviewAgent");
  if (safetyReview) plan.safetyReview = safetyReview;

  const alternatives = pick<AlternativeOption[]>(o, "alternativesAgent");
  if (alternatives) plan.alternatives = alternatives;

  const mistakes = pick<MistakeWarning[]>(o, "mistakePreventionAgent");
  if (mistakes) plan.mistakePrevention = mistakes;

  const lessons = pick<MiniLesson[]>(o, "miniLessonAgent");
  if (lessons) plan.miniLessons = lessons;

  const problems = pick<CommonProblem[]>(o, "troubleshootingAgent");
  if (problems) plan.commonProblems = problems;

  const handoff = pick<BuilderHandoffBrief>(o, "builderHandoffAgent");
  if (handoff) plan.builderHandoff = handoff;

  const questions = pick<FeasibilityQuestion[]>(o, "feasibilityQuestionAgent");
  if (questions && (!ctx.project.feasibilityQuestions || ctx.project.feasibilityQuestions.length === 0)) {
    plan.feasibilityQuestions = questions;
  } else if (ctx.project.feasibilityQuestions && ctx.project.feasibilityQuestions.length > 0) {
    plan.feasibilityQuestions = deepClone(ctx.project.feasibilityQuestions);
  }

  const qa = pick<QaResult>(o, "qaAgent");
  if (qa) {
    plan.qaNotes = qa.qaNotes;
    plan.confidenceScore = qa.confidenceScore;
    plan.confidenceBreakdown = qa.confidenceBreakdown;
  }

  /* ------------------------- consistency pass ------------------------- */

  /* steps numbered 1..n, no gaps */
  plan.steps.forEach((s, i) => (s.stepNumber = i + 1));

  /* every referenced mini-lesson id resolves */
  const lessonIds = new Set(plan.miniLessons.map((l) => l.id));
  for (const step of plan.steps) {
    if (step.relatedMiniLessons) {
      step.relatedMiniLessons = step.relatedMiniLessons.filter((id) => lessonIds.has(id));
      if (step.relatedMiniLessons.length === 0) step.relatedMiniLessons = undefined;
    }
  }

  /* exactly one recommended build path */
  if (!plan.buildPaths.some((p) => p.recommended)) {
    const fallback = plan.buildPaths.find((p) => p.name === plan.snapshot.selectedBuildPath) || plan.buildPaths[0];
    if (fallback) fallback.recommended = true;
  }

  /* budget arithmetic + snapshot/savings sync */
  recomputeBudget(plan);

  /* snapshot mirrors the selected path */
  const selected = plan.buildPaths.find((p) => p.recommended);
  if (selected) {
    plan.snapshot.selectedBuildPath = selected.name;
    plan.snapshot.difficulty = selected.difficulty;
    plan.snapshot.visualMatchScore = selected.visualMatchScore;
    plan.snapshot.durabilityScore = selected.durabilityScore;
  }

  return plan;
}
