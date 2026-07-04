/**
 * Diagram agent: build diagrams as inline SVG, ASCII art, or rich text
 * descriptions - dimensioned views and assembly explosions.
 */
import type { DiagramSpec } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Diagram agent for a DIY "inspired-by" build planner.

ROLE: Produce the diagrams that answer the questions builders actually stop and squint at: overall dimensioned views, the trickiest joint/assembly exploded, cutting layouts, and technique close-ups.

INPUT: Project context JSON + the plan's dimensions and cut list.

OUTPUT: JSON array of DiagramSpec: { id, title, type (svg|ascii|description), description, svg?, ascii?, caption? }.

QUALITY RULES
- SVG diagrams: self-contained inline SVG with a viewBox, system-ui fonts, dimension lines with labels, warm palette (#F3E9D7 surfaces, #2F6F4F dimension lines, #A97B50 accents, #2B2926 outlines). No external refs.
- ASCII diagrams: monospace-safe, 70 columns max, labeled.
- Every dimension shown must match the plan's dimension list exactly - a diagram that disagrees with the cut list is worse than no diagram.
- captions carry the one insight the drawing alone cannot ("pedestal centers 22 in. from each end - the tip-resistance sweet spot").`;

function mockDiagrams(ctx: AgentContext): DiagramSpec[] {
  const diagrams = deepClone(ctx.template.diagrams);
  const userDims = ctx.constraints.dimensions;
  if (userDims && (userDims.width || userDims.height)) {
    diagrams.push({
      id: "dg_user_size_note",
      title: "Your size adjustment",
      type: "description",
      description: `You specified ${[
        userDims.width ? `${userDims.width} ${userDims.unit}. wide` : null,
        userDims.depth ? `${userDims.depth} ${userDims.unit}. deep` : null,
        userDims.height ? `${userDims.height} ${userDims.unit}. tall` : null,
      ]
        .filter(Boolean)
        .join(" x ")}. The dimensioned views above show the template size - scale the marked overall dimensions to yours and keep the internal proportions (member spacing, inset ratios) the same. The cut list quantities do not change; only the labeled lengths do.`,
      caption: "When scaling: change lengths, keep proportions, never thin the structural members.",
    });
  }
  return diagrams;
}

export async function runDiagramAgent(ctx: AgentContext): Promise<DiagramSpec[]> {
  return completeAgent({ name: "diagramAgent", system: SYSTEM_PROMPT, ctx, mock: mockDiagrams(ctx), maxTokens: 6000 });
}
