/**
 * Intake agent: reads whatever the user gave us (URL, pasted product text,
 * description, photos) and produces a ReferenceExtraction - what we know,
 * what we could not get, and how confident we are in it.
 */
import type { ReferenceExtraction } from "../../../shared/types";
import type { AgentContext } from "../generators";
import { inferIdentity } from "../generators";
import { completeAgent } from "./agentUtil";

const SYSTEM_PROMPT = `You are the Reference Intake agent for a DIY "inspired-by" build planner.

ROLE: Extract everything factual from the user's reference inputs (product URL, pasted product-page text, their own description). You do NOT fetch URLs - you work from the text provided.

INPUT: Project context JSON (source URL, pasted product text, user description).

OUTPUT: A ReferenceExtraction JSON object: { title?, brand?, price?, currency?, description?, dimensionsText?, materialsText?, imageUrls?, fetchSucceeded, fetchError?, extractionConfidence }.

QUALITY RULES
- Only report a price/dimensions if they literally appear in the provided text. NEVER invent a price - leave it undefined and let downstream agents label their estimate as an assumption.
- fetchSucceeded is true only if actual page content was available; if only a URL was given with no page text, set false with a clear fetchError explaining that retailer pages commonly block automated readers.
- materialsText should quote or tightly paraphrase the source's materials claims.
- extractionConfidence: 80+ only when pasted product copy exists; 30-50 for URL-only; scale with how much real text you had.`;

function mockIntake(ctx: AgentContext): ReferenceExtraction {
  const p = ctx.project;
  const identity = inferIdentity(p);
  const pasted = p.pastedProductText?.trim();
  const desc = p.userDescription?.trim();

  const priceMatch = (pasted || "").match(/\$\s?([\d,]+(?:\.\d{2})?)/);
  const price = priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : undefined;
  const dimsMatch = (pasted || desc || "").match(/\d+(?:\.\d+)?\s*(?:in|inch|inches|"|cm)\b[^.;]{0,80}/i);

  return {
    title: identity.title.replace(/\s*\(inspired-by\)\s*$/i, ""),
    brand: identity.brand ? `${identity.brand} (user-provided reference)` : undefined,
    price,
    currency: price ? "USD" : undefined,
    description: pasted
      ? `Recovered from user-pasted product copy: ${pasted.slice(0, 400)}${pasted.length > 400 ? "…" : ""}`
      : desc
        ? `From the user's own description: ${desc.slice(0, 400)}`
        : undefined,
    dimensionsText: dimsMatch ? dimsMatch[0].trim() : undefined,
    materialsText: pasted ? pasted.slice(0, 300) : undefined,
    imageUrls: p.sourceImages.map((img) => img.name),
    fetchSucceeded: Boolean(pasted),
    fetchError: p.sourceUrl && !pasted
      ? "The reference page was not fetched (retailer pages commonly block automated readers). Paste the product page text into the project to raise extraction confidence."
      : undefined,
    extractionConfidence: pasted ? 82 : p.sourceImages.length > 0 ? 55 : p.sourceUrl ? 35 : desc ? 45 : 20,
  };
}

export async function runIntakeAgent(ctx: AgentContext): Promise<ReferenceExtraction> {
  return completeAgent({ name: "intakeAgent", system: SYSTEM_PROMPT, ctx, mock: mockIntake(ctx), maxTokens: 1500 });
}
