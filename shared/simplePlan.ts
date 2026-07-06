/**
 * Dupe It Yourself — simple plan derivation layer.
 *
 * The AI pipeline produces a very rich `BuildPlan` (37+ sections). Most DIY
 * users should not have to read a technical dossier to get started. This module
 * derives a compact, action-oriented `SimpleBuildPlanSummary` from that rich
 * plan — the model behind the default "Simple Plan" experience.
 *
 * It is a PURE function of an existing BuildPlan (no network, no side effects),
 * so it is shared by the server (checklist export) and the client (Simple view).
 * The full BuildPlan is never discarded; the advanced view still renders it.
 */
import type { BuildPlan, BuildStep } from "./types";

/* ----------------------------- summary shapes -------------------------- */

export type SimpleBuildPhaseStep = {
  stepNumber: number;
  title: string;
  shortInstruction: string;
  detailedInstructions: string[];
  measurementNotes?: string[];
  safetyNotes?: string[];
  qualityCheck?: string;
  commonMistake?: string;
  toolsNeeded: string[];
  materialsNeeded: string[];
  estimatedTime: string;
  relatedMiniLessons?: string[];
};

export type SimpleBuildPhase = {
  phaseNumber: number;
  title: string;
  goal: string;
  estimatedTime: string;
  steps: SimpleBuildPhaseStep[];
  commonMistake?: string;
  qualityCheck?: string;
};

export type SimpleShoppingGroup = {
  category: string;
  items: string[];
  optional?: boolean;
};

export type SimpleBuildPlanSummary = {
  projectName: string;
  plainEnglishDescription: string;
  recommendedPath: {
    key: string;
    name: string;
    why: string;
    costRange: string;
    difficulty: string;
    timeEstimate: string;
    visualMatchScore: number;
    durabilityScore: number;
  };
  worthIt: {
    score: number;
    verdict: string;
    oneSentenceVerdict: string;
  };
  cost: {
    low: number;
    high: number;
    range: string;
    referencePrice?: number;
    savings?: number;
    savingsPct?: number;
  };
  readiness: {
    score: number;
    status: string;
    statusLabel: string;
    topMissingItems: string[];
  };
  difficulty: string;
  estimatedTime: string;
  safetyLabel: string;
  topThingsToKnow: string[];
  assumptionsToConfirm: string[];
  topMaterials: SimpleShoppingGroup[];
  mustHaveTools: string[];
  helpfulTools: string[];
  notNeededTools: string[];
  missingToolWorkarounds: string[];
  preBuildChecklist: string[];
  phases: SimpleBuildPhase[];
  finish: {
    targetLook: string;
    steps: string[];
    cureNote?: string;
  };
  topMistakes: { mistake: string; avoidBy: string }[];
  safetyHighlights: string[];
  finalChecklist: string[];
};

/* -------------------------------- helpers ------------------------------ */

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function moneyRange(low: number, high: number): string {
  return low === high ? money(low) : `${money(low)}–${money(high)}`;
}

/** First sentence of a paragraph, trimmed, with a trailing period. */
export function firstSentence(text: string | undefined): string {
  if (!text) return "";
  const trimmed = text.trim();
  const match = trimmed.match(/^(.+?[.!?])(\s|$)/);
  const sentence = (match ? match[1] : trimmed).trim();
  if (!sentence) return "";
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

function lcFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

function unique(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim().toLowerCase();
    if (item.trim() && !seen.has(key)) {
      seen.add(key);
      out.push(item.trim());
    }
  }
  return out;
}

/** Strip a "Store - " prefix from a shopping department name. */
function cleanDepartment(dept: string): string {
  const dashIdx = dept.indexOf(" - ");
  const withoutStore = dashIdx >= 0 ? dept.slice(dashIdx + 3) : dept;
  return withoutStore.replace(/[/&]/g, " / ").replace(/\s+/g, " ").trim();
}

/** Parse a loose time string ("45 min", "2 hours", "1-2 hr") to minutes. */
function parseMinutes(text: string): number {
  if (!text) return 0;
  let total = 0;
  const lower = text.toLowerCase();
  // grab the larger end of any "a-b" range so estimates stay honest/generous
  const hourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?)\s*)?(?:hours?|hrs?|hr)\b/);
  if (hourMatch) {
    total += parseFloat(hourMatch[2] ?? hourMatch[1]) * 60;
  }
  const minMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?)\s*)?(?:minutes?|mins?|min)\b/);
  if (minMatch) {
    total += parseFloat(minMatch[2] ?? minMatch[1]);
  }
  return total;
}

