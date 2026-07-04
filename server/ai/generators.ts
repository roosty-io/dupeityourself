/**
 * Template selection + adaptation core for the mock pipeline.
 *
 * Mock agents do not invent plans from nothing: they start from a complete,
 * expert-written template BuildPlan for the project's category, then adapt it
 * to the user's actual constraints (budget, tools, fidelity, kids/pets,
 * existing inventory, dimensions). The result is deterministic, internally
 * consistent, and specific.
 */
import type {
  BuildPathType,
  BuildPlan,
  Project,
  ProjectCategory,
  ProjectConstraints,
  ToolAwareNote,
  ToolItem,
} from "../../shared/types";
import { BUILD_PATH_LABELS } from "../../shared/constants";
import { demoPlan } from "../data/demoPlan";
import { upholsteredBenchTemplate } from "./templates/upholsteredBench";
import { wovenWallHangingTemplate } from "./templates/wovenWallHanging";

/* ------------------------------ agent context ---------------------------- */

export type AgentContext = {
  project: Project;
  constraints: ProjectConstraints;
  /** Category template already adapted to the user's constraints. */
  template: BuildPlan;
  pathPreference?: BuildPathType;
  /** Accumulated agent outputs, keyed by agent name. */
  outputs: Record<string, unknown>;
};

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* ----------------------------- template choice --------------------------- */

export function selectTemplate(category: ProjectCategory): BuildPlan {
  switch (category) {
    case "upholstery":
    case "sewing":
      return deepClone(upholsteredBenchTemplate);
    case "knitting":
    case "weaving":
    case "decor_craft":
      return deepClone(wovenWallHangingTemplate);
    default:
      // woodworking, finishing, metalworking, mixed_material, other:
      // the flagship table template has the deepest coverage.
      return deepClone(demoPlan);
  }
}

/* --------------------------- identity inference -------------------------- */

const CATEGORY_KEYWORDS: { category: ProjectCategory; projectType: string; words: string[] }[] = [
  { category: "upholstery", projectType: "Upholstered item", words: ["upholster", "boucle", "bouclé", "tufted", "ottoman", "headboard", "cushion", "velvet"] },
  { category: "weaving", projectType: "Woven item", words: ["weav", "woven", "wall hanging", "wall-hanging", "tapestry", "macrame", "macramé", "fiber art", "loom"] },
  { category: "knitting", projectType: "Knitted item", words: ["knit", "crochet", "chunky blanket", "throw blanket", "yarn"] },
  { category: "sewing", projectType: "Cushion/ottoman", words: ["sew", "curtain", "pillow cover", "slipcover", "drape"] },
  { category: "decor_craft", projectType: "Wall art / décor", words: ["mirror", "wall art", "wreath", "vase", "candle", "decor", "frame"] },
  { category: "woodworking", projectType: "Dining table", words: ["dining table", "dining-table", "kitchen table"] },
  { category: "woodworking", projectType: "Coffee table", words: ["coffee table", "coffee-table"] },
  { category: "woodworking", projectType: "Side table", words: ["side table", "end table", "nightstand", "night-stand"] },
  { category: "woodworking", projectType: "Console", words: ["console", "entry table", "sofa table"] },
  { category: "woodworking", projectType: "Shelf", words: ["shelf", "shelv", "bookcase", "bookshelf"] },
  { category: "woodworking", projectType: "Cabinet", words: ["cabinet", "sideboard", "credenza", "buffet", "dresser"] },
  { category: "woodworking", projectType: "Bench", words: ["bench"] },
  { category: "woodworking", projectType: "Chair", words: ["chair", "stool"] },
  { category: "woodworking", projectType: "Bed frame", words: ["bed frame", "bed-frame", "platform bed"] },
  { category: "woodworking", projectType: "Outdoor item", words: ["outdoor", "patio", "adirondack", "planter"] },
  { category: "woodworking", projectType: "Dining table", words: ["table"] },
];

