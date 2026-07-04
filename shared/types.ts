/**
 * Dupe It Yourself - shared type contracts.
 * These types are the single source of truth for the client, the server,
 * and every AI agent's structured output.
 */

/* ----------------------------- core enums ------------------------------ */

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "professional";

export type WorkspaceType = "apartment" | "garage" | "basement" | "outdoor" | "shop" | "other";

export type DupeAccuracyPreference =
  | "similar_vibe"
  | "budget_interpretation"
  | "function_first"
  | "close_visual_match"
  | "near_dupe_inspired";

export type DurabilityNeed = "decorative" | "light_use" | "everyday_use" | "heavy_duty";

export type BuildPathType =
  | "budget"
  | "beginner"
  | "balanced"
  | "closest_match"
  | "premium"
  | "pro"
  | "minimum_viable_dupe";

export type ProjectCategory =
  | "woodworking"
  | "upholstery"
  | "sewing"
  | "knitting"
  | "weaving"
  | "finishing"
  | "metalworking"
  | "decor_craft"
  | "mixed_material"
  | "other";

export type ProjectStatus = "draft" | "analyzing" | "questions" | "generating" | "ready" | "error";

export type RiskLevel = "low" | "medium" | "high" | "professional_review_recommended" | "unsupported";

export type UserSubscriptionTier = "free" | "plus" | "pro";

/* ----------------------------- constraints ----------------------------- */

export type ExistingInventoryItem = {
  name: string;
  category: "material" | "hardware" | "tool" | "finish" | "fabric" | "yarn" | "other";
  quantity?: string;
  dimensions?: string;
  condition?: string;
  notes?: string;
};

export type ProjectConstraints = {
  budgetMin?: number;
  budgetMax?: number;
  skillLevel: SkillLevel;
  ownedTools: string[];
  preferredStores: string[];
  workspaceType?: WorkspaceType;
  desiredFidelity: DupeAccuracyPreference;
  durability: DurabilityNeed;
  dimensions?: {
    width?: number;
    depth?: number;
    height?: number;
    unit: "in" | "cm";
  };
  knownReferenceDimensions?: string;
  materialPreferences?: string[];
  avoidMaterials?: string[];
  existingInventory?: ExistingInventoryItem[];
  kidsOrPets?: boolean;
  weightBearing?: boolean;
  storeCutsOnly?: boolean;
  optimizeFor?: "cheapest" | "easiest" | "closest_match" | "balanced";
  timeAvailability?: string;
  notes?: string;
};

/* --------------------------- reference intake -------------------------- */

export type SourceType = "url" | "images" | "description" | "mixed";

export type ReferenceExtraction = {
  title?: string;
  brand?: string;
  price?: number;
  currency?: string;
  description?: string;
  dimensionsText?: string;
  materialsText?: string;
  imageUrls?: string[];
  fetchSucceeded: boolean;
  fetchError?: string;
  extractionConfidence: number; // 0-100
};

export type VisionComponentGuess = {
  component: string;
  observation: string;
  confidence: number; // 0-100
};

export type VisionAnalysis = {
  objectType: string;
  styleSummary: string;
  components: VisionComponentGuess[];
  materialGuesses: { material: string; confidence: number; reasoning: string }[];
  finishGuesses: { finish: string; confidence: number; reasoning: string }[];
  constructionClues: string[];
  decorativeDetails: string[];
  complexityLevel: "simple" | "moderate" | "complex" | "very_complex";
  uncertainAreas: string[];
  needsUserConfirmation: string[];
};

export type MeasurementCalibration = {
  knownDimension?: {
    label: string;
    value: number;
    unit: "in" | "cm";
  };
  anchorType?:
    | "product_page"
    | "table_height"
    | "door_height"
    | "chair_height"
    | "person_in_photo"
    | "user_entered"
    | "tape_measure_in_photo";
  estimatedDimensions: {
    label: string;
    value: number;
    unit: "in" | "cm";
    confidence: number;
    reasoning: string;
  }[];
  notes: string[];
};

export type ProjectAnalysis = {
  projectBrief: string;
  category: ProjectCategory;
  secondaryCategory?: ProjectCategory;
  referenceExtraction?: ReferenceExtraction;
  visionAnalysis?: VisionAnalysis;
  measurementCalibration?: MeasurementCalibration;
  assumptions: string[];
  missingInformation: string[];
  riskFlags: RiskFlag[];
  highRisk: boolean;
  confidenceScore: number; // 0-100
};

/* ------------------------- feasibility questions ----------------------- */

