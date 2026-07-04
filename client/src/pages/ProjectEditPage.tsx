import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { DurabilityNeed, ProjectConstraints, SkillLevel, WorkspaceType } from "@shared/types";
import { DUPE_ACCURACY_OPTIONS, STORE_OPTIONS, TOOL_OPTIONS } from "@shared/constants";
import { api } from "@/lib/api";
import { PageSpinner, Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";

const SKILL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
];

const WORKSPACE_OPTIONS: { value: WorkspaceType; label: string }[] = [
  { value: "apartment", label: "Apartment / indoor only" },
  { value: "garage", label: "Garage" },
  { value: "basement", label: "Basement" },
  { value: "outdoor", label: "Outdoor / driveway" },
  { value: "shop", label: "Dedicated shop" },
  { value: "other", label: "Other" },
];

const DURABILITY_OPTIONS: { value: DurabilityNeed; label: string; hint: string }[] = [
  { value: "decorative", label: "Decorative", hint: "Looks matter, light handling only" },
  { value: "light_use", label: "Light use", hint: "Occasional use, gentle wear" },
  { value: "everyday_use", label: "Everyday use", hint: "Daily family life" },
  { value: "heavy_duty", label: "Heavy duty", hint: "Hard daily wear, needs to take abuse" },
];

function parseNumber(text: string): number | undefined {
  if (text.trim() === "") return undefined;
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}

function ToggleRow({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-sand/50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-pine-600 shrink-0"
      />
      <span>
        <span className="text-sm text-ink font-medium">{label}</span>
        <span className="block text-xs text-muted mt-0.5">{hint}</span>
      </span>
    </label>
  );
}

