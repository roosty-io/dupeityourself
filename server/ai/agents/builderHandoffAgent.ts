/**
 * Builder handoff agent: the commission-ready brief for hiring a local
 * builder/upholsterer/maker instead of DIYing - spec, expectations,
 * questions to ask, and a copy-paste quote request message.
 */
import type { BuilderHandoffBrief } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Builder Handoff agent for a DIY "inspired-by" build planner.

ROLE: Package this project as a professional commission brief: everything a local furniture maker / upholsterer / fiber artist needs to quote accurately, the quality bar in inspectable terms, the smart questions that reveal builder quality, and a friendly ready-to-send quote request.

INPUT: Project context JSON + the plan (dimensions, materials, finish).

OUTPUT: JSON BuilderHandoffBrief: { projectSummary, referenceStyle, desiredDimensions, materials[], finish, constructionNotes[], budgetTarget, qualityExpectations[], questionsForBuilder[], quoteRequestMessage }.

QUALITY RULES
- referenceStyle frames this as an inspired-by commission in the same spirit - an original piece, never a reproduction of a protected design.
- budgetTarget is a realistic commissioned range ABOVE the DIY materials cost, with the DIY cost cited as context ("the gap is what quality labor is worth").
- qualityExpectations are inspectable at pickup ("miters read as lines, not gaps, at arm's length").
- questionsForBuilder expose craft decisions (construction method, movement handling, finish system, sample availability, lead time).
- quoteRequestMessage is warm, complete, and pasteable into an email or DM as-is.`;

function mockBuilderHandoff(ctx: AgentContext): BuilderHandoffBrief {
  const brief = deepClone(ctx.template.builderHandoff);
  const c = ctx.constraints;
  if (c.dimensions?.width || c.dimensions?.height) {
    const dims = [
      c.dimensions?.width ? `${c.dimensions.width} ${c.dimensions.unit}. W` : null,
      c.dimensions?.depth ? `${c.dimensions.depth} ${c.dimensions.unit}. D` : null,
      c.dimensions?.height ? `${c.dimensions.height} ${c.dimensions.unit}. H` : null,
    ]
      .filter(Boolean)
      .join(" x ");
    brief.desiredDimensions = `${dims} (customer-specified). ${brief.desiredDimensions}`;
  }
  if (c.kidsOrPets && !brief.constructionNotes.some((n) => /kid|child|pet/i.test(n))) {
    brief.constructionNotes.push("Household includes kids/pets: eased edges, cured non-toxic finishes, and conservative stability are requirements, not preferences.");
  }
  if (c.notes) {
    brief.constructionNotes.push(`Customer notes: ${c.notes.slice(0, 200)}`);
  }
  return brief;
}

export async function runBuilderHandoffAgent(ctx: AgentContext): Promise<BuilderHandoffBrief> {
  return completeAgent({ name: "builderHandoffAgent", system: SYSTEM_PROMPT, ctx, mock: mockBuilderHandoff(ctx), maxTokens: 2000 });
}
