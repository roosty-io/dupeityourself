/**
 * Markdown exports: the full downloadable build manual, the store cut sheet,
 * and the builder handoff brief.
 */
import type { BuildPlan, Project, StoreCutSheet } from "../../shared/types";
import { LEGAL_DISCLAIMER } from "../../shared/constants";

/* -------------------------------- helpers -------------------------------- */

function money(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function range(low: number, high: number): string {
  return `${money(low)}–${money(high)}`;
}

function table(headers: string[], rows: (string | number | undefined)[][]): string {
  const clean = (v: string | number | undefined) => String(v ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map(clean).join(" | ")} |`),
  ].join("\n");
}

function bullets(items: (string | undefined)[], marker = "-"): string {
  return items.filter(Boolean).map((i) => `${marker} ${i}`).join("\n");
}

function checklist(items: string[]): string {
  return items.map((i) => `- [ ] ${i}`).join("\n");
}

/* --------------------------- store cut sheet ------------------------------ */

export function storeCutSheetMarkdown(plan: BuildPlan): string {
  const sheet = plan.storeCutSheet;
  if (!sheet) return `# Store Cut Sheet\n\nThis plan ("${plan.title}") has no store cut sheet - all cuts are shop cuts or no sheet goods are involved.`;
  return renderCutSheet(plan.title, sheet);
}

function renderCutSheet(title: string, sheet: StoreCutSheet): string {
  const parts: string[] = [];
  parts.push(`# 🛒 Store Cut Sheet — ${title}`);
  parts.push(`**Store:** ${sheet.storeName}`);
  parts.push(sheet.intro);
  for (const req of sheet.requests) {
    parts.push(`## ${req.material}`);
    parts.push(`**Buy:** ${req.buySize}`);
    parts.push(
      table(
        ["Cut", "Cut to", "Oversized by", "Final trim at home", "Notes"],
        req.requestedCuts.map((c) => [c.label, c.cutTo, c.oversizedBy ?? "—", c.finalTrimAtHome ? "Yes" : "No", c.notes ?? ""])
      )
    );
  }
  parts.push(`## ⚠️ Warnings`);
  parts.push(bullets(sheet.warnings));
  parts.push(`## 🏠 Home trim notes`);
  parts.push(bullets(sheet.homeTrimNotes));
  return parts.join("\n\n");
}

/* --------------------------- builder handoff ------------------------------ */

export function builderHandoffMarkdown(plan: BuildPlan): string {
  const b = plan.builderHandoff;
  const parts: string[] = [];
  parts.push(`# 🤝 Builder Handoff Brief — ${plan.title}`);
  parts.push(`## Project summary\n\n${b.projectSummary}`);
  parts.push(`## Reference style\n\n${b.referenceStyle}`);
  parts.push(`## Desired dimensions\n\n${b.desiredDimensions}`);
  parts.push(`## Materials\n\n${bullets(b.materials)}`);
  parts.push(`## Finish\n\n${b.finish}`);
  parts.push(`## Construction notes\n\n${bullets(b.constructionNotes)}`);
  parts.push(`## Budget target\n\n${b.budgetTarget}`);
  parts.push(`## Quality expectations\n\n${bullets(b.qualityExpectations)}`);
  parts.push(`## Questions to ask the builder\n\n${bullets(b.questionsForBuilder.map((q, i) => `${i + 1}. ${q}`), "")}`);
  parts.push(`## Ready-to-send quote request\n\n> ${b.quoteRequestMessage.replace(/\n/g, "\n> ")}`);
  parts.push(`---\n\n_${LEGAL_DISCLAIMER}_`);
  return parts.join("\n\n");
}

/* ---------------------------- full build manual --------------------------- */

export function planToMarkdown(project: Project, plan: BuildPlan): string {
  const s = plan.snapshot;
  const parts: string[] = [];

  /* 1. Title + snapshot */
  parts.push(`# 🔨 ${plan.title}`);
  parts.push(`_An original "inspired-by" DIY build plan. ${s.inspiredBy}._`);
  parts.push(
    table(
      ["", ""],
      [
        ["📦 Project type", s.projectType],
        ["🛤️ Build path", s.selectedBuildPath.replace(/_/g, " ")],
        ["📊 Difficulty", s.difficulty],
        ["💰 Estimated cost", range(s.estimatedCostLow, s.estimatedCostHigh)],
        ["⏱️ Estimated time", s.estimatedTime],
        ["🎯 Visual match", `${s.visualMatchScore}/100`],
        ["🛡️ Durability", `${s.durabilityScore}/100`],
        ["⚠️ Safety risk", s.safetyRiskLabel],
        ["👤 Best for", s.bestFor],
        ["🏠 Workspace", s.requiredWorkspace],
        ["🪵 Main materials", s.mainMaterials.join("; ")],
        ["🛠️ Key tools", s.keyTools.join("; ")],
      ]
    )
  );

  /* 2. Worth-it score */
  const w = plan.worthItScore;
  parts.push(`## 1. 💡 DIY Worth-It Score: ${w.score}/100 (${w.verdict})`);
  parts.push(
    table(
      ["Subscore", "Value"],
      [
        ["Savings potential", `${w.savingsPotential}`],
        ["Difficulty fit", `${w.difficultyFit}`],
        ["Tool accessibility", `${w.toolAccessibility}`],
        ["Material availability", `${w.materialAvailability}`],
        ["Visual match potential", `${w.visualMatchPotential}`],
        ["Safety (higher = safer)", `${w.safetyRisk}`],
        ["Time commitment (higher = lighter)", `${w.timeCommitment}`],
      ]
    )
  );
  parts.push(w.explanation);
  parts.push(`**Recommendation:** ${w.recommendation}`);

  /* 3. Savings story */
  const sv = plan.savingsStory;
  parts.push(`## 2. 💰 Savings Story`);
  parts.push(
    bullets([
      sv.referencePrice ? `Reference price: ${money(sv.referencePrice)}${sv.referenceLabel ? ` — ${sv.referenceLabel}` : ""}` : `Reference price: not verified${sv.referenceLabel ? ` — ${sv.referenceLabel}` : ""}`,
      `Estimated DIY cost: ${range(sv.estimatedDiyCostLow, sv.estimatedDiyCostHigh)}`,
      sv.estimatedSavings !== undefined ? `Estimated savings: ~${money(sv.estimatedSavings)}${sv.savingsPercentage !== undefined ? ` (~${sv.savingsPercentage}%)` : ""}` : undefined,
      `Tool costs included: ${sv.toolCostsIncluded ? "yes" : "no"}`,
      `Labor tradeoff: ${sv.laborTimeTradeoff}`,
    ])
  );
  parts.push(sv.explanation);

  /* 4. Reference analysis */
  const d = plan.referenceAnalysisDetails;
  parts.push(`## 3. 🔍 Reference Analysis`);
  parts.push(plan.referenceAnalysis);
  parts.push(
    table(
      ["Aspect", "Reading"],
      [
        ["Shape / form", d.shapeForm],
        ["Approx. dimensions", d.approxDimensions],
        ["Materials", d.materials],
        ["Finish / color", d.finishColor],
        ["Construction style", d.constructionStyle],
        ["Decorative details", d.decorativeDetails],
      ]
    )
  );
  parts.push(`**Visible in the reference:**\n\n${bullets(d.visible)}`);
  parts.push(`**Uncertain / not visible:**\n\n${bullets(d.uncertain)}`);

  /* 5. Confidence breakdown */
  const cb = plan.confidenceBreakdown;
  parts.push(`## 4. 📈 Confidence Breakdown (overall ${cb.overall}/100)`);
  parts.push(
    table(
      ["Area", "Confidence"],
      [
        ["Reference imagery", `${cb.referenceImage}`],
        ["Materials", `${cb.materials}`],
        ["Dimensions", `${cb.dimensions}`],
        ["Finish", `${cb.finish}`],
        ["Construction", `${cb.construction}`],
        ["Cost", `${cb.cost}`],
        ["Safety", `${cb.safety}`],
        ["Visual match", `${cb.visualMatch}`],
      ]
    )
  );
  parts.push(`**Uncertainty notes:**\n\n${bullets(cb.uncertaintyNotes)}`);
  parts.push(`**How to improve confidence:**\n\n${bullets(cb.howToImproveConfidence)}`);

  /* 6. Feasibility Q&A */
  if (plan.feasibilityQuestions.length > 0) {
    parts.push(`## 5. ❓ Feasibility Questions`);
    for (const q of plan.feasibilityQuestions) {
      parts.push(
        [
          `**${q.question}**${q.requiredForSafety ? " ⚠️ _(safety-relevant)_" : ""}`,
          `- Why it matters: ${q.whyItMatters}`,
          q.answer ? `- Your answer: ${q.answer}` : `- Not answered — assumption used: ${q.assumptionIfSkipped}`,
        ].join("\n")
      );
    }
  }

  /* 7. Assumptions */
  parts.push(`## 6. 📋 Assumptions`);
  parts.push(bullets(plan.assumptions));

  /* 8-9. Build paths + recommendation */
  parts.push(`## 7. 🛤️ Build Paths`);
  parts.push(
    table(
      ["Path", "Cost", "Time", "Difficulty", "Visual match", "Durability", "Best for"],
      plan.buildPaths.map((p) => [
        `${p.recommended ? "⭐ " : ""}${p.label}`,
        range(p.estimatedCostLow, p.estimatedCostHigh),
        p.estimatedTime,
        p.difficulty,
        `${p.visualMatchScore}`,
        `${p.durabilityScore}`,
        p.bestFor,
      ])
    )
  );
  for (const p of plan.buildPaths) {
    parts.push(`### ${p.recommended ? "⭐ " : ""}${p.label}\n\n**Pros:**\n\n${bullets(p.pros)}\n\n**Cons:**\n\n${bullets(p.cons)}\n\n**Compromises:** ${p.compromises.join("; ")}`);
  }
  parts.push(`**Why this path:** ${plan.recommendedPathReason}`);

  /* 10. Design simplifier */
  const ds = plan.designSimplifier;
  parts.push(`## 8. ✂️ Design Simplifications`);
  parts.push(table(["Hard original detail", "Why difficult"], ds.difficultOriginalDetails.map((x) => [x.detail, x.whyDifficult])));
  parts.push(table(["Original", "Simplified to", "Fidelity impact"], ds.simplifications.map((x) => [x.original, x.simplified, x.fidelityImpact])));
  parts.push(`**Preserved:** ${ds.preservedElements.join("; ")}\n\n**Changed:** ${ds.changedElements.join("; ")}\n\n**Removed:** ${ds.removedElements.join("; ")}`);
  parts.push(`${ds.fidelityLossSummary}\n\n_${ds.rationale}_`);

  /* 11. Minimum viable dupe */
  const mvd = plan.minimumViableDupe;
  parts.push(`## 9. 🪶 Minimum Viable Dupe (${range(mvd.estimatedCostLow, mvd.estimatedCostHigh)}, ${mvd.estimatedTime})`);
  parts.push(mvd.summary);
  parts.push(`**Must preserve:** ${mvd.mustPreserveElements.join("; ")}\n\n**Can simplify:** ${mvd.canSimplifyElements.join("; ")}\n\n**Can remove:** ${mvd.canRemoveElements.join("; ")}`);
  parts.push(`**Approach:** ${mvd.constructionApproach}\n\n**Tradeoff:** ${mvd.fidelityTradeoff}`);

  /* 12. Dimensions */
  parts.push(`## 10. 📏 Dimensions`);
  parts.push(table(["Dimension", "Value", "Source", "Confidence"], plan.dimensions.map((x) => [x.label, x.value, x.source, x.confidence !== undefined ? `${x.confidence}` : "—"])));

  /* 13. Measurement calibration */
  if (plan.measurementCalibration) {
    const mc = plan.measurementCalibration;
    parts.push(`## 11. 📐 Measurement Calibration`);
    if (mc.knownDimension) parts.push(`Anchor: ${mc.knownDimension.label} = ${mc.knownDimension.value} ${mc.knownDimension.unit}. (${mc.anchorType?.replace(/_/g, " ") ?? "anchor"})`);
    parts.push(table(["Estimated dimension", "Value", "Confidence", "Reasoning"], mc.estimatedDimensions.map((e) => [e.label, `${e.value} ${e.unit}.`, `${e.confidence}`, e.reasoning])));
    parts.push(bullets(mc.notes));
  }

  /* 14. Materials */
  parts.push(`## 12. 🪵 Materials`);
  parts.push(
    table(
      ["Material", "Qty", "Specification", "Purpose", "Cost", "Notes"],
      plan.materials.map((m) => [m.name, m.quantity, m.specification, m.purpose, range(m.estimatedCostLow, m.estimatedCostHigh), [m.existingInventorySubstitution, m.notes].filter(Boolean).join(" ")])
    )
  );
  const withAlts = plan.materials.filter((m) => m.budgetAlternative || m.premiumAlternative);
  if (withAlts.length > 0) {
    parts.push(`**Alternatives:**\n\n${bullets(withAlts.map((m) => `${m.name}: ${[m.budgetAlternative ? `budget → ${m.budgetAlternative}` : null, m.premiumAlternative ? `premium → ${m.premiumAlternative}` : null].filter(Boolean).join("; ")}`))}`);
  }

  /* 15. Material swaps */
  parts.push(`## 13. 🔄 Material Swap Options`);
  parts.push(
    table(
      ["Swap", "Cost", "Durability", "Visual", "Difficulty", "Notes"],
      plan.materialSwaps.map((x) => [`${x.originalMaterial ? `${x.originalMaterial} → ` : ""}${x.alternativeMaterial}`, x.costImpact, x.durabilityImpact, x.visualMatchImpact, x.difficultyImpact, x.notes])
    )
  );

  /* 16. Hardware */
  parts.push(`## 14. 🔩 Hardware`);
  parts.push(
    table(
      ["Item", "Qty", "Specification", "Purpose", "Cost", "Notes"],
      plan.hardware.map((h) => [h.name, h.quantity, h.specification, h.purpose, range(h.estimatedCostLow, h.estimatedCostHigh), h.notes ?? ""])
    )
  );

  /* 17. Tools */
  parts.push(`## 15. 🛠️ Tools`);
  parts.push(
    table(
      ["Tool", "Required", "Owned", "Purpose", "Substitute / buy", "Beginner note"],
      plan.tools.map((t) => [
        t.name,
        t.required ? "Required" : "Optional",
        t.owned ? "✅" : "—",
        t.purpose,
        [t.substitute, t.estimatedCostIfBuying, t.rentalRecommended ? "rental recommended" : null].filter(Boolean).join("; ") || "—",
        t.beginnerNote ?? "",
      ])
    )
  );

  /* 18. Tool-aware notes */
  if (plan.toolAwareNotes.length > 0) {
    parts.push(`## 16. 🧰 Missing-Tool Workarounds`);
    parts.push(table(["Missing tool", "Impact", "Workaround", "Type"], plan.toolAwareNotes.map((n) => [n.missingTool, n.impact, n.workaround, n.workaroundType.replace(/_/g, " ")])));
  }

  /* 19. Build readiness */
  const br = plan.buildReadiness;
  parts.push(`## 17. ✅ Build Readiness: ${br.score}/100 (${br.readyStatus.replace(/_/g, " ")})`);
  parts.push(
    bullets([
      br.missingTools.length > 0 ? `Missing tools: ${br.missingTools.join("; ")}` : "Missing tools: none",
      br.missingMaterials.length > 0 ? `Missing materials: ${br.missingMaterials.join("; ")}` : undefined,
      br.skillGaps.length > 0 ? `Skill gaps: ${br.skillGaps.join("; ")}` : undefined,
      br.workspaceConcerns.length > 0 ? `Workspace: ${br.workspaceConcerns.join("; ")}` : undefined,
      br.budgetConcerns.length > 0 ? `Budget: ${br.budgetConcerns.join("; ")}` : undefined,
      br.safetyConcerns.length > 0 ? `Safety: ${br.safetyConcerns.join("; ")}` : undefined,
    ])
  );
  parts.push(`**Recommendation:** ${br.recommendation}`);

  /* 20. Difficulty breakdown */
  const db = plan.difficultyBreakdown;
  parts.push(`## 18. 📊 Difficulty Breakdown (overall: ${db.overall})`);
  parts.push(
    table(
      ["Axis", "Assessment"],
      (
        [
          ["Cutting accuracy", db.cuttingAccuracy],
          ["Assembly", db.assembly],
          ["Joinery", db.joinery],
          ["Finish matching", db.finishMatching],
          ["Tool complexity", db.toolComplexity],
          ["Physical handling", db.physicalHandling],
          ["Safety risk", db.safetyRisk],
          ["Time commitment", db.timeCommitment],
          ["Repairability", db.repairability],
          ["Beginner tolerance", db.beginnerTolerance],
        ] as [string, string | undefined][]
      ).filter((r) => r[1])
    )
  );
  parts.push(bullets(db.notes));

  /* 21. Cut list */
  parts.push(`## 19. 📏 Cut List`);
  parts.push(table(["Part", "Qty", "Material", "Dimensions", "Notes"], plan.cutList.map((c) => [c.partName, `${c.quantity}`, c.material, c.dimensions, c.notes ?? ""])));

  /* 22. Cut optimization */
  parts.push(`## 20. 🧩 Cut Optimization`);
  for (const cp of plan.cutOptimizationPlans) {
    parts.push(`### ${cp.material} (${cp.sourceSize}) — est. waste ${cp.estimatedWastePercent}%`);
    parts.push(table(["Part", "Qty", "Dimensions", "Precision", "Notes"], cp.cuts.map((c) => [c.partName, `${c.quantity}`, c.dimensions, c.precision, c.notes ?? ""])));
    if (cp.grainDirectionNotes?.length) parts.push(`**Grain:**\n\n${bullets(cp.grainDirectionNotes)}`);
    parts.push(`**Sequence:**\n\n${bullets(cp.sequenceNotes.map((n, i) => `${i + 1}. ${n}`), "")}`);
  }

  /* 23. Store cut sheet */
  if (plan.storeCutSheet) {
    parts.push(`## 21. 🛒 Store Cut Sheet`);
    parts.push(renderCutSheet(plan.title, plan.storeCutSheet).split("\n").slice(1).join("\n"));
  }

  /* 24. Budget */
  const bb = plan.budgetBreakdown;
  parts.push(`## 22. 💵 Budget Breakdown`);
  for (const line of bb.lines) {
    parts.push(`### ${line.category} — ${range(line.subtotalLow, line.subtotalHigh)}`);
    parts.push(table(["Item", "Low", "High", "Optional"], line.items.map((i) => [i.name, money(i.costLow), money(i.costHigh), i.optional ? "optional" : ""])));
  }
  parts.push(
    bullets([
      `Materials total: ${range(bb.materialsTotalLow, bb.materialsTotalHigh)}`,
      `Optional tools (excluded from grand total): ${range(bb.optionalToolsLow, bb.optionalToolsHigh)}`,
      `**Grand total: ${range(bb.grandTotalLow, bb.grandTotalHigh)}**`,
      bb.referencePrice ? `Reference price: ${money(bb.referencePrice)}` : undefined,
      bb.estimatedSavingsLow !== undefined && bb.estimatedSavingsHigh !== undefined ? `Estimated savings: ${range(bb.estimatedSavingsLow, bb.estimatedSavingsHigh)}` : undefined,
      `Cost confidence: ${bb.confidence}/100`,
    ])
  );
  parts.push(bullets(bb.notes));

  /* 25. Shopping list */
  parts.push(`## 23. 🛒 Shopping List`);
  for (const dept of plan.shoppingListByDepartment) {
    parts.push(`### ${dept.store ? `${dept.store} — ` : ""}${dept.department}`);
    parts.push(
      checklist(
        dept.items.map(
          (i) => `${i.name} — ${i.quantity}, ${i.spec} (${range(i.estimatedCostLow, i.estimatedCostHigh)})${i.required ? "" : " _(optional)_"}${i.notes ? ` — ${i.notes}` : ""}`
        )
      )
    );
  }

  /* 26. Timeline */
  parts.push(`## 24. 🗓️ Project Timeline`);
  for (const ph of plan.projectTimeline) {
    parts.push(
      [
        `### ${ph.phase} — ${ph.dayOrSession} (${ph.estimatedDuration})`,
        bullets(ph.tasks),
        ph.waitTime ? `⏳ Wait time: ${ph.waitTime}` : "",
        ph.dependencies?.length ? `Depends on: ${ph.dependencies.join("; ")}` : "",
        ph.notes ? `_${ph.notes}_` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  /* 27. Pre-build checklist */
  parts.push(`## 25. ☑️ Pre-Build Checklist`);
  parts.push(checklist(plan.preBuildChecklist));

  /* 28. Steps */
  parts.push(`## 26. 🔨 Step-by-Step Build Guide`);
  for (const st of plan.steps) {
    parts.push(
      [
        `### Step ${st.stepNumber}: ${st.title} _(${st.estimatedTime})_`,
        `**Goal:** ${st.goal}`,
        `**Tools:** ${st.toolsNeeded.join(", ") || "—"} · **Materials:** ${st.materialsNeeded.join(", ") || "—"}`,
        bullets(st.instructions.map((x, i) => `${i + 1}. ${x}`), ""),
        st.measurementNotes?.length ? `📏 **Measurement notes:**\n\n${bullets(st.measurementNotes)}` : "",
        st.safetyNotes?.length ? `⚠️ **Safety:**\n\n${bullets(st.safetyNotes)}` : "",
        st.qualityCheck ? `✅ **Quality check:** ${st.qualityCheck}` : "",
        st.commonMistake ? `🚫 **Common mistake:** ${st.commonMistake}` : "",
        st.relatedMiniLessons?.length ? `📚 Related mini-lessons: ${st.relatedMiniLessons.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  /* 29. Diagrams */
  parts.push(`## 27. 📐 Diagrams`);
  for (const dg of plan.diagrams) {
    parts.push(`### ${dg.title}`);
    parts.push(dg.description);
    if (dg.type === "ascii" && dg.ascii) parts.push("```\n" + dg.ascii + "\n```");
    if (dg.type === "svg") parts.push("_(SVG diagram — view in the app or the exported HTML for the rendered drawing.)_");
    if (dg.caption) parts.push(`_${dg.caption}_`);
  }

  /* 30. Finish guide */
  const fg = plan.finishGuide;
  parts.push(`## 28. 🎨 Finish Matching Guide (confidence ${fg.confidence}/100)`);
  parts.push(`**Reference finish:** ${fg.referenceFinishDescription}`);
  parts.push(`**Recommended system:**\n\n${bullets(fg.recommendedFinishSystem.map((x, i) => `${i + 1}. ${x}`), "")}`);
  parts.push(`**Budget option:**\n\n${bullets(fg.budgetOption)}\n\n**Premium option:**\n\n${bullets(fg.premiumOption)}`);
  parts.push(`**Stain / paint options:**\n\n${table(["Product", "Type", "Note"], fg.stainPaintOptions.map((x) => [x.name, x.type, x.note]))}`);
  parts.push(`**Topcoats:**\n\n${table(["Product", "Note"], fg.topcoatOptions.map((x) => [x.name, x.note]))}`);
  parts.push(`**Color matching tips:**\n\n${bullets(fg.colorMatchingTips)}`);
  parts.push(`**Test board protocol:**\n\n${bullets(fg.testBoardInstructions.map((x, i) => `${i + 1}. ${x}`), "")}`);
  parts.push(`**Application:**\n\n${bullets(fg.applicationSteps.map((x, i) => `${i + 1}. ${x}`), "")}`);
  parts.push(`**Common finish problems:**\n\n${table(["Problem", "Fix"], fg.commonProblems.map((x) => [x.problem, x.fix]))}`);
  parts.push(`**Curing:**\n\n${bullets(fg.curingNotes)}`);

  /* 31. Mini lessons */
  parts.push(`## 29. 📚 Skill Mini-Lessons`);
  for (const ml of plan.miniLessons) {
    parts.push(
      [
        `### ${ml.title} _(${ml.skillCategory} · ${ml.difficulty})_`,
        ml.explanation,
        ml.steps?.length ? bullets(ml.steps.map((x, i) => `${i + 1}. ${x}`), "") : "",
        ml.commonMistakes?.length ? `🚫 Mistakes: ${ml.commonMistakes.join(" · ")}` : "",
        ml.safetyNotes?.length ? `⚠️ ${ml.safetyNotes.join(" · ")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );
  }

  /* 32. Mistake prevention */
  parts.push(`## 30. 🚫 Mistake Prevention`);
  parts.push(
    table(
      ["Mistake", "Why it happens", "How to avoid", "How to fix", "Steps"],
      plan.mistakePrevention.map((x) => [x.mistake, x.whyItHappens, x.howToAvoid, x.howToFix, x.affectedSteps?.join(", ") ?? "—"])
    )
  );

  /* 33. Common problems */
  parts.push(`## 31. 🔧 Troubleshooting Reference`);
  parts.push(
    table(
      ["Problem", "Likely causes", "Fix", "Severity"],
      plan.commonProblems.map((x) => [x.problem, x.likelyCauses.join("; "), x.fix, x.severity])
    )
  );

  /* 34. Safety review */
  const sr = plan.safetyReview;
  parts.push(`## 32. ⚠️ Safety Design Review (overall: ${sr.overallRisk.replace(/_/g, " ")})`);
  parts.push(sr.summary);
  parts.push(table(["Level", "Category", "Issue", "Mitigation"], sr.hazards.map((h) => [h.level, h.category, h.issue, h.mitigation])));
  parts.push(`**PPE:**\n\n${bullets(sr.ppe)}`);
  if (sr.childPetNotes.length > 0) parts.push(`**Kids & pets:**\n\n${bullets(sr.childPetNotes)}`);
  parts.push(`**Structural notes:**\n\n${bullets(sr.structuralNotes)}`);
  parts.push(`**Finish toxicity:**\n\n${bullets(sr.finishToxicityNotes)}`);
  if (sr.professionalReviewRecommended) parts.push(`> ⚠️ **Professional review recommended.** ${sr.professionalReviewReason ?? ""}`);

  /* 35. Alternatives */
  parts.push(`## 33. 🔀 Alternative Versions`);
  for (const alt of plan.alternatives) {
    parts.push(
      [
        `### ${alt.name} _(${alt.focus.replace(/_/g, " ")} · ${range(alt.estimatedCostLow, alt.estimatedCostHigh)} · ${alt.estimatedTime})_`,
        alt.description,
        `**Pros:** ${alt.pros.join(" · ")}`,
        `**Cons:** ${alt.cons.join(" · ")}`,
        `**Key changes:**\n\n${bullets(alt.keyChanges)}`,
      ].join("\n\n")
    );
  }

  /* 36. Builder handoff */
  parts.push(`## 34. 🤝 Builder Handoff Brief`);
  parts.push(builderHandoffMarkdown(plan).split("\n").slice(1).join("\n"));

  /* 37-39. Final checklist, maintenance, QA */
  parts.push(`## 35. ✅ Final Inspection Checklist`);
  parts.push(checklist(plan.finalChecklist));
  parts.push(`## 36. 🧽 Maintenance`);
  parts.push(bullets(plan.maintenance));
  parts.push(`## 37. 🔎 QA Notes (plan confidence ${plan.confidenceScore}/100)`);
  parts.push(bullets(plan.qaNotes));

  parts.push(`---`);
  parts.push(`_Generated by Dupe It Yourself for project "${project.title}" on ${new Date(plan.createdAt).toLocaleDateString("en-US")}. ${LEGAL_DISCLAIMER}_`);

  return parts.join("\n\n");
}
