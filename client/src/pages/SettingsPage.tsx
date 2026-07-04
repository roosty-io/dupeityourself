import { useCallback, useEffect, useRef, useState } from "react";
import { FREE_TIER_PROJECT_LIMIT, STORE_OPTIONS } from "@shared/constants";
import type { SkillLevel, UserPreferences, WorkspaceType } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner, Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ToolInventorySelector } from "@/components/wizard/ToolInventorySelector";
import { ExistingInventoryInput } from "@/components/wizard/ExistingInventoryInput";

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

function parseNumber(text: string): number | undefined {
  if (text.trim() === "") return undefined;
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}

function tierLabel(prefs: UserPreferences): string {
  switch (prefs.subscriptionTier) {
    case "plus":
      return "Plus plan — unlimited projects";
    case "pro":
      return "Pro plan — unlimited projects";
    default:
      return `Free plan — ${FREE_TIER_PROJECT_LIMIT} projects/month`;
  }
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setPrefs(await api.getPreferences());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load your preferences.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, [load]);

  const set = (patch: Partial<UserPreferences>) =>
    setPrefs((prev) => (prev ? { ...prev, ...patch } : prev));

  const toggleStore = (store: string) => {
    if (!prefs) return;
    const next = prefs.preferredStores.includes(store)
      ? prefs.preferredStores.filter((s) => s !== store)
      : [...prefs.preferredStores, store];
    set({ preferredStores: next });
  };

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await api.updatePreferences({
        preferredStores: prefs.preferredStores,
        defaultBudgetMin: prefs.defaultBudgetMin,
        defaultBudgetMax: prefs.defaultBudgetMax,
        skillLevel: prefs.skillLevel,
        workspaceType: prefs.workspaceType,
        units: prefs.units,
        ownedTools: prefs.ownedTools,
        inventory: prefs.inventory,
      });
      setPrefs(updated);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save your preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (loadError || !prefs) {
    return <ErrorState message={loadError ?? "Could not load your preferences."} onRetry={load} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Settings</h1>
          <p className="text-sm text-muted mt-1">
            These defaults prefill every new project wizard — set them once, tweak per project.
          </p>
        </div>
        <Badge tone="oak">{tierLabel(prefs)}</Badge>
      </div>

      <Card title="🛒 Preferred stores" subtitle="Shopping lists and cut sheets are written for these stores.">
        <div className="flex flex-wrap gap-2">
          {STORE_OPTIONS.map((store) => {
            const selected = prefs.preferredStores.includes(store);
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
      </Card>

      <Card title="💰 Defaults" subtitle="Budget, skill, workspace, and measurement units.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <span className="label">Default budget range (USD)</span>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                className="input"
                placeholder="Min"
                value={prefs.defaultBudgetMin ?? ""}
                onChange={(e) => set({ defaultBudgetMin: parseNumber(e.target.value) })}
                aria-label="Default budget minimum"
              />
              <span className="text-muted text-sm shrink-0">to</span>
              <input
                type="number"
                min={0}
                className="input"
                placeholder="Max"
                value={prefs.defaultBudgetMax ?? ""}
                onChange={(e) => set({ defaultBudgetMax: parseNumber(e.target.value) })}
                aria-label="Default budget maximum"
              />
            </div>
          </div>

          <div>
            <span className="label">Workspace</span>
            <select
              className="input"
              value={prefs.workspaceType ?? ""}
              onChange={(e) =>
                set({
                  workspaceType: e.target.value === "" ? undefined : (e.target.value as WorkspaceType),
                })
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

          <div>
            <span className="label">Skill level</span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Skill level">
              {SKILL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={prefs.skillLevel === opt.value}
                  onClick={() => set({ skillLevel: opt.value })}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    prefs.skillLevel === opt.value
                      ? "border-pine-500 bg-pine-50 text-ink ring-1 ring-pine-400"
                      : "border-bdr bg-surface text-soot hover:bg-sand"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Measurement units</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Measurement units">
              {(
                [
                  { value: "in", label: "Inches" },
                  { value: "cm", label: "Centimeters" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={prefs.units === opt.value}
                  onClick={() => set({ units: opt.value })}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    prefs.units === opt.value
                      ? "border-pine-500 bg-pine-50 text-ink ring-1 ring-pine-400"
                      : "border-bdr bg-surface text-soot hover:bg-sand"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="🛠️ Tools you own"
        subtitle="New plans adapt to this inventory automatically — update it when your shop grows."
      >
        <ToolInventorySelector
          selected={prefs.ownedTools}
          onChange={(ownedTools) => set({ ownedTools })}
        />
      </Card>

      <Card
        title="📦 Materials and supplies on hand"
        subtitle="Leftover lumber, hardware, finishes — plans try to use these before adding shopping-list items."
      >
        <ExistingInventoryInput
          items={prefs.inventory}
          onChange={(inventory) => set({ inventory })}
        />
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn-primary btn-lg" onClick={save} disabled={saving}>
          {saving && <Spinner className="w-4 h-4 text-white" />}
          Save Preferences
        </button>
        {saved && (
          <span className="chip bg-pine-100 text-pine-800" role="status">
            ✅ Preferences saved
          </span>
        )}
        {saveError && (
          <span className="text-sm text-danger flex items-center gap-1.5">
            <span aria-hidden>⚠️</span> {saveError}
          </span>
        )}
      </div>

      <p className="text-xs text-faint">
        Subscription management isn't available in this preview — all plans run on the free tier.
      </p>
    </div>
  );
}
