import type { ToolAwareNote, ToolItem } from "@shared/types";
import { titleCase } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";

const WORKAROUND_META: Record<ToolAwareNote["workaroundType"], { label: string; tone: BadgeTone }> = {
  store_cut: { label: "Store cut", tone: "green" },
  substitute_tool: { label: "Substitute tool", tone: "oak" },
  rental: { label: "Rent it", tone: "yellow" },
  technique_change: { label: "Technique change", tone: "oak" },
  buy: { label: "Worth buying", tone: "orange" },
  borrow: { label: "Borrow it", tone: "gray" },
};

function isOptionalPro(tool: ToolItem): boolean {
  return /pro|optional|advanced|specialty|nice.?to.?have/i.test(tool.category);
}

function ToolGroup({ icon, title, subtitle, tools }: { icon: string; title: string; subtitle: string; tools: ToolItem[] }) {
  if (tools.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink flex items-center gap-1.5">
        <span aria-hidden>{icon}</span> {title}
        <span className="text-xs font-normal text-faint">· {subtitle}</span>
      </h4>
      <div className="overflow-x-auto mt-2">
        <table className="table-base">
          <thead>
            <tr>
              <th>Tool</th>
              <th>Status</th>
              <th>Purpose</th>
              <th>Substitute / rental</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool, i) => (
              <tr key={`${tool.name}-${i}`}>
                <td className="min-w-[10rem]">
                  <div className="font-medium text-ink">{tool.name}</div>
                  <div className="text-xs text-faint mt-0.5">{titleCase(tool.category)}</div>
                  {tool.beginnerNote && (
                    <div className="text-xs text-muted mt-1">
                      <span className="font-semibold text-soot">🙂 Beginner note:</span> {tool.beginnerNote}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap">
                  {tool.owned ? (
                    <span className="chip bg-pine-100 text-pine-800">✅ You own it</span>
                  ) : (
                    <span className="chip bg-amber-100 text-amber-800">⚠️ Not in your kit</span>
                  )}
                  {tool.estimatedCostIfBuying && !tool.owned && (
                    <div className="text-xs text-muted mt-1">Buy: {tool.estimatedCostIfBuying}</div>
                  )}
                </td>
                <td className="min-w-[12rem] text-soot">{tool.purpose}</td>
                <td className="min-w-[10rem]">
                  <div className="space-y-1 text-xs text-soot">
                    {tool.substitute && (
                      <div>
                        <span className="font-semibold">🔄 Sub:</span> {tool.substitute}
                      </div>
                    )}
                    {tool.rentalRecommended && (
                      <div>
                        <span className="chip bg-oak-100 text-oak-800">🛠️ Rental recommended</span>
                      </div>
                    )}
                    {!tool.substitute && !tool.rentalRecommended && <span className="text-faint">—</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ToolsTable({ tools, toolAwareNotes }: { tools: ToolItem[]; toolAwareNotes: ToolAwareNote[] }) {
  const mustHave = tools.filter((t) => t.required);
  const optionalPro = tools.filter((t) => !t.required && isOptionalPro(t));
  const helpful = tools.filter((t) => !t.required && !isOptionalPro(t));
  const ownedCount = tools.filter((t) => t.owned).length;

  return (
    <Card title="🛠️ Tools" subtitle={`You own ${ownedCount} of the ${tools.length} tools on this plan.`}>
      <div className="space-y-6">
        <ToolGroup icon="🔨" title="Must-have" subtitle="the build depends on these" tools={mustHave} />
        <ToolGroup icon="👍" title="Helpful" subtitle="faster and cleaner results, but workable without" tools={helpful} />
        <ToolGroup icon="✨" title="Optional / pro" subtitle="upgrades for repeat builders" tools={optionalPro} />

        {toolAwareNotes.length > 0 && (
          <div className="rounded-xl bg-parchment border border-bdr p-4">
            <h4 className="text-sm font-semibold text-ink mb-2.5">🧰 Adapted to your tool kit</h4>
            <ul className="space-y-3">
              {toolAwareNotes.map((note, i) => (
                <li key={i} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-soot">
                      <span className="font-semibold text-ink">You don't own {note.missingTool}</span>{" "}
                      <span aria-hidden>→</span> {note.workaround}
                    </span>
                    <Badge tone={WORKAROUND_META[note.workaroundType].tone}>
                      {WORKAROUND_META[note.workaroundType].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted mt-1">{note.impact}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