export type FeasibilityQuestion = {
  id: string;
  question: string;
  whyItMatters: string;
  answerType: "text" | "number" | "single_choice" | "multi_choice" | "boolean";
  options?: string[];
  requiredForSafety: boolean;
  assumptionIfSkipped: string;
  answer?: string;
};

/* ------------------------------- scoring ------------------------------- */

export type WorthItScore = {
  score: number; // 0-100
  verdict: "excellent" | "good" | "mixed" | "poor" | "not_recommended";
  savingsPotential: number; // 0-100 subscores
  difficultyFit: number;
  toolAccessibility: number;
  materialAvailability: number;
  visualMatchPotential: number;
  safetyRisk: number; // higher = safer
  timeCommitment: number; // higher = less time burden
  explanation: string;
  recommendation: string;
};

export type SavingsStory = {
  referencePrice?: number;
  referenceLabel?: string;
  estimatedDiyCostLow: number;
  estimatedDiyCostHigh: number;
  estimatedSavings?: number;
  savingsPercentage?: number;
  toolCostsIncluded: boolean;
  laborTimeTradeoff: string;
  explanation: string;
};

export type ConfidenceBreakdown = {
  overall: number;
  referenceImage: number;
  materials: number;
  dimensions: number;
  finish: number;
  construction: number;
  cost: number;
  safety: number;
  visualMatch: number;
  uncertaintyNotes: string[];
  howToImproveConfidence: string[];
};

export type BuildReadiness = {
  score: number; // 0-100
  readyStatus: "ready" | "mostly_ready" | "needs_prep" | "not_ready";
  missingTools: string[];
  missingMaterials: string[];
  skillGaps: string[];
  workspaceConcerns: string[];
  budgetConcerns: string[];
  safetyConcerns: string[];
  recommendation: string;
};

export type DifficultyBreakdown = {
  overall: SkillLevel;
  cuttingAccuracy?: string;
  assembly?: string;
  joinery?: string;
  finishMatching?: string;
  toolComplexity?: string;
  physicalHandling?: string;
  safetyRisk?: string;
  timeCommitment?: string;
  repairability?: string;
  beginnerTolerance?: string;
  notes: string[];
};

/* ----------------------------- build paths ----------------------------- */

export type BuildPath = {
  id: string;
  name: BuildPathType;
  label: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  estimatedTime: string;
  difficulty: string;
  visualMatchScore: number; // 0-100
  durabilityScore: number; // 0-100
  requiredTools: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  compromises: string[];
  recommendationReason?: string;
  recommended?: boolean;
};

/* ------------------------- materials & hardware ------------------------ */

export type MaterialItem = {
  name: string;
  category: string;
  quantity: string;
  specification: string;
  purpose: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  budgetAlternative?: string;
  premiumAlternative?: string;
  existingInventorySubstitution?: string;
  notes?: string;
};

export type MaterialSwapOption = {
  originalMaterial?: string;
  alternativeMaterial: string;
  costImpact: "lower" | "similar" | "higher";
  durabilityImpact: "lower" | "similar" | "higher";
  visualMatchImpact: "lower" | "similar" | "higher";
  difficultyImpact: "easier" | "similar" | "harder";
  pros: string[];
  cons: string[];
  notes: string;
};

export type ToolItem = {
  name: string;
  required: boolean;
  category: string;
  purpose: string;
  substitute?: string;
  rentalRecommended?: boolean;
  owned?: boolean;
  beginnerNote?: string;
  estimatedCostIfBuying?: string;
};

export type ToolAwareNote = {
  missingTool: string;
  impact: string;
  workaround: string;
  workaroundType: "store_cut" | "substitute_tool" | "rental" | "technique_change" | "buy" | "borrow";
};

/* --------------------------- cuts & shopping --------------------------- */

export type CutListItem = {
  partName: string;
  quantity: number;
  material: string;
  dimensions: string;
  notes?: string;
};

export type CutOptimizationPlan = {
  material: string;
  sourceSize: string;
  cuts: {
    partName: string;
    quantity: number;
    dimensions: string;
    precision: "rough" | "finish";
    notes?: string;
  }[];
  estimatedWastePercent: number;
  grainDirectionNotes?: string[];
  sequenceNotes: string[];
};

export type StoreCutRequest = {
  material: string;
  buySize: string;
  requestedCuts: {
    label: string;
    cutTo: string;
    oversizedBy?: string;
    finalTrimAtHome: boolean;
    notes?: string;
  }[];
};

export type StoreCutSheet = {
  storeName: string;
  intro: string;
  requests: StoreCutRequest[];
  warnings: string[];
  homeTrimNotes: string[];
};

