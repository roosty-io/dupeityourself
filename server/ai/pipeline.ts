/**
 * The generation pipeline: runs every agent stage in sequence, streaming
 * progress into project.generation (the client polls it), and composes the
 * final BuildPlan at the end.
 */
import type { AgentStageKey, BuildPathType, GenerationState, Project } from "../../shared/types";
import { AGENT_STAGES, BUILD_PATH_LABELS } from "../../shared/constants";
import { newId, nowIso, storage } from "../storage";
import type { AgentContext } from "./generators";
import { createAgentContext } from "./generators";
import { composeBuildPlan } from "./composeBuildPlan";
import { runIntakeAgent } from "./agents/intakeAgent";
import { runVisionAgent } from "./agents/visionAgent";
import { runProjectClassificationAgent } from "./agents/projectClassificationAgent";
import { runFeasibilityQuestionAgent } from "./agents/feasibilityQuestionAgent";
import { runWorthItScoringAgent } from "./agents/worthItScoringAgent";
import { runBuildPathAgent } from "./agents/buildPathAgent";
import { runMaterialsAgent } from "./agents/materialsAgent";
import { runMaterialSwapAgent } from "./agents/materialSwapAgent";
import { runEngineeringAgent } from "./agents/engineeringAgent";
import { runToolsSkillAgent } from "./agents/toolsSkillAgent";
import { runToolAdaptationAgent } from "./agents/toolAdaptationAgent";
import { runCostAgent } from "./agents/costAgent";
import { runShoppingAgent } from "./agents/shoppingAgent";
import { runCutOptimizationAgent } from "./agents/cutOptimizationAgent";
import { runFinishMatchingAgent } from "./agents/finishMatchingAgent";
import { runInstructionsAgent } from "./agents/instructionsAgent";
import { runDiagramAgent } from "./agents/diagramAgent";
import { runSafetyAgent } from "./agents/safetyAgent";
import { runSafetyDesignReviewAgent } from "./agents/safetyDesignReviewAgent";
import { runAlternativesAgent } from "./agents/alternativesAgent";
import { runMistakePreventionAgent } from "./agents/mistakePreventionAgent";
import { runMiniLessonAgent } from "./agents/miniLessonAgent";
import { runTroubleshootingAgent } from "./agents/troubleshootingAgent";
import { runBuilderHandoffAgent } from "./agents/builderHandoffAgent";
import { runQaAgent } from "./agents/qaAgent";

type AgentRunner = { name: string; run: (ctx: AgentContext) => Promise<unknown> };

const STAGE_AGENTS: Record<AgentStageKey, AgentRunner[]> = {
  intake: [{ name: "intakeAgent", run: runIntakeAgent }],
  vision: [{ name: "visionAgent", run: runVisionAgent }],
  classification: [{ name: "projectClassificationAgent", run: runProjectClassificationAgent }],
  feasibility: [{ name: "feasibilityQuestionAgent", run: runFeasibilityQuestionAgent }],
  worth_it: [{ name: "worthItScoringAgent", run: runWorthItScoringAgent }],
  build_paths: [{ name: "buildPathAgent", run: runBuildPathAgent }],
  materials: [{ name: "materialsAgent", run: runMaterialsAgent }],
  material_swaps: [{ name: "materialSwapAgent", run: runMaterialSwapAgent }],
  engineering: [{ name: "engineeringAgent", run: runEngineeringAgent }],
  tools_skill: [{ name: "toolsSkillAgent", run: runToolsSkillAgent }],
  tool_adaptation: [{ name: "toolAdaptationAgent", run: runToolAdaptationAgent }],
  cost: [{ name: "costAgent", run: runCostAgent }],
  shopping: [{ name: "shoppingAgent", run: runShoppingAgent }],
  cut_optimization: [{ name: "cutOptimizationAgent", run: runCutOptimizationAgent }],
  finish_matching: [{ name: "finishMatchingAgent", run: runFinishMatchingAgent }],
  instructions: [{ name: "instructionsAgent", run: runInstructionsAgent }],
  diagrams: [{ name: "diagramAgent", run: runDiagramAgent }],
  safety: [{ name: "safetyAgent", run: runSafetyAgent }],
  safety_design_review: [{ name: "safetyDesignReviewAgent", run: runSafetyDesignReviewAgent }],
  alternatives: [{ name: "alternativesAgent", run: runAlternativesAgent }],
  mistake_prevention: [
    { name: "mistakePreventionAgent", run: runMistakePreventionAgent },
    { name: "troubleshootingAgent", run: runTroubleshootingAgent },
  ],
  mini_lessons: [{ name: "miniLessonAgent", run: runMiniLessonAgent }],
  builder_handoff: [{ name: "builderHandoffAgent", run: runBuilderHandoffAgent }],
  qa: [{ name: "qaAgent", run: runQaAgent }],
  compose: [],
};

