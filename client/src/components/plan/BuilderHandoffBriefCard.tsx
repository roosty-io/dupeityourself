import { useEffect, useRef, useState } from "react";
import type { BuilderHandoffBrief } from "@shared/types";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[11rem,1fr] gap-1 sm:gap-4 py-2.5 border-b border-bdr/70">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm text-ink leading-relaxed">{value}</dd>
    </div>
  );
}

function SpecListRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[11rem,1fr] gap-1 sm:gap-4 py-2.5 border-b border-bdr/70">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd>
        <ul className="list-disc pl-4 space-y-1 text-sm text-ink">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              {it}
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

export function BuilderHandoffBriefCard({ brief, projectId }: { brief: BuilderHandoffBrief; projectId: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const copyQuoteRequest = async () => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(brief.quoteRequestMessage);
      setCopied(true);
    } catch {
      setCopyError(true);
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, 3000);
  };

  return (
    <Card
      title="📦 Builder handoff brief"
      subtitle="Rather have a pro build it? Hand this spec sheet to a local woodworker or maker."
      actions={
        <a href={api.exportUrls(projectId).builderHandoff} download className="btn-secondary btn-sm no-print">
          📄 Download brief (.md)
        </a>
      }
    >
      <dl>
        <SpecRow label="Project summary" value={brief.projectSummary} />
        <SpecRow label="Reference style" value={brief.referenceStyle} />
        <SpecRow label="Dimensions" value={brief.desiredDimensions} />
        <div className="grid grid-cols-1 sm:grid-cols-[11rem,1fr] gap-1 sm:gap-4 py-2.5 border-b border-bdr/70">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Materials</dt>
          <dd className="flex flex-wrap gap-1.5">
            {brief.materials.map((m) => (
              <span key={m} className="chip bg-oak-100 text-oak-800">
                🪵 {m}
              </span>
            ))}
          </dd>
        </div>
        <SpecRow label="Finish" value={brief.finish} />
        <SpecListRow label="Construction notes" items={brief.constructionNotes} />
        <SpecRow label="Budget target" value={brief.budgetTarget} />
        <SpecListRow label="Quality expectations" items={brief.qualityExpectations} />
        <SpecListRow label="Questions for builder" items={brief.questionsForBuilder} />
      </dl>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 className="text-sm font-semibold text-ink">✉️ Ready-to-send quote request</h4>
          <div className="flex items-center gap-2 no-print">
            <button type="button" className="btn-secondary btn-sm" onClick={copyQuoteRequest}>
              📋 {copied ? "Copied!" : "Copy"}
            </button>
            {copyError && <span className="text-xs text-danger">Copy failed — select the text manually.</span>}
          </div>
        </div>
        <blockquote className="rounded-xl bg-parchment border-l-4 border-pine-500 border border-bdr px-4 py-3 text-sm text-soot whitespace-pre-wrap leading-relaxed select-all">
          {brief.quoteRequestMessage}
        </blockquote>
      </div>
    </Card>
  );
}
