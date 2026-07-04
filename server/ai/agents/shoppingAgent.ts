/**
 * Shopping agent: the store-trip-ready list, organized by store and
 * department in walking order, with specs an associate can act on.
 */
import type { ShoppingListDepartment } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone, retargetShoppingStore } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Shopping List agent for a DIY "inspired-by" build planner.

ROLE: Convert the bill of materials into the list someone actually shops with: grouped by store and department (in roughly the order you walk a big-box store), with quantity, spec, cost range, required flag, and in-store tips.

INPUT: Project context JSON (preferredStores matters) + the plan's materials/hardware.

OUTPUT: JSON array of ShoppingListDepartment: { store?, department, items: [{name, quantity, spec, estimatedCostLow, estimatedCostHigh, required, notes?}] }.

QUALITY RULES
- Departments match real store layouts (Lumber & Sheet Goods, Moulding & Trim, Hardware & Fasteners, Adhesives, Paint & Stain, Safety Gear; fabric/fiber items go to a fabric or craft store department).
- notes carry the in-store judgment calls ("sight down every board", "check the bolt-end label for the rub count", "get the panel cuts before leaving").
- Every required material from the BOM appears exactly once; optional items marked required=false with the reason in notes.
- Use the user's preferred store name where sensible; specialty goods keep their specialty store.`;

function mockShopping(ctx: AgentContext): ShoppingListDepartment[] {
  const scratch = deepClone(ctx.template);
  const store = ctx.constraints.preferredStores?.[0];
  if (store && store !== "Other") retargetShoppingStore(scratch, store);
  const departments = scratch.shoppingListByDepartment;

  /* flag existing-inventory items so the shopper skips them */
  for (const inv of ctx.constraints.existingInventory || []) {
    for (const dept of departments) {
      for (const item of dept.items) {
        if (item.name.toLowerCase().includes(inv.name.toLowerCase().split(" ")[0]) && inv.name.length > 3) {
          item.notes = `${item.notes ? `${item.notes} ` : ""}You may already have this (${inv.name}) - check before buying.`;
        }
      }
    }
  }
  return departments;
}

export async function runShoppingAgent(ctx: AgentContext): Promise<ShoppingListDepartment[]> {
  return completeAgent({ name: "shoppingAgent", system: SYSTEM_PROMPT, ctx, mock: mockShopping(ctx), maxTokens: 3500 });
}