const STYLE_WORDS = [
  "oak", "walnut", "pine", "cedar", "rattan", "cane", "marble", "travertine", "boucle", "bouclé",
  "linen", "velvet", "brass", "iron", "pedestal", "trestle", "arched", "fluted", "reeded",
  "mid-century", "farmhouse", "scandinavian",
];

const BRAND_HOSTS: [string, string][] = [
  ["potterybarn", "Pottery Barn"],
  ["westelm", "West Elm"],
  ["crateandbarrel", "Crate & Barrel"],
  ["cb2", "CB2"],
  ["article", "Article"],
  ["wayfair", "Wayfair"],
  ["anthropologie", "Anthropologie"],
  ["urbanoutfitters", "Urban Outfitters"],
  ["arhaus", "Arhaus"],
  ["restorationhardware", "RH"],
  ["rh.com", "RH"],
  ["ikea", "IKEA"],
  ["target", "Target"],
  ["etsy", "Etsy"],
];

export type InferredIdentity = {
  title: string;
  category: ProjectCategory;
  projectType: string;
  brand?: string;
  styleWord?: string;
};

/** Infer a brand-safe title, category and project type from the user's inputs. */
export function inferIdentity(project: Project): InferredIdentity {
  const haystack = [
    project.sourceUrl || "",
    project.userDescription || "",
    project.pastedProductText || "",
    project.projectType || "",
    project.title || "",
  ]
    .join(" ")
    .toLowerCase();

  let category: ProjectCategory = project.category || "other";
  let projectType = project.projectType || "";
  const hit = CATEGORY_KEYWORDS.find((k) => k.words.some((w) => haystack.includes(w)));
  if (hit) {
    if (!projectType || projectType === "Other") projectType = hit.projectType;
    if (!category || category === "other") category = hit.category;
  }
  if (!projectType) projectType = "Custom piece";
  if (!category || (category === "other" && hit)) category = hit ? hit.category : "other";

  const styleWord = STYLE_WORDS.find((w) => haystack.includes(w));
  let brand: string | undefined;
  if (project.sourceUrl) {
    const lower = project.sourceUrl.toLowerCase();
    brand = BRAND_HOSTS.find(([host]) => lower.includes(host))?.[1];
  }

  const styled = styleWord ? `${styleWord[0].toUpperCase()}${styleWord.slice(1)} ` : "";
  const title =
    project.title && project.title !== "Untitled project"
      ? project.title
      : `${styled}${projectType} (inspired-by)`;

  return { title, category, projectType, brand, styleWord };
}

/* ------------------------------ tool matching ---------------------------- */

const NOISE_WORDS = new Set(["in", "with", "and", "for", "the", "a", "or", "set", "x"]);

function toolWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w.length > 1 && !NOISE_WORDS.has(w) && !/^\d/.test(w));
}

/** Fuzzy match between an owned-tool label and a plan tool name. */
export function toolMatches(ownedTool: string, toolName: string): boolean {
  const a = toolWords(ownedTool);
  const b = toolWords(toolName);
  if (a.length === 0 || b.length === 0) return false;
  const aStr = a.join(" ");
  const bStr = b.join(" ");
  if (aStr.includes(bStr) || bStr.includes(aStr)) return true;
  const overlap = a.filter((w) => b.includes(w));
  return overlap.length >= 2 || (overlap.length === 1 && (a.length === 1 || b.length === 1));
}

export function ownsTool(owned: string[], toolName: string): boolean {
  return owned.some((o) => toolMatches(o, toolName));
}

/* ------------------------------ budget helpers --------------------------- */

function round$(n: number): number {
  return Math.max(0, Math.round(n));
}

