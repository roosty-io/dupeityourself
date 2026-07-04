import { Link } from "react-router-dom";
import { LandingHero } from "@/components/landing/LandingHero";
import { ExampleSavingsCard } from "@/components/landing/ExampleSavingsCard";
import { FeatureHighlights } from "@/components/landing/FeatureHighlights";

const HOW_IT_WORKS: { emoji: string; title: string; description: string }[] = [
  {
    emoji: "📷",
    title: "1 · Add inspiration",
    description:
      "Paste a product link, upload photos or screenshots, or just describe the piece. Blocked links are fine — screenshots work too.",
  },
  {
    emoji: "🛠️",
    title: "2 · Tell us budget & tools",
    description:
      "Your budget, skill level, workspace, and the tools you own. The plan is built around your reality, not a dream shop.",
  },
  {
    emoji: "📦",
    title: "3 · Get your build plan",
    description:
      "A complete inspired-by build manual: Worth-It Score, build paths, materials, cut list, shopping list, steps, and safety review.",
  },
];

const AI_STRIP: { emoji: string; title: string; description: string }[] = [
  {
    emoji: "🔨",
    title: "Multi-agent pipeline",
    description:
      "25 specialized passes — vision, engineering, cost, cut optimization, safety review — each doing one job well.",
  },
  {
    emoji: "📏",
    title: "Confidence labels",
    description:
      "Every estimate carries a confidence score. When we're guessing from a photo, we say so — no fake certainty.",
  },
  {
    emoji: "💬",
    title: "Assumptions disclosed",
    description:
      "Skipped a question? The plan lists exactly what we assumed and how to correct it to tighten the plan.",
  },
];

export default function LandingPage() {
  return (
    <div>
      <LandingHero />

      {/* Example savings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink text-center">
            Designer price tag. <span className="text-pine-600">Weekend project budget.</span>
          </h2>
          <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
            Real examples of what an inspired-by build plan can turn a wish-list item into.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <ExampleSavingsCard
              emoji="🪵"
              from="$3,999 designer oak dining table"
              to="$580–$840 DIY build"
              href="/examples/designer-dining-table"
            />
            <ExampleSavingsCard
              emoji="🛋️"
              from="Boutique upholstered bench"
              to="Custom weekend project"
              note="Staple gun, foam, and the fabric you actually want."
            />
            <ExampleSavingsCard
              emoji="📦"
              from="Pinterest storage shelf"
              to="Home Depot shopping list"
              note="Department-by-department, with the cuts made in-store."
            />
            <ExampleSavingsCard
              emoji="🎨"
              from="Expensive woven wall hanging"
              to="Affordable craft plan"
              note="Materials from the craft store, technique mini-lessons included."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-parchment border-y border-bdr/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.title} className="card p-6">
                <div className="text-3xl mb-3" aria-hidden>
                  {step.emoji}
                </div>
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="text-sm text-muted mt-2 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/projects/new" className="btn-primary btn-lg">
              Create a Build Plan
            </Link>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink text-center">
            Everything a real build actually needs
          </h2>
          <p className="text-sm text-muted text-center mt-2 max-w-2xl mx-auto">
            Not a mood board — a build manual. Specific measurements, real product specs, and honest
            tradeoffs, like a knowledgeable hardware-store pro wrote it for you.
          </p>
          <div className="mt-8">
            <FeatureHighlights />
          </div>
        </div>
      </section>

      {/* How the AI works — honesty strip */}
      <section className="py-12 bg-pine-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-center">How the AI works — honestly</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {AI_STRIP.map((item) => (
              <div key={item.title} className="text-center md:text-left">
                <div className="text-2xl mb-2" aria-hidden>
                  {item.emoji}
                </div>
                <h3 className="font-semibold text-pine-50">{item.title}</h3>
                <p className="text-sm text-pine-100/80 mt-1.5 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-pine-100/60 text-center mt-8 max-w-3xl mx-auto">
            Plans are original, inspired-by designs. High-risk builds get flagged for professional
            review, and we never claim guaranteed load ratings.
          </p>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-4xl mb-4" aria-hidden>
            🔨
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            Stop paying designer prices for lumber and screws.
          </h2>
          <p className="text-sm text-muted mt-3 max-w-xl mx-auto">
            Your first build plan takes about two minutes to set up. If the honest answer is “just
            buy it,” the Worth-It Score will tell you that too.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <Link to="/projects/new" className="btn-ember btn-lg shadow-lift">
              Create a Build Plan
            </Link>
            <Link to="/library" className="btn-ghost btn-lg">
              Browse the Dupe Library →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
