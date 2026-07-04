/**
 * Feasibility question agent: the handful of smart questions whose answers
 * actually change the plan - each with why-it-matters, a skip assumption,
 * and a requiredForSafety flag where the answer gates safe design choices.
 */
import type { FeasibilityQuestion } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { deepClone } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Feasibility Questions agent for a DIY "inspired-by" build planner.

ROLE: Ask 3-6 questions whose answers materially change the cut list, budget, or safety posture. Never ask filler.

INPUT: Project context JSON.

OUTPUT: JSON array of FeasibilityQuestion: { id, question, whyItMatters, answerType (text|number|single_choice|multi_choice|boolean), options?, requiredForSafety, assumptionIfSkipped }.

QUALITY RULES
- whyItMatters must name the concrete downstream consequence ("an 84 in. top needs a full 8 ft sheet; 72 in. frees offcut material").
- Every question has an honest assumptionIfSkipped so the pipeline can proceed without answers.
- requiredForSafety=true for anything gating child safety, wall anchoring, weight bearing, or finish toxicity. Wall-mounted items and kid-adjacent items MUST include at least one safety-required question.
- Category-appropriate: fabric/foam questions for upholstery, fiber/scale for weaving, size/joinery/finish for woodworking.`;

function mockQuestions(ctx: AgentContext): FeasibilityQuestion[] {
  const questions: FeasibilityQuestion[] = deepClone(ctx.template.feasibilityQuestions).map((q) => ({
    ...q,
    answer: undefined,
  }));
  const c = ctx.constraints;
  const cat = ctx.project.category;

  const hangs = cat === "weaving" || cat === "decor_craft";
  if (hangs && !questions.some((q) => q.id === "q_wall_anchor")) {
    questions.push({
      id: "q_wall_anchor",
      question: "What is the wall where this will hang (drywall, plaster, brick), and is it above a bed, couch, or child play area?",
      whyItMatters:
        "Anything hung over people gets conservative mounting: a rated hook into a stud or a rated anchor, never a bare nail in drywall. The wall type decides which hardware goes on the shopping list.",
      answerType: "single_choice",
      options: ["Drywall (will find a stud)", "Drywall (no stud available)", "Plaster", "Brick/masonry", "Not sure"],
      requiredForSafety: true,
      assumptionIfSkipped: "We assume drywall and spec a rated anchor good for several times the piece's weight - a conservative default, not a certified rating.",
    });
  }
  if (c.weightBearing && !questions.some((q) => q.requiredForSafety && /weight|load|climb|lean|sit/i.test(q.question))) {
    questions.push({
      id: "q_weight_use",
      question: "What is the heaviest realistic use this piece will see (sitting, standing, kids climbing)?",
      whyItMatters:
        "Weight-bearing use changes fastener specs, bracing, and the safety review. We design conservatively for the worst realistic case, and we never state guaranteed load ratings.",
      answerType: "text",
      requiredForSafety: true,
      assumptionIfSkipped: "We assume everyday adult use plus occasional kid chaos, and size the structure conservatively for that.",
    });
  }
  if (c.kidsOrPets) {
    for (const q of questions) {
      if (/kid|child|pet/i.test(q.question)) q.requiredForSafety = true;
    }
  }
  return questions;
}

export async function runFeasibilityQuestionAgent(ctx: AgentContext): Promise<FeasibilityQuestion[]> {
  return completeAgent({ name: "feasibilityQuestionAgent", system: SYSTEM_PROMPT, ctx, mock: mockQuestions(ctx), maxTokens: 2000 });
}