export type ShoppingListItem = {
  name: string;
  quantity: string;
  spec: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  required: boolean;
  notes?: string;
  checked?: boolean;
};

export type ShoppingListDepartment = {
  store?: string;
  department: string;
  items: ShoppingListItem[];
};

export type BudgetLine = {
  category: string;
  items: { name: string; costLow: number; costHigh: number; optional?: boolean }[];
  subtotalLow: number;
  subtotalHigh: number;
};

export type BudgetBreakdown = {
  lines: BudgetLine[];
  materialsTotalLow: number;
  materialsTotalHigh: number;
  optionalToolsLow: number;
  optionalToolsHigh: number;
  grandTotalLow: number;
  grandTotalHigh: number;
  referencePrice?: number;
  estimatedSavingsLow?: number;
  estimatedSavingsHigh?: number;
  confidence: number;
  notes: string[];
};

/* ------------------------------- timeline ------------------------------ */

export type ProjectTimelinePhase = {
  phase: string;
  dayOrSession: string;
  estimatedDuration: string;
  tasks: string[];
  waitTime?: string;
  dependencies?: string[];
  notes?: string;
};

/* --------------------------------- steps ------------------------------- */

export type BuildStep = {
  stepNumber: number;
  title: string;
  estimatedTime: string;
  goal: string;
  toolsNeeded: string[];
  materialsNeeded: string[];
  instructions: string[];
  measurementNotes?: string[];
  safetyNotes?: string[];
  qualityCheck?: string;
  commonMistake?: string;
  relatedMiniLessons?: string[];
  phase?: string;
};

export type DiagramSpec = {
  id: string;
  title: string;
  type: "svg" | "ascii" | "description";
  description: string;
  svg?: string;
  ascii?: string;
  caption?: string;
};

/* ------------------------------- finishing ----------------------------- */

export type FinishGuide = {
  referenceFinishDescription: string;
  confidence: number;
  recommendedFinishSystem: string[];
  budgetOption: string[];
  premiumOption: string[];
  stainPaintOptions: { name: string; type: string; note: string }[];
  topcoatOptions: { name: string; note: string }[];
  colorMatchingTips: string[];
  testBoardInstructions: string[];
  commonProblems: { problem: string; fix: string }[];
  curingNotes: string[];
  applicationSteps: string[];
};

/* ------------------------------ mini lessons --------------------------- */

export type MiniLesson = {
  id: string;
  title: string;
  skillCategory: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  explanation: string;
  steps?: string[];
  commonMistakes?: string[];
  safetyNotes?: string[];
};

/* ------------------------- mistakes & troubleshooting ------------------ */

export type MistakeWarning = {
  mistake: string;
  whyItHappens: string;
  howToAvoid: string;
  howToFix: string;
  affectedSteps?: number[];
};

export type CommonProblem = {
  problem: string;
  likelyCauses: string[];
  fix: string;
  severity: "minor" | "moderate" | "serious" | "safety_stop";
};

export type TroubleshootingResponse = {
  problemSummary: string;
  likelyCauses: string[];
  diagnosticChecks: string[];
  recommendedFixes: string[];
  severity: "minor" | "moderate" | "serious" | "safety_stop";
  safetyWarning?: string;
  preventionTips: string[];
};

/* -------------------------------- safety ------------------------------- */

export type RiskFlag = {
  level: RiskLevel;
  category: string;
  issue: string;
  mitigation: string;
};

export type SafetyDesignReview = {
  overallRisk: RiskLevel;
  summary: string;
  hazards: RiskFlag[];
  ppe: string[];
  childPetNotes: string[];
  structuralNotes: string[];
  finishToxicityNotes: string[];
  professionalReviewRecommended: boolean;
  professionalReviewReason?: string;
};

/* ------------------------- design simplification ----------------------- */

export type DesignSimplifierNotes = {
  difficultOriginalDetails: { detail: string; whyDifficult: string }[];
  simplifications: { original: string; simplified: string; fidelityImpact: string }[];
  preservedElements: string[];
  changedElements: string[];
  removedElements: string[];
  fidelityLossSummary: string;
  rationale: string;
};

export type MinimumViableDupe = {
  summary: string;
  mustPreserveElements: string[];
  canSimplifyElements: string[];
  canRemoveElements: string[];
  constructionApproach: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  estimatedTime: string;
  fidelityTradeoff: string;
};

/* ------------------------------ alternatives --------------------------- */

