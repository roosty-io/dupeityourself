import { useCallback, useEffect, useMemo, useState } from "react";
import type { DupeLibraryEntry, ProjectCategory } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { DupeLibraryCard } from "@/components/library/DupeLibraryCard";
import { titleCase } from "@/lib/format";

export default function LibraryPage() {
  const [entries, setEntries] = useState<DupeLibraryEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ProjectCategory | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await api.listLibrary());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the Dupe Library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const seen: ProjectCategory[] = [];
    for (const entry of entries ?? []) {
      if (!seen.includes(entry.category)) seen.push(entry.category);
    }
    return seen;
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    if (category === "all") return entries;
    return entries.filter((e) => e.category === category);
  }, [entries, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">📦 Dupe Library</h1>
        <p className="text-sm text-muted mt-1 max-w-3xl">
          Popular inspired-by build plans. Each one is an original DIY guide that captures the look
          and function of a well-known style — no brand affiliation, just honest lumber, hardware,
          and finish work.
        </p>
      </div>

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          icon="📦"
          title="The library is empty"
          description="Library plans haven't been loaded yet. Check back soon, or start a build plan of your own."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`chip transition-colors ${
                category === "all" ? "bg-pine-600 text-white" : "bg-surface border border-bdr text-soot hover:bg-sand"
              }`}
            >
              All ({entries.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`chip transition-colors ${
                  category === cat ? "bg-pine-600 text-white" : "bg-surface border border-bdr text-soot hover:bg-sand"
                }`}
              >
                {titleCase(cat)} ({entries.filter((e) => e.category === cat).length})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon="🪵"
              title="No plans in this category yet"
              description="Try another category, or browse everything with the All filter."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((entry) => (
                <DupeLibraryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
