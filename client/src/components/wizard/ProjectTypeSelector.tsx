import { PROJECT_TYPE_OPTIONS } from "@shared/constants";

/** Ordered keyword → project type rules. First match wins, so specific terms come first. */
const KEYWORD_RULES: { pattern: RegExp; type: string }[] = [
  { pattern: /dining/i, type: "Dining table" },
  { pattern: /coffee\s*table/i, type: "Coffee table" },
  { pattern: /(side\s*table|end\s*table|nightstand|night\s*stand)/i, type: "Side table" },
  { pattern: /console/i, type: "Console" },
  { pattern: /bench/i, type: "Bench" },
  { pattern: /(chair|stool)/i, type: "Chair" },
  { pattern: /(shelf|shelv|bookcase|book\s*case)/i, type: "Shelf" },
  { pattern: /cabinet/i, type: "Cabinet" },
  { pattern: /(storage|organizer|organiser|cubby)/i, type: "Storage unit" },
  { pattern: /(upholster|sofa|couch|settee|loveseat)/i, type: "Upholstered item" },
  { pattern: /(headboard|bed\s*frame)/i, type: "Headboard" },
  { pattern: /(cushion|ottoman|pouf|pillow)/i, type: "Cushion/ottoman" },
  { pattern: /(knit|crochet|sweater|chunky\s*blanket|throw\s*blanket)/i, type: "Knitted item" },
  { pattern: /(woven|weav|macrame|macramé|wall\s*hanging|tapestry)/i, type: "Woven item" },
  { pattern: /(mirror|wall\s*art|artwork|frame|sign|d[ée]cor)/i, type: "Wall art / décor" },
  { pattern: /(outdoor|patio|planter|adirondack|garden)/i, type: "Outdoor item" },
  { pattern: /table/i, type: "Dining table" },
];

/** Lightweight client-side guess from the URL/description text. Returns null when unsure. */
export function guessProjectType(text: string): string | null {
  const cleaned = text.replace(/[-_/+.]/g, " ");
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(cleaned)) return rule.type;
  }
  return null;
}

export function ProjectTypeSelector({
  value,
  onChange,
  guessed,
}: {
  value: string;
  onChange: (type: string) => void;
  /** The pre-selected client-side guess, if any, so we can label it. */
  guessed?: string | null;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Project type">
        {PROJECT_TYPE_OPTIONS.map((type) => {
          const selected = value === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type)}
              className={`chip px-3.5 py-2 text-sm border transition-colors ${
                selected
                  ? "bg-pine-600 border-pine-600 text-white"
                  : "bg-surface border-bdr text-soot hover:bg-sand"
              }`}
            >
              {type}
              {guessed === type && !selected && <span className="text-faint">· our guess</span>}
              {guessed === type && selected && <span aria-hidden>✨</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-3">
        {guessed
          ? `We pre-selected “${guessed}” based on your link and description — change it if we got it wrong. `
          : "Pick the closest match. "}
        The AI will verify this during analysis.
      </p>
    </div>
  );
}
