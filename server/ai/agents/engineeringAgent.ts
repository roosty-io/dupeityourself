/**
 * Engineering agent: structure and joinery sanity - design simplifications
 * from the factory original, the minimum viable dupe, and the dimension set
 * with per-dimension sources and confidence.
 */
import type { BuildPlan, DesignSimplifierNotes, MinimumViableDupe } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

export type EngineeringResult = {
  designSimplifier: DesignSimplifierNotes;
  minimumViableDupe: MinimumViableDupe;
  dimensions: BuildPlan["dimensions"];
};

const SYSTEM_PROMPT = `You are the Engineering & Design Simplification agent for a DIY "inspired-by" build planner.

ROLE: Convert factory construction into garage-buildable construction without losing the silhouette. Identify which original details are hard and why, define each simplification with its honest fidelity impact, define the minimum viable dupe, and settle the dimension list.

INPUT: Project context JSON + vision analysis.

OUTPUT: JSON { designSimplifier: {difficultOriginalDetails[{detail, whyDifficult}], simplifications[{original, simplified, fidelityImpact}], preservedElements[], changedElements[], removedElements[], fidelityLossSummary, rationale}, minimumViableDupe: {summary, mustPreserveElements[], canSimplifyElements[], canRemoveElements[], constructionApproach, estimatedCostLow, estimatedCostHigh, estimatedTime, fidelityTradeoff}, dimensions: [{label, value, source (user|product_page|estimated|standard), confidence?}] }.

QUALITY RULES
- Every simplification trades an invisible or equipment-dependent detail for one an amateur can execute crisply - state the trade explicitly.
- Structural changes stay conservative: hidden joints may simplify, safety margins may not shrink.
- dimensions: user-provided values get source "user" and high confidence; photo-scaled estimates stay labeled "estimated" with honest confidence (40-60).
- Never claim guaranteed load capacity anywhere.`;

function mockEngineering(ctx: AgentContext): EngineeringResult {
  const t = ctx.template;
  const result: EngineeringResult = {
    designSimplifier: deepClone(t.designSimplifier),
    minimumViableDupe: deepClone(t.minimumViableDupe),
    dimensions: deepClone(t.dimensions),
  };
  const c = ctx.constraints;
  if (c.skillLevel === "beginner") {
    result.designSimplifier.rationale +=
      " Because you marked yourself a beginner, the simplifications lean one notch further toward forgiving techniques - each one is reversible if your skills outgrow it mid-build.";
  }
  if (c.knownReferenceDimensions) {
    result.dimensions.unshift({
      label: "Reference dimensions (user-reported)",
      value: c.knownReferenceDimensions.slice(0, 80),
      source: "user",
      confidence: 90,
    });
  }
  return result;
}

export async function runEngineeringAgent(ctx: AgentContext): Promise<EngineeringResult> {
  return completeAgent({ name: "engineeringAgent", system: SYSTEM_PROMPT, ctx, mock: mockEngineering(ctx), maxTokens: 3000 });
}
