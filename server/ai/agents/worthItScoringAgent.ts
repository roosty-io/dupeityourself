/**
 * Worth-It scoring agent: the honest "should you even build this" verdict,
 * scored across savings, difficulty fit, tools, materials, visual match,
 * safety, and time.
 */
import type { SkillLevel, WorthItScore } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the DIY Worth-It Score agent for a DIY "inspired-by" build planner.

ROLE: Give an honest 0-100 verdict on whether THIS user should build THIS piece, with seven subscores and a recommendation. You are allowed - encouraged - to say "buy it instead" when the math is bad.

INPUT: Project context JSON (constraints matter a lot: budget, skill, tools).

OUTPUT: JSON WorthItScore: { score, verdict (excellent|good|mixed|poor|not_recommended), savingsPotential, difficultyFit, toolAccessibility, materialAvailability, visualMatchPotential, safetyRisk (higher=safer), timeCommitment (higher=less burden), explanation, recommendation }.

QUALITY RULES
- Subscores must reflect the user's actual constraints, not generic averages: a beginner facing an advanced build gets a low difficultyFit and the explanation says so.
- The explanation names the specific hard parts and the specific savings math.
- The recommendation is a direct instruction ("Build it, take the Balanced path, spend your care on X") - not hedging.
- score should be consistent with the subscores (roughly their weighted center).`;

const SKILL_ORDER: SkillLevel[] = ["beginner", "intermediate", "advanced", "professional"];

function mockWorthIt(ctx: AgentContext): WorthItScore {
  const base = { ...ctx.template.worthItScore };
  const c = ctx.constraints;
  const t = ctx.template;

  /* difficulty fit: user skill vs plan difficulty */
  const planLevel = SKILL_ORDER.indexOf(t.difficultyBreakdown.overall);
  const userLevel = SKILL_ORDER.indexOf(c.skillLevel);
  const gap = planLevel - userLevel;
  base.difficultyFit = Math.max(30, Math.min(96, base.difficultyFit - gap * 15 + (gap < 0 ? 6 : 0)));

  /* tool accessibility tracks the adapted readiness score */
  base.toolAccessibility = Math.max(35, Math.min(96, Math.round((t.buildReadiness.score + base.toolAccessibility) / 2)));

  /* budget fit nudges savings potential */
  if (c.budgetMax && t.budgetBreakdown.grandTotalHigh > c.budgetMax * 1.2) {
    base.savingsPotential = Math.max(35, base.savingsPotential - 12);
  }
  if (c.timeAvailability && /week(day|night)|evening|1 hour|limited/i.test(c.timeAvailability)) {
    base.timeCommitment = Math.max(35, base.timeCommitment - 8);
  }

  const weighted =
    base.savingsPotential * 0.2 +
    base.difficultyFit * 0.2 +
    base.toolAccessibility * 0.15 +
    base.materialAvailability * 0.1 +
    base.visualMatchPotential * 0.15 +
    base.safetyRisk * 0.1 +
    base.timeCommitment * 0.1;
  base.score = Math.round(weighted);
  base.verdict = base.score >= 85 ? "excellent" : base.score >= 70 ? "good" : base.score >= 50 ? "mixed" : base.score >= 30 ? "poor" : "not_recommended";

  if (gap > 0) {
    base.explanation += ` One honest caution for your skill level: this plan is rated ${t.difficultyBreakdown.overall} and you marked yourself ${c.skillLevel} - the beginner-oriented path and the rehearsal steps on scrap exist for exactly this gap.`;
  }
  return base;
}

export async function runWorthItScoringAgent(ctx: AgentContext): Promise<WorthItScore> {
  return completeAgent({ name: "worthItScoringAgent", system: SYSTEM_PROMPT, ctx, mock: mockWorthIt(ctx), maxTokens: 1500 });
}