/** Multiply every cost figure in the plan by `factor`, then re-verify sums. */
export function scaleCosts(plan: BuildPlan, factor: number): void {
  if (!isFinite(factor) || factor <= 0 || Math.abs(factor - 1) < 0.01) {
    recomputeBudget(plan);
    return;
  }
  for (const m of [...plan.materials, ...plan.hardware]) {
    m.estimatedCostLow = round$(m.estimatedCostLow * factor);
    m.estimatedCostHigh = round$(m.estimatedCostHigh * factor);
  }
  for (const line of plan.budgetBreakdown.lines) {
    for (const item of line.items) {
      item.costLow = round$(item.costLow * factor);
      item.costHigh = round$(item.costHigh * factor);
    }
  }
  for (const dept of plan.shoppingListByDepartment) {
    for (const item of dept.items) {
      item.estimatedCostLow = round$(item.estimatedCostLow * factor);
      item.estimatedCostHigh = round$(item.estimatedCostHigh * factor);
    }
  }
  for (const path of plan.buildPaths) {
    path.estimatedCostLow = round$(path.estimatedCostLow * factor);
    path.estimatedCostHigh = round$(path.estimatedCostHigh * factor);
  }
  for (const alt of plan.alternatives) {
    alt.estimatedCostLow = round$(alt.estimatedCostLow * factor);
    alt.estimatedCostHigh = round$(alt.estimatedCostHigh * factor);
  }
  plan.minimumViableDupe.estimatedCostLow = round$(plan.minimumViableDupe.estimatedCostLow * factor);
  plan.minimumViableDupe.estimatedCostHigh = round$(plan.minimumViableDupe.estimatedCostHigh * factor);
  recomputeBudget(plan);
}

/** Recompute budget subtotals/totals from line items and sync dependent numbers. */
export function recomputeBudget(plan: BuildPlan): void {
  const b = plan.budgetBreakdown;
  let requiredLow = 0;
  let requiredHigh = 0;
  let optionalHigh = 0;
  for (const line of b.lines) {
    line.subtotalLow = line.items.reduce((s, i) => s + (i.optional ? 0 : i.costLow), 0);
    line.subtotalHigh = line.items.reduce((s, i) => s + i.costHigh, 0);
    requiredLow += line.subtotalLow;
    requiredHigh += line.items.reduce((s, i) => s + (i.optional ? 0 : i.costHigh), 0);
    optionalHigh += line.items.reduce((s, i) => s + (i.optional ? i.costHigh : 0), 0);
  }
  b.materialsTotalLow = requiredLow;
  b.materialsTotalHigh = requiredHigh + optionalHigh;
  b.grandTotalLow = requiredLow;
  b.grandTotalHigh = requiredHigh + optionalHigh;
  if (b.referencePrice) {
    b.estimatedSavingsLow = Math.max(0, b.referencePrice - b.grandTotalHigh);
    b.estimatedSavingsHigh = Math.max(0, b.referencePrice - b.grandTotalLow);
  }

  plan.snapshot.estimatedCostLow = b.grandTotalLow;
  plan.snapshot.estimatedCostHigh = b.grandTotalHigh;
  const s = plan.savingsStory;
  s.estimatedDiyCostLow = b.grandTotalLow;
  s.estimatedDiyCostHigh = b.grandTotalHigh;
  if (s.referencePrice) {
    const mid = (b.grandTotalLow + b.grandTotalHigh) / 2;
    s.estimatedSavings = round$(s.referencePrice - mid);
    s.savingsPercentage = Math.round(((s.referencePrice - mid) / s.referencePrice) * 100);
  } else {
    s.estimatedSavings = undefined;
    s.savingsPercentage = undefined;
  }
}

/* ------------------------------ path helpers ----------------------------- */

/** Pin the plan to a build path: recommended flags, snapshot, title suffix. */
export function applyBuildPath(plan: BuildPlan, pathType: BuildPathType): void {
  const path =
    plan.buildPaths.find((p) => p.name === pathType) ||
    plan.buildPaths.find((p) => p.recommended) ||
    plan.buildPaths[0];
  if (!path) return;
  for (const p of plan.buildPaths) p.recommended = p.id === path.id;
  plan.snapshot.selectedBuildPath = path.name;
  plan.snapshot.difficulty = path.difficulty;
  plan.snapshot.estimatedTime = path.estimatedTime;
  plan.snapshot.visualMatchScore = path.visualMatchScore;
  plan.snapshot.durabilityScore = path.durabilityScore;
  const base = plan.title.replace(/ - [^-]*$/, "");
  plan.title = `${base} - ${BUILD_PATH_LABELS[path.name]}`;
}

