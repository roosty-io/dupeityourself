import { TOOL_OPTIONS } from "@shared/constants";

export function ToolInventorySelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tools: string[]) => void;
}) {
  const toggle = (tool: string) => {
    if (selected.includes(tool)) {
      onChange(selected.filter((t) => t !== tool));
    } else {
      onChange([...selected, tool]);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {TOOL_OPTIONS.map((tool) => {
          const checked = selected.includes(tool);
          return (
            <label
              key={tool}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                checked
                  ? "border-pine-400 bg-pine-50 text-ink"
                  : "border-bdr bg-surface text-soot hover:bg-sand"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(tool)}
                className="w-4 h-4 accent-pine-600 shrink-0"
              />
              <span className="min-w-0 truncate">{tool}</span>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-muted mt-2">
        🛠️ {selected.length} of {TOOL_OPTIONS.length} selected — the plan adapts to what you own and
        suggests workarounds (store cuts, rentals, substitutes) for the rest.
      </p>
    </div>
  );
}
