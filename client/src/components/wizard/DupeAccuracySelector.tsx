import { DUPE_ACCURACY_OPTIONS } from "@shared/constants";
import type { DupeAccuracyPreference } from "@shared/types";

const OPTION_EMOJI: Record<DupeAccuracyPreference, string> = {
  similar_vibe: "🎨",
  budget_interpretation: "💰",
  function_first: "📦",
  close_visual_match: "📏",
  near_dupe_inspired: "✅",
};

export function DupeAccuracySelector({
  value,
  onChange,
}: {
  value: DupeAccuracyPreference;
  onChange: (value: DupeAccuracyPreference) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" role="radiogroup" aria-label="Dupe accuracy">
      {DUPE_ACCURACY_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`text-left rounded-xl border p-3.5 transition-colors ${
              selected
                ? "border-pine-500 bg-pine-50 ring-1 ring-pine-400"
                : "border-bdr bg-surface hover:bg-sand"
            }`}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden>{OPTION_EMOJI[opt.value]}</span>
              <span className="text-sm font-semibold text-ink">{opt.label}</span>
              {selected && (
                <span className="ml-auto text-pine-600 text-sm" aria-hidden>
                  ✓
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
