/**
 * API routes. Every endpoint the client api layer (client/src/lib/api.ts)
 * calls is implemented here. Handlers are wrapped so thrown errors become
 * 500 JSON { error } responses; missing entities return 404s.
 */
import type { Express, Request, Response } from "express";
import type {
  AdvisorChatRequest,
  BuildPlan,
  CreateProjectInput,
  GeneratePlanRequest,
  Project,
  ProjectConstraints,
  ProjectWithPlan,
  RefineRequest,
  SavedPlanVersion,
  TroubleshootRequest,
  UpdateProjectInput,
  UserPreferences,
} from "../shared/types";
import { AGENT_STAGES, BUILD_PATH_LABELS, FREE_TIER_PROJECT_LIMIT } from "../shared/constants";
import { newId, nowIso, storage } from "./storage";
import { libraryEntries } from "./data/library";
import { startGeneration } from "./ai/pipeline";
import {
  applyBuildPath,
  createAgentContext,
  deepClone,
  ensureStoreCutSheet,
  inferIdentity,
  ownsTool,
  recomputeBudget,
  retargetShoppingStore,
  scaleCosts,
} from "./ai/generators";
import { runIntakeAgent } from "./ai/agents/intakeAgent";
import { runVisionAgent } from "./ai/agents/visionAgent";
import { runProjectClassificationAgent } from "./ai/agents/projectClassificationAgent";
import { runFeasibilityQuestionAgent } from "./ai/agents/feasibilityQuestionAgent";
import { runSafetyAgent } from "./ai/agents/safetyAgent";
import { advisorChat, troubleshoot } from "./ai/advisor";
import { builderHandoffMarkdown, planToMarkdown, storeCutSheetMarkdown } from "./exports/markdown";
import { shoppingListCsv } from "./exports/csv";

/* ------------------------------- utilities ------------------------------- */

type Handler = (req: Request, res: Response) => Promise<void> | void;

const h = (fn: Handler): Handler => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    console.error(`[routes] ${req.method} ${req.path} failed:`, message);
    if (!res.headersSent) res.status(500).json({ error: message });
  }
};

function requireProject(req: Request, res: Response): Project | undefined {
  const project = storage.getProject(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return undefined;
  }
  return project;
}

function projectWithPlan(project: Project): ProjectWithPlan {
  return {
    ...project,
    plan: storage.getLatestPlanForProject(project.id),
    versions: storage.listVersions(project.id),
    agentRuns: storage.listAgentRuns(project.id),
  };
}

function requireLatestPlan(project: Project, res: Response): BuildPlan | undefined {
  const plan = storage.getLatestPlanForProject(project.id);
  if (!plan) {
    res.status(404).json({ error: "No generated plan exists for this project yet" });
    return undefined;
  }
  return plan;
}

function defaultConstraints(partial?: Partial<ProjectConstraints>): ProjectConstraints {
  const prefs = storage.getPreferences();
  return {
    skillLevel: prefs?.skillLevel ?? "beginner",
    ownedTools: prefs?.ownedTools ? [...prefs.ownedTools] : [],
    preferredStores: prefs?.preferredStores ? [...prefs.preferredStores] : ["Home Depot"],
    desiredFidelity: "close_visual_match",
    durability: "everyday_use",
    budgetMin: prefs?.defaultBudgetMin,
    budgetMax: prefs?.defaultBudgetMax,
    workspaceType: prefs?.workspaceType,
    ...partial,
  };
}

function defaultPreferences(): UserPreferences {
  const now = nowIso();
  return {
    id: newId("pref"),
    userId: "user_default",
    preferredStores: ["Home Depot"],
    defaultBudgetMin: 100,
    defaultBudgetMax: 750,
    skillLevel: "beginner",
    workspaceType: "garage",
    units: "in",
    ownedTools: [],
    inventory: [],
    subscriptionTier: "free",
    createdAt: now,
    updatedAt: now,
  };
}

const sanitizeFilename = (s: string) => s.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").toLowerCase();

function sendDownload(res: Response, filename: string, contentType: string, body: string): void {
  res.setHeader("Content-Type", `${contentType}; charset=utf-8`);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(body);
}

/* --------------------------------- routes -------------------------------- */

