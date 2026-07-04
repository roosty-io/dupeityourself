import type { AgentStageKey, DupeAccuracyPreference, BuildPathType } from "./types";

export const LEGAL_DISCLAIMER =
  "Dupe It Yourself creates original DIY plans inspired by user-provided references. It does not claim affiliation with any brands and does not reproduce protected logos, trademarks, or proprietary plans. Always follow safety guidelines and consult a qualified professional for structural, electrical, plumbing, load-bearing, or high-risk projects.";

export const TOOL_OPTIONS = [
  "Drill/driver",
  "Circular saw",
  "Miter saw",
  "Table saw",
  "Jigsaw",
  "Router",
  "Random orbit sander",
  "Pocket hole jig",
  "Brad nailer",
  "Clamps",
  "Sewing machine",
  "Serger",
  "Knitting needles",
  "Loom",
  "Staple gun",
  "Paint sprayer",
  "Measuring/layout tools",
  "Safety gear",
] as const;

export const STORE_OPTIONS = [
  "Home Depot",
  "Lowe's",
  "Menards",
  "Amazon",
  "Michaels",
  "Joann",
  "Hobby Lobby",
  "Local lumber yard",
  "Local fabric store",
  "Other",
] as const;

export const PROJECT_TYPE_OPTIONS = [
  "Dining table",
  "Coffee table",
  "Side table",
  "Console",
  "Bench",
  "Chair",
  "Shelf",
  "Cabinet",
  "Storage unit",
  "Upholstered item",
  "Headboard",
  "Cushion/ottoman",
  "Knitted item",
  "Woven item",
  "Wall art / décor",
  "Outdoor item",
  "Other",
] as const;

export const DUPE_ACCURACY_OPTIONS: {
  value: DupeAccuracyPreference;
  label: string;
  description: string;
}[] = [
  {
    value: "similar_vibe",
    label: "Similar vibe",
    description: "Capture the overall style with the simplest, cheapest approach.",
  },
  {
    value: "budget_interpretation",
    label: "Budget interpretation",
    description: "Prioritize cost savings while keeping the key design cues.",
  },
  {
    value: "function_first",
    label: "Function-first",
    description: "Match the function and footprint; looks are secondary.",
  },
  {
    value: "close_visual_match",
    label: "Close visual match",
    description: "Get visually close with better materials and finish work.",
  },
  {
    value: "near_dupe_inspired",
    label: "Near-dupe inspired",
    description: "The closest practical inspired-by version, cost is secondary.",
  },
];

export const BUILD_PATH_LABELS: Record<BuildPathType, string> = {
  budget: "Budget Build",
  beginner: "Beginner Build",
  balanced: "Balanced Build",
  closest_match: "Closest Match",
  premium: "Premium Build",
  pro: "Pro Build",
  minimum_viable_dupe: "Minimum Viable Dupe",
};

export const AGENT_STAGES: { key: AgentStageKey; label: string }[] = [
  { key: "intake", label: "Analyzing reference input…" },
  { key: "vision", label: "Identifying materials and construction style…" },
  { key: "classification", label: "Classifying project type…" },
  { key: "feasibility", label: "Reviewing feasibility details…" },
  { key: "worth_it", label: "Calculating DIY Worth-It Score…" },
  { key: "build_paths", label: "Generating build path options…" },
  { key: "materials", label: "Creating materials list…" },
  { key: "material_swaps", label: "Simulating material swaps…" },
  { key: "engineering", label: "Checking structure and joinery…" },
  { key: "tools_skill", label: "Checking your tool inventory…" },
  { key: "tool_adaptation", label: "Adapting the plan to your tools…" },
  { key: "cost", label: "Estimating budget…" },
  { key: "shopping", label: "Building store shopping list…" },
  { key: "cut_optimization", label: "Creating cut list and store cut sheet…" },
  { key: "finish_matching", label: "Matching finish and color options…" },
  { key: "instructions", label: "Writing step-by-step instructions…" },
  { key: "diagrams", label: "Drawing build diagrams…" },
  { key: "safety", label: "Checking safety risks…" },
  { key: "safety_design_review", label: "Running safety design review…" },
  { key: "alternatives", label: "Generating alternative versions…" },
  { key: "mistake_prevention", label: "Adding mistake prevention notes…" },
  { key: "mini_lessons", label: "Preparing skill mini lessons…" },
  { key: "builder_handoff", label: "Drafting builder handoff brief…" },
  { key: "qa", label: "Reviewing plan for missing details…" },
  { key: "compose", label: "Composing your build manual…" },
];

export const FEATURE_FLAGS = [
  {
    key: "pdf_export",
    enabledFor: ["free", "plus", "pro"],
    description: "Print-friendly full plan export",
  },
  {
    key: "csv_export",
    enabledFor: ["free", "plus", "pro"],
    description: "CSV shopping list export",
  },
  {
    key: "cut_optimizer",
    enabledFor: ["free", "plus", "pro"],
    description: "AI cut optimizer (MVP: available to all tiers)",
  },
  {
    key: "unlimited_projects",
    enabledFor: ["plus", "pro"],
    description: "Unlimited build plans per month",
  },
  {
    key: "advanced_diagrams",
    enabledFor: ["pro"],
    description: "Advanced diagram pack (future)",
  },
] as const;

export const FREE_TIER_PROJECT_LIMIT = 10;
