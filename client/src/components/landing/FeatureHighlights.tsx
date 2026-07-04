const FEATURES: { emoji: string; title: string; description: string }[] = [
  {
    emoji: "💰",
    title: "Worth-It Score",
    description: "An honest 0–100 read on whether building beats buying — including when it doesn't.",
  },
  {
    emoji: "🪵",
    title: "Multiple build paths",
    description: "Budget, beginner, balanced, and closest-match versions of every plan, compared side by side.",
  },
  {
    emoji: "🛠️",
    title: "Tool-aware plans",
    description: "Plans adapt to the tools you actually own, with workarounds, substitutes, and rental picks.",
  },
  {
    emoji: "🛒",
    title: "Store shopping list",
    description: "A department-by-department list with specs and price ranges for Home Depot, Lowe's, and more.",
  },
  {
    emoji: "📏",
    title: "Cut sheet + store cuts",
    description: "A full cut list plus a sheet the store's panel-saw crew can follow — no table saw required.",
  },
  {
    emoji: "🎨",
    title: "Finish matching",
    description: "Stain and topcoat combos to get close to the reference color, with test-board instructions.",
  },
  {
    emoji: "⚠️",
    title: "Mistake prevention",
    description: "The mistakes people actually make on this exact kind of build, flagged before you start.",
  },
  {
    emoji: "💬",
    title: "Troubleshooting assistant",
    description: "Wobbly leg? Blotchy stain? Describe the problem mid-build and get a diagnosis and fix.",
  },
  {
    emoji: "📦",
    title: "Builder handoff",
    description: "Not feeling the build? Hand a local pro a complete brief and ready-to-send quote request.",
  },
];

export function FeatureHighlights() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FEATURES.map((f) => (
        <div key={f.title} className="card p-5">
          <div className="text-2xl mb-2.5" aria-hidden>
            {f.emoji}
          </div>
          <h3 className="font-semibold text-ink">{f.title}</h3>
          <p className="text-sm text-muted mt-1.5 leading-relaxed">{f.description}</p>
        </div>
      ))}
    </div>
  );
}