export function registerRoutes(app: Express): void {
  /* ------------------------------ projects ------------------------------ */

  app.get("/api/projects", h((_req, res) => {
    res.json(storage.listProjects());
  }));

  app.post("/api/projects", h(async (req, res) => {
    const input = req.body as CreateProjectInput;
    const nonDemoCount = storage.listProjects().filter((p) => !p.isDemo).length;
    if (nonDemoCount >= FREE_TIER_PROJECT_LIMIT) {
      res.status(402).json({
        error: `Free tier limit reached (${FREE_TIER_PROJECT_LIMIT} projects). Delete an old project to start a new one, or upgrade for unlimited projects.`,
      });
      return;
    }
    const now = nowIso();
    const project: Project = {
      id: newId("proj"),
      userId: "user_default",
      title: input.title?.trim() || "Untitled project",
      projectType: input.projectType || "",
      category: input.category || "other",
      status: "draft",
      sourceType: input.sourceType || "description",
      sourceUrl: input.sourceUrl,
      sourceImages: (input.sourceImages || []).map((img) => ({
        id: newId("img"),
        name: img.name,
        dataUrl: img.dataUrl,
        createdAt: now,
      })),
      userDescription: input.userDescription,
      pastedProductText: input.pastedProductText,
      constraints: defaultConstraints(input.constraints),
      generation: {
        status: "idle",
        stages: AGENT_STAGES.map((s) => ({ key: s.key, label: s.label, status: "pending" as const })),
      },
      createdAt: now,
      updatedAt: now,
    };
    if (project.title === "Untitled project") {
      const identity = inferIdentity(project);
      project.title = identity.title;
      if (!project.projectType) project.projectType = identity.projectType;
      if (project.category === "other") project.category = identity.category;
    }
    await storage.saveProject(project);
    res.status(201).json(project);
  }));

  app.get("/api/projects/:id", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    res.json(projectWithPlan(project));
  }));

  app.patch("/api/projects/:id", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const input = req.body as UpdateProjectInput;

    if (input.title !== undefined) project.title = input.title;
    if (input.projectType !== undefined) project.projectType = input.projectType;
    if (input.category !== undefined) project.category = input.category;
    if (input.sourceUrl !== undefined) project.sourceUrl = input.sourceUrl;
    if (input.userDescription !== undefined) project.userDescription = input.userDescription;
    if (input.pastedProductText !== undefined) project.pastedProductText = input.pastedProductText;
    if (input.selectedBuildPath !== undefined) project.selectedBuildPath = input.selectedBuildPath;
    if (input.constraints) {
      project.constraints = { ...project.constraints, ...input.constraints };
    }
    if (input.feasibilityAnswers && project.feasibilityQuestions) {
      for (const answer of input.feasibilityAnswers) {
        const q = project.feasibilityQuestions.find((fq) => fq.id === answer.id);
        if (q) q.answer = answer.answer;
      }
      if (project.status === "questions" && input.feasibilityAnswers.length > 0) {
        project.status = "questions"; // answered but still pre-generation
      }
    }
    project.updatedAt = nowIso();
    await storage.saveProject(project);
    res.json(project);
  }));

  app.delete("/api/projects/:id", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    await storage.deleteProject(project.id);
    res.json({ ok: true });
  }));

  /* ------------------------------ pipeline ------------------------------ */

  app.post("/api/projects/:id/analyze", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;

    project.status = "analyzing";
    const identity = inferIdentity(project);
    if (!project.title || project.title === "Untitled project") project.title = identity.title;
    if (!project.projectType || project.projectType === "Other") project.projectType = identity.projectType;
    if (project.category === "other" || !project.category) project.category = identity.category;

    const ctx = createAgentContext(project);
    const [extraction, vision, classification, safety] = [
      await runIntakeAgent(ctx),
      await runVisionAgent(ctx),
      await runProjectClassificationAgent(ctx),
      await runSafetyAgent(ctx),
    ];

    project.title = classification.title || project.title;
    project.category = classification.category || project.category;
    project.projectType = classification.projectType || project.projectType;

    const missingInformation: string[] = [];
    if (!extraction.fetchSucceeded) missingInformation.push("Verified product page content (price, dimensions, official materials list)");
    if (!extraction.price) missingInformation.push("Verified current retail price - savings math will use a labeled estimate");
    if (!project.constraints.dimensions && !extraction.dimensionsText) missingInformation.push("Confirmed target dimensions");
    if (project.sourceImages.length === 0) missingInformation.push("Reference photos (upload any to tighten material and proportion estimates)");

    project.analysis = {
      projectBrief: classification.projectBrief,
      category: classification.category,
      secondaryCategory: classification.secondaryCategory,
      referenceExtraction: extraction,
      visionAnalysis: vision,
      measurementCalibration: ctx.template.measurementCalibration,
      assumptions: ctx.template.assumptions.slice(0, 5),
      missingInformation,
      riskFlags: safety.riskFlags,
      highRisk: safety.highRisk,
      confidenceScore: Math.round(
        extraction.extractionConfidence * 0.35 + ctx.template.confidenceBreakdown.overall * 0.65
      ),
    };
    project.status = "questions";
    project.updatedAt = nowIso();
    await storage.saveProject(project);
    res.json(project);
  }));

  app.post("/api/projects/:id/feasibility-questions", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const ctx = createAgentContext(project);
    const fresh = await runFeasibilityQuestionAgent(ctx);

    /* preserve any answers the user already gave to matching questions */
    const existing = project.feasibilityQuestions || [];
    for (const q of fresh) {
      const prior = existing.find((e) => e.id === q.id);
      if (prior?.answer) q.answer = prior.answer;
    }
    project.feasibilityQuestions = fresh;
    project.status = "questions";
    project.updatedAt = nowIso();
    await storage.saveProject(project);
    res.json(fresh);
  }));

  app.post("/api/projects/:id/generate-plan", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const { pathPreference } = (req.body || {}) as GeneratePlanRequest;
    /* fire-and-forget: the client polls generation-status */
    startGeneration(project.id, pathPreference).catch((err) => {
      console.error(`[routes] background generation failed for ${project.id}:`, err instanceof Error ? err.message : err);
    });
    res.json({ started: true });
  }));

  app.get("/api/projects/:id/generation-status", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    res.json(project.generation);
  }));

  /* ------------------------------ refinement ---------------------------- */

  app.post("/api/projects/:id/refine", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const latest = requireLatestPlan(project, res);
    if (!latest) return;
    const { instruction, presetKey } = (req.body || {}) as RefineRequest;

    const plan = deepClone(latest);
    plan.id = newId("plan");
    plan.projectId = project.id;
    plan.createdAt = nowIso();
    plan.updatedAt = plan.createdAt;

    /* map free-text instructions onto presets when obvious */
    const key =
      presetKey ||
      (/cheap|budget|less.*(money|cost)|afford/i.test(instruction || "") ? "cheaper"
        : /easi|simpl|beginner/i.test(instruction || "") ? "easier"
        : /durab|tough|kid.?proof|stronger/i.test(instruction || "") ? "more_durable"
        : /fast|quick|less time|one weekend/i.test(instruction || "") ? "faster"
        : /closer|match|premium|nicer|higher.?end/i.test(instruction || "") ? "closer_match"
        : /own tools|my tools|tools i (have|own)/i.test(instruction || "") ? "own_tools_only"
        : undefined);

    let changeSummary = instruction || "Plan refinement";
    let versionName = "Refined plan";

    switch (key) {
      case "cheaper": {
        applyBuildPath(plan, "budget");
        const swap = plan.materials.find((m) => m.budgetAlternative);
        if (swap) {
          const original = swap.name;
          swap.premiumAlternative = `${original} (the original spec - swap back for a closer look)`;
          swap.name = swap.budgetAlternative!.split("(")[0].trim();
          swap.budgetAlternative = undefined;
          swap.notes = `${swap.notes ? `${swap.notes} ` : ""}Swapped from ${original} to cut cost per your refinement.`;
        }
        scaleCosts(plan, 0.75);
        plan.snapshot.visualMatchScore = Math.max(40, plan.snapshot.visualMatchScore - 10);
        versionName = "Budget interpretation";
        changeSummary = `Refined for cost: pinned to the Budget path, swapped the top visible material to its budget alternative, and re-scaled every cost line (~25% down). New range ${"$" + plan.budgetBreakdown.grandTotalLow}-$${plan.budgetBreakdown.grandTotalHigh}; visual match adjusted honestly downward.`;
        break;
      }
      case "easier": {
        applyBuildPath(plan, "beginner");
        plan.difficultyBreakdown.overall = "beginner";
        plan.difficultyBreakdown.notes.push("Refined to the beginner-friendly variant: store cuts for sheet goods, simplified joinery per the beginner path's compromises, unforgiving operations removed or rehearsed on scrap.");
        ensureStoreCutSheet(plan, project.constraints.preferredStores?.[0] || "Home Depot");
        plan.buildReadiness.skillGaps = plan.buildReadiness.skillGaps.filter((g) => !/bevel|advanced|miter/i.test(g));
        versionName = "Beginner-friendly";
        changeSummary = "Refined for skill level: pinned to the Beginner path, store panel-saw cuts for every sheet part, simplified joinery per the path's compromises, and the store cut sheet guaranteed present.";
        break;
      }
      case "own_tools_only": {
        const owned = project.constraints.ownedTools || [];
        ensureStoreCutSheet(plan, project.constraints.preferredStores?.[0] || "Home Depot");
        const stripped: string[] = [];
        for (const tool of plan.tools) {
          if (tool.required && !ownsTool(owned, tool.name)) {
            tool.required = false;
            tool.substitute = tool.substitute || "Covered by the store cut sheet / workaround notes - this refinement removed it from the required list.";
            stripped.push(tool.name);
          }
        }
        for (const step of plan.steps) {
          const missing = step.toolsNeeded.filter((tn) => stripped.some((s) => tn.toLowerCase().includes(s.toLowerCase().split(" ")[0])));
          if (missing.length > 0) {
            step.instructions.unshift(`Own-tools mode: this step originally used ${missing.join(", ")} - use the store-cut parts from the cut sheet and the workaround in the Tools tab instead.`);
          }
        }
        plan.buildReadiness.missingTools = [];
        plan.buildReadiness.score = Math.max(plan.buildReadiness.score, 85);
        plan.buildReadiness.readyStatus = "ready";
        plan.buildReadiness.recommendation = `Plan restructured around the tools you own (${owned.join(", ") || "hand tools only"}): every sheet/lumber cut moved to the store cut sheet, and formerly-required tools (${stripped.join(", ") || "none"}) now have baked-in workarounds. ${plan.buildReadiness.recommendation}`;
        versionName = "Own tools only";
        changeSummary = `Refined to your exact tool inventory: ${stripped.length} tools moved from required to worked-around (${stripped.join(", ") || "no changes needed"}), all precision cutting delegated to the store cut sheet.`;
        break;
      }
      case "closer_match": {
        applyBuildPath(plan, "closest_match");
        for (const m of plan.materials) {
          if (m.premiumAlternative) {
            m.notes = `${m.notes ? `${m.notes} ` : ""}Closer-match refinement: upgrade to ${m.premiumAlternative}.`;
          }
        }
        scaleCosts(plan, 1.2);
        plan.snapshot.visualMatchScore = Math.min(96, plan.snapshot.visualMatchScore + 8);
        versionName = "Closest match";
        changeSummary = `Refined for fidelity: pinned to the Closest Match path, premium material upgrades noted per line, costs re-scaled (~20% up) to ${"$" + plan.budgetBreakdown.grandTotalLow}-$${plan.budgetBreakdown.grandTotalHigh}.`;
        break;
      }
      case "more_durable": {
        plan.snapshot.durabilityScore = Math.min(98, plan.snapshot.durabilityScore + 8);
        plan.finishGuide.recommendedFinishSystem.push("Durability refinement: add one extra topcoat on every wear surface, and prefer the harder-wearing sheen option noted in the topcoats table.");
        plan.maintenance.unshift("Durability build: re-check all fasteners monthly for the first quarter, then seasonally.");
        plan.hardware.push({
          name: "Reinforcement hardware",
          category: "Fasteners",
          quantity: "As needed",
          specification: "Corner braces / glue blocks / upgraded fasteners per the durable alternative's key changes",
          purpose: "The durability refinement's structural reinforcement allowance",
          estimatedCostLow: 8,
          estimatedCostHigh: 20,
          notes: "See the 'durable' alternative in the Alternatives tab for exactly where these go.",
        });
        recomputeBudget(plan);
        versionName = "Durability build";
        changeSummary = "Refined for durability: extra topcoat on wear surfaces, reinforcement hardware allowance added, inspection cadence doubled. Conservative design estimates as always - no certified ratings.";
        break;
      }
      case "faster": {
        applyBuildPath(plan, "beginner");
        ensureStoreCutSheet(plan, project.constraints.preferredStores?.[0] || "Home Depot");
        plan.snapshot.estimatedTime = `Compressed: ${Math.max(1, plan.projectTimeline.length - 2)}-${plan.projectTimeline.length} sessions with store cuts doing the precision work`;
        plan.preBuildChecklist.unshift("Fast-track mode: get EVERY cut made at the store in one trip (cut sheet printed), and batch all finish coats into evening sessions so cure time runs overnight instead of on the clock.");
        versionName = "Fast track";
        changeSummary = "Refined for speed: store cuts for all precision work, sessions batched around overnight cure windows, simplified path selected. Cure times themselves cannot be compressed - the calendar shrinks, not the chemistry.";
        break;
      }
      case "minimum_viable_dupe": {
        applyBuildPath(plan, "minimum_viable_dupe");
        const mvd = plan.minimumViableDupe;
        const factor = plan.budgetBreakdown.grandTotalHigh > 0 ? mvd.estimatedCostHigh / plan.budgetBreakdown.grandTotalHigh : 1;
        scaleCosts(plan, Math.max(0.4, Math.min(1, factor)));
        plan.snapshot.estimatedTime = mvd.estimatedTime;
        plan.snapshot.visualMatchScore = Math.max(35, plan.snapshot.visualMatchScore - 25);
        plan.qaNotes.push(`Minimum viable dupe refinement: build only the must-preserve elements (${mvd.mustPreserveElements.join("; ")}); everything in "can remove" is out of scope for this version.`);
        versionName = "Minimum viable dupe";
        changeSummary = `Refined to the minimum viable dupe: ${mvd.summary} New range ${"$" + plan.budgetBreakdown.grandTotalLow}-$${plan.budgetBreakdown.grandTotalHigh}.`;
        break;
      }
      case "home_depot_list": {
        retargetShoppingStore(plan, "Home Depot");
        versionName = "Home Depot list";
        changeSummary = "Shopping list re-organized for Home Depot department layout (specialty fabric/fiber items stay at their specialty store).";
        break;
      }
      case "lowes_list": {
        retargetShoppingStore(plan, "Lowe's");
        versionName = "Lowe's list";
        changeSummary = "Shopping list re-organized for Lowe's department layout (specialty fabric/fiber items stay at their specialty store).";
        break;
      }
      case "store_cut_sheet": {
        ensureStoreCutSheet(plan, project.constraints.preferredStores?.[0] || "Home Depot");
        versionName = "With store cut sheet";
        changeSummary = "Store cut sheet generated: every sheet-goods break-down written up for the panel saw, with oversize allowances and home-trim notes.";
        break;
      }
      case "builder_handoff": {
        /* the brief always exists; refresh its budget context from current numbers */
        plan.builderHandoff.budgetTarget = `${plan.builderHandoff.budgetTarget.split("(")[0].trim()} (customer's DIY alternative currently estimates $${plan.budgetBreakdown.grandTotalLow}-$${plan.budgetBreakdown.grandTotalHigh} in materials)`;
        versionName = "Builder handoff";
        changeSummary = "Builder handoff brief refreshed against the current plan numbers - ready to export from the Handoff tab.";
        break;
      }
      default: {
        plan.qaNotes.push(`User refinement request applied as guidance: "${(instruction || "").slice(0, 200)}". Review the affected sections; where the instruction conflicts with safety guidance, safety wins.`);
        versionName = "Custom refinement";
        changeSummary = instruction ? `Custom refinement: ${instruction.slice(0, 200)}` : "Custom refinement";
      }
    }

    recomputeBudget(plan);
    const suffix = versionName !== "Refined plan" ? versionName : BUILD_PATH_LABELS[plan.snapshot.selectedBuildPath];
    plan.title = `${plan.title.replace(/ - [^-]*$/, "")} - ${suffix}`;

    await storage.savePlan(plan);
    const version: SavedPlanVersion = {
      id: newId("ver"),
      projectId: project.id,
      versionNumber: storage.nextVersionNumber(project.id),
      versionName,
      changeSummary,
      buildPathType: plan.snapshot.selectedBuildPath,
      plan,
      createdAt: plan.createdAt,
    };
    await storage.saveVersion(version);
    project.latestPlanId = plan.id;
    project.selectedBuildPath = plan.snapshot.selectedBuildPath;
    project.updatedAt = nowIso();
    await storage.saveProject(project);
    res.json({ plan, version });
  }));

  /* --------------------------- advisor & handoff ------------------------ */

  app.post("/api/projects/:id/troubleshoot", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const { problem } = (req.body || {}) as TroubleshootRequest;
    if (!problem || !problem.trim()) {
      res.status(400).json({ error: "Describe the problem you're hitting" });
      return;
    }
    const plan = storage.getLatestPlanForProject(project.id);
    res.json(await troubleshoot(project, plan, problem));
  }));

  app.post("/api/projects/:id/advisor-chat", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const { message, history } = (req.body || {}) as AdvisorChatRequest;
    if (!message || !message.trim()) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const plan = storage.getLatestPlanForProject(project.id);
    const reply = await advisorChat(project, plan, history || [], message);
    res.json({ reply });
  }));

  app.post("/api/projects/:id/builder-handoff", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const plan = requireLatestPlan(project, res);
    if (!plan) return;
    res.json({ brief: plan.builderHandoff, markdown: builderHandoffMarkdown(plan) });
  }));

  /* ------------------------------ progress ------------------------------ */

  app.get("/api/projects/:id/progress", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const progress = storage.getProgress(project.id);
    res.json({
      checkedShoppingItems: progress.checkedShoppingItems,
      completedSteps: progress.completedSteps,
      notes: progress.notes,
    });
  }));

  app.patch("/api/projects/:id/progress", h(async (req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const body = (req.body || {}) as { checkedShoppingItems?: string[]; completedSteps?: number[]; notes?: string };
    const current = storage.getProgress(project.id);
    await storage.saveProgress({
      projectId: project.id,
      checkedShoppingItems: body.checkedShoppingItems ?? current.checkedShoppingItems,
      completedSteps: body.completedSteps ?? current.completedSteps,
      notes: body.notes ?? current.notes,
    });
    res.json({ ok: true });
  }));

  /* ------------------------------- exports ------------------------------ */

  app.get("/api/projects/:id/export/csv", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const plan = requireLatestPlan(project, res);
    if (!plan) return;
    sendDownload(res, "shopping-list.csv", "text/csv", shoppingListCsv(plan));
  }));

  app.get("/api/projects/:id/export/plan.md", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const plan = requireLatestPlan(project, res);
    if (!plan) return;
    sendDownload(res, `${sanitizeFilename(plan.title) || "build-plan"}.md`, "text/markdown", planToMarkdown(project, plan));
  }));

  app.get("/api/projects/:id/export/store-cut-sheet.md", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const plan = requireLatestPlan(project, res);
    if (!plan) return;
    if (!plan.storeCutSheet) {
      res.status(404).json({ error: "This plan has no store cut sheet. Use the 'store cut sheet' refinement to generate one." });
      return;
    }
    sendDownload(res, "store-cut-sheet.md", "text/markdown", storeCutSheetMarkdown(plan));
  }));

  app.get("/api/projects/:id/export/builder-handoff.md", h((req, res) => {
    const project = requireProject(req, res);
    if (!project) return;
    const plan = requireLatestPlan(project, res);
    if (!plan) return;
    sendDownload(res, "builder-handoff.md", "text/markdown", builderHandoffMarkdown(plan));
  }));

  /* --------------------------- library & gallery ------------------------ */

  app.get("/api/library", h((_req, res) => {
    res.json(libraryEntries);
  }));

  app.get("/api/library/:slug", h((req, res) => {
    const entry = libraryEntries.find((e) => e.slug === req.params.slug);
    if (!entry) {
      res.status(404).json({ error: "Library entry not found" });
      return;
    }
    const plan = entry.demoProjectId ? storage.getLatestPlanForProject(entry.demoProjectId) : undefined;
    res.json({ ...entry, plan });
  }));

  app.get("/api/gallery", h((_req, res) => {
    res.json(storage.listGallery().filter((g) => g.visibility !== "private"));
  }));

  app.get("/api/gallery/:slug", h((req, res) => {
    const entry = storage.getGalleryBySlug(req.params.slug);
    if (!entry || entry.visibility === "private") {
      res.status(404).json({ error: "Gallery entry not found" });
      return;
    }
    res.json(entry);
  }));

  /* ----------------------------- preferences ---------------------------- */

  app.get("/api/preferences", h(async (_req, res) => {
    let prefs = storage.getPreferences();
    if (!prefs) {
      prefs = await storage.savePreferences(defaultPreferences());
    }
    res.json(prefs);
  }));

  app.put("/api/preferences", h(async (req, res) => {
    const current = storage.getPreferences() || defaultPreferences();
    const input = (req.body || {}) as Partial<UserPreferences>;
    const updated: UserPreferences = {
      ...current,
      ...input,
      id: current.id,
      userId: current.userId,
      createdAt: current.createdAt,
      updatedAt: nowIso(),
    };
    await storage.savePreferences(updated);
    res.json(updated);
  }));

  /* --------------------------------- demo ------------------------------- */

  app.get("/api/demo-project", h((_req, res) => {
    const project = storage.getProject("proj_demo_meadowview");
    if (!project) {
      res.status(404).json({ error: "Demo project not seeded" });
      return;
    }
    res.json(projectWithPlan(project));
  }));
}
