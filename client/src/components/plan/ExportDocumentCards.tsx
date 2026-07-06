import type { ReactNode } from "react";
import { api } from "@/lib/api";

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "build-plan"
  );
}

type Doc = {
  icon: string;
  title: string;
  description: string;
  action: ReactNode;
  primary?: boolean;
};

/**
 * Exports treated as separate, focused documents. The Simple Build Checklist is
 * the highlighted default; the full 30+ section manual is clearly labeled as the
 * technical appendix, not the everyday output.
 */
export function ExportDocumentCards({
  projectId,
  planTitle,
  hasCutSheet,
  onPrint,
}: {
  projectId: string;
  planTitle: string;
  hasCutSheet: boolean;
  onPrint?: () => void;
}) {
  const urls = api.exportUrls(projectId);
  const slug = slugify(planTitle);

  const docs: Doc[] = [
    {
      icon: "✅",
      title: "Simple Build Checklist",
      description:
        "The short version you take to the shop — shopping list, tools, phase-by-phase steps, key warnings, and a final inspection. A few pages, everything you actually need.",
      primary: true,
      action: (
        <a href={urls.checklist} download={`${slug}-checklist.md`} className="btn-ember btn-md w-full">
          Download checklist
        </a>
      ),
    },
    {
      icon: "🛒",
      title: "Shopping List (CSV)",
      description:
        "Every item by store department with quantities, specs, and cost ranges — opens in any spreadsheet app for the store run.",
      action: (
        <a href={urls.csv} download={`${slug}-shopping-list.csv`} className="btn-secondary btn-md w-full">
          Download .csv
        </a>
      ),
    },
    {
      icon: "✂️",
      title: "Store Cut Sheet",
      description:
        "Hand this to the panel-saw counter at Home Depot or Lowe's: exact buy sizes, the cuts to request, and what to trim at home.",
      action: hasCutSheet ? (
        <a href={urls.storeCutSheet} download={`${slug}-store-cut-sheet.md`} className="btn-secondary btn-md w-full">
          Download .md
        </a>
      ) : (
        <button
          type="button"
          className="btn-secondary btn-md w-full"
          disabled
          title="This plan has no store cut sheet. Use the 'store cut sheet' refinement to add one."
        >
          Not available for this plan
        </button>
      ),
    },
    {
      icon: "📦",
      title: "Builder Handoff Brief",
      description:
        "A professional spec plus a ready-to-send quote request — for when you'd rather hand the project to a local woodworker or maker.",
      action: (
        <a href={urls.builderHandoff} download={`${slug}-builder-handoff.md`} className="btn-secondary btn-md w-full">
          Download .md
        </a>
      ),
    },
    {
      icon: "📘",
      title: "Full Technical Manual",
      description:
        "Everything the AI produced — confidence notes, measurement assumptions, material swaps, cut optimization, budget, alternatives. Appendix-style, 30+ sections.",
      action: (
        <div className="flex gap-2">
          <a href={urls.planMarkdown} download={`${slug}-plan.md`} className="btn-secondary btn-md flex-1">
            Download .md
          </a>
          {onPrint && (
            <button type="button" className="btn-secondary btn-md flex-1" onClick={onPrint}>
              🖨️ Print
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <div
            key={doc.title}
            className={`card p-5 flex flex-col gap-3 ${
              doc.primary ? "ring-2 ring-ember-300 bg-ember-50/40" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" aria-hidden>
                {doc.icon}
              </span>
              <h3 className="font-semibold text-ink">{doc.title}</h3>
              {doc.primary && <span className="chip bg-ember-100 text-ember-800 ml-auto">Start here</span>}
            </div>
            <p className="text-sm text-muted leading-relaxed flex-1">{doc.description}</p>
            <div>{doc.action}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted mt-4">
        💡 Need a PDF? Open any document and use your browser's{" "}
        <span className="font-medium text-soot">Print → Save as PDF</span>.
      </p>
    </div>
  );
}