export type AlternativeOption = {
  id: string;
  name: string;
  focus:
    | "cheapest"
    | "beginner"
    | "premium"
    | "tool_limited"
    | "weekend"
    | "durable"
    | "smaller"
    | "larger"
    | "minimum_viable_dupe";
  description: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  estimatedTime: string;
  pros: string[];
  cons: string[];
  keyChanges: string[];
};

/* ---------------------------- builder handoff -------------------------- */

export type BuilderHandoffBrief = {
  projectSummary: string;
  referenceStyle: string;
  desiredDimensions: string;
  materials: string[];
  finish: string;
  constructionNotes: string[];
  budgetTarget: string;
  qualityExpectations: string[];
  questionsForBuilder: string[];
  quoteRequestMessage: string;
};

/* ----------------------------- the build plan -------------------------- */

export type BuildPlanSnapshot = {
  inspiredBy: string;
  projectType: string;
  selectedBuildPath: BuildPathType;
  difficulty: string;
  estimatedCostLow: number;
  estimatedCostHigh: number;
  estimatedTime: string;
  visualMatchScore: number;
  durabilityScore: number;
  safetyRiskLabel: string;
  bestFor: string;
  requiredWorkspace: string;
  mainMaterials: string[];
  keyTools: string[];
};

export type BuildPlan = {
  id: string;
  projectId: string;
  title: string;
  snapshot: BuildPlanSnapshot;
  worthItScore: WorthItScore;
  savingsStory: SavingsStory;
  referenceAnalysis: string;
  referenceAnalysisDetails: {
    shapeForm: string;
    approxDimensions: string;
    materials: string;
    finishColor: string;
    constructionStyle: string;
    decorativeDetails: string;
    visible: string[];
    uncertain: string[];
  };
  confidenceBreakdown: ConfidenceBreakdown;
  feasibilityQuestions: FeasibilityQuestion[];
  assumptions: string[];
  buildPaths: BuildPath[];
  recommendedPathReason: string;
  designSimplifier: DesignSimplifierNotes;
  minimumViableDupe: MinimumViableDupe;
  dimensions: {
    label: string;
    value: string;
    source: "user" | "product_page" | "estimated" | "standard";
    confidence?: number;
  }[];
  measurementCalibration?: MeasurementCalibration;
  materials: MaterialItem[];
  materialSwaps: MaterialSwapOption[];
  hardware: MaterialItem[];
  tools: ToolItem[];
  toolAwareNotes: ToolAwareNote[];
  buildReadiness: BuildReadiness;
  difficultyBreakdown: DifficultyBreakdown;
  cutList: CutListItem[];
  cutOptimizationPlans: CutOptimizationPlan[];
  storeCutSheet?: StoreCutSheet;
  budgetBreakdown: BudgetBreakdown;
  shoppingListByDepartment: ShoppingListDepartment[];
  projectTimeline: ProjectTimelinePhase[];
  preBuildChecklist: string[];
  steps: BuildStep[];
  diagrams: DiagramSpec[];
  finishGuide: FinishGuide;
  miniLessons: MiniLesson[];
  mistakePrevention: MistakeWarning[];
  commonProblems: CommonProblem[];
  safetyReview: SafetyDesignReview;
  alternatives: AlternativeOption[];
  builderHandoff: BuilderHandoffBrief;
  finalChecklist: string[];
  maintenance: string[];
  qaNotes: string[];
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
};

/* ----------------------------- plan versions --------------------------- */

export type SavedPlanVersion = {
  id: string;
  projectId: string;
  versionNumber: number;
  versionName: string;
  changeSummary: string;
  buildPathType: BuildPathType;
  plan: BuildPlan;
  createdAt: string;
};

export type VersionComparisonRow = {
  versionId: string;
  name: string;
  costRange: string;
  difficulty: string;
  requiredToolsSummary: string;
  visualMatchScore: number;
  durabilityScore: number;
  estimatedTime: string;
  riskLevel: string;
  bestFor: string;
  mainTradeoff: string;
};

/* ----------------------------- agent pipeline -------------------------- */

export type AgentStageKey =
  | "intake"
  | "vision"
  | "classification"
  | "feasibility"
  | "worth_it"
  | "build_paths"
  | "materials"
  | "material_swaps"
  | "engineering"
  | "tools_skill"
  | "tool_adaptation"
  | "cost"
  | "shopping"
  | "cut_optimization"
  | "finish_matching"
  | "instructions"
  | "diagrams"
  | "safety"
  | "safety_design_review"
  | "alternatives"
  | "mistake_prevention"
  | "mini_lessons"
  | "builder_handoff"
  | "qa"
  | "compose";

export type AgentStageStatus = {
  key: AgentStageKey;
  label: string;
  status: "pending" | "running" | "complete" | "error";
};

