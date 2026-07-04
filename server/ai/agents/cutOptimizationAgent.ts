/**
 * Cut optimization agent: the cut list, sheet/board yield plans with waste
 * percentages and sequencing, and the store cut sheet for saw-less builders.
 */
import type { CutListItem, CutOptimizationPlan, StoreCutSheet } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone, ensureStoreCutSheet, ownsTool } from "../generators";
import { completeAgent } from "./agentUtil";

export type CutOptimizationResult = {
  cutList: CutListItem[];
  cutOptimizationPlans: CutOptimizationPlan[];
  storeCutSheet?: StoreCutSheet;
};

const SYSTEM_PROMPT = `You are the Cut Optimization agent for a DIY "inspired-by" build planner.

ROLE: Produce the part-by-part cut list, the yield plan for each source sheet/board (which parts come from where, in what order, with waste %), and - when the user lacks a saw or asked for store cuts - a store cut sheet the panel-saw associate can follow.

INPUT: Project context JSON (ownedTools, storeCutsOnly) + draft.

OUTPUT: JSON { cutList: [{partName, quantity, material, dimensions, notes?}], cutOptimizationPlans: [{material, sourceSize, cuts[{partName, quantity, dimensions, precision (rough|finish), notes?}], estimatedWastePercent, grainDirectionNotes?, sequenceNotes[]}], storeCutSheet?: {storeName, intro, requests[{material, buySize, requestedCuts[{label, cutTo, oversizedBy?, finalTrimAtHome, notes?}]}], warnings[], homeTrimNotes[]} }.

QUALITY RULES
- Parts must physically fit their source sheets including ~1/8 in. kerf; waste % should be honest.
- Grain direction called out wherever it shows; "grain irrelevant, chase yield" where hidden.
- Sequence notes capture the pro tricks (cut all same-angle bevels in one session; keep factory edges as references).
- Store cuts are ROUGH break-downs, oversized for home trimming; say so and warn about +/- 1/8 in. tolerance.
- Include spare parts where first attempts commonly fail.`;

function mockCutOptimization(ctx: AgentContext): CutOptimizationResult {
  const scratch = deepClone(ctx.template);
  const owned = ctx.constraints.ownedTools || [];
  const hasSaw = ownsTool(owned, "Circular saw") || ownsTool(owned, "Table saw") || ownsTool(owned, "Miter saw") || ownsTool(owned, "Jigsaw");
  if ((ctx.constraints.storeCutsOnly || !hasSaw) && !scratch.storeCutSheet) {
    ensureStoreCutSheet(scratch, ctx.constraints.preferredStores?.[0] || "Home Depot");
  }
  if (scratch.storeCutSheet && ctx.constraints.storeCutsOnly) {
    scratch.storeCutSheet.intro = `You asked for store cuts only, so this sheet covers every cut in the plan. ${scratch.storeCutSheet.intro}`;
  }
  return {
    cutList: scratch.cutList,
    cutOptimizationPlans: scratch.cutOptimizationPlans,
    storeCutSheet: scratch.storeCutSheet,
  };
}

export async function runCutOptimizationAgent(ctx: AgentContext): Promise<CutOptimizationResult> {
  return completeAgent({ name: "cutOptimizationAgent", system: SYSTEM_PROMPT, ctx, mock: mockCutOptimization(ctx), maxTokens: 3500 });
}
