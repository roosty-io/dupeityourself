import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProjectWithPlan } from "@shared/types";
import { api } from "@/lib/api";
import { money, moneyRange, pct, scoreBandLabel } from "@/lib/format";
import { PageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { StatTile } from "@/components/ui/StatTile";
import { StepByStepGuide } from "@/components/plan/StepByStepGuide";
import { DiagramViewer } from "@/components/plan/DiagramViewer";
import { FinishMatchingGuide } from "@/components/plan/FinishMatchingGuide";

export default function ExampleProjectPage() {
  const [project, setProject] = useState<ProjectWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // demo-only step checkboxes — not persisted, just to show the interaction
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProject(await api.getDemoProject());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the example project.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner />;
  if (error || !project?.plan) {
    return <ErrorState message={error ?? "The example plan isn't available right now."} onRetry={load} />;
  }

  const plan = project.plan;
  const story = plan.savingsStory;
  const referenceLabel = story.referencePrice ? money(story.referencePrice) : "$3,999";
  const diyLabel = moneyRange(story.estimatedDiyCostLow, story.estimatedDiyCostHigh);

  const toggleStep = (n: number) =>
    setCompletedSteps((prev) => (prev.includes(n) ? prev.filter((s) => s !== n) : [...prev, n]));

  const sampleSteps = plan.steps.slice(0, 4);
  const sampleDiagrams = plan.diagrams.slice(0, 2);

  return (
    <div className="space-y-10">
      {/* ------------------------------- hero ------------------------------- */}
      <section className="text-center max-w-3xl mx-auto pt-4">
        <span className="chip bg-ember-100 text-ember-800 mb-4">🪵 Real generated example — not a mockup</span>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink leading-tight">
          {referenceLabel} designer oak pedestal table →{" "}
          <span className="text-pine-600">{diyLabel} DIY build</span>
        </h1>
        <p className="text-muted mt-4 leading-relaxed">
          This is an actual plan our pipeline generated from a designer pedestal dining table listing — the same
          worth-it scoring, cut lists, step-by-step guide, and safety review you get for your own reference piece.
          Below are a few highlights; the full interactive plan has all of it.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/projects/proj_demo_meadowview" className="btn-primary btn-lg">
            Open the full interactive plan
          </Link>
          <Link to="/projects/new" className="btn-ember btn-lg">
            + Create your own
          </Link>
        </div>
      </section>

      {/* --------------------------- snapshot tiles -------------------------- */}
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            icon="🏆"
            label="Worth-It Score"
            value={`${plan.worthItScore.score}/100`}
            sub={scoreBandLabel(plan.worthItScore.score)}
          />
          <StatTile icon="💰" label="Estimated cost" value={diyLabel} sub={`vs. ${referenceLabel} retail`} />
          <StatTile icon="⏱️" label="Build time" value={plan.snapshot.estimatedTime} sub={plan.snapshot.difficulty} />
          <StatTile
            icon="🎨"
            label="Visual match"
            value={pct(plan.snapshot.visualMatchScore)}
            sub={`Durability ${pct(plan.snapshot.durabilityScore)}`}
          />
        </div>

        <div className="card p-5 mt-4">
          <h3 className="font-semibold text-ink mb-1.5">💵 The savings story</h3>
          <p className="text-sm text-soot leading-relaxed">{story.explanation}</p>
          {story.savingsPercentage !== undefined && story.estimatedSavings !== undefined && (
            <p className="text-sm font-medium text-pine-700 mt-2">
              Estimated savings: about {money(story.estimatedSavings)} ({pct(story.savingsPercentage)} less than
              buying) — before valuing your time. {story.laborTimeTradeoff}
            </p>
          )}
        </div>
      </section>

      {/* --------------------------- sample steps ---------------------------- */}
      <section className="max-w-5xl mx-auto">
        <div className="flex items-baseline justify-between gap-4 mb-3 flex-wrap">
          <h2 className="text-xl font-bold text-ink">🔨 A taste of the build guide</h2>
          <p className="text-sm text-muted">
            First {sampleSteps.length} of {plan.steps.length} steps — try checking one off.
          </p>
        </div>
        <StepByStepGuide
          steps={sampleSteps}
          completedSteps={completedSteps}
          onToggleStep={toggleStep}
          miniLessons={plan.miniLessons}
        />
      </section>

      {/* ----------------------------- diagrams ------------------------------ */}
      {sampleDiagrams.length > 0 && (
        <section className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-ink mb-3">📐 Build diagrams</h2>
          <DiagramViewer diagrams={sampleDiagrams} />
        </section>
      )}

      {/* ------------------------- finish guide teaser ----------------------- */}
      <section className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-ink mb-3">🎨 Finish matching, done properly</h2>
        <div className="relative max-h-[26rem] overflow-hidden rounded-xl">
          <FinishMatchingGuide guide={plan.finishGuide} />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream to-transparent flex items-end justify-center pb-4">
            <Link to="/projects/proj_demo_meadowview" className="btn-secondary btn-md shadow-lift">
              See the full finish guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ big CTA ------------------------------ */}
      <section className="max-w-3xl mx-auto text-center card p-8 sm:p-10 border-2 border-pine-200">
        <div className="text-4xl mb-3" aria-hidden>
          🛠️
        </div>
        <h2 className="text-2xl font-bold text-ink">This is maybe a quarter of the plan.</h2>
        <p className="text-muted mt-2 leading-relaxed">
          The full version adds the complete cut list, store cut sheet, budget breakdown, shopping list by aisle,
          mistake prevention, safety design review, alternatives, and a builder handoff brief.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link to="/projects/proj_demo_meadowview" className="btn-primary btn-lg">
            Open the full interactive plan
          </Link>
          <Link to="/projects/new" className="btn-ember btn-lg">
            + Create your own
          </Link>
        </div>
      </section>
    </div>
  );
}
