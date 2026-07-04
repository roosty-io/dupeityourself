/**
 * Instructions agent: the numbered build steps (goal, tools, materials,
 * instructions, quality checks, common mistakes), the phase timeline, and
 * the pre-build checklist.
 */
import type { BuildStep, ProjectTimelinePhase } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone, ownsTool } from "../generators";
import { completeAgent } from "./agentUtil";

export type InstructionsResult = {
  steps: BuildStep[];
  projectTimeline: ProjectTimelinePhase[];
  preBuildChecklist: string[];
};

const SYSTEM_PROMPT = `You are the Build Instructions agent for a DIY "inspired-by" build planner.

ROLE: Write the complete numbered step sequence a first-time builder of this plan's level can follow without guessing, plus the session-by-session timeline and the pre-build checklist.

INPUT: Project context JSON + the plan's cut list, materials, tools.

OUTPUT: JSON { steps: BuildStep[], projectTimeline: ProjectTimelinePhase[], preBuildChecklist: string[] }. BuildStep: { stepNumber, title, estimatedTime, goal, toolsNeeded[], materialsNeeded[], instructions[], measurementNotes?, safetyNotes?, qualityCheck?, commonMistake?, relatedMiniLessons?, phase? }.

QUALITY RULES
- Each step has ONE goal; instructions are imperative, concrete, and dimensioned ("rip to 38-1/2 in. measuring from the FACTORY edge at both ends"), 3-6 bullets.
- qualityCheck is objectively verifiable ("diagonals within 1/16 in."), not "looks good".
- commonMistake names the failure a first-timer actually makes at that step and why.
- Steps that are unforgiving get a rehearsal-on-scrap instruction built in.
- Timeline groups steps into realistic sessions with wait/cure windows called out; never let glue/finish cure times hide inside "hands-on hours".
- Every tool referenced must exist in the plan's tool list; every material in its materials list.`;

function mockInstructions(ctx: AgentContext): InstructionsResult {
  const scratch = deepClone(ctx.template);
  const steps = scratch.steps;
  const owned = ctx.constraints.ownedTools || [];

  /* annotate steps that lean on tools the user lacks with the workaround pointer */
  for (const step of steps) {
    const missing = step.toolsNeeded.filter((tool) => {
      const isRequired = scratch.tools.find((t) => t.name.toLowerCase().includes(tool.toLowerCase().split(" ")[0]));
      return isRequired && !ownsTool(owned, tool) && !/tape|square|ruler|pencil|clamps?|scissors|fork|hammer|marker|straightedge|awl/i.test(tool);
    });
    if (missing.length > 0) {
      const note = `Tool note: you have not listed ${missing.join(" / ")} - see the Tools tab workaround before starting this step.`;
      if (!step.measurementNotes) step.measurementNotes = [note];
      else if (!step.measurementNotes.includes(note)) step.measurementNotes.push(note);
    }
  }

  /* renumber defensively so the sequence is always 1..n */
  steps.forEach((s, i) => (s.stepNumber = i + 1));

  const checklist = scratch.preBuildChecklist;
  if (ctx.constraints.timeAvailability) {
    checklist.push(`Your stated availability ("${ctx.constraints.timeAvailability}") - map the timeline sessions onto real calendar days before buying perishable materials.`);
  }
  return { steps, projectTimeline: scratch.projectTimeline, preBuildChecklist: checklist };
}

export async function runInstructionsAgent(ctx: AgentContext): Promise<InstructionsResult> {
  return completeAgent({ name: "instructionsAgent", system: SYSTEM_PROMPT, ctx, mock: mockInstructions(ctx), maxTokens: 8000 });
}
