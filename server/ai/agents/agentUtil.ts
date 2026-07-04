/**
 * Shared plumbing for pipeline agents.
 *
 * Every agent has two implementations:
 *  - a deterministic MOCK that derives its slice of the plan from the adapted
 *    category template + user constraints (always available, no keys), and
 *  - a REAL implementation that sends its system prompt + the project context
 *    + the mock draft to the LLM and expects strict JSON back.
 *
 * Real mode falls back to the mock output whenever the call or the JSON parse
 * fails, so the pipeline never dies on a flaky completion.
 */
import type { AgentContext } from "../generators";
import { isMockMode, llmComplete, tryParseJson } from "../llmClient";

/** Rules appended to every agent prompt - brand safety and honesty policy. */
export const SHARED_RULES = `
GLOBAL QUALITY RULES
- Voice: practical, expert, like a knowledgeable Home Depot employee. Specific measurements, real product specs (brand-name examples allowed for commodity products like Titebond II or T50 staples), honest uncertainty.
- Every cost is a low-high range in whole USD, plausible for mid-2026 US big-box retail.
- Never contradict the draft's arithmetic without recomputing all dependent totals.

BRAND SAFETY (HARD RULES)
- This is an "inspired-by" product. NEVER use the words: replica, knockoff, counterfeit, exact copy, official, or claim affiliation with any brand.
- Refer to the reference item generically ("the reference", "the original", "a designer piece").

SAFETY LANGUAGE (HARD RULES)
- Never state or imply guaranteed load ratings. Use "conservative design estimate, not a certified rating".
- Anything wall-mounted, load-bearing over people, electrical, or involving small children gets explicit conservative safety guidance.
- When uncertain, recommend a professional review rather than guessing.

CONFIDENCE SCORING
- All confidence values are 0-100 integers. 85+ means verified/high certainty, 60-84 solid inference, 40-59 educated estimate, below 40 speculative.

OUTPUT FORMAT
- Return ONLY valid JSON matching the exact shape of the provided draft. No markdown fences, no commentary.`;

/** Compact project context sent to the model in real mode. */
export function describeProject(ctx: AgentContext): string {
  const p = ctx.project;
  const c = ctx.constraints;
  return JSON.stringify(
    {
      title: p.title,
      projectType: p.projectType,
      category: p.category,
      sourceType: p.sourceType,
      sourceUrl: p.sourceUrl,
      userDescription: p.userDescription,
      pastedProductText: p.pastedProductText?.slice(0, 1500),
      constraints: c,
      analysisBrief: p.analysis?.projectBrief,
      feasibilityAnswers: (p.feasibilityQuestions || [])
        .filter((q) => q.answer)
        .map((q) => ({ question: q.question, answer: q.answer })),
    },
    null,
    2
  );
}

/**
 * Run one agent: mock mode returns the deterministic draft; real mode asks the
 * LLM to improve the draft and parses strict JSON, falling back to the draft.
 */
export async function completeAgent<T>(opts: {
  name: string;
  system: string;
  ctx: AgentContext;
  mock: T;
  maxTokens?: number;
}): Promise<T> {
  if (isMockMode()) return opts.mock;
  try {
    const user = [
      "PROJECT CONTEXT:",
      describeProject(opts.ctx),
      "",
      "DRAFT (produced by the deterministic template engine - improve it for THIS project, keep the exact JSON shape):",
      JSON.stringify(opts.mock, null, 2),
    ].join("\n");
    const raw = await llmComplete({
      system: `${opts.system}\n${SHARED_RULES}`,
      messages: [{ role: "user", content: user }],
      maxTokens: opts.maxTokens ?? 4096,
    });
    const parsed = tryParseJson<T>(raw);
    if (parsed !== undefined) return parsed;
    console.error(`[${opts.name}] could not parse model JSON; using deterministic fallback`);
    return opts.mock;
  } catch (err) {
    console.error(`[${opts.name}] real-mode call failed; using deterministic fallback:`, err instanceof Error ? err.message : String(err));
    return opts.mock;
  }
}