function fidelityToPath(fidelity: ProjectConstraints["desiredFidelity"]): BuildPathType {
  switch (fidelity) {
    case "similar_vibe":
    case "budget_interpretation":
      return "budget";
    case "near_dupe_inspired":
      return "closest_match";
    case "function_first":
    case "close_visual_match":
    default:
      return "balanced";
  }
}

/* ------------------------------- adaptation ------------------------------ */

/** Deep-clone the category template and adapt it to this project's constraints. */
export function adaptTemplateToProject(project: Project, pathPreference?: BuildPathType): BuildPlan {
  const identity = inferIdentity(project);
  const plan = selectTemplate(identity.category);
  const c = project.constraints;

  plan.projectId = project.id;
  const baseTitle = identity.title.replace(/\s*\(inspired-by\)\s*$/i, "");
  plan.title = `${baseTitle} - Balanced Build`;
  plan.snapshot.projectType = identity.projectType;
  plan.snapshot.inspiredBy = project.sourceUrl
    ? `${identity.brand ? `${identity.brand}-catalog style ` : "Designer "}${identity.projectType.toLowerCase()} (user-provided reference link)`
    : `Designer ${identity.projectType.toLowerCase()} (user-provided ${project.sourceType === "images" ? "photos" : "description"})`;

  /* build path: explicit preference wins, then fidelity mapping */
  const chosenPath = pathPreference || fidelityToPath(c.desiredFidelity);
  applyBuildPath(plan, chosenPath);

  /* fidelity: material lean notes + visual match nudges */
  if (c.desiredFidelity === "similar_vibe" || c.desiredFidelity === "budget_interpretation") {
    plan.snapshot.visualMatchScore = Math.max(40, plan.snapshot.visualMatchScore - 8);
    for (const m of plan.materials) {
      if (m.budgetAlternative && !m.notes?.includes("budget alternative")) {
        m.notes = `${m.notes ? `${m.notes} ` : ""}Per your similar-vibe preference, the budget alternative (${m.budgetAlternative}) is the recommended pick here.`;
        break;
      }
    }
  } else if (c.desiredFidelity === "near_dupe_inspired") {
    plan.snapshot.visualMatchScore = Math.min(96, plan.snapshot.visualMatchScore + 4);
    for (const m of plan.materials) {
      if (m.premiumAlternative && !m.notes?.includes("premium alternative")) {
        m.notes = `${m.notes ? `${m.notes} ` : ""}Per your near-dupe preference, consider the premium alternative (${m.premiumAlternative}) - it closes most of the remaining visual gap.`;
        break;
      }
    }
  }

  /* budget scaling toward the user's ceiling */
  if (c.budgetMax && plan.budgetBreakdown.grandTotalHigh > c.budgetMax) {
    const factor = Math.max(0.65, c.budgetMax / plan.budgetBreakdown.grandTotalHigh);
    scaleCosts(plan, factor);
    plan.budgetBreakdown.notes.push(
      `Costs were leaned toward your $${c.budgetMax} ceiling by preferring the budget alternatives listed per material. If the total still lands high in your region, the material swaps tab shows where the next dollars come out.`
    );
  } else {
    recomputeBudget(plan);
  }

  /* tool awareness */
  applyToolAwareness(plan, c);

  /* durability + kids/pets */
  if (c.kidsOrPets) {
    plan.safetyReview.childPetNotes.unshift(
      "You told us kids or pets share this home: every finish cure window, rounded-edge spec, and hardware safety note in this plan is REQUIRED, not optional. Conservative beats sorry."
    );
    if (!plan.snapshot.safetyRiskLabel.toLowerCase().includes("kid")) {
      plan.snapshot.safetyRiskLabel += "; kid/pet household notes applied";
    }
  }
  if (c.durability === "heavy_duty") {
    plan.snapshot.durabilityScore = Math.min(98, plan.snapshot.durabilityScore + 4);
    plan.maintenance.unshift(
      "Heavy-duty use selected: double the inspection cadence in this list, and re-tighten all mechanical fasteners monthly for the first quarter."
    );
  } else if (c.durability === "decorative") {
    plan.assumptions.push("You marked this decorative/light-use - structural margins in this plan are sized for everyday use anyway, so treat that as headroom, not license to climb on it.");
  }

  /* existing inventory substitutions */
  for (const inv of c.existingInventory || []) {
    const target = [...plan.materials, ...plan.hardware].find((m) =>
      toolMatches(inv.name, m.name) || toolMatches(inv.name, m.specification)
    );
    if (target && !target.existingInventorySubstitution) {
      target.existingInventorySubstitution = `You already have ${inv.name}${inv.quantity ? ` (${inv.quantity})` : ""}${inv.dimensions ? `, ${inv.dimensions}` : ""} - use it here and save roughly $${target.estimatedCostLow}-$${target.estimatedCostHigh}. Check condition first${inv.condition ? ` (you noted: ${inv.condition})` : ""}.`;
    }
  }

  /* user dimensions override */
  if (c.dimensions && (c.dimensions.width || c.dimensions.height || c.dimensions.depth)) {
    const unit = c.dimensions.unit;
    const entries: { label: string; value?: number }[] = [
      { label: "Overall width (user)", value: c.dimensions.width },
      { label: "Overall depth (user)", value: c.dimensions.depth },
      { label: "Overall height (user)", value: c.dimensions.height },
    ];
    for (const e of entries) {
      if (e.value) {
        plan.dimensions.unshift({ label: e.label, value: `${e.value} ${unit}.`, source: "user", confidence: 95 });
      }
    }
  }

  /* reference price from analysis, if the intake actually extracted one */
  const extractedPrice = project.analysis?.referenceExtraction?.price;
  if (extractedPrice) {
    plan.savingsStory.referencePrice = extractedPrice;
    plan.savingsStory.referenceLabel = `$${extractedPrice.toLocaleString("en-US")} (from the product page)`;
    plan.budgetBreakdown.referencePrice = extractedPrice;
    recomputeBudget(plan);
  }

  /* carry the user's answered feasibility questions into the plan */
  if (project.feasibilityQuestions && project.feasibilityQuestions.length > 0) {
    plan.feasibilityQuestions = deepClone(project.feasibilityQuestions);
  }

  /* stores */
  const store = c.preferredStores?.[0];
  if (store && store !== "Other") {
    retargetShoppingStore(plan, store);
  }

  plan.updatedAt = new Date().toISOString();
  return plan;
}