export default function ProjectEditPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState("");
  const [constraints, setConstraints] = useState<ProjectConstraints | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"idle" | "save" | "regenerate">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const project = await api.getProject(id);
      setProjectTitle(project.title);
      setConstraints(project.constraints);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load this project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (patch: Partial<ProjectConstraints>) => {
    setSaved(false);
    setConstraints((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const setDimension = (key: "width" | "depth" | "height", value: number | undefined) => {
    setSaved(false);
    setConstraints((prev) => {
      if (!prev) return prev;
      const dims = { unit: "in" as const, ...prev.dimensions, [key]: value };
      return { ...prev, dimensions: dims };
    });
  };

  const toggleInList = (key: "ownedTools" | "preferredStores", value: string) => {
    if (!constraints) return;
    const list = constraints[key];
    set({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const save = async (regenerate: boolean) => {
    if (!constraints || saving !== "idle") return;
    setSaving(regenerate ? "regenerate" : "save");
    setSaveError(null);
    setSaved(false);
    try {
      const dims = constraints.dimensions;
      const cleaned: ProjectConstraints = {
        ...constraints,
        dimensions:
          dims && (dims.width !== undefined || dims.depth !== undefined || dims.height !== undefined)
            ? dims
            : undefined,
      };
      await api.updateProject(id, { constraints: cleaned });
      if (regenerate) {
        await api.generatePlan(id);
        navigate(`/projects/${id}`);
        return;
      }
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save your changes.");
    } finally {
      setSaving("idle");
    }
  };

  if (loading) return <PageSpinner />;
  if (loadError || !constraints) {
    return <ErrorState message={loadError ?? "Could not load this project."} onRetry={load} />;
  }

  const unit = constraints.dimensions?.unit ?? "in";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <nav className="text-sm text-muted no-print">
        <Link to={`/projects/${id}`} className="hover:text-ink">
          ← Back to {projectTitle}
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-ink">✏️ Edit project constraints</h1>
        <p className="text-sm text-muted mt-1">
          Change budget, tools, or fidelity, then regenerate — the whole plan adapts to the new constraints.
        </p>
      </div>

      <Card title="💰 Budget" subtitle="A realistic range keeps material picks honest.">
        <div className="flex items-center gap-3 max-w-md">
          <input
            type="number"
            min={0}
            className="input"
            placeholder="Min"
            value={constraints.budgetMin ?? ""}
            onChange={(e) => set({ budgetMin: parseNumber(e.target.value) })}
            aria-label="Budget minimum (USD)"
          />
          <span className="text-muted text-sm shrink-0">to</span>
          <input
            type="number"
            min={0}
            className="input"
            placeholder="Max"
            value={constraints.budgetMax ?? ""}
            onChange={(e) => set({ budgetMax: parseNumber(e.target.value) })}
            aria-label="Budget maximum (USD)"
          />
          <span className="text-muted text-sm shrink-0">USD</span>
        </div>
      </Card>

      <Card title="🧰 Skill & workspace">
        <div className="space-y-5">
          <div>
            <span className="label">Skill level</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Skill level">
              {SKILL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={constraints.skillLevel === opt.value}
                  onClick={() => set({ skillLevel: opt.value })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    constraints.skillLevel === opt.value
                      ? "border-pine-500 bg-pine-50 text-ink ring-1 ring-pine-400"
                      : "border-bdr bg-surface text-soot hover:bg-sand"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-md">
            <span className="label">Workspace</span>
            <select
              className="input"
              value={constraints.workspaceType ?? ""}
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
          </div>
        </div>
      </Card>

      <Card title="🛠️ Tools you own" subtitle="The plan works around missing tools with store cuts, substitutes, or rentals.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {TOOL_OPTIONS.map((tool) => (
            <label
              key={tool}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-sand/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={constraints.ownedTools.includes(tool)}
                onChange={() => toggleInList("ownedTools", tool)}
                className="w-4 h-4 accent-pine-600 shrink-0"
              />
              <span className="text-sm text-ink">{tool}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card title="🛒 Preferred stores" subtitle="Shopping lists and cut sheets are written for these stores.">
        <div className="flex flex-wrap gap-2">
          {STORE_OPTIONS.map((store) => {
            const selected = constraints.preferredStores.includes(store);
            return (
              <button
                key={store}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInList("preferredStores", store)}
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
      </Card>

      <Card title="🎯 Dupe fidelity & durability">
        <div className="space-y-5">
          <div className="max-w-md">
            <span className="label">How close should the dupe be?</span>
            <select
              className="input"
              value={constraints.desiredFidelity}
              onChange={(e) =>
                set({ desiredFidelity: e.target.value as ProjectConstraints["desiredFidelity"] })
              }
              aria-label="Desired fidelity"
            >
              {DUPE_ACCURACY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted mt-1.5">
              {DUPE_ACCURACY_OPTIONS.find((o) => o.value === constraints.desiredFidelity)?.description}
            </p>
          </div>

          <div>
            <span className="label">How hard will life be on it?</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Durability need">
              {DURABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={constraints.durability === opt.value}
                  onClick={() => set({ durability: opt.value })}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    constraints.durability === opt.value
                      ? "border-pine-500 bg-pine-50 ring-1 ring-pine-400"
                      : "border-bdr bg-surface hover:bg-sand"
                  }`}
                >
                  <span className="block text-sm font-medium text-ink">{opt.label}</span>
                  <span className="block text-xs text-muted mt-0.5">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="📏 Target dimensions" subtitle="Leave blank to keep the plan's estimated dimensions.">
        <div className="flex flex-wrap items-end gap-3">
          {(
            [
              { key: "width", label: "Width" },
              { key: "depth", label: "Depth" },
              { key: "height", label: "Height" },
            ] as const
          ).map((dim) => (
            <div key={dim.key} className="w-28">
              <span className="label">{dim.label}</span>
              <input
                type="number"
                min={0}
                className="input"
                value={constraints.dimensions?.[dim.key] ?? ""}
                onChange={(e) => setDimension(dim.key, parseNumber(e.target.value))}
                aria-label={`${dim.label} (${unit})`}
              />
            </div>
          ))}
          <div className="w-36">
            <span className="label">Units</span>
            <select
              className="input"
              value={unit}
              onChange={(e) =>
                set({ dimensions: { ...constraints.dimensions, unit: e.target.value as "in" | "cm" } })
              }
              aria-label="Dimension units"
            >
              <option value="in">Inches</option>
              <option value="cm">Centimeters</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="🏠 Household & shop realities">
        <div className="space-y-1">
          <ToggleRow
            checked={constraints.kidsOrPets ?? false}
            onChange={(v) => set({ kidsOrPets: v })}
            label="Kids or pets at home"
            hint="Prefers low-VOC finishes, rounded corners, and tip-over safety notes."
          />
          <ToggleRow
            checked={constraints.weightBearing ?? false}
            onChange={(v) => set({ weightBearing: v })}
            label="Needs to bear real weight"
            hint="People sitting, heavy loads, daily leaning — triggers conservative structural choices."
          />
          <ToggleRow
            checked={constraints.storeCutsOnly ?? false}
            onChange={(v) => set({ storeCutsOnly: v })}
            label="Store cuts only (no saw at home)"
            hint="The plan builds a store cut sheet and avoids cuts you can't make at home."
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3 pb-4">
        <button
          type="button"
          className="btn-secondary btn-lg"
          onClick={() => save(false)}
          disabled={saving !== "idle"}
        >
          {saving === "save" && <Spinner className="w-4 h-4" />}
          Save
        </button>
        <button
          type="button"
          className="btn-primary btn-lg"
          onClick={() => save(true)}
          disabled={saving !== "idle"}
        >
          {saving === "regenerate" && <Spinner className="w-4 h-4 text-white" />}
          Save & regenerate plan
        </button>
        {saved && (
          <span className="chip bg-pine-100 text-pine-800" role="status">
            ✅ Changes saved
          </span>
        )}
        {saveError && (
          <span className="text-sm text-danger flex items-center gap-1.5">
            <span aria-hidden>⚠️</span> {saveError}
          </span>
        )}
      </div>
    </div>
  );
}
