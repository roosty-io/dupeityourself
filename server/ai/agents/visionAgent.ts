/**
 * Vision agent: interprets the reference's photos/description into a
 * structured VisionAnalysis - components, material and finish guesses,
 * construction clues, and what needs user confirmation.
 */
import type { VisionAnalysis } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Vision Analysis agent for a DIY "inspired-by" build planner.

ROLE: Read the reference like an experienced builder standing in the showroom: identify the object, break it into buildable components, guess materials and finishes with per-guess confidence and reasoning, and list what CANNOT be determined from photos.

INPUT: Project context JSON (description, pasted product copy, image names).

OUTPUT: A VisionAnalysis JSON object: { objectType, styleSummary, components[{component, observation, confidence}], materialGuesses[{material, confidence, reasoning}], finishGuesses[{finish, confidence, reasoning}], constructionClues[], decorativeDetails[], complexityLevel, uncertainAreas[], needsUserConfirmation[] }.

QUALITY RULES
- Observations must be concrete and dimensional where possible ("thick slab appearance, ~1-3/4 in., large-radius roundover"), never vague ("nice edge").
- Every material/finish guess needs reasoning a shopper could verify.
- Confidence honesty: photos cannot reveal internal construction - such guesses cap at ~60.
- uncertainAreas and needsUserConfirmation must be non-empty; something is always unknown.`;

function mockVision(ctx: AgentContext): VisionAnalysis {
  const t = ctx.template;
  const d = t.referenceAnalysisDetails;
  const difficultyWord = t.snapshot.difficulty.toLowerCase();
  return {
    objectType: t.snapshot.projectType,
    styleSummary: t.referenceAnalysis.split(". ").slice(0, 2).join(". ") + ".",
    components: d.visible.slice(0, 4).map((v, i) => ({
      component: v.split(" - ")[0].split(",")[0],
      observation: v,
      confidence: 78 - i * 6,
    })),
    materialGuesses: t.snapshot.mainMaterials.slice(0, 3).map((m, i) => ({
      material: m,
      confidence: 80 - i * 8,
      reasoning: i === 0
        ? "Primary visible surface; texture and tone in the reference photos are consistent with this material."
        : "Consistent with how this category of piece is normally constructed at retail; not directly verifiable from photos.",
    })),
    finishGuesses: [
      {
        finish: d.finishColor,
        confidence: 72,
        reasoning: "Sheen level and color cast read from the photos; exact chemistry is not photo-determinable.",
      },
    ],
    constructionClues: [d.constructionStyle, ...t.designSimplifier.difficultOriginalDetails.slice(0, 2).map((x) => x.detail)],
    decorativeDetails: [d.decorativeDetails],
    complexityLevel: difficultyWord.includes("advanced") || difficultyWord.includes("professional")
      ? "complex"
      : difficultyWord.includes("intermediate")
        ? "moderate"
        : "simple",
    uncertainAreas: d.uncertain,
    needsUserConfirmation: t.feasibilityQuestions.slice(0, 3).map((q) => q.question),
  };
}

export async function runVisionAgent(ctx: AgentContext): Promise<VisionAnalysis> {
  return completeAgent({ name: "visionAgent", system: SYSTEM_PROMPT, ctx, mock: mockVision(ctx), maxTokens: 2500 });
}
