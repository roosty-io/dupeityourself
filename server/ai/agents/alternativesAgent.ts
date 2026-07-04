/**
 * Alternatives agent: the "same piece, different life circumstances"
 * versions - cheapest, tool-limited, weekend, premium, resized.
 */
import type { AlternativeOption } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Alternatives agent for a DIY "inspired-by" build planner.

ROLE: Generate the genuinely useful alternative versions of this build - each a coherent variant someone would actually choose, with its own cost range, time, pros/cons, and the concrete key changes from the main plan.

INPUT: Project context JSON + the main plan summary.

OUTPUT: JSON array of AlternativeOption: { id, name, focus (cheapest|beginner|premium|tool_limited|weekend|durable|smaller|larger|minimum_viable_dupe), description, estimatedCostLow, estimatedCostHigh, estimatedTime, pros[], cons[], keyChanges[] }.

QUALITY RULES
- Each alternative answers a real situation ("no saw at all", "one weekend only", "room is too small for the reference size").
- keyChanges are actionable diffs from the main plan ("all cuts store-made", "top 70-1/2 x 34-1/2 before banding"), not vibes.
- cons include the emotional truth where relevant ("you will probably want to rebuild the pedestals later - budget emotionally for that").
- 3-6 alternatives; names memorable but plain.`;

function mockAlternatives(ctx: AgentContext): AlternativeOption[] {
  const alts = deepClone(ctx.template.alternatives);
  const c = ctx.constraints;

  /* surface the most relevant alternative first for this user */
  const priority = (a: AlternativeOption): number => {
    if (c.storeCutsOnly && a.focus === "tool_limited") return 0;
    if (c.budgetMax && a.estimatedCostHigh <= c.budgetMax && a.focus === "cheapest") return 1;
    if (c.skillLevel === "beginner" && a.focus === "beginner") return 1;
    if (c.durability === "heavy_duty" && a.focus === "durable") return 1;
    if (/week(end)?s? only|one weekend/i.test(c.timeAvailability || "") && a.focus === "weekend") return 1;
    return 5;
  };
  alts.sort((a, b) => priority(a) - priority(b));

  if (c.dimensions?.width && !alts.some((a) => a.focus === "smaller" || a.focus === "larger")) {
    alts.push({
      id: "alt_custom_size",
      name: "Your-Size Version",
      focus: "smaller",
      description: `The same design scaled to your stated ${c.dimensions.width} ${c.dimensions.unit}. width - proportions preserved, cut lengths adjusted, structure unchanged.`,
      estimatedCostLow: Math.round(ctx.template.snapshot.estimatedCostLow * 0.9),
      estimatedCostHigh: Math.round(ctx.template.snapshot.estimatedCostHigh * 0.95),
      estimatedTime: ctx.template.snapshot.estimatedTime,
      pros: ["Fits your actual space instead of the catalog's", "Usually slightly cheaper in materials"],
      cons: ["You own the re-measuring: every labeled length in the cut list shifts"],
      keyChanges: ["Scale the overall dimensions, keep member spacing proportional", "Re-check the yield plan - smaller parts sometimes free a whole sheet"],
    });
  }
  return alts;
}

export async function runAlternativesAgent(ctx: AgentContext): Promise<AlternativeOption[]> {
  return completeAgent({ name: "alternativesAgent", system: SYSTEM_PROMPT, ctx, mock: mockAlternatives(ctx), maxTokens: 3000 });
}