export type GenerationState = {
  status: "idle" | "running" | "complete" | "error";
  stages: AgentStageStatus[];
  planId?: string;
  error?: string;
  startedAt?: string;
  finishedAt?: string;
};

export type AgentRunRecord = {
  id: string;
  projectId: string;
  agentName: string;
  status: "success" | "error";
  confidenceScore?: number;
  summary?: string;
  errorMessage?: string;
  createdAt: string;
};

/* -------------------------------- project ------------------------------ */

export type UploadedImage = {
  id: string;
  name: string;
  dataUrl: string; // base64 data URL, stored server-side for MVP
  createdAt: string;
};

export type Project = {
  id: string;
  userId: string;
  title: string;
  projectType: string;
  category: ProjectCategory;
  status: ProjectStatus;
  sourceType: SourceType;
  sourceUrl?: string;
  sourceImages: UploadedImage[];
  userDescription?: string;
  pastedProductText?: string;
  constraints: ProjectConstraints;
  analysis?: ProjectAnalysis;
  feasibilityQuestions?: FeasibilityQuestion[];
  generation: GenerationState;
  selectedBuildPath?: BuildPathType;
  latestPlanId?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectWithPlan = Project & {
  plan?: BuildPlan;
  versions: SavedPlanVersion[];
  agentRuns: AgentRunRecord[];
};

/* ----------------------------- chat threads ---------------------------- */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ProjectTroubleshootingThread = {
  id: string;
  projectId: string;
  userId: string;
  messages: ChatMessage[];
  status: "open" | "resolved";
};

/* ---------------------------- library/gallery -------------------------- */

export type DupeLibraryEntry = {
  id: string;
  slug: string;
  title: string;
  styleTagline: string; // brand-safe "inspired-by" description
  category: ProjectCategory;
  referencePriceLabel: string;
  diyCostLabel: string;
  savingsLabel: string;
  difficulty: string;
  time: string;
  worthItScore: number;
  heroEmoji: string;
  summary: string;
  highlights: string[];
  demoProjectId?: string;
};

export type ProjectGalleryEntry = {
  id: string;
  projectId: string;
  userId: string;
  slug: string;
  title: string;
  description: string;
  inspirationImages: string[];
  inProgressImages?: string[];
  finishedImages: string[];
  actualCost?: number;
  actualTime?: string;
  difficultyRating?: number;
  lessonsLearned?: string[];
  notes?: string;
  visibility: "private" | "public" | "unlisted";
  createdAt: string;
};

/* ------------------------------ preferences ---------------------------- */

export type UserPreferences = {
  id: string;
  userId: string;
  preferredStores: string[];
  defaultBudgetMin?: number;
  defaultBudgetMax?: number;
  skillLevel: SkillLevel;
  workspaceType?: WorkspaceType;
  units: "in" | "cm";
  ownedTools: string[];
  inventory: ExistingInventoryItem[];
  subscriptionTier: UserSubscriptionTier;
  createdAt: string;
  updatedAt: string;
};

export type FeatureFlag = {
  key: string;
  enabledFor: UserSubscriptionTier[];
  description: string;
};

/* ------------------------------- API DTOs ------------------------------ */

export type CreateProjectInput = {
  title?: string;
  sourceType: SourceType;
  sourceUrl?: string;
  sourceImages?: { name: string; dataUrl: string }[];
  userDescription?: string;
  pastedProductText?: string;
  projectType?: string;
  category?: ProjectCategory;
  constraints?: Partial<ProjectConstraints>;
};

export type UpdateProjectInput = Partial<
  Pick<
    Project,
    | "title"
    | "projectType"
    | "category"
    | "sourceUrl"
    | "userDescription"
    | "pastedProductText"
    | "constraints"
    | "selectedBuildPath"
  >
> & {
  feasibilityAnswers?: { id: string; answer: string }[];
};

export type RefineRequest = {
  instruction: string;
  presetKey?:
    | "cheaper"
    | "easier"
    | "own_tools_only"
    | "closer_match"
    | "more_durable"
    | "faster"
    | "home_depot_list"
    | "lowes_list"
    | "store_cut_sheet"
    | "builder_handoff"
    | "minimum_viable_dupe";
};

export type AdvisorChatRequest = {
  message: string;
  history: ChatMessage[];
};

export type AdvisorChatResponse = {
  reply: string;
};

export type TroubleshootRequest = {
  problem: string;
};

export type GeneratePlanRequest = {
  pathPreference?: BuildPathType;
};

export type ApiError = {
  error: string;
  detail?: string;
};
