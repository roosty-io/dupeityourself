import type { DiagramSpec } from "@shared/types";
import { Card } from "@/components/ui/Card";

export function DiagramViewer({ diagrams }: { diagrams: DiagramSpec[] }) {
  if (diagrams.length === 0) {
    return (
      <Card title="📐 Build diagrams">
        <p className="text-sm text-muted">No diagrams were generated for this plan.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {diagrams.map((d) => (
        <Card key={d.id} title={d.title} className="min-w-0">
          {d.type === "svg" && d.svg && (
            <div className="bg-white rounded-lg border border-bdr max-w-full overflow-x-auto p-3">
              {/*
                Safe use of dangerouslySetInnerHTML: these SVG strings are authored
                server-side by our own diagram data layer — never by user input.
              */}
              <div dangerouslySetInnerHTML={{ __html: d.svg }} />
            </div>
          )}

          {d.type === "ascii" && d.ascii && (
            <div className="bg-white rounded-lg border border-bdr max-w-full overflow-x-auto p-3">
              <pre className="text-xs text-ink font-mono leading-relaxed">{d.ascii}</pre>
            </div>
          )}

          {(d.type === "description" || (d.type === "svg" && !d.svg) || (d.type === "ascii" && !d.ascii)) && (
            <p className="text-sm text-soot leading-relaxed">{d.description}</p>
          )}

          {d.caption && <p className="text-xs text-muted mt-3 leading-relaxed">{d.caption}</p>}
        </Card>
      ))}
    </div>
  );
}
