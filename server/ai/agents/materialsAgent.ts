/**
 * Materials agent: the full materials + hardware bill with real product
 * specs, purposes, cost ranges, and budget/premium alternatives per item.
 */
import type { MaterialItem } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

export type MaterialsResult = { materials: MaterialItem[]; hardware: MaterialItem[] };

const SYSTEM_PROMPT = `You are the Materials agent for a DIY "inspired-by" build planner.

ROLE: Produce the complete bill of materials (sheet goods, lumber, fabric, fiber, finishes, adhesives) and the hardware list (fasteners, hinges, inserts, feet) for the recommended build path.

INPUT: Project context JSON + draft lists.

OUTPUT: JSON { materials: MaterialItem[], hardware: MaterialItem[] }. Each item: { name, category, quantity, specification, purpose, estimatedCostLow, estimatedCostHigh, budgetAlternative?, premiumAlternative?, existingInventorySubstitution?, notes? }.

QUALITY RULES
- Specifications a store employee could pull from the shelf: exact dimensions, grades, thread specs, product-class names ("3/4 in. x 4x8 B/BB birch ply", "#8 x 1-1/4 in. coarse washer-head pocket screws", "2 in. HD36 / 1.8 lb density foam").
- purpose says what the item does IN THIS BUILD, not generically.
- Quantities include selection margin where pros buy extra ("buy 4 boards to pick 3 straight").
- If the user declared existing inventory that covers an item, fill existingInventorySubstitution with the savings.
- Fastener lengths must be physically correct for the stock thicknesses used (call out through-poke risks).`;

function mockMaterials(ctx: AgentContext): MaterialsResult {
  const materials = deepClone(ctx.template.materials);
  const hardware = deepClone(ctx.template.hardware);
  const avoid = (ctx.constraints.avoidMaterials || []).map((a) => a.toLowerCase());
  for (const m of materials) {
    const hit = avoid.find((a) => a && (m.name.toLowerCase().includes(a) || m.specification.toLowerCase().includes(a)));
    if (hit) {
      m.notes = `${m.notes ? `${m.notes} ` : ""}You asked to avoid ${hit}: use the ${m.budgetAlternative || m.premiumAlternative || "listed alternative"} instead.`;
    }
  }
  return { materials, hardware };
}

export async function runMaterialsAgent(ctx: AgentContext): Promise<MaterialsResult> {
  return completeAgent({ name: "materialsAgent", system: SYSTEM_PROMPT, ctx, mock: mockMaterials(ctx), maxTokens: 4000 });
}
