/**
 * Safety design review agent: the formal end-of-pipeline review - overall
 * risk, hazard table, PPE, child/pet notes, structural notes, finish
 * toxicity, and the professional-review recommendation.
 */
import type { SafetyDesignReview } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import type { SafetyResult } from "./safetyAgent";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Safety Design Review agent for a DIY "inspired-by" build planner - the last safety gate before the plan ships.

ROLE: Review the COMPLETE plan (materials, steps, hardware, finish system) as a skeptical shop-safety officer. Produce the formal review: overall risk, the consolidated hazard table, required PPE per activity, child/pet-specific notes, structural notes, finish toxicity notes, and whether a professional should look at this before it is built.

INPUT: Project context JSON + the earlier safety scan.

OUTPUT: JSON SafetyDesignReview: { overallRisk (low|medium|high|professional_review_recommended|unsupported), summary, hazards: RiskFlag[], ppe[], childPetNotes[], structuralNotes[], finishToxicityNotes[], professionalReviewRecommended, professionalReviewReason? }.

QUALITY RULES
- The summary is honest about what the real risks are and are not - no theater, no minimizing.
- structuralNotes must include the "conservative design estimates, not certified ratings" policy line whenever load-bearing use exists.
- Finish toxicity: distinguish wet/curing hazards from cured-film reality; rag disposal note whenever oils are involved.
- professionalReviewRecommended=true escalates, never downgrades, the earlier scan's high-risk finding.`;

function mockSafetyDesignReview(ctx: AgentContext): SafetyDesignReview {
  const review = deepClone(ctx.template.safetyReview);
  const scan = ctx.outputs["safetyAgent"] as SafetyResult | undefined;
  if (scan) {
    for (const flag of scan.riskFlags) {
      if (!review.hazards.some((h) => h.category.toLowerCase() === flag.category.toLowerCase())) {
        review.hazards.push(flag);
      }
    }
    if (scan.highRisk && !review.professionalReviewRecommended) {
      review.professionalReviewRecommended = true;
      review.professionalReviewReason =
        "The safety scan raised at least one high-severity flag - have a qualified professional review the structural/mounting details before building.";
      review.overallRisk = "professional_review_recommended";
    }
  }
  if (ctx.constraints.weightBearing && !review.structuralNotes.some((n) => /not.*(certified|guaranteed)|no guaranteed/i.test(n))) {
    review.structuralNotes.push(
      "No guaranteed load ratings are stated or implied anywhere in this plan; all figures are conservative design estimates for a one-off build."
    );
  }
  return review;
}

export async function runSafetyDesignReviewAgent(ctx: AgentContext): Promise<SafetyDesignReview> {
  return completeAgent({ name: "safetyDesignReviewAgent", system: SYSTEM_PROMPT, ctx, mock: mockSafetyDesignReview(ctx), maxTokens: 2500 });
}
