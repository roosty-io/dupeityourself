/**
 * Simple plan composition (server side).
 *
 * Re-exports the shared derivation and renders the "Simple Build Checklist" —
 * the short, garage-ready export (a handful of pages) that most users actually
 * want, as opposed to the full technical manual (`planToMarkdown`).
 */
import type { BuildPlan, Project } from "../../shared/types";
import { deriveSimpleBuildPlanSummary } from "../../shared/simplePlan";
import { LEGAL_DISCLAIMER } from "../../shared/constants";

export { deriveSimpleBuildPlanSummary } from "../../shared/simplePlan";
export type { SimpleBuildPlanSummary } from "../../shared/simplePlan";

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/** The condensed, action-first checklist a builder takes to the shop. */
export function simpleChecklistMarkdown(project: Project, plan: BuildPlan): string {
  const s = deriveSimpleBuildPlanSummary(plan);
  const out: string[] = [];

  out.push(`# ${s.projectName} — Simple Build Checklist`);
  out.push(`_${s.plainEnglishDescription}_`);
  out.push("");
  out.push(
    [
      `**Recommended build:** ${s.recommendedPath.name}`,
      `**Estimated cost:** ${s.cost.range}`,
      `**Estimated time:** ${s.estimatedTime}`,
      `**Difficulty:** ${s.difficulty}`,
      `**Visual match:** ${s.recommendedPath.visualMatchScore}/100`,
      `**Worth-It Score:** ${s.worthIt.score}/100`,
    ].join("  \n")
  );

  /* --- the 3 things that matter most --- */
  if (s.topThingsToKnow.length > 0) {
    out.push("");
    out.push(`## Before you start`);
    s.topThingsToKnow.forEach((t, i) => out.push(`${i + 1}. ${t}`));
  }

  if (s.assumptionsToConfirm.length > 0) {
    out.push("");
    out.push(`## Assumptions to confirm`);
    s.assumptionsToConfirm.forEach((a) => out.push(`- [ ] ${a}`));
  }

  /* --- shopping --- */
  out.push("");
  out.push(`## Shopping list`);
  for (const dept of plan.shoppingListByDepartment) {
    out.push("");
    out.push(`### ${dept.department}${dept.store ? ` (@ ${dept.store})` : ""}`);
    for (const item of dept.items) {
      const cost = ` — ${money(item.estimatedCostLow)}–${money(item.estimatedCostHigh)}`;
      const opt = item.required ? "" : " _(optional)_";
      out.push(`- [ ] ${item.quantity} ${item.name} · ${item.spec}${cost}${opt}`);
    }
  }

  /* --- tools --- */
  out.push("");
  out.push(`## Tools`);
  if (s.mustHaveTools.length > 0) {
    out.push(`**Must have:**`);
    s.mustHaveTools.forEach((t) => out.push(`- [ ] ${t}`));
  }
  if (s.helpfulTools.length > 0) {
    out.push("");
    out.push(`**Helpful:** ${s.helpfulTools.join(", ")}`);
  }
  if (s.missingToolWorkarounds.length > 0) {
    out.push("");
    out.push(`**If you're missing a tool:**`);
    s.missingToolWorkarounds.forEach((w) => out.push(`- ${w}`));
  }

  /* --- prep --- */
  if (s.preBuildChecklist.length > 0) {
    out.push("");
    out.push(`## Before the first cut`);
    s.preBuildChecklist.forEach((p) => out.push(`- [ ] ${p}`));
  }

  /* --- phases --- */
  out.push("");
  out.push(`## Build steps`);
  for (const phase of s.phases) {
    out.push("");
    out.push(`### Phase ${phase.phaseNumber}: ${phase.title}${phase.estimatedTime ? ` (${phase.estimatedTime})` : ""}`);
    if (phase.goal) out.push(`_Goal: ${phase.goal}_`);
    for (const step of phase.steps) {
      out.push(`- [ ] **${step.title}** — ${step.shortInstruction}`);
    }
    if (phase.commonMistake) out.push(`> ⚠️ Common mistake: ${phase.commonMistake}`);
    if (phase.qualityCheck) out.push(`> ✅ Check before moving on: ${phase.qualityCheck}`);
  }

  /* --- finish --- */
  if (s.finish.steps.length > 0) {
    out.push("");
    out.push(`## Finish`);
    if (s.finish.targetLook) out.push(`_Target look: ${s.finish.targetLook}_`);
    s.finish.steps.forEach((step) => out.push(`- [ ] ${step}`));
    if (s.finish.cureNote) out.push(`> ⏳ ${s.finish.cureNote}`);
  }

  /* --- do not skip --- */
  if (s.topMistakes.length > 0 || s.safetyHighlights.length > 0) {
    out.push("");
    out.push(`## Do not skip these`);
    s.safetyHighlights.forEach((h) => out.push(`- ${h}`));
    s.topMistakes.forEach((m) => out.push(`- ${m.mistake} — ${m.avoidBy}`));
  }

  /* --- final inspection --- */
  if (s.finalChecklist.length > 0) {
    out.push("");
    out.push(`## Final inspection`);
    s.finalChecklist.forEach((c) => out.push(`- [ ] ${c}`));
  }

  out.push("");
  out.push("---");
  out.push(`_${LEGAL_DISCLAIMER}_`);
  out.push("");
  out.push(
    `_Want every detail — full budget, cut optimization, confidence notes, alternatives? Export the **Full Technical Manual** instead._`
  );

  return out.join("\n");
}
