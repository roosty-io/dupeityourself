/**
 * Finish matching agent: the complete finish system to hit the reference's
 * color/sheen/texture - products, test-board protocol, application steps,
 * cure windows, and the failure modes with fixes.
 */
import type { FinishGuide } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Finish Matching agent for a DIY "inspired-by" build planner.

ROLE: Reverse-engineer the reference's finish (or fabric/fiber presentation for soft goods) and specify a garage-achievable system that lands on the same color, sheen, and hand-feel - with the test protocol that prevents expensive surprises.

INPUT: Project context JSON + vision finish guesses.

OUTPUT: JSON FinishGuide: { referenceFinishDescription, confidence, recommendedFinishSystem[], budgetOption[], premiumOption[], stainPaintOptions[{name, type, note}], topcoatOptions[{name, note}], colorMatchingTips[], testBoardInstructions[], commonProblems[{problem, fix}], curingNotes[], applicationSteps[] }.

QUALITY RULES
- Name real product classes and widely-stocked examples (Varathane Ultimate WB Matte, Minwax Polycrylic, Rust-Oleum 2X) - a store employee should be able to shelf-pull the system.
- Chemistry honesty: never spec an ambering product over a pale target; call out incompatibilities explicitly.
- Test boards are NON-NEGOTIABLE and use the same wood/fabric + sanding schedule as the piece; say so.
- Cure times distinguish dry-to-touch vs usable vs fully cured, with kid-household implications.`;

function mockFinish(ctx: AgentContext): FinishGuide {
  const guide = deepClone(ctx.template.finishGuide);
  const c = ctx.constraints;
  if (c.kidsOrPets) {
    guide.curingNotes.unshift(
      "Kid/pet household: treat every cure window here as a hard rule, not a suggestion - 'dry to touch' is not 'safe to chew on or scrub'."
    );
  }
  if (c.workspaceType === "apartment") {
    guide.recommendedFinishSystem.push(
      "Apartment note: stick to the water-based/low-odor options in this guide, finish near an open window with cross-ventilation, and skip any aerosol steps or do them outdoors."
    );
  }
  const prefs = (c.materialPreferences || []).join(" ").toLowerCase();
  if (prefs.includes("no voc") || prefs.includes("low voc") || prefs.includes("natural")) {
    guide.premiumOption.push("Zero-VOC direction: a hardwax oil system (plant-based 2K oils) trades some scratch resistance for the cleanest chemistry and easiest spot repair.");
  }
  return guide;
}

export async function runFinishMatchingAgent(ctx: AgentContext): Promise<FinishGuide> {
  return completeAgent({ name: "finishMatchingAgent", system: SYSTEM_PROMPT, ctx, mock: mockFinish(ctx), maxTokens: 3000 });
}
