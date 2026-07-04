/**
 * Mini lesson agent: the just-in-time skill primers referenced from the
 * build steps - each teaches exactly one technique this plan uses.
 */
import type { MiniLesson } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Mini Lessons agent for a DIY "inspired-by" build planner.

ROLE: Write the short skill lessons this plan's steps link to - one technique each, teachable in two minutes of reading, practiced in ten minutes on scrap.

INPUT: Project context JSON + the plan's steps (their relatedMiniLessons ids define what is needed).

OUTPUT: JSON array of MiniLesson: { id, title, skillCategory, difficulty (beginner|intermediate|advanced), explanation, steps?, commonMistakes?, safetyNotes? }.

QUALITY RULES
- The explanation teaches the WHY in plain mechanical terms ("a pilot hole gives the shank clearance so threads pull wood together instead of wedging it apart") - understanding beats memorization.
- steps are the practice sequence, ending in a verifiable result.
- Every id referenced by any build step's relatedMiniLessons must exist in the output.
- Lessons match the user's skill level: assume zero jargon for beginners, name the jargon as you introduce it.`;

function mockMiniLessons(ctx: AgentContext): MiniLesson[] {
  const lessons = deepClone(ctx.template.miniLessons);

  /* guarantee every referenced lesson id exists */
  const referenced = new Set<string>();
  for (const step of ctx.template.steps) {
    for (const id of step.relatedMiniLessons || []) referenced.add(id);
  }
  for (const id of referenced) {
    if (!lessons.some((l) => l.id === id)) {
      lessons.push({
        id,
        title: id.replace(/^ml_/, "").replace(/_/g, " "),
        skillCategory: "Technique",
        difficulty: "beginner",
        explanation:
          "A technique referenced by one of the build steps. Practice it once on scrap material before the step that uses it - the step's own instructions carry the specifics.",
        steps: ["Read the referencing step end to end.", "Run the motion once on scrap.", "Check the result against the step's quality check before doing it for real."],
      });
    }
  }
  return lessons;
}

export async function runMiniLessonAgent(ctx: AgentContext): Promise<MiniLesson[]> {
  return completeAgent({ name: "miniLessonAgent", system: SYSTEM_PROMPT, ctx, mock: mockMiniLessons(ctx), maxTokens: 3000 });
}
