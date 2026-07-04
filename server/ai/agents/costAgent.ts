/**
 * Cost agent: the category-by-category budget breakdown with verified
 * arithmetic, plus the savings story against the reference price.
 */
import type { BudgetBreakdown, SavingsStory } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone, recomputeBudget } from "../generators";
import { completeAgent } from "./agentUtil";

export type CostResult = { budgetBreakdown: BudgetBreakdown; savingsStory: SavingsStory };

const SYSTEM_PROMPT = `You are the Cost Estimation agent for a DIY "inspired-by" build planner.

ROLE: Produce the budget breakdown (category lines with items, low/high, optional flags) and the savings story. Your arithmetic must be exact and you must show it in the notes.

INPUT: Project context JSON + the plan's materials/hardware lists.

OUTPUT: JSON { budgetBreakdown: {lines[{category, items[{name, costLow, costHigh, optional?}], subtotalLow, subtotalHigh}], materialsTotalLow/High, optionalToolsLow/High, grandTotalLow/High, referencePrice?, estimatedSavingsLow/High?, confidence, notes[]}, savingsStory: {referencePrice?, referenceLabel?, estimatedDiyCostLow/High, estimatedSavings?, savingsPercentage?, toolCostsIncluded, laborTimeTradeoff, explanation} }.

QUALITY RULES
- Subtotals must equal the sum of their items; grand totals must equal the sum of subtotals (+ optional items on the high side). Spell the math out in one budget note.
- referencePrice only when actually extracted from the page; otherwise leave it as a labeled assumption and say so in referenceLabel.
- The savings story includes the $/hour framing of labor-vs-savings.
- Optional tools live in their own bucket, excluded from the grand total; note this.
- Regional volatility gets one honest note (sheet goods and fabric swing 20-40%).`;

function mockCost(ctx: AgentContext): CostResult {
  const scratch = deepClone(ctx.template);
  recomputeBudget(scratch);
  const budget = scratch.budgetBreakdown;
  const story = scratch.savingsStory;

  const c = ctx.constraints;
  if (c.budgetMax && budget.grandTotalHigh > c.budgetMax) {
    budget.notes.push(
      `Heads up: the padded high estimate ($${budget.grandTotalHigh}) exceeds your $${c.budgetMax} ceiling by $${budget.grandTotalHigh - c.budgetMax}. The low estimate ($${budget.grandTotalLow}) fits; the difference is optional add-ons, contingency, and regional price swings.`
    );
  } else if (c.budgetMax) {
    budget.notes.push(`Comfortably inside your $${c.budgetMin ?? 0}-$${c.budgetMax} budget even at the padded high estimate.`);
  }
  return { budgetBreakdown: budget, savingsStory: story };
}

export async function runCostAgent(ctx: AgentContext): Promise<CostResult> {
  return completeAgent({ name: "costAgent", system: SYSTEM_PROMPT, ctx, mock: mockCost(ctx), maxTokens: 3500 });
}
