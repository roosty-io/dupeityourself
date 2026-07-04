import { Link } from "react-router-dom";

export function LandingHero() {
  return (
    <section className="bg-gradient-to-b from-parchment via-cream to-cream border-b border-bdr/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <span className="chip bg-pine-100 text-pine-800 mb-6">
          🪵 Brand-safe, inspired-by build plans — never copies
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-ink leading-tight">
          Dupe It <span className="text-pine-600">Yourself</span>
        </h1>
        <p className="text-xl sm:text-2xl font-semibold text-soot mt-4 max-w-3xl mx-auto">
          Turn expensive inspiration into a custom DIY build plan.
        </p>
        <p className="text-base text-muted mt-4 max-w-2xl mx-auto leading-relaxed">
          Paste a product link or upload photos of that $4,000 piece you keep coming back to. Get an
          honest Worth-It Score and a complete, practical plan — materials, cut list, store shopping
          list, budget, and step-by-step instructions — sized to your tools, your skills, and your
          garage.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link to="/projects/new" className="btn-ember btn-lg shadow-lift">
            🔨 Create a Build Plan
          </Link>
          <Link to="/examples/designer-dining-table" className="btn-secondary btn-lg">
            View Example Plan
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs text-muted">
          <span>💰 Real store price ranges</span>
          <span>🛠️ Adapts to the tools you own</span>
          <span>⚠️ Safety-first, honest about uncertainty</span>
        </div>
      </div>
    </section>
  );
}
