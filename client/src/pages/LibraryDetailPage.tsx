import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { BuildPlan, DupeLibraryEntry } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { BadgeTone } from "@/components/ui/Badge";
import { ScoreRing } from "@/components/ui/ScoreBar";
import { scoreBandLabel, titleCase } from "@/lib/format";

type LibraryEntryWithPlan = DupeLibraryEntry & { plan?: BuildPlan };

function worthItTone(score: number): BadgeTone {
  if (score >= 70) return "green";
  if (score >= 50) return "yellow";
  return "orange";
}

export default function LibraryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [entry, setEntry] = useState<LibraryEntryWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      setEntry(await api.getLibraryEntry(slug));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load this library plan.";
      if (/404|not found/i.test(message)) {
        setNotFound(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (notFound || !entry) {
    return (
      <EmptyState
        icon="📦"
        title="Library plan not found"
        description="This dupe isn't in the library — it may have been renamed or removed."
        action={
          <Link to="/library" className="btn-primary btn-md">
            Back to the Dupe Library
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/library" className="text-sm text-muted hover:text-ink inline-flex items-center gap-1">
        ← Back to Dupe Library
      </Link>

      {/* header */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-parchment border border-bdr grid place-items-center text-5xl shrink-0" aria-hidden>
            {entry.heroEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-ink">{entry.title}</h1>
            <p className="text-muted mt-1">{entry.styleTagline}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge tone={worthItTone(entry.worthItScore)}>
                💰 Worth-it {entry.worthItScore}/100 — {scoreBandLabel(entry.worthItScore)}
              </Badge>
              <Badge tone="oak">🛠️ {entry.difficulty}</Badge>
              <Badge tone="gray">⏱️ {entry.time}</Badge>
              <Badge tone="gray">{titleCase(entry.category)}</Badge>
            </div>
          </div>
          <div className="shrink-0">
            <ScoreRing score={entry.worthItScore} label="Worth-it score" />
          </div>
        </div>
      </div>

      {/* savings visual */}
      <div className="card p-6">
        <h2 className="section-title mb-4">💰 The savings story</h2>
        <div className="grid sm:grid-cols-3 gap-3 items-stretch">
          <div className="bg-sand/60 border border-bdr rounded-xl px-4 py-4 text-center">
            <div className="text-xs text-muted">Reference retail price</div>
            <div className="text-2xl font-bold text-soot line-through decoration-danger/60 mt-1">
              {entry.referencePriceLabel}
            </div>
          </div>
          <div className="bg-pine-50 border border-pine-200 rounded-xl px-4 py-4 text-center">
            <div className="text-xs text-muted">Estimated DIY cost</div>
            <div className="text-2xl font-bold text-pine-700 mt-1">{entry.diyCostLabel}</div>
          </div>
          <div className="bg-ember-50 border border-ember-200 rounded-xl px-4 py-4 text-center">
            <div className="text-xs text-muted">Potential savings</div>
            <div className="text-2xl font-bold text-ember-700 mt-1">{entry.savingsLabel}</div>
          </div>
        </div>
        <p className="text-xs text-faint mt-3">
          Estimates assume mid-range material prices at big-box stores. Your total will shift with
          lumber prices, finish choices, and any tools you still need.
        </p>
      </div>

      {/* summary */}
      <div className="card p-6">
        <h2 className="section-title mb-3">📦 About this build</h2>
        <p className="text-sm text-soot leading-relaxed whitespace-pre-line">{entry.summary}</p>
      </div>

      {/* highlights */}
      {entry.highlights.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-3">✅ What you get in the plan</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {entry.highlights.map((h) => (
              <li key={h} className="text-sm text-soot flex items-start gap-2">
                <span aria-hidden>✅</span>
                <span className="min-w-0">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="card p-6 sm:p-8 bg-pine-50 border-pine-200 text-center">
        {entry.demoProjectId ? (
          <>
            <h2 className="text-lg font-semibold text-ink">See the full build manual</h2>
            <p className="text-sm text-muted mt-1 max-w-xl mx-auto">
              This library dupe has a complete interactive demo plan — build paths, cut list,
              budget, step-by-step instructions, and safety review.
            </p>
            <Link to={`/projects/${entry.demoProjectId}`} className="btn-ember btn-lg mt-5">
              🔨 Open the full interactive demo plan
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-ink">Want this look in your home?</h2>
            <p className="text-sm text-muted mt-1 max-w-xl mx-auto">
              Start a new project with your own budget, tools, and dimensions, and get a build plan
              tailored to you.
            </p>
            <Link to="/projects/new" className="btn-ember btn-lg mt-5">
              🔨 Create a plan like this
            </Link>
          </>
        )}
      </div>

      <p className="text-xs text-faint leading-relaxed">
        ⚠️ Library plans are original, inspired-by DIY guides. They reference the general style of
        popular pieces, not any brand's proprietary designs, and aren't affiliated with or endorsed
        by any manufacturer. Always verify structural details for your use and consult a
        professional for load-bearing or high-risk work.
      </p>
    </div>
  );
}