/** Compare required tools against owned tools; write notes + readiness. */
export function applyToolAwareness(plan: BuildPlan, c: ProjectConstraints): void {
  const owned = c.ownedTools || [];
  const missingRequired: ToolItem[] = [];
  for (const tool of plan.tools) {
    tool.owned = ownsTool(owned, tool.name);
    if (tool.required && !tool.owned) missingRequired.push(tool);
  }

  const notes: ToolAwareNote[] = [...plan.toolAwareNotes];
  for (const tool of missingRequired) {
    const already = notes.some((n) => toolMatches(n.missingTool, tool.name));
    if (already) continue;
    const lower = tool.name.toLowerCase();
    if (lower.includes("saw") && (c.storeCutsOnly || lower.includes("circular") || lower.includes("table"))) {
      notes.push({
        missingTool: tool.name,
        impact: `Needed for: ${tool.purpose}`,
        workaround:
          "Have the store panel saw make the sheet break-downs per the store cut sheet, and treat every store cut as rough - final trims happen at home against a straightedge. Cut accuracy on hidden parts is forgiving.",
        workaroundType: "store_cut",
      });
    } else if (tool.substitute) {
      notes.push({
        missingTool: tool.name,
        impact: `Needed for: ${tool.purpose}`,
        workaround: tool.substitute,
        workaroundType: "substitute_tool",
      });
    } else if (tool.rentalRecommended || lower.includes("sander") || lower.includes("router")) {
      notes.push({
        missingTool: tool.name,
        impact: `Needed for: ${tool.purpose}`,
        workaround: `Rent it for the day from the big-box tool desk (typically $15-35/day)${tool.estimatedCostIfBuying ? `, or buy at ${tool.estimatedCostIfBuying} if more projects are coming` : ""}.`,
        workaroundType: "rental",
      });
    } else {
      notes.push({
        missingTool: tool.name,
        impact: `Needed for: ${tool.purpose}`,
        workaround: `Budget it as a purchase${tool.estimatedCostIfBuying ? ` (${tool.estimatedCostIfBuying})` : ""} or borrow one - this one has no clean technique workaround.`,
        workaroundType: tool.estimatedCostIfBuying ? "buy" : "borrow",
      });
    }
  }
  plan.toolAwareNotes = notes;

  const r = plan.buildReadiness;
  r.missingTools = missingRequired.map((t) => {
    const note = notes.find((n) => toolMatches(n.missingTool, t.name));
    return note ? `${t.name} (workaround: ${note.workaroundType.replace(/_/g, " ")})` : t.name;
  });
  r.score = Math.max(30, Math.min(95, 95 - missingRequired.length * 6 - (c.skillLevel === "beginner" ? 5 : 0)));
  r.readyStatus = r.score >= 85 ? "ready" : r.score >= 65 ? "mostly_ready" : r.score >= 45 ? "needs_prep" : "not_ready";
}

