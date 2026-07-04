/**
 * Provider abstraction for LLM calls.
 *
 * Env vars:
 *   AI_PROVIDER       "anthropic" | "openai" | "mock"   (default "anthropic")
 *   USE_MOCK_AI       "true" | "false"                  (default "true")
 *   ANTHROPIC_API_KEY / OPENAI_API_KEY
 *   ANTHROPIC_MODEL   default "claude-sonnet-5"
 *   OPENAI_MODEL      default "gpt-4o"
 *
 * The whole app runs end-to-end in mock mode with no keys. Real-mode calls
 * go through global fetch so no SDK dependency is needed. API keys are never
 * logged and never included in error messages.
 */

export type LlmMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LlmCompleteInput = {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
};

function provider(): "anthropic" | "openai" | "mock" {
  const p = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  if (p === "openai") return "openai";
  if (p === "mock") return "mock";
  return "anthropic";
}

export function isMockMode(): boolean {
  // Mock is the default; real providers must be explicitly opted into.
  if (process.env.USE_MOCK_AI !== "false") return true;
  if (provider() === "mock") return true;
  if (provider() === "anthropic" && !process.env.ANTHROPIC_API_KEY) return true;
  if (provider() === "openai" && !process.env.OPENAI_API_KEY) return true;
  return false;
}

async function anthropicComplete(input: LlmCompleteInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: input.maxTokens ?? 4096,
      system: input.system,
      messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic API error (${res.status}): ${detail.slice(0, 500)}`);
  }
  const body = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = (body.content || [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("");
  if (!text) throw new Error("Anthropic API returned an empty completion");
  return text;
}

async function openaiComplete(input: LlmCompleteInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: input.maxTokens ?? 4096,
      messages: [
        { role: "system", content: input.system },
        ...input.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI API error (${res.status}): ${detail.slice(0, 500)}`);
  }
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI API returned an empty completion");
  return text;
}

/**
 * Single completion entry point used by every agent in real mode.
 * Throws immediately if called while the app is in mock mode - agents must
 * check isMockMode() and use their deterministic mock implementation instead.
 */
export async function llmComplete(input: LlmCompleteInput): Promise<string> {
  if (isMockMode()) {
    throw new Error(
      "llmComplete called in mock mode. Set USE_MOCK_AI=false and provide an API key to use a real provider."
    );
  }
  if (provider() === "openai") return openaiComplete(input);
  return anthropicComplete(input);
}

/**
 * Tolerant JSON extraction for LLM responses: strips code fences and grabs
 * the first {...} or [...] block. Returns undefined when nothing parses -
 * callers fall back to their deterministic mock output.
 */
export function tryParseJson<T>(raw: string): T | undefined {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  const candidates = [stripped];
  const objStart = stripped.indexOf("{");
  const arrStart = stripped.indexOf("[");
  if (objStart > 0) candidates.push(stripped.slice(objStart, stripped.lastIndexOf("}") + 1));
  if (arrStart > 0) candidates.push(stripped.slice(arrStart, stripped.lastIndexOf("]") + 1));
  for (const c of candidates) {
    try {
      return JSON.parse(c) as T;
    } catch {
      /* try next candidate */
    }
  }
  return undefined;
}
