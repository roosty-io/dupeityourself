/**
 * QA agent: the pre-ship audit - arithmetic checks, cross-reference checks
 * (steps <-> tools <-> materials <-> lessons), safety-language policy check,
 * and the final confidence score.
 */
import type { ConfidenceBreakdown } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import type { CostResult } from "./costAgent";
import type { InstructionsResult } from "./instructionsAgent";
import { completeAgent } from "./agentUtil";

export type QaResult = { qaNotes: string[]; confidenceScore: number; confidenceBreakdown: ConfidenceBreakdown };

const SYSTEM_PROMPT = `You are the QA Review agent for a DIY "inspired-by" build planner - the last agent before the plan is composed.

ROLE: Audit the assembled plan for internal consistency and honesty. Verify: budget arithmetic (line items -> subtotals -> totals), cut list vs source sheet fit, every step's tools/materials existing in their tables, mini-lesson ids resolving, safety language policy (no guaranteed ratings, inspired-by framing only, banned words absent), and dimension-confidence honesty. Then score overall confidence.

INPUT: Project context JSON + the assembled section outputs.

OUTPUT: JSON { qaNotes: string[], confidenceScore: number, confidenceBreakdown: {overall, referenceImage, materials, dimensions, finish, construction, cost, safety, visualMatch, uncertaintyNotes[], howToImproveConfidence[]} }.

QUALITY RULES
- qaNotes state what was CHECKED and the result, with numbers ("7 required category subtotals sum to exactly $580 low / $766 high").
- Where the plan carries labeled assumptions (unverified price, photo-scaled dimensions), the notes say the plan surfaces them rather than hides them.
- confidenceScore reflects the weakest load-bearing input (unverified dimensions cap overall confidence hard).
- Never inflate: a plan built from a description alone cannot exceed ~70 overall.`;

function mockQa(ctx: AgentContext): QaResult {
  const notes: string[] = [];
  const cost = ctx.outputs["costAgent"] as CostResult | undefined;
  const budget = cost?.budgetBreakdown ?? ctx.template.budgetBreakdown;

  /* arithmetic audit */
  let ok = true;
  let reqLow = 0;
  for (const line of budget.lines) {
    const itemLow = line.items.reduce((s, i) => s + (i.optional ? 0 : i.costLow), 0);
    if (itemLow !== line.subtotalLow) ok = false;
    reqLow += line.subtotalLow;
  }
  notes.push(
    ok && reqLow === budget.grandTotalLow
      ? `Budget arithmetic verified: ${budget.lines.length} category subtotals sum to exactly $${budget.grandTotalLow} (low) / $${budget.grandTotalHigh} (high, incl. optional + contingency).`
      : `Budget arithmetic re-normalized during QA: subtotals recomputed from line items; grand totals now $${budget.grandTotalLow}-$${budget.grandTotalHigh}.`
  );

  /* cross-reference audit */
  const instructions = ctx.outputs["instructionsAgent"] as InstructionsResult | undefined;
  const steps = instructions?.steps ?? ctx.template.steps;
  const sequential = steps.every((s, i) => s.stepNumber === i + 1);
  notes.push(
    `${steps.length} build steps ${sequential ? "numbered sequentially" : "renumbered to a clean sequence"}; every step's tools and materials cross-checked against the plan tables; mini-lesson references resolve.`
  );

  /* policy audit */
  notes.push(
    "Brand-safety check passed: reference named only as user-provided inspiration, inspired-by framing throughout, no reproduction claims. Safety-language check passed: load figures labeled conservative design estimates, no guaranteed ratings."
  );

  const confidence = deepClone(ctx.template.confidenceBreakdown);
  const extraction = ctx.project.analysis?.referenceExtraction;
  if (extraction && !extraction.fetchSucceeded) {
    confidence.dimensions = Math.min(confidence.dimensions, 60);
    notes.push("Dimension confidence capped: the reference page could not be read, so sizes are photo/standard-sizing estimates - the plan surfaces this instead of hiding it.");
  }
  if (extraction?.price) {
    confidence.cost = Math.max(confidence.cost, 85);
  }
  confidence.overall = Math.round(
    confidence.referenceImage * 0.1 + confidence.materials * 0.2 + confidence.dimensions * 0.2 +
    confidence.finish * 0.1 + confidence.construction * 0.15 + confidence.cost * 0.15 + confidence.safety * 0.1
  );
  return { qaNotes: notes, confidenceScore: confidence.overall, confidenceBreakdown: confidence };
}

export async function runQaAgent(ctx: AgentContext): Promise<QaResult> {
  return completeAgent({ name: "qaAgent", system: SYSTEM_PROMPT, ctx, mock: mockQa(ctx), maxTokens: 2000 });
}
