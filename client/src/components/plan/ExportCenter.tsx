import type { ReactNode } from "react";
import { api } from "@/lib/api";

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "build-plan";
}

export function ExportCenter({
  projectId,
  planTitle,
  hasCutSheet,
}: {
  projectId: string;
  planTitle: string;
  hasCutSheet: boolean;
}) {
  const urls = api.exportUrls(projectId);
  const slug = slugify(planTitle);

  const exportCard = (
    icon: string,
    title: string,
    description: string,
    action: ReactNode
  ) => (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        <h3 className="font-semibold text-ink">{title}</h3>
      </div>
      <p className="text-sm text-muted leading-relaxed flex-1">{description}</p>
      <div>{action}</div>
    </div>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exportCard(
          "🖨️",
          "Print-friendly full plan",
          "Opens your browser's print dialog with a clean, garage-ready layout of the whole build manual.",
          <button type="button" className="btn-primary btn-md w-full" onClick={() => window.print()}>
            Print plan
          </button>
        )}

        {exportCard(
          "📄",
          "Full plan (Markdown)",
          "The complete build manual as a portable .md file — steps, materials, cut list, budget, safety notes.",
          <a href={urls.planMarkdown} download={`${slug}-plan.md`} className="btn-secondary btn-md w-full">
            Download .md
          </a>
        )}

        {exportCard(
          "🛒",
          "Shopping list (CSV)",
          "Every item by store department with quantities, specs, and cost ranges — opens in any spreadsheet app.",
          <a href={urls.csv} download={`${slug}-shopping-list.csv`} className="btn-secondary btn-md w-full">
            Download .csv
          </a>
        )}

        {exportCard(
          "✂️",
          "Store cut sheet",
          "A ready-to-hand-over sheet for the store's panel saw counter: buy sizes, requested cuts, and home-trim notes.",
          hasCutSheet ? (
            <a href={urls.storeCutSheet} download={`${slug}-store-cut-sheet.md`} className="btn-secondary btn-md w-full">
              Download .md
            </a>
          ) : (
            <button
              type="button"
              className="btn-secondary btn-md w-full"
              disabled
              title="This plan doesn't include a store cut sheet. Regenerate the plan with the store-cuts option turned on."
            >
              Not available for this plan
            </button>
          )
        )}

        {exportCard(
          "📦",
          "Builder handoff brief",
          "A professional spec sheet plus a ready-to-send quote request for a local woodworker or maker.",
          <a href={urls.builderHandoff} download={`${slug}-builder-handoff.md`} className="btn-secondary btn-md w-full">
            Download .md
          </a>
        )}
      </div>

      <p className="text-xs text-muted mt-4">
        💡 Need a PDF? Use <span className="font-medium text-soot">Print plan</span> and choose{" "}
        <span className="font-medium text-soot">“Save as PDF”</span> as the printer destination.
      </p>
    </div>
  );
}
