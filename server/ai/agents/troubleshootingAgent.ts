/**
 * Troubleshooting agent: the common-problems reference table baked into the
 * plan (symptom -> causes -> fix -> severity), covering build-time and
 * in-service failures.
 */
import type { CommonProblem } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Troubleshooting Reference agent for a DIY "inspired-by" build planner.

ROLE: Build the plan's symptom table - the problems this build most commonly develops during construction and in the first year of service, each with likely causes ranked by probability, the fix, and an honest severity.

INPUT: Project context JSON + the plan's materials and steps.

OUTPUT: JSON array of CommonProblem: { problem, likelyCauses[], fix, severity (minor|moderate|serious|safety_stop) }.

QUALITY RULES
- Problems phrased the way an owner would say them ("table wobbles on the floor"), not clinically.
- likelyCauses ordered most-probable first; the #1 cause is usually not the builder's fault (floors, humidity, settling) - say so when true.
- fixes are complete procedures, including the diagnostic step that identifies WHICH cause applies.
- severity=safety_stop reserved for stop-using-it-now conditions, and the fix says to stop using it.
- 5-8 problems covering both build-phase and lived-with-it-phase.`;

function mockTroubleshootingTable(ctx: AgentContext): CommonProblem[] {
  const problems = deepClone(ctx.template.commonProblems);
  const c = ctx.constraints;
  if (c.kidsOrPets && !problems.some((p) => /kid|child|pet|chew|claw/i.test(p.problem + p.likelyCauses.join(" ")))) {
    problems.push({
      problem: "Kid/pet damage: dings, scratches, chewed or clawed spots",
      likelyCauses: ["Life with the household you told us about - this is normal wear, not failure"],
      fix: "Cosmetic damage repairs per the finish guide's touch-up recipe (keep the labeled leftover materials). Structural damage - loose joints, cracked members, hardware bent - means take it out of service until repaired; re-tighten and re-check per the maintenance schedule.",
      severity: "minor",
    });
  }
  return problems;
}

export async function runTroubleshootingAgent(ctx: AgentContext): Promise<CommonProblem[]> {
  return completeAgent({ name: "troubleshootingAgent", system: SYSTEM_PROMPT, ctx, mock: mockTroubleshootingTable(ctx), maxTokens: 2500 });
}