const running = new Set<string>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function freshState(): GenerationState {
  return {
    status: "running",
    stages: AGENT_STAGES.map((s) => ({ key: s.key, label: s.label, status: "pending" as const })),
    startedAt: nowIso(),
  };
}

function extractConfidence(output: unknown): number | undefined {
  if (!output || typeof output !== "object") return undefined;
  const o = output as Record<string, unknown>;
  for (const key of ["confidenceScore", "extractionConfidence", "confidence", "score"]) {
    if (typeof o[key] === "number") return o[key] as number;
  }
  return undefined;
}

function summarize(name: string, output: unknown): string {
  if (Array.isArray(output)) return `${name} produced ${output.length} items`;
  if (output && typeof output === "object") {
    const keys = Object.keys(output as object).slice(0, 4);
    return `${name} produced ${keys.join(", ")}`;
  }
  return `${name} complete`;
}

async function setStage(project: Project, key: AgentStageKey, status: "pending" | "running" | "complete" | "error"): Promise<void> {
  const stage = project.generation.stages.find((s) => s.key === key);
  if (stage) stage.status = status;
  project.updatedAt = nowIso();
  await storage.saveProject(project);
}

/**
 * Kick off (or refuse to double-start) a full generation run for a project.
 * Designed to be called fire-and-forget from the route handler.
 */
export async function startGeneration(projectId: string, pathPreference?: BuildPathType): Promise<void> {
  const project = storage.getProject(projectId);
  if (!project) throw new Error(`Project not found: ${projectId}`);
  if (running.has(projectId)) return; // concurrent-run guard (authoritative)

  running.add(projectId);
  try {
    project.generation = freshState();
    project.status = "generating";
    if (pathPreference) project.selectedBuildPath = pathPreference;
    await storage.saveProject(project);

    const ctx = createAgentContext(project, pathPreference || project.selectedBuildPath);

    for (const stageDef of AGENT_STAGES) {
      await setStage(project, stageDef.key, "running");
      await delay(250 + Math.floor(Math.random() * 250));

      try {
        for (const agent of STAGE_AGENTS[stageDef.key]) {
          const output = await agent.run(ctx);
          ctx.outputs[agent.name] = output;
          await storage.saveAgentRun({
            id: newId("run"),
            projectId,
            agentName: agent.name,
            status: "success",
            confidenceScore: extractConfidence(output),
            summary: summarize(agent.name, output),
            createdAt: nowIso(),
          });
        }

        if (stageDef.key === "compose") {
          const plan = composeBuildPlan(ctx);
          await storage.savePlan(plan);
          const versionNumber = storage.nextVersionNumber(projectId);
          const pathLabel = BUILD_PATH_LABELS[plan.snapshot.selectedBuildPath];
          await storage.saveVersion({
            id: newId("ver"),
            projectId,
            versionNumber,
            versionName: versionNumber === 1 ? `${pathLabel} (initial)` : pathLabel,
            changeSummary: `Full plan generated on the ${pathLabel} path: $${plan.snapshot.estimatedCostLow}-$${plan.snapshot.estimatedCostHigh}, ${plan.snapshot.estimatedTime}, ${plan.steps.length} steps.`,
            buildPathType: plan.snapshot.selectedBuildPath,
            plan,
            createdAt: nowIso(),
          });
          await storage.saveAgentRun({
            id: newId("run"),
            projectId,
            agentName: "composeBuildPlan",
            status: "success",
            confidenceScore: plan.confidenceScore,
            summary: `Composed "${plan.title}" (v${versionNumber}) with ${plan.steps.length} steps and ${plan.materials.length} materials`,
            createdAt: nowIso(),
          });
          project.latestPlanId = plan.id;
          project.selectedBuildPath = plan.snapshot.selectedBuildPath;
          project.generation.planId = plan.id;
          project.status = "ready";
        }

        await setStage(project, stageDef.key, "complete");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await storage.saveAgentRun({
          id: newId("run"),
          projectId,
          agentName: STAGE_AGENTS[stageDef.key][0]?.name || stageDef.key,
          status: "error",
          errorMessage: message,
          createdAt: nowIso(),
        });
        await setStage(project, stageDef.key, "error");
        throw err;
      }
    }

    project.generation.status = "complete";
    project.generation.finishedAt = nowIso();
    await storage.saveProject(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[pipeline] generation failed for ${projectId}:`, message);
    project.generation.status = "error";
    project.generation.error = message;
    project.generation.finishedAt = nowIso();
    project.status = "error";
    await storage.saveProject(project);
  } finally {
    running.delete(projectId);
  }
}

export function isGenerationRunning(projectId: string): boolean {
  return running.has(projectId);
}
