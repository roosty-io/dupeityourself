/**
 * Project advisor: mid-build chat + structured troubleshooting.
 *
 * Mock mode is a plan-aware rule engine that answers from the plan's ACTUAL
 * materials, steps, costs and safety notes - not canned platitudes. Real mode
 * hands the full plan JSON to the LLM under a safety-forward system prompt.
 */
import type { BuildPlan, ChatMessage, Project, TroubleshootingResponse } from "../../shared/types";
import { isMockMode, llmComplete, tryParseJson } from "./llmClient";

/* ------------------------------- helpers -------------------------------- */

function moneyRange(low: number, high: number): string {
  return `$${low}-$${high}`;
}

function topMaterial(plan: BuildPlan) {
  return plan.materials[0];
}

function findStep(plan: BuildPlan, n: number) {
  return plan.steps.find((s) => s.stepNumber === n);
}

function matchProblem(plan: BuildPlan, text: string) {
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  let best: { score: number; problem: BuildPlan["commonProblems"][number] } | undefined;
  for (const p of plan.commonProblems) {
    const hay = `${p.problem} ${p.likelyCauses.join(" ")}`.toLowerCase();
    const score = words.filter((w) => hay.includes(w)).length;
    if (score > 0 && (!best || score > best.score)) best = { score, problem: p };
  }
  return best?.problem;
}

/* ------------------------------ advisor chat ---------------------------- */

const CHAT_SYSTEM = `You are the Project Advisor for a DIY "inspired-by" build planner - a patient, knowledgeable shop mentor chatting with a builder mid-project.

You receive the user's FULL build plan as JSON. Answer from it: quote its actual materials, specs, step numbers, costs, and safety notes. Be practical and specific; admit uncertainty honestly.

HARD RULES
- Brand-safe: this is an inspired-by build. Never say replica/knockoff/counterfeit/exact copy/official.
- Never state guaranteed load ratings: figures are "conservative design estimates, not certified ratings". Anything that sounds structurally risky gets conservative guidance and, where warranted, "stop and have a professional look".
- If the user describes an active safety hazard, lead with the safety action.
- Keep answers focused: 1-3 short paragraphs or a tight bullet list, ending with a concrete next action.`;

export async function advisorChat(
  project: Project,
  plan: BuildPlan | undefined,
  history: ChatMessage[],
  message: string
): Promise<string> {
  if (!isMockMode() && plan) {
    try {
      const raw = await llmComplete({
        system: CHAT_SYSTEM,
        messages: [
          { role: "user", content: `BUILD PLAN JSON:\n${JSON.stringify(plan).slice(0, 60000)}` },
          { role: "assistant", content: "Got it - I have the full plan loaded. What's going on with the build?" },
          ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: message },
        ],
        maxTokens: 1200,
      });
      return raw.trim();
    } catch (err) {
      console.error("[advisor] real-mode chat failed, falling back to rule engine:", err instanceof Error ? err.message : err);
    }
  }
  return mockAdvisorReply(project, plan, message);
}