/** Point every shopping department at the user's preferred store (fabric/craft departments keep their specialty store). */
export function retargetShoppingStore(plan: BuildPlan, store: string): void {
  const craftLike = /fabric|yarn|fiber|upholstery/i;
  for (const dept of plan.shoppingListByDepartment) {
    if (craftLike.test(dept.department) && !/michaels|joann|hobby/i.test(store)) continue;
    dept.store = store;
  }
  if (plan.storeCutSheet) plan.storeCutSheet.storeName = store;
}

/** Guarantee a store cut sheet exists (used by the refine preset). */
export function ensureStoreCutSheet(plan: BuildPlan, store = "Home Depot"): void {
  if (plan.storeCutSheet) return;
  const sheetMaterials = plan.cutOptimizationPlans;
  plan.storeCutSheet = {
    storeName: store,
    intro:
      sheetMaterials.length > 0
        ? "Hand this to the panel-saw associate. All cuts are rough break-downs so parts fit your car and handle safely; final dimensions get trimmed at home."
        : "This project has no sheet goods that need store cutting - the list below covers the few straight lumber cuts a store chop saw can make if you have no saw at home.",
    requests: sheetMaterials.map((p) => ({
      material: p.material,
      buySize: p.sourceSize,
      requestedCuts: p.cuts.slice(0, 4).map((cut) => ({
        label: cut.partName,
        cutTo: `${cut.quantity} @ ${cut.dimensions}`,
        oversizedBy: cut.precision === "finish" ? "1/4 in. for home trimming" : "generous",
        finalTrimAtHome: true,
        notes: cut.notes,
      })),
    })),
    warnings: [
      "Panel saws hold about +/- 1/8 in. - treat every store cut as rough.",
      "Measure each piece before leaving the store.",
    ],
    homeTrimNotes: ["Re-trim any edge you will reference against a straightedge before using it."],
  };
}

/** Create the ready-to-run context used by every pipeline agent. */
export function createAgentContext(project: Project, pathPreference?: BuildPathType): AgentContext {
  return {
    project,
    constraints: project.constraints,
    template: adaptTemplateToProject(project, pathPreference),
    pathPreference,
    outputs: {},
  };
}
