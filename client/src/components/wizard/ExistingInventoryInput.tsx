import type { ExistingInventoryItem } from "@shared/types";

const CATEGORY_OPTIONS: { value: ExistingInventoryItem["category"]; label: string }[] = [
  { value: "material", label: "Material" },
  { value: "hardware", label: "Hardware" },
  { value: "tool", label: "Tool" },
  { value: "finish", label: "Finish" },
  { value: "fabric", label: "Fabric" },
  { value: "yarn", label: "Yarn" },
  { value: "other", label: "Other" },
];

const emptyItem = (): ExistingInventoryItem => ({ name: "", category: "material" });

export function ExistingInventoryInput({
  items,
  onChange,
}: {
  items: ExistingInventoryItem[];
  onChange: (items: ExistingInventoryItem[]) => void;
}) {
  const updateAt = (index: number, patch: Partial<ExistingInventoryItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-xs text-muted">
          Got leftover plywood, half a box of screws, or a quart of stain? List it and the plan will
          try to use it before sending you shopping.
        </p>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          className="grid grid-cols-1 sm:grid-cols-[1fr_130px_90px_1fr_auto] gap-2 items-start bg-parchment border border-bdr rounded-lg p-2.5"
        >
          <input
            className="input"
            placeholder="Item — e.g. 3/4″ birch plywood offcut"
            value={item.name}
            onChange={(e) => updateAt(i, { name: e.target.value })}
            aria-label={`Inventory item ${i + 1} name`}
          />
          <select
            className="input"
            value={item.category}
            onChange={(e) =>
              updateAt(i, { category: e.target.value as ExistingInventoryItem["category"] })
            }
            aria-label={`Inventory item ${i + 1} category`}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Qty"
            value={item.quantity ?? ""}
            onChange={(e) => updateAt(i, { quantity: e.target.value || undefined })}
            aria-label={`Inventory item ${i + 1} quantity`}
          />
          <input
            className="input"
            placeholder="Notes — size, condition…"
            value={item.notes ?? ""}
            onChange={(e) => updateAt(i, { notes: e.target.value || undefined })}
            aria-label={`Inventory item ${i + 1} notes`}
          />
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="btn-ghost btn-sm mt-0.5"
            aria-label={`Remove inventory item ${i + 1}`}
          >
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="btn-secondary btn-sm" onClick={() => onChange([...items, emptyItem()])}>
        + Add item
      </button>
    </div>
  );
}
