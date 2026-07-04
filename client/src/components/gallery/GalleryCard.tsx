import { Link } from "react-router-dom";
import type { ProjectGalleryEntry } from "@shared/types";
import { money } from "@/lib/format";

const PLACEHOLDER_EMOJIS = ["🖼️", "🛋️", "🪑"] as const;

export function GalleryCard({ entry, index = 0 }: { entry: ProjectGalleryEntry; index?: number }) {
  // Image arrays are empty in the MVP, so rotate a placeholder hero emoji.
  const placeholder = PLACEHOLDER_EMOJIS[index % PLACEHOLDER_EMOJIS.length];
  const lessonsCount = entry.lessonsLearned?.length ?? 0;

  return (
    <Link
      to={`/gallery/${entry.slug}`}
      className="card overflow-hidden flex flex-col h-full hover:shadow-lift transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-pine-400"
    >
      <div className="h-36 bg-gradient-to-br from-sand to-linen grid place-items-center text-6xl" aria-hidden>
        {placeholder}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink leading-snug">{entry.title}</h3>
          <p className="text-sm text-muted mt-1 line-clamp-3">{entry.description}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-soot mt-auto">
          {entry.actualCost !== undefined && (
            <span className="flex items-center gap-1">
              <span aria-hidden>💰</span> {money(entry.actualCost)} spent
            </span>
          )}
          {entry.actualTime && (
            <span className="flex items-center gap-1">
              <span aria-hidden>⏱️</span> {entry.actualTime}
            </span>
          )}
          {entry.difficultyRating !== undefined && (
            <span className="flex items-center gap-1" title={`Difficulty ${entry.difficultyRating} out of 5`}>
              {"⭐".repeat(Math.max(1, Math.min(5, entry.difficultyRating)))}
            </span>
          )}
        </div>

        {lessonsCount > 0 && (
          <p className="text-xs text-faint flex items-center gap-1">
            <span aria-hidden>💬</span>
            {lessonsCount} lesson{lessonsCount === 1 ? "" : "s"} learned
          </p>
        )}
      </div>
    </Link>
  );
}
