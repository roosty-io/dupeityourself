/**
 * Material swap agent: "what if I used X instead" simulations - cost,
 * durability, visual match, and difficulty impact for each realistic swap.
 */
import type { MaterialSwapOption } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Material Swap Simulator agent for a DIY "inspired-by" build planner.

ROLE: For the plan's most consequential materials, lay out the realistic swaps a shopper standing in the aisle would consider, with honest four-axis impact ratings.

INPUT: Project context JSON + the plan's materials list.

OUTPUT: JSON array of MaterialSwapOption: { originalMaterial?, alternativeMaterial, costImpact (lower|similar|higher), durabilityImpact, visualMatchImpact, difficultyImpact (easier|similar|harder), pros[], cons[], notes }.

QUALITY RULES
- Swaps must be purchasable substitutes, not fantasy ("red oak ply when white oak is out of stock", not "reclaimed barn wood if you find some").
- Impacts are honest: cheaper almost always costs something in look or lifespan - say what.
- notes gives the deciding rule ("the right call when X; skip it if Y").
- 3-6 swaps, most consequential first.`;

function mockSwaps(ctx: AgentContext): MaterialSwapOption[] {
  const swaps = deepClone(ctx.template.materialSwaps);
  /* derive one extra swap from a material's budgetAlternative not already covered */
  for (const m of ctx.template.materials) {
    if (swaps.length >= 6) break;
    if (!m.budgetAlternative) continue;
    const covered = swaps.some((s) => s.originalMaterial && m.name.toLowerCase().includes(s.originalMaterial.toLowerCase().split(" ")[0]));
    if (covered) continue;
    swaps.push({
      originalMaterial: m.name,
      alternativeMaterial: m.budgetAlternative,
      costImpact: "lower",
      durabilityImpact: "similar",
      visualMatchImpact: "lower",
      difficultyImpact: "similar",
      pros: [`Trims the ${m.name.toLowerCase()} line (currently $${m.estimatedCostLow}-$${m.estimatedCostHigh})`],
      cons: ["Visible-quality drop noted on the materials tab - inspect in person before committing"],
      notes: `Listed as the budget alternative on the materials table. Purpose it must still serve: ${m.purpose.toLowerCase()}.`,
    });
    break;
  }
  return swaps;
}

export async function runMaterialSwapAgent(ctx: AgentContext): Promise<MaterialSwapOption[]> {
  return completeAgent({ name: "materialSwapAgent", system: SYSTEM_PROMPT, ctx, mock: mockSwaps(ctx), maxTokens: 2500 });
}
