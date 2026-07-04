import { useState } from "react";
import type { ReactNode } from "react";
import { STORE_OPTIONS } from "@shared/constants";
import type {
  DurabilityNeed,
  ProjectConstraints,
  SkillLevel,
  WorkspaceType,
} from "@shared/types";
import { ToolInventorySelector } from "@/components/wizard/ToolInventorySelector";
import { ExistingInventoryInput } from "@/components/wizard/ExistingInventoryInput";
import { DupeAccuracySelector } from "@/components/wizard/DupeAccuracySelector";

const SKILL_OPTIONS: { value: SkillLevel; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "First few projects" },
  { value: "intermediate", label: "Intermediate", hint: "Comfortable with power tools" },
  { value: "advanced", label: "Advanced", hint: "Joinery and finish work" },
  { value: "professional", label: "Professional", hint: "I build for a living" },
];

const DURABILITY_OPTIONS: { value: DurabilityNeed; label: string; hint: string }[] = [
  { value: "decorative", label: "Decorative", hint: "Looks only, light touch" },
  { value: "light_use", label: "Light use", hint: "Occasional use" },
  { value: "everyday_use", label: "Everyday use", hint: "Daily family life" },
  { value: "heavy_duty", label: "Heavy duty", hint: "Hard, constant use" },
];

const OPTIMIZE_OPTIONS: { value: NonNullable<ProjectConstraints["optimizeFor"]>; label: string; hint: string }[] = [
  { value: "cheapest", label: "Cheapest", hint: "Lowest total cost" },
  { value: "easiest", label: "Easiest", hint: "Fewest skills and tools" },
  { value: "closest_match", label: "Closest match", hint: "Best visual fidelity" },
  { value: "balanced", label: "Balanced", hint: "Sensible middle ground" },
];

const WORKSPACE_OPTIONS: { value: WorkspaceType; label: string }[] = [
  { value: "apartment", label: "Apartment / indoor only" },
  { value: "garage", label: "Garage" },
  { value: "basement", label: "Basement" },
  { value: "outdoor", label: "Outdoor / driveway" },
  { value: "shop", label: "Dedicated shop" },
  { value: "other", label: "Other" },
];

function parseList(text: string): string[] | undefined {
  const parts = text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : undefined;
}

function parseNumber(text: string): number | undefined {
  if (text.trim() === "") return undefined;
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && <p className="text-xs text-muted mt-1.5">{hint}</p>}
    </div>
  );
}

