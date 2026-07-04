/**
 * Safety agent: first-pass risk scan - flags with level, category, issue,
 * and mitigation, plus the overall high-risk determination that can route
 * a project to "professional review recommended".
 */
import type { RiskFlag } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

export type SafetyResult = { riskFlags: RiskFlag[]; highRisk: boolean };

const SYSTEM_PROMPT = `You are the Safety Scan agent for a DIY "inspired-by" build planner.

ROLE: Scan the project for every meaningful hazard across build-time (tools, dust, vapors, lifting) and in-service life (stability, tip-over, pinch points, finish toxicity, wall anchoring), and flag anything that should trigger a professional review.

INPUT: Project context JSON (kidsOrPets and weightBearing matter a lot).

OUTPUT: JSON { riskFlags: [{level (low|medium|high|professional_review_recommended|unsupported), category, issue, mitigation}], highRisk: boolean }.

QUALITY RULES
- Mitigations are specific and buildable ("pedestal centers at least 40 in. apart; felt-pad shims for floor variance"), never "use caution".
- NEVER state guaranteed load ratings - conservative design estimates only, labeled as such.
- highRisk=true (and a professional_review_recommended flag) for: wall-mounted furniture over beds/cribs, lofted sleeping surfaces, anything electrical/plumbing/gas, structural modifications to the home, or glass above head height.
- Kid/pet households upgrade relevant severities one notch and add cure-time and tip-over specifics.`;

function mockSafety(ctx: AgentContext): SafetyResult {
  const flags: RiskFlag[] = deepClone(ctx.template.safetyReview.hazards);
  const c = ctx.constraints;

  if (c.kidsOrPets && !flags.some((f) => /child|kid|pet|pinch|tip/i.test(f.issue + f.category))) {
    flags.push({
      level: "low",
      category: "Kids & pets",
      issue: "Small children or pets share the home with this piece.",
      mitigation:
        "All finish cure windows are hard requirements before contact; edges get eased/rounded per the steps; any tip-prone or pinch-prone hardware in this plan is spec'd with its safety mitigation included.",
    });
  }
  if (c.weightBearing && !flags.some((f) => /load|weight|structur|stabil/i.test(f.issue + f.category))) {
    flags.push({
      level: "medium",
      category: "Structural use",
      issue: "The piece will bear meaningful weight in service.",
      mitigation:
        "Joinery and fastener specs in this plan are sized with conservative margins for the stated use. These are design estimates for a one-off build, not certified ratings - do not exceed the described use, and re-tighten mechanical fasteners after the first week.",
    });
  }
  const highRisk = flags.some((f) => f.level === "high" || f.level === "professional_review_recommended" || f.level === "unsupported");
  return { riskFlags: flags, highRisk };
}

export async function runSafetyAgent(ctx: AgentContext): Promise<SafetyResult> {
  return completeAgent({ name: "safetyAgent", system: SYSTEM_PROMPT, ctx, mock: mockSafety(ctx), maxTokens: 2000 });
}
