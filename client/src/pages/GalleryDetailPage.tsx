import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ProjectGalleryEntry } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { BadgeTone } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { formatDate, money } from "@/lib/format";

const visibilityTone: Record<ProjectGalleryEntry["visibility"], BadgeTone> = {
  public: "green",
  unlisted: "yellow",
  private: "gray",
};

export default function GalleryDetailPage() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const [entry, setEntry] = useState<ProjectGalleryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!projectSlug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      setEntry(await api.getGalleryEntry(projectSlug));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load this gallery build.";
      if (/404|not found/i.test(message)) {
        setNotFound(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound || !entry) {
    return (
      <EmptyState
        icon="🖼️"
        title="Gallery build not found"
        description="This build isn't in the gallery — it may be private or may have been removed."
        action={
          <Link to="/gallery" className="btn-primary btn-md">
            Back to the Gallery
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/gallery" className="text-sm text-muted hover:text-ink inline-flex items-center gap-1">
        ← Back to Gallery
      </Link>

      {/* placeholder hero — image uploads land post-MVP */}
      <div className="card overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-sand to-linen grid place-items-center text-7xl" aria-hidden>
          🖼️
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-ink">{entry.title}</h1>
              <p className="text-xs text-faint mt-1">Shared {formatDate(entry.createdAt)}</p>
            </div>
            <Badge tone={visibilityTone[entry.visibility]}>
              {entry.visibility === "public" ? "✅" : "⚠️"} {entry.visibility}
            </Badge>
          </div>
          <p className="text-sm text-soot leading-relaxed mt-4 whitespace-pre-line">{entry.description}</p>
        </div>
      </div>

      {/* stats */}
      <div className="grid sm:grid-cols-3 gap-3">
        <StatTile
          icon="💰"
          label="Actual cost"
          value={entry.actualCost !== undefined ? money(entry.actualCost) : "Not reported"}
          sub="materials as built"
        />
        <StatTile
          icon="⏱️"
          label="Actual time"
          value={entry.actualTime ?? "Not reported"}
          sub="including dry/cure time"
        />
        <StatTile
          icon="🛠️"
          label="Difficulty felt"
          value={
            entry.difficultyRating !== undefined
              ? "⭐".repeat(Math.max(1, Math.min(5, entry.difficultyRating)))
              : "Not reported"
          }
          sub={entry.difficultyRating !== undefined ? `${entry.difficultyRating} out of 5` : undefined}
        />
      </div>

      {/* lessons learned */}
      {entry.lessonsLearned && entry.lessonsLearned.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-3">💬 Lessons learned</h2>
          <ul className="space-y-2.5">
            {entry.lessonsLearned.map((lesson) => (
              <li key={lesson} className="text-sm text-soot flex items-start gap-2">
                <span aria-hidden>✅</span>
                <span className="min-w-0">{lesson}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* builder notes */}
      {entry.notes && (
        <div className="card p-6">
          <h2 className="section-title mb-3">📏 Builder notes</h2>
          <p className="text-sm text-soot leading-relaxed whitespace-pre-line">{entry.notes}</p>
        </div>
      )}

      <div className="card p-5 bg-parchment border-dashed text-center">
        <p className="text-sm text-soot">
          <span aria-hidden>🔨</span> Inspired to try it? Start your own version with your budget
          and tools.{" "}
          <Link to="/projects/new" className="font-medium text-pine-700 hover:text-pine-800 underline">
            Create a build plan
          </Link>
        </p>
      </div>
    </div>
  );
}