function formatMinutes(total: number): string {
  if (total <= 0) return "";
  if (total < 60) return `~${Math.round(total)} min`;
  const hours = total / 60;
  const rounded = hours >= 3 ? Math.round(hours) : Math.round(hours * 2) / 2;
  return `~${rounded % 1 === 0 ? rounded : rounded.toFixed(1)} hr`;
}

const READY_STATUS_LABELS: Record<string, string> = {
  ready: "You're ready to build",
  mostly_ready: "Almost ready — a couple of gaps",
  needs_prep: "A bit of prep needed first",
  not_ready: "Not quite ready yet",
};

/* --------------------------- the derivation ---------------------------- */

export function deriveSimpleBuildPlanSummary(plan: BuildPlan): SimpleBuildPlanSummary {
  const snap = plan.snapshot;

  /* ---- recommended path ---- */
  const recommended =
    plan.buildPaths.find((p) => p.recommended) ??
    plan.buildPaths.find((p) => p.name === snap.selectedBuildPath) ??
    plan.buildPaths.find((p) => p.name === "balanced") ??
    plan.buildPaths[0];

  const recPath = recommended
    ? {
        key: recommended.name,
        name: recommended.label,
        why:
          firstSentence(recommended.recommendationReason) ||
          firstSentence(plan.recommendedPathReason) ||
          recommended.bestFor,
        costRange: moneyRange(recommended.estimatedCostLow, recommended.estimatedCostHigh),
        difficulty: recommended.difficulty,
        timeEstimate: recommended.estimatedTime,
        visualMatchScore: recommended.visualMatchScore,
        durabilityScore: recommended.durabilityScore,
      }
    : {
        key: snap.selectedBuildPath,
        name: snap.difficulty,
        why: firstSentence(plan.recommendedPathReason) || snap.bestFor,
        costRange: moneyRange(snap.estimatedCostLow, snap.estimatedCostHigh),
        difficulty: snap.difficulty,
        timeEstimate: snap.estimatedTime,
        visualMatchScore: snap.visualMatchScore,
        durabilityScore: snap.durabilityScore,
      };

  /* ---- cost & savings ---- */
  const referencePrice = plan.savingsStory.referencePrice;
  const savings = plan.savingsStory.estimatedSavings;
  const cost = {
    low: snap.estimatedCostLow,
    high: snap.estimatedCostHigh,
    range: moneyRange(snap.estimatedCostLow, snap.estimatedCostHigh),
    referencePrice,
    savings,
    savingsPct: plan.savingsStory.savingsPercentage,
  };

  /* ---- readiness ---- */
  const readiness = {
    score: plan.buildReadiness.score,
    status: plan.buildReadiness.readyStatus,
    statusLabel: READY_STATUS_LABELS[plan.buildReadiness.readyStatus] ?? "Getting ready",
    topMissingItems: unique([
      ...plan.buildReadiness.missingTools,
      ...plan.buildReadiness.missingMaterials,
    ]).slice(0, 4),
  };

  /* ---- the 3 things that matter most ---- */
  const hardest = plan.designSimplifier?.difficultOriginalDetails?.[0];
  const topMistake = plan.mistakePrevention?.[0];
  const worthItLine = firstSentence(plan.worthItScore.recommendation) || firstSentence(plan.worthItScore.explanation);
  const finishLine = firstSentence(plan.finishGuide?.referenceFinishDescription);

  const knowCandidates = [
    worthItLine,
    hardest ? `The hardest part is ${lcFirst(hardest.detail).replace(/\.$/, "")} — ${lcFirst(firstSentence(hardest.whyDifficult))}` : "",
    finishLine ? `The finish is what makes it read as expensive: ${lcFirst(finishLine)}` : "",
    topMistake ? `Watch out early: ${lcFirst(topMistake.mistake).replace(/\.$/, "")}. ${topMistake.howToAvoid}` : "",
    plan.buildReadiness.recommendation ? firstSentence(plan.buildReadiness.recommendation) : "",
  ];
  const topThingsToKnow = unique(knowCandidates.filter(Boolean)).slice(0, 3);

  /* ---- top materials (grouped, store-agnostic) ---- */
  const topMaterials: SimpleShoppingGroup[] = plan.shoppingListByDepartment
    .map((dept) => {
      const required = dept.items.filter((i) => i.required);
      const optional = dept.items.filter((i) => !i.required);
      const items = (required.length > 0 ? required : dept.items).slice(0, 6).map((i) => {
        const qty = i.quantity && i.quantity !== "1" ? `${i.quantity} ` : "";
        return `${qty}${i.name}`.trim();
      });
      return {
        category: cleanDepartment(dept.department),
        items,
        optional: required.length === 0 && optional.length > 0,
      };
    })
    .filter((g) => g.items.length > 0);

  /* ---- tools ---- */
  const mustHaveTools = unique(plan.tools.filter((t) => t.required).map((t) => t.name)).slice(0, 10);
  const helpfulTools = unique(
    plan.tools.filter((t) => !t.required && !t.rentalRecommended).map((t) => t.name)
  ).slice(0, 8);

  const namedTools = new Set(plan.tools.map((t) => t.name.toLowerCase()));
  const bigTools = ["Table saw", "Planer", "Jointer", "Miter saw", "Router", "Wood lathe", "Serger"];
  const notNeededTools = bigTools.filter(
    (t) => !Array.from(namedTools).some((named) => named.includes(t.toLowerCase()))
  );

  const missingToolWorkarounds = plan.toolAwareNotes.map(
    (n) => `No ${n.missingTool.toLowerCase()}? ${n.workaround}`
  );

  /* ---- phases from steps ---- */
  const phases = derivePhases(plan.steps);

  /* ---- finish ---- */
  const finishSteps =
    plan.finishGuide?.applicationSteps?.length > 0
      ? plan.finishGuide.applicationSteps.slice(0, 6)
      : (plan.finishGuide?.recommendedFinishSystem ?? []).slice(0, 6);
  const finish = {
    targetLook: firstSentence(plan.finishGuide?.referenceFinishDescription) || plan.finishGuide?.referenceFinishDescription || "",
    steps: finishSteps,
    cureNote: plan.finishGuide?.curingNotes?.[0],
  };

  /* ---- mistakes & safety ---- */
  const topMistakes = plan.mistakePrevention
    .slice(0, 5)
    .map((m) => ({ mistake: m.mistake, avoidBy: m.howToAvoid }));

  const safetyHighlights = unique([
    ...plan.safetyReview.hazards.map((h) => h.mitigation),
    ...plan.safetyReview.childPetNotes,
    ...plan.safetyReview.finishToxicityNotes,
  ]).slice(0, 6);

  return {
    projectName: plan.title,
    plainEnglishDescription: `A ${snap.projectType.toLowerCase()} inspired by your reference — ${snap.inspiredBy}.`,
    recommendedPath: recPath,
    worthIt: {
      score: plan.worthItScore.score,
      verdict: plan.worthItScore.verdict,
      oneSentenceVerdict: worthItLine || plan.worthItScore.explanation,
    },
    cost,
    readiness,
    difficulty: snap.difficulty,
    estimatedTime: snap.estimatedTime,
    safetyLabel: snap.safetyRiskLabel,
    topThingsToKnow,
    assumptionsToConfirm: plan.assumptions.slice(0, 5),
    topMaterials,
    mustHaveTools,
    helpfulTools,
    notNeededTools,
    missingToolWorkarounds,
    preBuildChecklist: plan.preBuildChecklist ?? [],
    phases,
    finish,
    topMistakes,
    safetyHighlights,
    finalChecklist: plan.finalChecklist ?? [],
  };
}

