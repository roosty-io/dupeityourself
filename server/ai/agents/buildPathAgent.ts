/**
 * Build path agent: the 3-7 ways to build this piece (budget through pro),
 * each with honest costs, tradeoffs, and a recommendation reasoned from the
 * user's constraints.
 */
import type { BuildPath } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

export type BuildPathResult = { buildPaths: BuildPath[]; recommendedPathReason: string };

const SYSTEM_PROMPT = `You are the Build Paths agent for a DIY "inspired-by" build planner.

ROLE: Lay out the realistic ways to build this piece as distinct paths (minimum_viable_dupe, budget, beginner, balanced, closest_match, premium, pro - use the subset that makes sense), and recommend ONE for this specific user.

INPUT: Project context JSON (budget range, skill, owned tools, fidelity preference).

OUTPUT: JSON { buildPaths: BuildPath[], recommendedPathReason }. Each path: { id, name, label, estimatedCostLow, estimatedCostHigh, estimatedTime, difficulty, visualMatchScore, durabilityScore, requiredTools, pros, cons, bestFor, compromises, recommendationReason?, recommended? }.

QUALITY RULES
- Paths must be genuinely different builds (different materials/joinery/finish systems), not the same build at three prices.
- Exactly one path has recommended=true, chosen from the user's budget, skill, tools, and fidelity preference - and recommendedPathReason must cite those specifics.
- Cost ranges ascend with fidelity; visualMatchScore and cost should correlate honestly.
- cons must be real (a beginner path that loses the signature silhouette says so).`;

function mockBuildPaths(ctx: AgentContext): BuildPathResult {
  const paths = deepClone(ctx.template.buildPaths);
  const c = ctx.constraints;
  const recommended = paths.find((p) => p.recommended) || paths[0];

  const reasons: string[] = [];
  if (c.budgetMin || c.budgetMax) {
    const fits = (!c.budgetMax || recommended.estimatedCostLow <= c.budgetMax) && (!c.budgetMin || recommended.estimatedCostHigh >= c.budgetMin);
    reasons.push(
      fits
        ? `it sits inside your $${c.budgetMin ?? 0}-$${c.budgetMax ?? "?"} budget`
        : `it is the closest fit to your $${c.budgetMin ?? 0}-$${c.budgetMax ?? "?"} budget (see the budget path if the ceiling is hard)`
    );
  }
  reasons.push(`it matches your ${c.skillLevel} skill level with rehearsal steps where it stretches`);
  if (c.ownedTools.length > 0) {
    reasons.push(`your owned tools (${c.ownedTools.slice(0, 3).join(", ")}${c.ownedTools.length > 3 ? "…" : ""}) cover the required list, with workarounds for the gaps`);
  } else {
    reasons.push("its tool list has store-cut or substitute workarounds for everything you have not declared");
  }
  reasons.push(`your ${c.desiredFidelity.replace(/_/g, " ")} preference points here`);

  const reason = `${recommended.label} is the pick for you specifically: ${reasons.join("; ")}. ${ctx.template.recommendedPathReason}`;
  recommended.recommendationReason = reason.slice(0, 400);
  return { buildPaths: paths, recommendedPathReason: reason };
}

export async function runBuildPathAgent(ctx: AgentContext): Promise<BuildPathResult> {
  return completeAgent({ name: "buildPathAgent", system: SYSTEM_PROMPT, ctx, mock: mockBuildPaths(ctx), maxTokens: 3500 });
}
