/**
 * Tools & skill agent: the full tool list (required vs optional, owned vs
 * missing, substitutes, rental advice) plus the multi-axis difficulty
 * breakdown for this user.
 */
import type { DifficultyBreakdown, ToolItem } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone, ownsTool } from "../generators";
import { completeAgent } from "./agentUtil";

export type ToolsSkillResult = { tools: ToolItem[]; difficultyBreakdown: DifficultyBreakdown };

const SYSTEM_PROMPT = `You are the Tools & Skill Assessment agent for a DIY "inspired-by" build planner.

ROLE: List every tool the recommended path needs, mark which the user owns, give substitutes and buy/rent guidance for the gaps, and break the difficulty down across the axes that actually decide whether this user succeeds.

INPUT: Project context JSON (ownedTools list matters most) + draft.

OUTPUT: JSON { tools: ToolItem[], difficultyBreakdown }. ToolItem: { name, required, category, purpose, substitute?, rentalRecommended?, owned?, beginnerNote?, estimatedCostIfBuying? }. DifficultyBreakdown: { overall (beginner|intermediate|advanced|professional), cuttingAccuracy?, assembly?, joinery?, finishMatching?, toolComplexity?, physicalHandling?, safetyRisk?, timeCommitment?, repairability?, beginnerTolerance?, notes[] }.

QUALITY RULES
- required=true only when no reasonable substitute exists; otherwise required=false with the substitute spelled out.
- owned flags must reflect the user's declared tools (fuzzy match: "Circular saw" owns "Circular saw, 7-1/4 in.").
- Buy-vs-rent advice includes real price ranges and an honest "not worth buying for one build" where true.
- Difficulty axes name the actual operations ("22.5-degree bevel rips over 82 in."), not abstractions.`;

function mockToolsSkill(ctx: AgentContext): ToolsSkillResult {
  const tools = deepClone(ctx.template.tools);
  const owned = ctx.constraints.ownedTools || [];
  for (const t of tools) t.owned = ownsTool(owned, t.name);

  const difficulty = deepClone(ctx.template.difficultyBreakdown);
  if (ctx.constraints.skillLevel === "beginner" && difficulty.overall !== "beginner") {
    difficulty.notes.push(
      `You marked yourself a beginner and this plan rates ${difficulty.overall}: the gap is concentrated in the few steps flagged with rehearsal instructions - do those rehearsals on scrap and the gap closes.`
    );
  }
  if (ctx.constraints.workspaceType === "apartment") {
    difficulty.notes.push(
      "Apartment workspace: lean on the store cut sheet for every sheet/lumber cut, do sanding outdoors or skip to hand-sanding, and check the finishing steps for low-odor product choices."
    );
  }
  return { tools, difficultyBreakdown: difficulty };
}

export async function runToolsSkillAgent(ctx: AgentContext): Promise<ToolsSkillResult> {
  return completeAgent({ name: "toolsSkillAgent", system: SYSTEM_PROMPT, ctx, mock: mockToolsSkill(ctx), maxTokens: 3000 });
}
