import { useCallback, useEffect, useState } from "react";
import type { ProjectGalleryEntry } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { GalleryCard } from "@/components/gallery/GalleryCard";

export default function GalleryPage() {
  const [entries, setEntries] = useState<ProjectGalleryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await api.listGallery());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the gallery.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">🖼️ Before &amp; After Gallery</h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Real builds from the community — what they spent, how long it took, and what they'd do
          differently. (Demo data for the MVP.)
        </p>
      </div>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          icon="🖼️"
          title="No builds in the gallery yet"
          description="Community builds will show up here once they're shared."
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry, index) => (
              <GalleryCard key={entry.id} entry={entry} index={index} />
            ))}
          </div>

          <div className="card p-5 bg-parchment border-dashed text-center">
            <p className="text-sm text-soot">
              <span aria-hidden>📦</span> Sharing your own build is coming soon — the MVP shows demo
              entries so you can see how the gallery will work.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