function mockAdvisorReply(project: Project, plan: BuildPlan | undefined, message: string): string {
  const m = message.toLowerCase();
  if (!plan) {
    return "I don't see a generated plan on this project yet - run the plan generation first and I'll be able to answer from your actual materials, steps, and budget. In the meantime: what are you hoping to build?";
  }
  const mat = topMaterial(plan);

  /* explain step N simply */
  const stepMatch = m.match(/step\s+(\d+)/);
  if (stepMatch && /explain|simpl|understand|confus|what|how|walk/.test(m)) {
    const step = findStep(plan, Number(stepMatch[1]));
    if (step) {
      return [
        `Step ${step.stepNumber} ("${step.title}") in plain terms - the goal is: ${step.goal.toLowerCase()}.`,
        ...step.instructions.slice(0, 4).map((inst, i) => `${i + 1}. ${inst}`),
        step.qualityCheck ? `You'll know it worked when: ${step.qualityCheck}` : "",
        step.commonMistake ? `The one thing that trips people up here: ${step.commonMistake}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }
    return `This plan has steps 1-${plan.steps.length}. Which one should I break down?`;
  }

  /* pine substitution */
  if (/\bpine\b/.test(m) && /(instead|substitut|swap|use|cheaper|switch)/.test(m)) {
    return (
      `You can use pine, with eyes open. Your plan specs ${mat ? `${mat.name.toLowerCase()} (${mat.specification})` : "hardwood-grade material"} for the visible surfaces${mat ? ` at ${moneyRange(mat.estimatedCostLow, mat.estimatedCostHigh)}` : ""}. Pine saves roughly 30-40% there, but three honest tradeoffs: it dents under a fingernail (soft, ~380-420 on the hardness scale vs ~1350 for white oak), its bold grain and knots read "farmhouse" rather than the reference's look, and it blotches under stain unless you use a pre-stain conditioner or gel stain.` +
      `\n\nIf the piece lives a gentle life or gets painted, pine is a fine call${mat?.budgetAlternative ? ` - though the plan's own budget alternative (${mat.budgetAlternative.toLowerCase()}) is usually the better cheap route` : ""}. If it's a daily-use surface, spend the difference. Next action: check the Material Swaps tab - the impacts there apply to pine almost exactly.`
    );
  }

  /* warped boards */
  if (/(warp|bow|twist|cupp|crook)/.test(m)) {
    return (
      `Warped stock happens to everyone - here's the triage. If you haven't cut it yet: return it. Big-box stores take back warped lumber without drama, and no amount of clamping "fixes" a bad board permanently.` +
      `\n\nIf it's already cut: mild bow along the length can often be used strategically (bow side clamped against something straight during assembly - glue and fasteners hold it), mild cup can be flattened by wetting the concave face and weighting it flat overnight, but twist is the killer - a twisted part becomes a wobbly assembly and should be recut from spare stock.` +
      `\n\nPrevention is in your plan: the acclimation instructions in step 1 exist precisely because wood moves when it changes buildings. Next action: sight down each remaining board now and mark the good ones before they surprise you.`
    );
  }

  /* pocket hole jig necessity */
  if (/pocket\s?hole/.test(m)) {
    const jig = plan.tools.find((t) => /pocket/i.test(t.name));
    if (jig && !jig.required && jig.substitute) {
      return `Good news: the pocket hole jig is optional in your plan. Its listed workaround: ${jig.substitute} Everything it joins in this build gets covered or hidden, so appearance isn't at stake - only convenience.`;
    }
    return (
      `Your plan ${jig?.required ? "does list the pocket hole jig as required" : "uses pocket holes for the hidden joints"} - but you have options. A basic single-hole jig runs $25-45 and is genuinely worth it if you'll build more than once. To skip it entirely: glue plus countersunk screws driven through the faces works wherever the joint gets covered later${plan.toolAwareNotes.length > 0 ? ", and your Tools tab lists the specific workaround for each gap" : ""}. What you lose is the self-clamping alignment pocket screws give you - so clamp joints flush before driving anything.`
    );
  }

  /* screw length */
  if (/screw/.test(m) && /(length|long|size|which|what)/.test(m)) {
    const fasteners = plan.hardware.filter((h) => /screw/i.test(h.name)).slice(0, 3);
    if (fasteners.length > 0) {
      return (
        `Straight from your plan's hardware list:\n` +
        fasteners.map((f) => `- ${f.name}: ${f.specification} - ${f.purpose.toLowerCase()}${f.notes ? ` (${f.notes})` : ""}`).join("\n") +
        `\n\nThe rule behind those numbers: a screw should reach about 2/3 of its length into the receiving piece without poking through. In 3/4 in. stock face-to-face, 1-1/4 in. is right and 1-5/8 in. pokes through. When in doubt, hold the screw against the joint's edge and look.`
      );
    }
  }

  /* only drill + circular saw */
  if (/only (have|own|got)/.test(m) || /just (a |my )?(drill|circular)/.test(m)) {
    const notes = plan.toolAwareNotes;
    return (
      `A drill and a circular saw cover more of this plan than you'd think. ${notes.length > 0 ? `Your plan already maps the gaps:\n` + notes.slice(0, 4).map((n) => `- ${n.missingTool}: ${n.workaround.split(".")[0]}.`).join("\n") : "The required list is short, and the big-box panel saw handles sheet break-downs free."}` +
      `\n\nThe pattern: store panel saw for big cuts, a shop-made straightedge guide to make the circular saw cut like a track saw, and a speed square as a crosscut fence. Next action: read the Store Cut Sheet tab before your lumber run - it's written for exactly your situation.`
    );
  }

  /* wobble */
  if (/(wobbl|rock|unstable|uneven)/.test(m)) {
    const p = plan.commonProblems.find((cp) => /wobbl|rock/i.test(cp.problem));
    if (p) {
      return `This one's in your plan's troubleshooting table. Most likely causes, in order: ${p.likelyCauses.join("; ")}. The fix: ${p.fix} Severity: ${p.severity} - annoying, not dangerous, as long as joints are tight.`;
    }
  }

  /* weight support - conservative safety language */
  if (/(weight|hold|support|heavy|lbs|pounds|sit on|stand on|climb|load)/.test(m)) {
    const structural = plan.safetyReview.structuralNotes.slice(0, 2);
    return (
      `Careful, honest answer: this plan is designed for ${plan.snapshot.projectType.toLowerCase()} service with conservative margins - ${structural.length > 0 ? structural.map((s) => s.toLowerCase().replace(/\.$/, "")).join("; ") : "normal use for its type"}. Those are conservative design estimates for a one-off build, NOT certified load ratings, and I won't pretend otherwise - materials vary, and so does workmanship.` +
      `\n\nPractical rules: use it for what it is (${plan.snapshot.bestFor.toLowerCase()}), keep the no-standing/no-climbing rule, re-tighten mechanical fasteners after the first week, and if you need genuinely rated load capacity for something safety-critical, that's a job for an engineered product or a professional review.`
    );
  }

  /* hardest step */
  if (/(hardest|most difficult|trickiest|scariest|worried)/.test(m)) {
    const risky = plan.steps.filter((s) => s.commonMistake).slice(0, 3);
    return (
      `Honest answer from your plan's difficulty breakdown: ${plan.difficultyBreakdown.notes[0] || `the difficulty concentrates in a handful of steps.`}` +
      (risky.length > 0
        ? `\n\nThe steps to slow down on:\n` + risky.map((s) => `- Step ${s.stepNumber} (${s.title}): ${s.commonMistake}`).join("\n")
        : "") +
      `\n\nEverything else is assembly-line work. The plan builds rehearsals on scrap into the unforgiving steps - do them, they're 15 minutes of insurance each.`
    );
  }

  /* cheaper */
  if (/(cheaper|save money|less expensive|too expensive|cut cost|budget)/.test(m)) {
    const alts = plan.materials.filter((mm) => mm.budgetAlternative).slice(0, 3);
    return (
      `Current plan cost: ${moneyRange(plan.snapshot.estimatedCostLow, plan.snapshot.estimatedCostHigh)}. Where the money actually comes out:\n` +
      (alts.length > 0
        ? alts.map((a) => `- ${a.name} (${moneyRange(a.estimatedCostLow, a.estimatedCostHigh)}): swap to ${a.budgetAlternative}`).join("\n")
        : `- Check the Material Swaps tab - each swap lists its cost and look impact.`) +
      `\n\nOr do it in one move: hit the "Make it cheaper" refine button and I'll re-cut the whole plan to the budget path with the swaps applied and the totals recomputed. The minimum viable dupe version runs ${moneyRange(plan.minimumViableDupe.estimatedCostLow, plan.minimumViableDupe.estimatedCostHigh)} if you want the floor.`
    );
  }

  /* finish questions */
  if (/(finish|stain|poly|polyurethane|paint|sheen|topcoat|coat|varnish)/.test(m)) {
    const g = plan.finishGuide;
    return (
      `Your plan's finish system, condensed: ${g.recommendedFinishSystem.slice(0, 3).join("; ")}.` +
      `\n\nThe two rules that matter most here: ${g.colorMatchingTips[0] || "test on scrap first"} And: ${g.testBoardInstructions[0] || "run the full recipe on a test piece sanded exactly like the real surface - never improvise on the piece itself."}` +
      `\n\nCure reality check: ${g.curingNotes[0] || "dry-to-touch is not cured - respect the wait times."} If you tell me the specific symptom or question (color off? streaks? which product?), I'll get more specific.`
    );
  }

  /* default: point at the relevant plan sections */
  return (
    `Here's where your plan covers that: the Overview tab has the worth-it math and budget (${moneyRange(plan.snapshot.estimatedCostLow, plan.snapshot.estimatedCostHigh)}, ${plan.snapshot.estimatedTime}), the Build tab has all ${plan.steps.length} steps with quality checks, Materials/Tools carry exact specs and workarounds, and Troubleshooting has the fix table for mid-build surprises.` +
    `\n\nAsk me anything specific - "explain step 4 simply", "can I use pine instead", "what screws where", "how do I make it cheaper", "my top wobbles" - and I'll answer from the plan's actual numbers. What part of the build are you on?`
  );
}

/* ----------------------------- troubleshooting --------------------------- */

const TROUBLESHOOT_SYSTEM = `You are the Troubleshooting agent for a DIY "inspired-by" build planner.

The user reports a problem mid-build or in service. You receive the full plan JSON. Diagnose like a calm shop mentor.

OUTPUT: JSON TroubleshootingResponse: { problemSummary, likelyCauses[], diagnosticChecks[], recommendedFixes[], severity (minor|moderate|serious|safety_stop), safetyWarning?, preventionTips[] }.

RULES
- diagnosticChecks identify WHICH cause applies before fixing.
- severity=safety_stop for structural failure, instability under load, or anything that could injure - and the safetyWarning says to stop using it now.
- Reference the plan's actual steps/materials where relevant.
- Never state guaranteed load ratings.`;

export async function troubleshoot(project: Project, plan: BuildPlan | undefined, problem: string): Promise<TroubleshootingResponse> {
  if (!isMockMode() && plan) {
    try {
      const raw = await llmComplete({
        system: TROUBLESHOOT_SYSTEM,
        messages: [{ role: "user", content: `PLAN JSON:\n${JSON.stringify(plan).slice(0, 50000)}\n\nPROBLEM REPORT:\n${problem}` }],
        maxTokens: 1500,
      });
      const parsed = tryParseJson<TroubleshootingResponse>(raw);
      if (parsed) return parsed;
    } catch (err) {
      console.error("[advisor] real-mode troubleshoot failed, falling back:", err instanceof Error ? err.message : err);
    }
  }
  return mockTroubleshoot(plan, problem);
}

function mockTroubleshoot(plan: BuildPlan | undefined, problem: string): TroubleshootingResponse {
  const p = problem.toLowerCase();

  /* structural red flags first */
  if (/(crack|snap|broke|collaps|gave way|split.*(leg|joint|frame)|falling)/.test(p)) {
    return {
      problemSummary: "A structural member or joint has cracked, split, or failed.",
      likelyCauses: [
        "Fastener driven without a pilot hole near an edge (most common split cause)",
        "A knot or weak grain section at a load point",
        "Joint racking under a load direction it was not designed for",
      ],
      diagnosticChecks: [
        "Unload the piece completely and photograph the damage before touching it.",
        "Trace the crack: does it pass through a fastener, a knot, or a glue line?",
        "Check every OTHER joint of the same type - failures of this kind travel in packs.",
      ],
      recommendedFixes: [
        "Hairline split at a screw: back the screw out, work glue into the split, clamp overnight, re-drive into a fresh pilot 1 in. away.",
        "Cracked structural member: replace the part - glue repairs on load-bearing cracks are not trustworthy long-term.",
        "Failed glue joint: scrape old glue to bare wood, re-glue, clamp, and add a mechanical fastener as backup.",
      ],
      severity: "safety_stop",
      safetyWarning:
        "Stop using the piece until repaired - especially around kids or for anything weight-bearing. A repaired structural part is an estimate, not a rating; when in doubt, replace the part or have someone experienced look at it.",
      preventionTips: ["Pilot every fastener within 2 in. of an edge.", "Re-tighten mechanical fasteners after the first week of use, then seasonally."],
    };
  }

  /* wobble/rocking */
  if (/(wobbl|rock|unstable|tippy|uneven)/.test(p)) {
    const fromPlan = plan ? matchProblem(plan, "wobble rock floor") : undefined;
    return {
      problemSummary: "The piece wobbles or rocks in use.",
      likelyCauses: fromPlan?.likelyCauses ?? [
        "Floor out of flat (the most common cause by far - test by moving the piece 2 ft)",
        "One support fractionally short or out of plumb",
        "Joints loosened after early use",
      ],
      diagnosticChecks: [
        "Rotate or move the piece 90 degrees: wobble that stays with the SPOT is the floor; wobble that follows the piece is the piece.",
        "Set a level across the top both directions to find which corner is short.",
        "Grab each joint and rack it gently - listen for creaks that reveal a loose fastener.",
      ],
      recommendedFixes: fromPlan ? [fromPlan.fix] : [
        "Floor wobble: shim the short foot's pad, or fit adjustable levelers.",
        "Short support: add a second felt pad on the short one - a 1/16 in. correction is invisible.",
        "Loose joints: re-tighten everything, and add glue blocks in hidden corners if it recurs.",
      ],
      severity: fromPlan?.severity ?? "minor",
      preventionTips: ["Assemble on the flattest surface available, not the garage floor's worst corner.", "Re-torque fasteners after week one - wood compresses under new hardware."],
    };
  }

  /* finish problems */
  if (/(blotch|streak|stain|finish|poly|haze|milky|bubble|tacky|sticky|drip)/.test(p)) {
    const fromPlan = plan?.finishGuide.commonProblems.find((fp) => p.split(/\W+/).some((w) => w.length > 3 && fp.problem.toLowerCase().includes(w)));
    return {
      problemSummary: "The finish is not coming out right (blotches, streaks, haze, or texture problems).",
      likelyCauses: [
        "Surface contamination: glue residue, oils, or dust under the finish",
        "Application too thick, too cold, or recoated before the window",
        "Uneven surface prep - skipped grits or burnished spots absorb differently",
      ],
      diagnosticChecks: [
        "Wipe the problem area with mineral spirits: blotches that flash pale are contamination (usually glue), not stain trouble.",
        "Check temperature and humidity against the can's specs - most finish misbehavior is environmental.",
        "Raking light at night with a flashlight shows whether the problem is IN the film or UNDER it.",
      ],
      recommendedFixes: fromPlan ? [fromPlan.fix] : [
        "Contamination: sand the area back to clean material, verify with a spirits wipe, recoat thin.",
        "Thick/cold coats: let it fully cure (48 h), scuff evenly, apply one thin coat in proper conditions.",
        "General rescue: nearly every film finish is rebuildable - scuff with 320 and apply a corrective thin coat rather than stripping.",
      ],
      severity: "moderate",
      preventionTips: [
        plan?.finishGuide.testBoardInstructions[0] ?? "Run the full finish recipe on a test piece prepared exactly like the real surface.",
        "Thin coats, proper temps, and patience between coats beat every additive and shortcut.",
      ],
    };
  }

  /* alignment/gaps/square */
  if (/(gap|misalign|not square|out of square|crooked|off center|uneven reveal|miter)/.test(p)) {
    return {
      problemSummary: "Parts are not lining up - gaps, out-of-square assemblies, or misaligned reveals.",
      likelyCauses: [
        "Reference-edge drift: measuring from different edges on different parts",
        "Clamping racked the assembly out of square during glue-up",
        "A store or rough cut used as a final edge",
      ],
      diagnosticChecks: [
        "Measure both diagonals of the assembly: equal means square, and the longer diagonal points at the problem corners.",
        "Check each mating part against a known straight edge - find WHICH part is off before adjusting anything.",
        "Dry-fit with tape before re-gluing anything.",
      ],
      recommendedFixes: [
        "Small gaps at visible joints: close with glue plus clamp pressure if unfastened, or fill (wood filler for paint, matching wax stick for clear finishes).",
        "Out-of-square glue-up caught wet: rack it back with a clamp across the long diagonal and re-check.",
        "Cured misalignment: decide between shimming/scribing to hide it vs recutting the offending part - hiding is usually smarter for anything under 1/8 in.",
      ],
      severity: "moderate",
      preventionTips: ["One tape measure, one reference edge per part, diagonals checked before glue sets.", "Every store cut gets re-trimmed at home before use as a reference."],
    };
  }

  /* fiber/fabric problems */
  if (/(gauge|tension|stitch|hourglass|selvedge|pull.*in|bunch|wrinkl|pucker|sag|fabric|weave|yarn)/.test(p)) {
    return {
      problemSummary: "Fabric or fiber tension trouble - bunching, wrinkles, pulled-in edges, or uneven texture.",
      likelyCauses: [
        "Uneven working tension (the universal cause in fabric and fiber work)",
        "For weaving: weft laid straight instead of bubbled, pulling edges inward",
        "For upholstery: staples spaced too far apart, or tension chased too hard in one zone",
      ],
      diagnosticChecks: [
        "Find where it started: tension problems compound, so the first bad row/section is upstream of where it is obvious.",
        "For fabric: check whether the weave/nap direction drifted relative to a straight edge.",
        "Press or steam a small test zone - what relaxes out is tension, what stays is structure.",
      ],
      recommendedFixes: [
        "Fabric wrinkles/bunching: remove staples in the affected zone only, re-pull with flat-palm tension, re-staple every 2 in.",
        "Weaving pull-in: unweave to where the narrowing started and rework with generous bubbling - or steam-block hard and call mild taper a design feature.",
        "Sagging over time: most fiber fixes are re-tensioning, not rebuilding - re-stretch and re-fasten the affected panel.",
      ],
      severity: "minor",
      preventionTips: ["Check width/straightness against a fixed mark every few inches, not at the end.", "Practice the tension motion on scrap - it is a hand skill, not a knowledge skill."],
    };
  }

  /* chip/tearout */
  if (/(chip|tearout|tear out|splinter|veneer)/.test(p)) {
    return {
      problemSummary: "Chipping or tearout along cut edges (usually veneer or plywood faces).",
      likelyCauses: ["No tape or scoring on the cut line", "Coarse or dull blade", "Good face oriented toward the blade's exit side"],
      diagnosticChecks: ["Is the damage on the show face or a hidden face? Hidden face chips cost nothing.", "Measure the worst chip - under 1/16 in. usually disappears into an eased edge or under banding."],
      recommendedFixes: [
        "Small chips on show edges: fill with matching filler (paint) or a wax stick (clear finish), or ease the edge so the chip vanishes into the roundover.",
        "Big chips: if the part has trim allowance, shift the line 1/8 in. and recut with painter's tape on the line and a fresh fine blade.",
        "Chips that pop off intact: glue the flake back immediately with a dot of CA or wood glue - invisible when it works.",
      ],
      severity: "minor",
      preventionTips: ["Painter's tape on every cross-grain cut line; score the line with a knife for critical edges.", "A fresh 40+ tooth blade is the cheapest quality upgrade you can buy."],
    };
  }

  /* match against the plan's own table, then generic */
  const fromPlan = plan ? matchProblem(plan, p) : undefined;
  if (fromPlan) {
    return {
      problemSummary: fromPlan.problem,
      likelyCauses: fromPlan.likelyCauses,
      diagnosticChecks: ["Work through the likely causes in order - they are ranked by probability.", "Change one variable at a time so you know what fixed it."],
      recommendedFixes: [fromPlan.fix],
      severity: fromPlan.severity,
      safetyWarning: fromPlan.severity === "safety_stop" ? "Stop using the piece until this is resolved." : undefined,
      preventionTips: plan ? plan.mistakePrevention.slice(0, 2).map((mp) => mp.howToAvoid) : [],
    };
  }
  return {
    problemSummary: `Reported problem: ${problem.slice(0, 140)}`,
    likelyCauses: [
      "Not enough detail yet to pin the cause - the categories below cover most build problems",
      "Measurement/reference drift, tension or clamping unevenness, environmental conditions (temp/humidity), or material variation",
    ],
    diagnosticChecks: [
      "Describe when it appeared (which step, or how long in service) - timing points at causes.",
      "Photograph it in raking light; most problems are diagnosable from one good angled photo.",
      "Check the plan's Common Problems table - the closest entry's diagnostics usually transfer.",
    ],
    recommendedFixes: [
      "Stop at the current step rather than building over a problem - almost everything is cheaper to fix now than after the next three steps.",
      "Re-ask with specifics (step number, what it looks like, what changed) and you'll get a targeted diagnosis.",
    ],
    severity: "minor",
    preventionTips: ["When something feels off mid-step, it is - pause and check the step's quality check before continuing."],
  };
}
