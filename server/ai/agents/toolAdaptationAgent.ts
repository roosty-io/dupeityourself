/**
 * Tool adaptation agent: turns missing tools into concrete workarounds
 * (store cuts, substitutes, rentals, technique changes) and scores overall
 * build readiness.
 */
import type { BuildReadiness, ToolAwareNote } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { applyToolAwareness, deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

export type ToolAdaptationResult = { toolAwareNotes: ToolAwareNote[]; buildReadiness: BuildReadiness };

const SYSTEM_PROMPT = `You are the Tool Adaptation agent for a DIY "inspired-by" build planner.

ROLE: For every required tool the user lacks, produce a concrete workaround that keeps the plan buildable: store panel-saw cuts, substitute tools, one-day rentals, or technique changes. Then score how ready this user is to start.

INPUT: Project context JSON (ownedTools vs the plan's required tools).

OUTPUT: JSON { toolAwareNotes: [{missingTool, impact, workaround, workaroundType (store_cut|substitute_tool|rental|technique_change|buy|borrow)}], buildReadiness: {score, readyStatus (ready|mostly_ready|needs_prep|not_ready), missingTools[], missingMaterials[], skillGaps[], workspaceConcerns[], budgetConcerns[], safetyConcerns[], recommendation} }.

QUALITY RULES
- Workarounds are step-level concrete ("clamp a speed square as a fence and crosscut with the circular saw; cut miters 1/16 proud and sneak up with a block"), never "just be careful".
- store_cut workarounds must reference what the store saw CAN do (straight rips/crosscuts, +/- 1/8 in.) and what must still happen at home.
- readiness recommendation tells the user what to do FIRST and what to rehearse.
- Do not invent missing tools the user actually owns.`;

function mockToolAdaptation(ctx: AgentContext): ToolAdaptationResult {
  /* Re-run the deterministic tool-awareness pass on a scratch copy so this
     agent stays correct even if constraints changed after adaptation. */
  const scratch = deepClone(ctx.template);
  applyToolAwareness(scratch, ctx.constraints);

  const readiness = scratch.buildReadiness;
  if (ctx.constraints.budgetMax && scratch.budgetBreakdown.grandTotalHigh > ctx.constraints.budgetMax) {
    readiness.budgetConcerns.push(
      `The padded high estimate ($${scratch.budgetBreakdown.grandTotalHigh}) runs past your $${ctx.constraints.budgetMax} ceiling - the budget path or the listed material swaps close the gap.`
    );
  }
  if (ctx.constraints.storeCutsOnly) {
    readiness.recommendation =
      "You asked for store cuts only: every sheet and lumber cut is on the store cut sheet, and the steps assume rough store cuts trimmed with hand tools. " +
      readiness.recommendation;
  }
  return { toolAwareNotes: scratch.toolAwareNotes, buildReadiness: readiness };
}

export async function runToolAdaptationAgent(ctx: AgentContext): Promise<ToolAdaptationResult> {
  return completeAgent({ name: "toolAdaptationAgent", system: SYSTEM_PROMPT, ctx, mock: mockToolAdaptation(ctx), maxTokens: 2500 });
}
