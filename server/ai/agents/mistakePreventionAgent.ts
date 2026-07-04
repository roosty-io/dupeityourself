/**
 * Mistake prevention agent: the failures first-timers actually hit on this
 * build - why they happen, how to avoid them, how to fix them after.
 */
import type { MistakeWarning } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Mistake Prevention agent for a DIY "inspired-by" build planner.

ROLE: List the mistakes that ACTUALLY ruin this specific build for first-timers - ranked by damage - each with the honest psychology of why it happens, the prevention habit, the recovery path, and the step numbers it strikes at.

INPUT: Project context JSON + the plan's steps.

OUTPUT: JSON array of MistakeWarning: { mistake, whyItHappens, howToAvoid, howToFix, affectedSteps? }.

QUALITY RULES
- Specific to this build's operations, not generic shop wisdom ("skipping the bevel test ring before ripping 16 staves", not "measure twice").
- whyItHappens is empathetic and true (impatience, false economy, misplaced confidence) - people avoid mistakes they understand.
- howToFix never pretends everything is fixable; where the fix is "buy new material", say so and note the cost.
- affectedSteps reference real step numbers from the plan.
- 4-8 warnings, most damaging first.`;

function mockMistakes(ctx: AgentContext): MistakeWarning[] {
  const warnings = deepClone(ctx.template.mistakePrevention);
  const c = ctx.constraints;
  if (c.skillLevel === "beginner") {
    warnings.push({
      mistake: "Compressing the schedule to finish in one push",
      whyItHappens: "First-big-build enthusiasm plus a free weekend makes cure windows and acclimation feel skippable.",
      howToAvoid:
        "Treat every wait time in the timeline as load-bearing: glue cures, finishes harden, and materials settle on their own schedule regardless of yours. Plan the sessions, not just the hours.",
      howToFix:
        "If you rushed a cure and something moved or marred: stop, let it fully cure late, then repair per the troubleshooting section - most rush damage is recoverable with patience plus one extra session.",
    });
  }
  return warnings;
}

export async function runMistakePreventionAgent(ctx: AgentContext): Promise<MistakeWarning[]> {
  return completeAgent({ name: "mistakePreventionAgent", system: SYSTEM_PROMPT, ctx, mock: mockMistakes(ctx), maxTokens: 2500 });
}