function PillRadio<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-3 py-2 text-left transition-colors ${
              selected
                ? "border-pine-500 bg-pine-50 ring-1 ring-pine-400"
                : "border-bdr bg-surface hover:bg-sand"
            }`}
          >
            <span className="block text-sm font-medium text-ink">{opt.label}</span>
            {opt.hint && <span className="block text-[11px] text-muted mt-0.5">{opt.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-bdr bg-surface px-3 py-2.5 cursor-pointer hover:bg-sand/60 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-pine-600 shrink-0"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted mt-0.5">{hint}</span>
      </span>
    </label>
  );
}

export function ConstraintsForm({
  value,
  onChange,
}: {
  value: ProjectConstraints;
  onChange: (constraints: ProjectConstraints) => void;
}) {
  const set = (patch: Partial<ProjectConstraints>) => onChange({ ...value, ...patch });

  const [materialText, setMaterialText] = useState((value.materialPreferences ?? []).join(", "));
  const [avoidText, setAvoidText] = useState((value.avoidMaterials ?? []).join(", "));

  const dims = value.dimensions ?? { unit: "in" as const };
  const setDim = (key: "width" | "depth" | "height", raw: string) => {
    set({ dimensions: { ...dims, [key]: parseNumber(raw) } });
  };

  const toggleStore = (store: string) => {
    const next = value.preferredStores.includes(store)
      ? value.preferredStores.filter((s) => s !== store)
      : [...value.preferredStores, store];
    set({ preferredStores: next });
  };

  return (
    <div className="space-y-7">
      <Field
        label="💰 Budget range (USD)"
        hint="A realistic range helps pick materials — solid white oak and edge-glued pine are very different bills."
      >
        <div className="flex items-center gap-3 max-w-sm">
          <input
            type="number"
            min={0}
            className="input"
            placeholder="Min"
            value={value.budgetMin ?? ""}
            onChange={(e) => set({ budgetMin: parseNumber(e.target.value) })}
            aria-label="Budget minimum"
          />
          <span className="text-muted text-sm shrink-0">to</span>
          <input
            type="number"
            min={0}
            className="input"
            placeholder="Max"
            value={value.budgetMax ?? ""}
            onChange={(e) => set({ budgetMax: parseNumber(e.target.value) })}
            aria-label="Budget maximum"
          />
        </div>
      </Field>

      <Field label="🔨 Your skill level">
        <PillRadio
          options={SKILL_OPTIONS}
          value={value.skillLevel}
          onChange={(skillLevel) => set({ skillLevel })}
          ariaLabel="Skill level"
        />
      </Field>

      <Field label="🛠️ Tools you own">
        <ToolInventorySelector selected={value.ownedTools} onChange={(ownedTools) => set({ ownedTools })} />
      </Field>

      <Field label="🛒 Preferred stores" hint="Shopping lists and cut sheets are written for the stores you pick.">
        <div className="flex flex-wrap gap-2">
          {STORE_OPTIONS.map((store) => {
            const selected = value.preferredStores.includes(store);
            return (
              <button
                key={store}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleStore(store)}
                className={`chip px-3.5 py-2 text-sm border transition-colors ${
                  selected
                    ? "bg-pine-600 border-pine-600 text-white"
                    : "bg-surface border-bdr text-soot hover:bg-sand"
                }`}
              >
                {store}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="🏠 Workspace">
        <select
          className="input max-w-sm"
          value={value.workspaceType ?? ""}
          onChange={(e) =>
            set({ workspaceType: e.target.value === "" ? undefined : (e.target.value as WorkspaceType) })
          }
          aria-label="Workspace type"
        >
          <option value="">Select workspace…</option>
          {WORKSPACE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="🎨 How close should the dupe be?">
        <DupeAccuracySelector value={value.desiredFidelity} onChange={(desiredFidelity) => set({ desiredFidelity })} />
      </Field>

      <Field label="📦 How tough does it need to be?">
        <PillRadio
          options={DURABILITY_OPTIONS}
          value={value.durability}
          onChange={(durability) => set({ durability })}
          ariaLabel="Durability need"
        />
      </Field>

      <Field
        label="📏 Desired finished dimensions"
        hint="Leave blank to match the reference — we'll estimate from the product page or photos."
      >
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={0}
            className="input w-24"
            placeholder="W"
            value={dims.width ?? ""}
            onChange={(e) => setDim("width", e.target.value)}
            aria-label="Width"
          />
          <span className="text-faint">×</span>
          <input
            type="number"
            min={0}
            className="input w-24"
            placeholder="D"
            value={dims.depth ?? ""}
            onChange={(e) => setDim("depth", e.target.value)}
            aria-label="Depth"
          />
          <span className="text-faint">×</span>
          <input
            type="number"
            min={0}
            className="input w-24"
            placeholder="H"
            value={dims.height ?? ""}
            onChange={(e) => setDim("height", e.target.value)}
            aria-label="Height"
          />
          <select
            className="input w-24"
            value={dims.unit}
            onChange={(e) => set({ dimensions: { ...dims, unit: e.target.value as "in" | "cm" } })}
            aria-label="Dimension unit"
          >
            <option value="in">inches</option>
            <option value="cm">cm</option>
          </select>
        </div>
      </Field>

      <Field
        label="📐 Known reference dimensions"
        hint="Anything you know for sure — “product page says 72″L × 38″W × 30″H” or “tabletop is 1.75″ thick”."
      >
        <input
          className="input"
          placeholder="e.g. Listing says 72″ long, seat height looks standard 18″"
          value={value.knownReferenceDimensions ?? ""}
          onChange={(e) => set({ knownReferenceDimensions: e.target.value || undefined })}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="🪵 Material preferences" hint="Comma-separated, e.g. white oak, birch plywood.">
          <input
            className="input"
            placeholder="e.g. white oak, birch plywood"
            value={materialText}
            onChange={(e) => {
              setMaterialText(e.target.value);
              set({ materialPreferences: parseList(e.target.value) });
            }}
          />
        </Field>
        <Field label="🚫 Materials to avoid" hint="e.g. MDF, pressure-treated lumber indoors.">
          <input
            className="input"
            placeholder="e.g. MDF, particle board"
            value={avoidText}
            onChange={(e) => {
              setAvoidText(e.target.value);
              set({ avoidMaterials: parseList(e.target.value) });
            }}
          />
        </Field>
      </div>

      <Field
        label="📦 Materials and supplies you already have"
        hint="The plan substitutes what you own before adding items to the shopping list."
      >
        <ExistingInventoryInput
          items={value.existingInventory ?? []}
          onChange={(existingInventory) => set({ existingInventory })}
        />
      </Field>

      <div className="space-y-2">
        <span className="label">⚠️ Safety and build context</span>
        <ToggleRow
          checked={value.kidsOrPets ?? false}
          onChange={(kidsOrPets) => set({ kidsOrPets })}
          label="Kids or pets in the home"
          hint="Adds anti-tip, rounded-edge, and low-VOC finish guidance to the plan."
        />
        <ToggleRow
          checked={value.weightBearing ?? false}
          onChange={(weightBearing) => set({ weightBearing })}
          label="Needs to bear weight (people, heavy loads)"
          hint="Triggers conservative structural sizing and an extra safety design review."
        />
        <ToggleRow
          checked={value.storeCutsOnly ?? false}
          onChange={(storeCutsOnly) => set({ storeCutsOnly })}
          label="Store cuts only"
          hint="Plan around the store's panel saw — you get a cut sheet to hand the lumber desk, no saw needed at home."
        />
      </div>

      <Field label="✅ Optimize the plan for">
        <PillRadio
          options={OPTIMIZE_OPTIONS}
          value={value.optimizeFor ?? "balanced"}
          onChange={(optimizeFor) => set({ optimizeFor })}
          ariaLabel="Optimize for"
        />
      </Field>
    </div>
  );
}
