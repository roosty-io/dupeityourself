/**
 * Classification agent: pins down the project's category, type, and a
 * one-paragraph project brief that every downstream agent works from.
 */
import type { ProjectCategory } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { inferIdentity } from "../generators";
import { completeAgent } from "./agentUtil";

export type ClassificationResult = {
  title: string;
  category: ProjectCategory;
  secondaryCategory?: ProjectCategory;
  projectType: string;
  projectBrief: string;
};

const SYSTEM_PROMPT = `You are the Project Classification agent for a DIY "inspired-by" build planner.

ROLE: Decide what this project IS: primary craft category, optional secondary category, a concise project type label, a brand-safe working title, and a 2-4 sentence project brief that frames the whole build.

INPUT: Project context JSON.

OUTPUT: JSON { title, category, secondaryCategory?, projectType, projectBrief }.
- category is one of: woodworking, upholstery, sewing, knitting, weaving, finishing, metalworking, decor_craft, mixed_material, other.
- projectType is a short shopper-friendly label ("Dining table", "Upholstered item", "Woven item"...).

QUALITY RULES
- Title is brand-safe: describe the piece, never name the brand as the product ("Chunky Oak Pedestal Dining Table (inspired-by)"), though the brief may note "user reference: <brand> page".
- The brief states what we build, the key visual signature, and the one hard part - in plain builder language.
- secondaryCategory only when genuinely bi-modal (e.g. woodworking + finishing).`;

function mockClassification(ctx: AgentContext): ClassificationResult {
  const identity = inferIdentity(ctx.project);
  const t = ctx.template;
  const hardPart = t.designSimplifier.difficultOriginalDetails[0]?.detail;
  return {
    title: identity.title,
    category: identity.category,
    secondaryCategory: identity.category === "woodworking" ? "finishing" : undefined,
    projectType: identity.projectType,
    projectBrief:
      `Build an inspired-by version of ${identity.brand ? `a ${identity.brand}-catalog style ` : "a designer "}${identity.projectType.toLowerCase()}: ` +
      `${t.referenceAnalysisDetails.shapeForm} ` +
      `The signature details to preserve are ${t.designSimplifier.preservedElements.slice(0, 2).join(" and ").toLowerCase()}. ` +
      (hardPart ? `The one genuinely tricky element (${hardPart.toLowerCase()}) has a planned simplification that keeps the silhouette.` : ""),
  };
}

export async function runProjectClassificationAgent(ctx: AgentContext): Promise<ClassificationResult> {
  return completeAgent({ name: "projectClassificationAgent", system: SYSTEM_PROMPT, ctx, mock: mockClassification(ctx), maxTokens: 1000 });
}