/** Group consecutive steps into phases (matching the step-guide grouping). */
export function derivePhases(steps: BuildStep[]): SimpleBuildPhase[] {
  const groups: { phase?: string; steps: BuildStep[] }[] = [];
  for (const step of steps) {
    const last = groups[groups.length - 1];
    if (last && last.phase === step.phase) last.steps.push(step);
    else groups.push({ phase: step.phase, steps: [step] });
  }

  return groups.map((group, i) => {
    const phaseSteps: SimpleBuildPhaseStep[] = group.steps.map((s) => ({
      stepNumber: s.stepNumber,
      title: s.title,
      shortInstruction: s.instructions[0] ?? s.goal,
      detailedInstructions: s.instructions,
      measurementNotes: s.measurementNotes,
      safetyNotes: s.safetyNotes,
      qualityCheck: s.qualityCheck,
      commonMistake: s.commonMistake,
      toolsNeeded: s.toolsNeeded,
      materialsNeeded: s.materialsNeeded,
      estimatedTime: s.estimatedTime,
      relatedMiniLessons: s.relatedMiniLessons,
    }));

    const totalMinutes = group.steps.reduce((sum, s) => sum + parseMinutes(s.estimatedTime), 0);
    const commonMistake = group.steps.map((s) => s.commonMistake).find(Boolean);
    const qualityChecks = group.steps.map((s) => s.qualityCheck).filter(Boolean) as string[];

    return {
      phaseNumber: i + 1,
      title: group.phase ?? `Phase ${i + 1}`,
      goal: firstSentence(group.steps[0]?.goal) || group.steps[0]?.goal || "",
      estimatedTime: formatMinutes(totalMinutes),
      steps: phaseSteps,
      commonMistake,
      qualityCheck: qualityChecks[qualityChecks.length - 1],
    };
  });
}
