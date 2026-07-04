/**
 * Flagship demo content: an "inspired-by" DIY build plan for a designer
 * white-oak pedestal dining table (user-provided reference: the Pottery Barn
 * Meadowview Rectangular Dining Table).
 *
 * Everything here is honest demo data: the reference page fetch was blocked
 * (403), so dimensions and price are labeled estimates, while materials
 * confidence is high because the user pasted the product copy. All prices are
 * 2026-plausible Home Depot-style numbers, and the budget lines are arithmetic-
 * checked so category subtotals add up to the plan totals.
 */
import type {
  BudgetBreakdown,
  BuildPlan,
  FeasibilityQuestion,
  MeasurementCalibration,
  Project,
  SavedPlanVersion,
} from "../../shared/types";
import { AGENT_STAGES } from "../../shared/constants";

const CREATED_AT = "2026-06-27T14:05:00.000Z";
const GENERATED_AT = "2026-06-27T14:11:42.000Z";
const UPDATED_AT = "2026-07-01T12:00:00.000Z";

/* ------------------------- feasibility questions ------------------------ */

const demoFeasibilityQuestions: FeasibilityQuestion[] = [
  {
    id: "q_size_confirm",
    question:
      "The listing photos suggest roughly an 84 in. x 40 in. eight-seater, but the page fetch was blocked so we could not verify. What size do you want to build?",
    whyItMatters:
      "Every cut list dimension, the sheet-goods count, and the pedestal spacing hang off this one answer. An 84 in. top needs a full 8 ft sheet; a 72 in. top frees up offcut material and changes pedestal placement.",
    answerType: "single_choice",
    options: [
      "Keep it 84 in. x 40 in. (seats 8)",
      "Shrink to 72 in. x 36 in. (seats 6)",
      "Custom size (tell us)",
    ],
    requiredForSafety: false,
    assumptionIfSkipped:
      "We assume 84 in. x 40 in. x 30 in. tall based on standard 8-seat rectangular dining sizing and the proportions in the listing photos.",
    answer: "Keep it 84 in. x 40 in. (seats 8)",
  },
  {
    id: "q_knockdown",
    question:
      "Do you want the top to be removable from the pedestals (for moving house or getting it through doorways), or permanently attached?",
    whyItMatters:
      "A knock-down design uses threaded inserts and machine bolts instead of wood screws, which survive repeated assembly. A finished 84 in. top will not turn most stairwells in one piece with pedestals attached.",
    answerType: "single_choice",
    options: ["Removable (bolt-down, knock-down hardware)", "Permanent (screwed and done)"],
    requiredForSafety: false,
    assumptionIfSkipped: "We assume removable, since an assembled 84 in. pedestal table is a two-person, doorway-hostile move.",
    answer: "Removable (bolt-down, knock-down hardware)",
  },
  {
    id: "q_colorway",
    question:
      "The original comes in two colorways: Natural white oak with a brushed-gold base wrap, or Charcoal with an antique-brass wrap. Which look are you matching?",
    whyItMatters:
      "It decides the entire finish schedule. Natural oak means a non-ambering water-based topcoat over bare oak; Charcoal means a pigmented finish where we could switch the top to cheaper birch plywood and save roughly $70.",
    answerType: "single_choice",
    options: [
      "Natural white oak top, metal-look base",
      "Charcoal top and base",
    ],
    requiredForSafety: false,
    assumptionIfSkipped: "We assume the Natural white oak colorway - it is the look in the photos you referenced.",
    answer: "Natural white oak top, metal-look base",
  },
  {
    id: "q_kids",
    question: "Will small children regularly climb on, lean on, or pull up against this table?",
    whyItMatters:
      "Pedestal tables concentrate tip resistance at the base footprint instead of at corner legs. With kids in the house we check end-load tip math, spec rounded corners, and require a fully cured, wipeable finish before everyday use.",
    answerType: "boolean",
    requiredForSafety: true,
    assumptionIfSkipped:
      "We assume yes and design conservatively: 3/4 in. corner radii, eased edges, pedestal centers at least 40 in. apart, and a 30-day finish cure before harsh cleaners.",
    answer: "Yes - two kids, ages 4 and 7. They will absolutely lean on the ends.",
  },
  {
    id: "q_floor",
    question: "What floor will the table live on?",
    whyItMatters:
      "Hard floors want felt pads sized for a 150+ lb table; carpet wants gliders or levelers because felt drags. An out-of-flat floor needs adjustable levelers to kill wobble that no amount of squaring will fix.",
    answerType: "single_choice",
    options: ["Hardwood / engineered wood", "Tile or stone", "Carpet", "Uneven floor - not sure"],
    requiredForSafety: false,
    assumptionIfSkipped: "We assume a hard floor and spec 2 in. heavy-duty felt pads under each pedestal.",
    answer: "Hardwood / engineered wood",
  },
];

/* ------------------------- measurement calibration ---------------------- */

const demoMeasurementCalibration: MeasurementCalibration = {
  knownDimension: {
    label: "Standard dining table height",
    value: 30,
    unit: "in",
  },
  anchorType: "table_height",
  estimatedDimensions: [
    {
      label: "Overall length",
      value: 84,
      unit: "in",
      confidence: 55,
      reasoning:
        "Scaled from listing photos using the 30 in. height anchor; length reads at roughly 2.8x the height. 84 in. is also the standard 8-seat rectangular size this collection sells in.",
    },
    {
      label: "Overall width",
      value: 40,
      unit: "in",
      confidence: 55,
      reasoning:
        "Photo proportion is close to a 2.1:1 top; 40 in. matches the standard width paired with 84 in. tops and leaves 15 in. of place-setting depth per side plus a shared center strip.",
    },
    {
      label: "Tabletop thickness",
      value: 1.75,
      unit: "in",
      confidence: 50,
      reasoning:
        "The chunky rounded edge reads at roughly 6 percent of table height in photos, about 1-3/4 in. We build at 1-1/2 in. (two 3/4 in. layers) - the 1/4 in. difference is not visible at dining height.",
    },
    {
      label: "Pedestal drum diameter",
      value: 18,
      unit: "in",
      confidence: 50,
      reasoning:
        "Drum width scales at about 60 percent of the 30 in. height in the straight-on photo. 18 in. also gives comfortable knee clearance for end seats on an 84 in. table.",
    },
    {
      label: "Pedestal centers, spacing",
      value: 40,
      unit: "in",
      confidence: 45,
      reasoning:
        "Photos show pedestals set in roughly a quarter of the length from each end. Centers 22 in. from each end (40 in. apart) balances end-seat legroom against tip resistance with kids in the house.",
    },
  ],
  notes: [
    "The retailer page blocked automated reading (HTTP 403), so no manufacturer dimensions were extracted. Every number above is an estimate anchored on the 30 in. standard dining height.",
    "Before buying lumber, verify the 84 in. x 40 in. footprint in your room: you want at least 36 in. from table edge to walls for chairs, 42 in. on the sides people walk past.",
    "If you can visit a store that carries the original, two minutes with a tape measure upgrades dimension confidence from ~55 to ~95 and may change the cut list.",
  ],
};

/* ------------------------------ demo project ---------------------------- */

export const demoProject: Project = {
  id: "proj_demo_meadowview",
  userId: "user_demo",
  title: "Chunky Oak Pedestal Dining Table (inspired-by)",
  projectType: "Dining table",
  category: "woodworking",
  status: "ready",
  sourceType: "url",
  sourceUrl: "https://www.potterybarn.com/products/meadowview-rectangular-dining-table-mp/",
  sourceImages: [],
  userDescription:
    "I love this table - the thick natural oak top with the big rounded edges and the two drum pedestals with the metal band. $4k is way outside our budget. I have a decent garage setup but no table saw. Want it to survive two kids and daily dinners.",
  pastedProductText:
    "Crafted from solid white oak, solid rubberwood, veneers and MDF. Base wrapped in steel. Kiln-dried wood helps prevent warping and cracking. Mortise-and-tenon joinery. Available in Charcoal with Antique Brass wrapped base, or Natural white oak with Brushed Gold wrapped base. Part of a collection with chunky rounded tabletop edges and sculptural pedestal bases.",
  constraints: {
    budgetMin: 400,
    budgetMax: 900,
    skillLevel: "intermediate",
    ownedTools: ["Drill/driver", "Circular saw", "Random orbit sander", "Clamps", "Pocket hole jig"],
    preferredStores: ["Home Depot"],
    workspaceType: "garage",
    desiredFidelity: "close_visual_match",
    durability: "everyday_use",
    dimensions: { width: 40, depth: 84, height: 30, unit: "in" },
    knownReferenceDimensions: "Not published to us - page fetch was blocked; sizes estimated from photos + standard dining sizing.",
    materialPreferences: ["Real wood grain on the top", "White oak if affordable"],
    avoidMaterials: ["Particleboard for structural parts"],
    existingInventory: [],
    kidsOrPets: true,
    weightBearing: true,
    storeCutsOnly: false,
    optimizeFor: "balanced",
    timeAvailability: "Weekends, roughly 8-10 hours per weekend",
    notes: "Garage has one 20A circuit and decent lighting. Helper available for glue-ups and the final flip.",
  },
  analysis: {
    projectBrief:
      "Build an inspired-by version of a designer oak pedestal dining table: an 84 in. x 40 in. chunky-edged natural white oak top on two sculptural pedestal bases with a metal band detail. The reference uses solid white oak, veneers and MDF with a steel-wrapped base; our version recreates the look with white oak veneer plywood, a built-up solid oak edge, and faceted octagonal plywood pedestals wrapped with brass-finish aluminum facets.",
    category: "woodworking",
    secondaryCategory: "finishing",
    referenceExtraction: {
      title: "Meadowview Rectangular Dining Table",
      brand: "Pottery Barn (user-provided reference)",
      currency: "USD",
      description:
        "Recovered from user-pasted product copy, not from the page: solid white oak, solid rubberwood, veneers and MDF; base wrapped in steel; kiln-dried wood; mortise-and-tenon joinery; Charcoal/Antique Brass or Natural/Brushed Gold colorways.",
      materialsText:
        "Solid white oak, solid rubberwood, veneers and MDF. Base wrapped in steel. Kiln-dried. Mortise-and-tenon joinery.",
      fetchSucceeded: false,
      fetchError:
        "The retailer's bot protection returned HTTP 403 on every fetch attempt, so no price, dimensions, or images could be extracted from the page itself.",
      extractionConfidence: 35,
    },
    visionAnalysis: {
      objectType: "Rectangular double-pedestal dining table",
      styleSummary:
        "Warm organic-modern: a thick rectangular top with heavily rounded edges and corners in pale natural oak, floating over two wide drum pedestals wrapped in metal with a brass-tone band. Reads expensive because of the edge mass and the wood-to-metal contrast.",
      components: [
        {
          component: "Tabletop",
          observation:
            "Thick slab appearance (~1-3/4 in.) with a large-radius roundover on edges and corners; long cathedral grain suggests plain-sliced white oak faces; copy admits veneers + MDF, so likely a veneered torsion-box or lumber-core top, not solid throughout.",
          confidence: 80,
        },
        {
          component: "Pedestal bases (x2)",
          observation:
            "Two wide cylindrical drums, slightly narrower than the top width, with a visible horizontal metal band; copy says the base is wrapped in steel over a wood core.",
          confidence: 75,
        },
        {
          component: "Metal wrap / band",
          observation:
            "Brushed gold-tone band on the Natural colorway; appears to sit at the base of each drum with a crisp reveal line. Gauge and attachment method not visible.",
          confidence: 60,
        },
        {
          component: "Top-to-base connection",
          observation: "No visible fasteners or aprons; almost certainly bolted through internal plates under the top.",
          confidence: 55,
        },
      ],
      materialGuesses: [
        {
          material: "White oak (solid edges + face veneer over engineered core)",
          confidence: 85,
          reasoning: "Product copy lists solid white oak AND veneers/MDF - classic solid-edge, veneered-panel construction.",
        },
        {
          material: "Steel sheet wrap on pedestals, painted/plated brass tone",
          confidence: 80,
          reasoning: "Copy states the base is wrapped in steel; photos show a metallic band consistent with a wrapped skin.",
        },
        {
          material: "Rubberwood in hidden structure",
          confidence: 70,
          reasoning: "Copy lists solid rubberwood - typically used for internal frames and blocking where it will not be seen.",
        },
      ],
      finishGuesses: [
        {
          finish: "Low-sheen, non-ambering clear coat over bare-toned white oak (UV-cured or water-based)",
          confidence: 75,
          reasoning:
            "The Natural colorway keeps oak pale and slightly matte with open grain texture - an oil-based poly would amber it noticeably, so the factory finish is almost certainly a non-yellowing system.",
        },
        {
          finish: "Brushed gold metallic on the base wrap",
          confidence: 70,
          reasoning: "Marketing names it Brushed Gold; photos show soft directional sheen, not mirror plating.",
        },
      ],
      constructionClues: [
        "No aprons or stretchers visible - stiffness must come from top thickness plus the pedestal mounting plates.",
        "Mortise-and-tenon called out in copy, likely inside the pedestal frames where we cannot see it.",
        "Edge roundover radius looks large (about 3/8 in. or more) and continues around the corners - a shaper/CNC detail we will reproduce with sanding blocks and patience.",
      ],
      decorativeDetails: [
        "Chunky rounded tabletop edge - the signature detail",
        "Metal band with crisp reveal at the drum base",
        "Pale, even, natural oak color with visible open grain",
      ],
      complexityLevel: "moderate",
      uncertainAreas: [
        "True curved-drum construction (stave-built? bent ply? MDF ring stack?) - not visible",
        "Steel wrap gauge and how it is seamed",
        "Exact top thickness and core construction",
        "Actual dimensions and current price - page fetch blocked",
      ],
      needsUserConfirmation: [
        "Room fits an 84 in. x 40 in. table with chair clearance",
        "Colorway choice (Natural vs Charcoal)",
        "Knock-down vs permanent top attachment",
      ],
    },
    measurementCalibration: demoMeasurementCalibration,
    assumptions: [
      "Reference retail price assumed at about $3,999 - typical for this size/collection; not verified because the page blocked us, and it varies by finish and promotions.",
      "Overall size assumed 84 in. L x 40 in. W x 30 in. H from standard sizing plus photo proportions.",
      "The two drums are assumed to be about 18 in. across; our octagonal interpretation keeps that across-flats width.",
    ],
    missingInformation: [
      "Manufacturer dimensions and weight",
      "Verified current price",
      "Drum internal construction and steel gauge",
    ],
    riskFlags: [
      {
        level: "low",
        category: "stability",
        issue: "Pedestal tables tip more easily under end loads than four-leg tables, and there are kids in the house.",
        mitigation:
          "Pedestal centers set 40 in. apart (22 in. from each end); under our weight assumptions the design resists roughly 300 lb applied straight down on the extreme end edge before tipping - conservative for leaning kids, but never a guaranteed rating. Do not let anyone sit or stand on the ends.",
      },
      {
        level: "low",
        category: "finish safety",
        issue: "Finishing indoors (garage) with kids around.",
        mitigation:
          "The plan specs water-based poly and low-VOC enamel, ventilation with a box fan, and a full cure window before daily use.",
      },
      {
        level: "low",
        category: "cutting",
        issue: "Breaking down full 4x8 sheets alone with a circular saw.",
        mitigation: "Store panel cuts for the big break-downs, foam-board support at home, and a shop-made straightedge guide.",
      },
    ],
    highRisk: false,
    confidenceScore: 74,
  },
  feasibilityQuestions: demoFeasibilityQuestions,
  generation: {
    status: "complete",
    stages: AGENT_STAGES.map((s) => ({ key: s.key, label: s.label, status: "complete" as const })),
    planId: "plan_demo_meadowview_v1",
    startedAt: CREATED_AT,
    finishedAt: GENERATED_AT,
  },
  selectedBuildPath: "balanced",
  latestPlanId: "plan_demo_meadowview_v1",
  isDemo: true,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

/* ------------------------------- demo plan ------------------------------ */

export const demoPlan: BuildPlan = {
  id: "plan_demo_meadowview_v1",
  projectId: "proj_demo_meadowview",
  title: "Chunky Oak Pedestal Dining Table - Balanced Build",
  snapshot: {
    inspiredBy: "Designer white-oak double-pedestal dining table (user reference: Pottery Barn Meadowview)",
    projectType: "Dining table",
    selectedBuildPath: "balanced",
    difficulty: "Intermediate",
    estimatedCostLow: 580,
    estimatedCostHigh: 840,
    estimatedTime: "3 weekends (28-34 hours hands-on, plus cure time)",
    visualMatchScore: 82,
    durabilityScore: 85,
    safetyRiskLabel: "Medium (power tools + finishing; low risk in use)",
    bestFor: "An intermediate DIYer with a garage, no table saw, and a helper for two lifts",
    requiredWorkspace: "One garage bay (about 10 x 12 ft clear) with a 9 ft run for long rips",
    mainMaterials: [
      "3/4 in. white oak veneer plywood (top)",
      "Solid white oak 1x2 (built-up edge)",
      "3/4 in. birch plywood (pedestals)",
      "Aluminum flat bar, brass-finish (base band)",
    ],
    keyTools: ["Circular saw + shop-made guide", "Drill/driver", "Pocket hole jig", "Random orbit sander", "Ratchet straps as band clamps"],
  },
  worthItScore: {
    score: 87,
    verdict: "excellent",
    savingsPotential: 95,
    difficultyFit: 78,
    toolAccessibility: 82,
    materialAvailability: 90,
    visualMatchPotential: 80,
    safetyRisk: 85,
    timeCommitment: 70,
    explanation:
      "This is close to the ideal DIY dupe: the expensive parts of the original are labor and brand, not exotic materials. A veneered top with a built-up solid oak edge recreates the signature chunky-edge look for a fraction of the price, and the one genuinely hard detail - curved steel-wrapped drums - has a clean simplification (faceted octagonal columns with a brass-finish band) that preserves the silhouette. Your tool set covers about 85 percent of the work; the two gaps (table saw, miter saw) both have solid workarounds using store panel cuts and a shop-made saw guide. The main costs to you are three weekends and careful finish work.",
    recommendation:
      "Build it. Take the Balanced path: white oak veneer ply top with solid oak edges, faceted pedestals, water-based matte topcoat. Spend your care on the edge miters and the finish - those two things are 90 percent of whether this reads as a $4,000 table.",
  },
  savingsStory: {
    referencePrice: 3999,
    referenceLabel: "Estimated retail (~$3,999 - not verified; the product page blocked our reader, and price varies by finish and promotions)",
    estimatedDiyCostLow: 580,
    estimatedDiyCostHigh: 840,
    estimatedSavings: 3289,
    savingsPercentage: 82,
    toolCostsIncluded: false,
    laborTimeTradeoff:
      "You are trading roughly 28-34 hours of shop time across three weekends (plus finish cure days) for about $3,200-$3,400 in savings - effectively $95-$120 per hour of your time, tax-free.",
    explanation:
      "The reference price is our estimate for this size and collection tier, labeled as an assumption because the page could not be read. The DIY range covers every required material at Home Depot-typical mid-2026 prices, from best-case ($580, all low estimates, no extras) to padded ($840, high estimates plus optional add-ons and a 5 percent mis-cut buffer). Tools are excluded per your settings; you own the expensive ones already.",
  },
  referenceAnalysis:
    "The reference is a rectangular double-pedestal dining table whose whole identity lives in three details: a thick pale-oak top with oversized rounded edges, two sculptural drum bases, and a metal band with a brass-tone finish. The product copy (pasted by you, since the page itself blocked us) confirms solid white oak plus veneers and MDF - meaning even the original uses veneered panels with solid edges, which is exactly the construction a careful DIYer can reproduce. The drums are steel-wrapped wood; that is the one element we simplify rather than copy, swapping curves for crisp facets. Built at 84 x 40 with the finishes specified here, this should read as the same family of table from across the room, and as a well-made piece from arm's length.",
  referenceAnalysisDetails: {
    shapeForm:
      "Rectangular top, softly radiused corners, thick eased edge; two wide cylindrical pedestals set in from the ends; no aprons or stretchers.",
    approxDimensions:
      "Estimated 84 in. L x 40 in. W x 30 in. H, top about 1-3/4 in. thick, drums about 18 in. across - all photo-scaled estimates, not manufacturer numbers.",
    materials:
      "Confirmed by product copy: solid white oak, solid rubberwood, veneers and MDF; kiln-dried stock; base wrapped in steel.",
    finishColor:
      "Natural colorway: pale, non-ambered white oak with open grain and a low sheen; base wrap in brushed gold tone.",
    constructionStyle:
      "Factory: veneered engineered panels with solid oak edges, mortise-and-tenon internal frames, steel-skinned drum bases, bolted top connection.",
    decorativeDetails: "Chunky roundover on all top edges and corners; crisp metal band reveal at the drum bases.",
    visible: [
      "Thick top with large-radius rounded edges and corners",
      "Long cathedral white oak grain on the top face",
      "Two drum pedestals inset from the table ends",
      "Brass-tone band on each pedestal",
      "Shadow-line reveal where the top meets the drums",
      "Low-sheen, pale natural finish",
    ],
    uncertain: [
      "Exact dimensions and top thickness (page blocked - estimated from photos)",
      "Current retail price (assumed ~$3,999)",
      "Drum internal construction and steel gauge",
      "Whether the top field is veneer over MDF or solid staves (copy suggests veneer + solid edges)",
      "Exact factory finish chemistry and sheen level",
    ],
  },
  confidenceBreakdown: {
    overall: 74,
    referenceImage: 70,
    materials: 85,
    dimensions: 55,
    finish: 75,
    construction: 72,
    cost: 80,
    safety: 88,
    visualMatch: 78,
    uncertaintyNotes: [
      "The retailer page returned HTTP 403 to every automated fetch, so nothing was extracted from the page itself - materials knowledge comes from the product copy you pasted, which is why materials confidence (85) is far above dimensions confidence (55).",
      "All dimensions are photo-proportional estimates anchored on the 30 in. standard dining height. If the real table is 80 in. long instead of 84, the cut list changes.",
      "The reference price of $3,999 is an assumption based on comparable tables in this collection tier; the savings math shifts with promotions.",
      "The drum interior is invisible in photos; our faceted interpretation is a deliberate redesign, not a guess at their construction.",
    ],
    howToImproveConfidence: [
      "Open the product page in your own browser and paste the dimensions section - that alone lifts overall confidence to about 85.",
      "Measure the table in a showroom if one is nearby: length, width, top thickness, drum diameter, band height.",
      "Upload a straight-on photo of the table end if you have one; it tightens the drum diameter and band position estimates.",
      "Confirm the current price on the page so the savings story uses a real number.",
    ],
  },
  feasibilityQuestions: demoFeasibilityQuestions,
  assumptions: [
    "Reference retail price is about $3,999; treated as an estimate because the page blocked reading and prices vary by finish and promotions.",
    "Overall size 84 in. x 40 in. x 30 in. with a ~1-3/4 in. thick top - photo-scaled estimates. Our build lands at 1-1/2 in. thick, visually equivalent at dining height.",
    "Drum pedestals are about 18 in. across; we keep that width across the flats of our octagonal columns.",
    "Home Depot has 3/4 in. white oak veneer plywood in stock ($95-$130/sheet in mid-2026; some stores only stock red oak - see the swap options).",
    "The 1x2 solid white oak boards on the hardwood rack are straight enough to select four good ones; if only red oak is available, the color shifts slightly warmer.",
    "Your garage stays between 60 and 85 F during glue-ups and finishing; Titebond II and water-based poly both misbehave below about 55 F.",
    "A second pair of hands is available twice: the tabletop lamination and the final stand-up.",
    "The floor where the table will live is flat within about 1/8 in. across the footprint; felt pads handle small variation, levelers are the backup plan.",
    "Store panel-saw cuts are within 1/8 in. of the requested size and are treated as rough cuts to be re-trimmed at home.",
    "Prices assume mid-2026 national averages at big-box stores; regional swings of plus or minus 20 percent are normal, sheet goods especially.",
  ],
  buildPaths: [
    {
      id: "path_mvd",
      name: "minimum_viable_dupe",
      label: "Minimum Viable Dupe",
      estimatedCostLow: 180,
      estimatedCostHigh: 300,
      estimatedTime: "1-2 weekends (10-14 hours)",
      difficulty: "Beginner-intermediate",
      visualMatchScore: 48,
      durabilityScore: 62,
      requiredTools: ["Drill/driver", "Circular saw or store cuts", "Random orbit sander", "Pocket hole jig"],
      pros: [
        "Cheapest possible version that still reads as a chunky pedestal table",
        "All cuts can be done at the store panel saw",
        "Done in one committed weekend plus finish time",
      ],
      cons: [
        "Birch grain and gel stain will not fool anyone up close who knows oak",
        "Square pedestal boxes lose the sculptural drum silhouette",
        "Thinner edge build-up (1-1/2 in. with simple square edge) loses some of the signature chunk",
      ],
      bestFor: "Testing whether you like the size and silhouette in your space before committing to the nicer build",
      compromises: ["Birch ply + gel stain instead of white oak", "Square pedestals, no metal band", "Simple eased edge instead of a big roundover"],
    },
    {
      id: "path_budget",
      name: "budget",
      label: "Budget Build",
      estimatedCostLow: 280,
      estimatedCostHigh: 420,
      estimatedTime: "2-3 weekends (16-22 hours)",
      difficulty: "Intermediate (light)",
      visualMatchScore: 62,
      durabilityScore: 74,
      requiredTools: ["Drill/driver", "Circular saw + straightedge guide", "Random orbit sander", "Pocket hole jig", "Clamps"],
      pros: [
        "Real chunky built-up edge and correct proportions at a third of the balanced cost",
        "Gel stain over birch is the most blotch-resistant way to fake oak tone",
        "Square-ish pedestal boxes go together fast with pocket screws you already know",
      ],
      cons: [
        "Birch cathedral grain is subtler than oak - the top reads as 'nice wood', not 'white oak'",
        "Painted pedestal base without the metal band loses the brass detail",
        "Gel stain color needs test boards to avoid landing orange",
      ],
      bestFor: "Getting 80 percent of the look when the budget genuinely stops at $400",
      compromises: ["Birch ply + poplar edge with gel stain", "Four-sided pedestal boxes", "No metal band - painted base only"],
    },
    {
      id: "path_beginner",
      name: "beginner",
      label: "Beginner Build",
      estimatedCostLow: 465,
      estimatedCostHigh: 660,
      estimatedTime: "3 weekends (20-26 hours, most cuts made at the store)",
      difficulty: "Confident beginner",
      visualMatchScore: 70,
      durabilityScore: 80,
      requiredTools: ["Drill/driver", "Pocket hole jig", "Random orbit sander", "Clamps", "Store panel saw for all sheet cuts"],
      pros: [
        "Keeps the real white oak top and solid oak edge - the details people touch",
        "No bevel cuts anywhere: square pedestal columns joined with pocket screws",
        "Every sheet cut comes off the store panel saw; you only trim and drill at home",
      ],
      cons: [
        "Square columns are the biggest visual departure from the drum bases",
        "Peel-and-stick metal-look band is convincing at a glance, not to the touch",
        "Store cut tolerance (about 1/8 in.) means edges need careful flush-trimming and filling",
      ],
      bestFor: "A first big furniture build where you want the premium top without learning bevel rips",
      compromises: ["Square pedestals with adhesive metal-look band", "Store-cut accuracy instead of shop-cut precision", "Simpler 1/8 in. eased edge roundover"],
    },
    {
      id: "path_balanced",
      name: "balanced",
      label: "Balanced Build",
      estimatedCostLow: 580,
      estimatedCostHigh: 840,
      estimatedTime: "3 weekends (28-34 hours hands-on)",
      difficulty: "Intermediate",
      visualMatchScore: 82,
      durabilityScore: 85,
      requiredTools: [
        "Drill/driver",
        "Circular saw + shop-made straightedge guide",
        "Random orbit sander",
        "Pocket hole jig",
        "Clamps",
        "Ratchet straps (band clamps)",
        "Hacksaw + file (metal band)",
      ],
      pros: [
        "White oak veneer top + solid white oak edge: real oak everywhere you see and touch",
        "Faceted octagonal pedestals keep the sculptural mass and take a real metal band cleanly",
        "Knock-down bolt connection survives moves and doorways",
        "Fits your owned tools with only cheap additions (straps, hacksaw, speed square)",
      ],
      cons: [
        "16 bevel-ripped staves demand a carefully set saw and a test cut - the fussiest cutting in the plan",
        "Finish matching pale natural oak takes test boards and restraint (no oil-based products)",
        "Aluminum facets need cutting, filing, priming and painting - a half day of metalwork-lite",
      ],
      bestFor: "The best look-per-dollar-per-weekend compromise for an intermediate builder without a table saw",
      compromises: [
        "Facets instead of true curves on the pedestals",
        "1-1/2 in. built-up top instead of ~1-3/4 in.",
        "Painted aluminum instead of plated steel wrap",
      ],
      recommendationReason:
        "Matches your $400-$900 budget, your close-visual-match goal, and your exact tool set; every missing tool has a store-cut or technique workaround baked into the steps.",
      recommended: true,
    },
    {
      id: "path_closest",
      name: "closest_match",
      label: "Closest Match",
      estimatedCostLow: 950,
      estimatedCostHigh: 1400,
      estimatedTime: "4-5 weekends (40-50 hours)",
      difficulty: "Intermediate-advanced",
      visualMatchScore: 90,
      durabilityScore: 88,
      requiredTools: ["Everything in Balanced", "Router + 1/2 in. roundover bit", "Jigsaw", "16-facet or kerf-bent column forms"],
      pros: [
        "16-sided columns (7-1/2 degree bevels) read as round from 6 feet away",
        "Router-cut 1/2 in. roundover nails the factory edge profile crisply",
        "Thicker 1-3/4 in. built-up edge matches our estimate of the original exactly",
      ],
      cons: [
        "32 bevel-ripped staves at 11.25 degrees leave zero room for saw-setup error",
        "Adds about $200 in router, bit, and extra material costs",
        "Nearly doubles the build hours versus Balanced",
      ],
      bestFor: "Builders who will lose sleep over facets that a throw pillow would not notice",
      compromises: ["Still painted aluminum, not plated steel", "Veneer-core top rather than the factory MDF-core lay-up"],
    },
    {
      id: "path_premium",
      name: "premium",
      label: "Premium Build",
      estimatedCostLow: 1500,
      estimatedCostHigh: 2100,
      estimatedTime: "5-6 weekends (50-65 hours)",
      difficulty: "Advanced",
      visualMatchScore: 94,
      durabilityScore: 93,
      requiredTools: ["Everything in Closest Match", "Jointing capability (router sled or hand plane)", "Long clamp set for panel glue-up"],
      pros: [
        "Solid white oak glue-up top - refinishable for generations, no veneer to worry about",
        "Real brass flat bar band, unpainted, that will patina like the original's hardware",
        "Hardwax oil finish gives the closest hand-feel to the factory surface",
      ],
      cons: [
        "Solid 8/4-adjacent top stock likely means a hardwood dealer trip, not Home Depot",
        "Panel flattening without a jointer/planer is genuinely advanced hand work",
        "Solid top requires movement-tolerant fastening (figure-8s) done exactly right",
      ],
      bestFor: "An heirloom version when budget stopped being the point",
      compromises: ["Time and cost balloon", "Still facets, unless you take on stave-drum lamination"],
    },
    {
      id: "path_pro",
      name: "pro",
      label: "Pro Build",
      estimatedCostLow: 2200,
      estimatedCostHigh: 3200,
      estimatedTime: "Commission it, or 60-80 shop hours",
      difficulty: "Professional",
      visualMatchScore: 96,
      durabilityScore: 95,
      requiredTools: ["Full shop: table saw, jointer, planer, veneer press or vacuum bag, metal brake"],
      pros: [
        "True curved drums via bending ply or coopered staves, steel-wrapped like the original",
        "Vacuum-pressed veneer top with solid edges - factory-grade construction",
        "Still roughly 20-45 percent under the estimated retail price",
      ],
      cons: [
        "Requires shop equipment far beyond your current set",
        "The savings-per-hour math gets thin versus just buying it on promotion",
        "Metal wrapping and seaming steel is its own trade",
      ],
      bestFor: "Handing our builder brief to a local furniture maker - see the Builder Handoff tab",
      compromises: ["Minimal visual compromises; the compromise is money and access to a shop"],
    },
  ],
  recommendedPathReason:
    "Balanced is the sweet spot for you specifically: it stays inside your $400-$900 budget with headroom, uses real white oak on every visible wood surface, needs zero tools you do not own beyond about $40 of cheap additions, and converts the one impossible detail (curved steel drums) into a build you can genuinely execute well - crisp facets with a real metal band. Beginner would sacrifice the drum silhouette further for skills you already have; Closest Match buys 8 visual-match points for roughly $400 and 15 more hours.",
  designSimplifier: {
    difficultOriginalDetails: [
      {
        detail: "Curved drum pedestals wrapped in steel",
        whyDifficult:
          "True cylinders need bending plywood or dozens of coopered staves plus a way to seam and fasten sheet steel around a curve - shop equipment and metalworking skills outside a garage tool set.",
      },
      {
        detail: "Chunky ~1-3/4 in. top with a large roundover on edges AND corners",
        whyDifficult:
          "The factory runs a shaper/CNC around a veneered lay-up. Without a router table, a big continuous roundover is slow hand work, and 1-3/4 in. needs a third lamination layer.",
      },
      {
        detail: "Mortise-and-tenon internal joinery",
        whyDifficult: "Proper M&T needs either a lot of chisel time or dedicated jigs; it is also invisible in the finished piece.",
      },
      {
        detail: "Factory UV-cured 'raw wood' finish",
        whyDifficult: "UV-cure lines do not exist in garages; the pale non-ambered look must be approximated with water-based products.",
      },
    ],
    simplifications: [
      {
        original: "Curved steel-wrapped drum pedestals",
        simplified:
          "Faceted octagonal plywood columns (8 staves, 22.5-degree bevels) with 8 brass-painted aluminum facet plates forming the band",
        fidelityImpact:
          "From 6 feet the mass, width, and band read the same; up close you see crisp facets instead of a curve. Honestly, the facets photograph beautifully - this is a redesign, not a knockdown in quality.",
      },
      {
        original: "~1-3/4 in. thick top edge",
        simplified: "1-1/2 in. built-up edge (3/4 in. panel + 3/4 in. perimeter build-up) wrapped in solid white oak 1x2",
        fidelityImpact: "About 1/4 in. thinner than our estimate of the original; imperceptible at dining height without a ruler.",
      },
      {
        original: "Large roundover on edges and corners",
        simplified: "3/4 in. corner radii cut within the solid edge stock plus a generous 3/16 in. hand-sanded roundover",
        fidelityImpact: "Softer and slightly smaller than the factory profile but preserves the 'thick and friendly' read; a router upgrade closes the gap.",
      },
      {
        original: "Mortise-and-tenon internal frames",
        simplified: "Pocket-screw and glue joinery with internal formers and glue blocks",
        fidelityImpact: "Zero visual impact (all hidden); adequate strength for dining loads with conservative margins.",
      },
      {
        original: "Steel base wrap in brushed gold",
        simplified: "1/16 in. aluminum flat bar facets, self-etch primed and sprayed aged brass",
        fidelityImpact: "Convincing color and crispness; aluminum will not ring like steel if tapped, and paint can chip where steel plating would not.",
      },
    ],
    preservedElements: [
      "84 x 40 footprint and 30 in. height",
      "Real white oak grain and pale natural color on every visible top surface",
      "Two-pedestal layout with the same inset proportions",
      "Metal band detail with a crisp reveal at the base",
      "Thick, rounded, touch-friendly edge",
    ],
    changedElements: ["Curved drums become octagonal faceted columns", "Top thickness 1-3/4 in. becomes 1-1/2 in.", "Steel wrap becomes painted aluminum facets"],
    removedElements: ["Full steel skin over the pedestal bodies (columns are painted wood instead, band only in metal)", "Rubberwood internal framing (replaced by ply formers)"],
    fidelityLossSummary:
      "You lose the curve and the full metal skin; you keep the silhouette, the oak, the band, and the chunk. Expect 'where did you buy that' from guests and 'the facets are actually nicer' from at least one of them.",
    rationale:
      "Every simplification trades an invisible or shop-dependent detail for one an intermediate garage builder can execute crisply. A crisp octagon beats a wobbly 'almost-circle' every time - clean geometry photographs as intentional design.",
  },
  minimumViableDupe: {
    summary:
      "One oak-look top with a thick edge on two simple pedestal boxes: birch ply, gel stain, square columns, store cuts for everything. The 'is this table right for our room' version.",
    mustPreserveElements: [
      "84 x 40 x 30 footprint (or your confirmed size)",
      "Thick edge look via a 1-1/2 in. built-up perimeter",
      "Two inset pedestals rather than corner legs",
    ],
    canSimplifyElements: ["Square pedestal boxes instead of octagons", "Gel-stained birch instead of white oak", "Eased edges instead of big roundovers"],
    canRemoveElements: ["Metal band entirely", "Knock-down hardware (screw it together permanently)", "Corner radii (just break the corners heavily)"],
    constructionApproach:
      "Store-cut birch panels; pocket-screw the edge build-up and pedestal boxes; glue and screw throughout; two coats of gel stain and three of water-based poly. Every technique is in the mini-lessons.",
    estimatedCostLow: 180,
    estimatedCostHigh: 300,
    estimatedTime: "1-2 weekends (10-14 hours) plus finish cure",
    fidelityTradeoff:
      "Roughly half the visual match of the Balanced build. It earns its keep as a proof-of-size you can later demote to a craft table when you build the real one.",
  },
  dimensions: [
    { label: "Overall length", value: "84 in.", source: "estimated", confidence: 55 },
    { label: "Overall width", value: "40 in.", source: "estimated", confidence: 55 },
    { label: "Overall height", value: "30 in.", source: "standard", confidence: 90 },
    { label: "Tabletop thickness (reference, estimated)", value: "~1-3/4 in.", source: "estimated", confidence: 50 },
    { label: "Tabletop thickness (as built)", value: "1-1/2 in.", source: "estimated", confidence: 95 },
    { label: "Pedestal width across flats", value: "18 in.", source: "estimated", confidence: 50 },
    { label: "Pedestal column height (as built)", value: "28-1/2 in. incl. plates", source: "estimated", confidence: 90 },
    { label: "Pedestal centers from table ends", value: "22 in.", source: "estimated", confidence: 60 },
    { label: "Pedestal center-to-center spacing", value: "40 in.", source: "estimated", confidence: 60 },
    { label: "Clear knee space between columns", value: "~22 in.", source: "estimated", confidence: 60 },
    { label: "Top overhang beyond pedestal (ends)", value: "13 in.", source: "estimated", confidence: 60 },
    { label: "Metal band height", value: "2 in., 1/4 in. floor reveal", source: "estimated", confidence: 55 },
  ],
  measurementCalibration: demoMeasurementCalibration,
  materials: [
    {
      name: "White oak veneer plywood",
      category: "Sheet goods",
      quantity: "1 sheet",
      specification: "3/4 in. x 4 ft. x 8 ft., A-grade plain-sliced white oak face, veneer core (PureBond-type, formaldehyde-free)",
      purpose: "Tabletop show surface plus the hidden build-up rails and finish test strips from the offcuts",
      estimatedCostLow: 98,
      estimatedCostHigh: 128,
      budgetAlternative: "Birch plywood + gel stain (saves ~$40, weaker grain match)",
      premiumAlternative: "Rift-sawn white oak ply, special order (+$60-90, straighter grain like the original)",
      notes:
        "Face veneer is roughly 1/40 in. thick - sand with 150 and finer only, and never park the sander in one spot. Check both faces at the store; reject face checks and core voids on the edges.",
    },
    {
      name: "Birch plywood",
      category: "Sheet goods",
      quantity: "2 sheets",
      specification: "3/4 in. x 4 ft. x 8 ft., B/BB birch, void-free enough for exposed bevels",
      purpose: "Pedestal staves, internal formers, mounting plates, and the shop-made saw guide",
      estimatedCostLow: 110,
      estimatedCostHigh: 140,
      budgetAlternative: "Sanded pine ply (saves ~$25/sheet but softer corners and more voids on beveled edges)",
      premiumAlternative: "Baltic birch 5x5 sheets from a plywood dealer (+$50, crisper bevel edges)",
      notes: "Columns get primed and painted, so the face grade matters less than flatness. Sight down each sheet and take the flattest two.",
    },
    {
      name: "Solid white oak board, 1x2",
      category: "Hardwood",
      quantity: "4 boards",
      specification: "1 in. x 2 in. x 8 ft. S4S white oak (actual 3/4 in. x 1-1/2 in.)",
      purpose: "Built-up solid edge banding around the tabletop - the surface hands and chairs actually hit",
      estimatedCostLow: 68,
      estimatedCostHigh: 84,
      budgetAlternative: "Red oak 1x2 (usually $3-4 less per board; slightly pinker, coarser grain)",
      premiumAlternative: "Quarter-sawn white oak from a hardwood dealer (ray fleck detail, +$30-50)",
      notes: "Buy 4 to select 3 straight ones; sight down every board in the store. Crooked edge stock cannot be clamped straight on an 84 in. run.",
    },
    {
      name: "Pine stud, 2x4",
      category: "Dimensional lumber",
      quantity: "2 studs",
      specification: "2 in. x 4 in. x 8 ft. kiln-dried whitewood, straightest two on the rack",
      purpose: "Anti-rotation cleats under the top and glue blocks inside the pedestal columns",
      estimatedCostLow: 10,
      estimatedCostHigh: 14,
      budgetAlternative: "Offcuts you already have - anything straight and dry works",
      premiumAlternative: "Poplar 2x4 equivalent (stays straighter, +$10)",
    },
    {
      name: "Aluminum flat bar",
      category: "Metal stock",
      quantity: "4 bars",
      specification: "1/16 in. x 2 in. x 36 in. mill-finish aluminum flat bar",
      purpose: "Cut into 16 facet plates forming the brass-tone band at each pedestal base",
      estimatedCostLow: 44,
      estimatedCostHigh: 56,
      budgetAlternative: "Painted hardboard strips (saves ~$25, loses the metallic crispness up close)",
      premiumAlternative: "Actual brass flat bar from an online metals supplier (+$70-110, no paint, real patina)",
      notes: "Each 36 in. bar yields 4 facets at 7-7/16 in. plus kerf. Buy 4 bars for 16 facets with almost zero waste.",
    },
    {
      name: "Wood glue",
      category: "Adhesive",
      quantity: "1 bottle, 16 oz",
      specification: "Titebond II Premium (water-resistant PVA, 8-10 minute open time)",
      purpose: "Every wood-to-wood joint: build-up frame, edge banding, stave glue-up, formers",
      estimatedCostLow: 10,
      estimatedCostHigh: 13,
      premiumAlternative: "Titebond III for a few more minutes of open time on the long edge glue-ups (+$3)",
      notes: "16 oz covers this build with some left over. Below 55 F it cures chalky and weak - warm the garage first.",
    },
    {
      name: "Construction adhesive",
      category: "Adhesive",
      quantity: "1 cartridge, 10 oz",
      specification: "Loctite PL Premium Max (polyurethane) or PL Premium 3X",
      purpose: "Bonding the painted aluminum facets to the painted columns - PVA glue will not bond metal",
      estimatedCostLow: 8,
      estimatedCostHigh: 11,
      notes: "A 1/8 in. bead 1/2 in. from the facet edges prevents squeeze-out past the metal.",
    },
    {
      name: "Wood filler",
      category: "Filler",
      quantity: "1 tub",
      specification: "DAP Plastic Wood, Natural, solvent-based (sandable, takes topcoat)",
      purpose: "Trim-screw counterbores on the columns and any stave joint lines before priming",
      estimatedCostLow: 5,
      estimatedCostHigh: 9,
      notes: "Columns are painted, so filler color barely matters there. Do NOT fill on the oak top - filler always shows under clear coats; fix oak dings with a damp cloth + iron steam-out instead.",
    },
    {
      name: "Water-based polyurethane, matte",
      category: "Finish",
      quantity: "1 quart",
      specification: "Varathane Ultimate Water-Based Polyurethane, Matte (or Minwax Polycrylic Matte)",
      purpose: "Three-coat clear topcoat on the oak top - water-based stays crystal clear and keeps white oak pale",
      estimatedCostLow: 26,
      estimatedCostHigh: 32,
      budgetAlternative: "Semi-gloss on sale, knocked down with a 0000 synthetic pad after cure (fussy - just buy matte)",
      premiumAlternative: "General Finishes High Performance Flat, online order (+$15, the furniture-maker favorite)",
      notes: "Oil-based poly would amber this top toward honey-yellow within months. Water-based is the whole ballgame for the Natural colorway.",
    },
    {
      name: "Primer, water-based",
      category: "Finish",
      quantity: "1 quart",
      specification: "Zinsser Bulls Eye 1-2-3 (water-based, sticks to sanded ply, sands powdery-smooth)",
      purpose: "Primes the birch pedestal columns before enamel",
      estimatedCostLow: 13,
      estimatedCostHigh: 17,
    },
    {
      name: "Enamel for columns",
      category: "Finish",
      quantity: "1 quart",
      specification: "Behr Urethane Alkyd Satin Enamel, tinted to a deep bronze-charcoal (bring a photo; ask for a near-black bronze)",
      purpose: "Two rolled coats on the pedestal columns - hard, scuffable-clean, kid-resistant film",
      estimatedCostLow: 30,
      estimatedCostHigh: 36,
      budgetAlternative: "Standard interior satin enamel (softer film, scuffs sooner)",
      notes: "Urethane-alkyd hybrids level like oil paint but clean up with water - ideal for foam-roller finishing on facets.",
    },
    {
      name: "Self-etching primer, spray",
      category: "Finish",
      quantity: "1 can",
      specification: "Rust-Oleum Self Etching Primer, 12 oz aerosol",
      purpose: "The only primer that reliably grips bare aluminum - regular primer flakes off metal",
      estimatedCostLow: 9,
      estimatedCostHigh: 12,
    },
    {
      name: "Metallic spray paint, aged brass",
      category: "Finish",
      quantity: "2 cans",
      specification: "Rust-Oleum Universal Metallic, Aged Brass (or Antique Brass), 11 oz",
      purpose: "Topcoat for the 16 aluminum band facets",
      estimatedCostLow: 18,
      estimatedCostHigh: 24,
      notes: "Two cans lets you do 3 light coats plus touch-ups. Light coats - metallics run and show every drip.",
    },
    {
      name: "Applicator kit",
      category: "Finish supplies",
      quantity: "1 set",
      specification: "4 in. foam rollers (2), quality 2 in. synthetic brush, staining pads (2), paint tray",
      purpose: "Rolling enamel on facets, padding poly onto the top",
      estimatedCostLow: 12,
      estimatedCostHigh: 17,
    },
    {
      name: "Sanding discs, 5 in.",
      category: "Abrasives",
      quantity: "1 assortment (~30 discs)",
      specification: "5 in. 8-hole hook-and-loop discs: 120 / 150 / 180 / 220 mix",
      purpose: "The full sanding schedule on top and columns",
      estimatedCostLow: 17,
      estimatedCostHigh: 23,
      notes: "You will burn through more 120 than anything else; the assortment plus the hand sheets covers it.",
    },
    {
      name: "Hand sanding sheets + block",
      category: "Abrasives",
      quantity: "1 pack + 1 block",
      specification: "9 x 11 sheets in 80 and 120 grit, cork or rubber sanding block",
      purpose: "Shaping the corner radii and the 3/16 in. edge roundover by hand",
      estimatedCostLow: 8,
      estimatedCostHigh: 12,
    },
    {
      name: "Fine sanding sponges",
      category: "Abrasives",
      quantity: "2",
      specification: "Fine/superfine (220-320 equivalent) flexible sponges",
      purpose: "Scuffing between poly and enamel coats without cutting through",
      estimatedCostLow: 4,
      estimatedCostHigh: 6,
    },
  ],
  materialSwaps: [
    {
      originalMaterial: "3/4 in. white oak veneer plywood (top)",
      alternativeMaterial: "3/4 in. birch plywood + Minwax Gel Stain (Aged Oak)",
      costImpact: "lower",
      durabilityImpact: "similar",
      visualMatchImpact: "lower",
      difficultyImpact: "similar",
      pros: ["Saves $40-60 on the sheet", "Gel stain is the most blotch-proof way to color birch", "Birch face veneer is slightly tougher to sand through"],
      cons: ["Birch grain is subtle and wavy - it will not read as oak up close", "Color depends entirely on your test boards", "Stain adds a full day to the finish schedule"],
      notes: "This is exactly what the Budget path does. If you go this way, buy the gel stain and skip nothing on test boards.",
    },
    {
      originalMaterial: "3/4 in. white oak veneer plywood (top)",
      alternativeMaterial: "3/4 in. red oak veneer plywood",
      costImpact: "lower",
      durabilityImpact: "similar",
      visualMatchImpact: "lower",
      difficultyImpact: "similar",
      pros: ["Stocked at nearly every store ($15-25 less)", "Unmistakably oak grain", "Same working properties"],
      cons: ["Pinker undertone than white oak", "Coarser, more open cathedrals", "Water-based poly keeps it pale but cannot hide the pink cast"],
      notes: "A wash coat of heavily thinned Sun Bleached stain before poly neutralizes most of the pink - prove it on the test strips first.",
    },
    {
      originalMaterial: "Veneer plywood top with built-up edge",
      alternativeMaterial: "Solid white oak glue-up panel (5/4 stock)",
      costImpact: "higher",
      durabilityImpact: "higher",
      visualMatchImpact: "higher",
      difficultyImpact: "harder",
      pros: ["Refinishable forever - no veneer to sand through", "End grain on show like fine furniture", "Closest to the premium original feel"],
      cons: ["$400-700 in lumber from a hardwood dealer", "Needs flattening and jointing you cannot do with current tools", "Requires movement-tolerant fastening (figure-8s) or it will crack itself apart"],
      notes: "This is the Premium path top. Wood movement stops being theoretical at 40 in. wide - see the wood movement mini-lesson.",
    },
    {
      originalMaterial: "3/4 in. birch plywood (pedestal staves)",
      alternativeMaterial: "3/4 in. MDF",
      costImpact: "lower",
      durabilityImpact: "lower",
      visualMatchImpact: "similar",
      difficultyImpact: "easier",
      pros: ["$20-30 cheaper per sheet", "Bevels cut glassy-smooth with zero tearout", "Primes to a perfect paint surface"],
      cons: ["Swells if the mop ever meets it at the floor line", "Screws hold poorly in edges - joints must rely on glue", "Nearly 30 percent heavier; the dust is nasty (P100 mask)"],
      notes: "Acceptable for the columns only if you seal the bottom edges completely and keep the 1/4 in. floor reveal.",
    },
    {
      originalMaterial: "Aluminum flat bar facets (band)",
      alternativeMaterial: "Peel-and-stick metal-look trim or painted hardboard strips",
      costImpact: "lower",
      durabilityImpact: "lower",
      visualMatchImpact: "lower",
      difficultyImpact: "easier",
      pros: ["No hacksaw, no filing, no etch primer", "Under $20 total", "Easy to replace if kicked"],
      cons: ["Reads as trim, not metal, from close up", "Edges can lift over time at floor level", "Loses the cold-to-the-touch tell of the original"],
      notes: "The Beginner path uses this. Wrap edges tightly and seal the bottom edge against mop water.",
    },
    {
      originalMaterial: "Pine 2x4 cleats and blocks",
      alternativeMaterial: "Poplar 1x3 / 2x3",
      costImpact: "similar",
      durabilityImpact: "similar",
      visualMatchImpact: "similar",
      difficultyImpact: "similar",
      pros: ["Straighter and drier than rack-grade studs", "Less pitch, nicer to drill", "Holds screws slightly better"],
      cons: ["A few dollars more", "Not always stocked in short lengths"],
      notes: "All hidden structure - use whatever straight, dry stock you can get cheapest.",
    },
  ],
  hardware: [
    {
      name: "Pocket-hole screws",
      category: "Fasteners",
      quantity: "1 box (100)",
      specification: "#8 x 1-1/4 in. coarse-thread, washer-head (Kreg Blue-Kote or equal)",
      purpose: "Build-up frame corner and brace joints in 3/4 in. ply",
      estimatedCostLow: 9,
      estimatedCostHigh: 12,
      notes: "Coarse thread for plywood. 1-1/4 in. is the correct length for 3/4 in. stock - anything longer pokes through.",
    },
    {
      name: "Multi-purpose screws",
      category: "Fasteners",
      quantity: "1 box (50)",
      specification: "#8 x 2-1/2 in. star-drive (GRK, SPAX, or Power Pro), self-countersinking",
      purpose: "Anti-rotation cleats to the top blocking, formers to glue blocks, plate-to-former connections",
      estimatedCostLow: 11,
      estimatedCostHigh: 16,
    },
    {
      name: "Trim-head screws",
      category: "Fasteners",
      quantity: "1 box (25)",
      specification: "#8 x 1-5/8 in. trim-head star-drive, plain or tan",
      purpose: "Fixing the columns to the mounting plates through the stave tops - tiny heads hide in the shadow line under the top overhang",
      estimatedCostLow: 8,
      estimatedCostHigh: 12,
      notes: "8 per pedestal. Pre-drill 3/32 in. - trim heads will split ply edges if you skip it.",
    },
    {
      name: "Threaded inserts",
      category: "Knock-down hardware",
      quantity: "1 pack (8)",
      specification: "5/16 in.-18 internal-thread inserts for wood (E-Z Lok or Everbilt), 7/16 in. pilot",
      purpose: "Machine-thread anchor points in the top's build-up braces so the pedestals bolt on and off forever",
      estimatedCostLow: 9,
      estimatedCostHigh: 14,
      notes: "4 used, 4 spares (they occasionally cross-thread going in). Drive with a bolt + jam nut, never a screwdriver slot.",
    },
    {
      name: "Hex bolts + washers",
      category: "Knock-down hardware",
      quantity: "6 bolts, 6 washers",
      specification: "5/16 in.-18 x 1-1/2 in. hex bolts, zinc, with 5/16 in. flat washers",
      purpose: "Bolt the pedestal mounting plates up into the tabletop inserts (2 per pedestal + spares)",
      estimatedCostLow: 6,
      estimatedCostHigh: 9,
      notes: "Snug plus a quarter turn. Overtorquing strips the insert out of the ply - it is a wood joint, not an engine block.",
    },
    {
      name: "Felt pads, heavy duty",
      category: "Floor protection",
      quantity: "1 pack (8)",
      specification: "2 in. round self-adhesive felt, furniture grade",
      purpose: "Under each pedestal base edge - the table weighs about 150 lb and will get shoved by chairs and kids",
      estimatedCostLow: 5,
      estimatedCostHigh: 9,
      notes: "4 per pedestal at the compass points. Clean the paint with alcohol first or the adhesive gives up in a month.",
    },
    {
      name: "Figure-8 tabletop fasteners",
      category: "Knock-down hardware (optional)",
      quantity: "1 pack (8) with screws",
      specification: "Steel figure-8 desktop fasteners + #8 x 5/8 in. screws",
      purpose: "ONLY needed if you upgrade to the solid-wood top (Premium path): solid tops must be attached with movement-tolerant fasteners. The plywood top bolts rigidly to inserts and does not need these.",
      estimatedCostLow: 6,
      estimatedCostHigh: 9,
      notes: "Listed optional so the swap to a solid top later does not strand you - see the wood movement mini-lesson for why this matters.",
    },
  ],
  tools: [
    { name: "Drill/driver", required: true, category: "Power tool", purpose: "Every screw, pilot hole, insert pilot, and counterbore in the build", owned: true, beginnerNote: "Keep two batteries rotating; the stave glue-up window does not wait for charging." },
    { name: "Circular saw, 7-1/4 in.", required: true, category: "Power tool", purpose: "All rips and crosscuts, including the 22.5-degree stave bevels, guided by the shop-made straightedge", owned: true, beginnerNote: "Put a fresh 40-tooth-plus blade on for the oak sheet - the stock framing blade will chew the veneer." },
    { name: "Random orbit sander, 5 in.", required: true, category: "Power tool", purpose: "The whole 120-150-180 schedule plus between-coat scuffing", owned: true, beginnerNote: "Let the pad stop spinning before lifting it off - swirl scars show badly under matte poly." },
    { name: "Pocket hole jig", required: true, category: "Joinery jig", purpose: "Build-up frame joints and the square-pedestal alternative", owned: true },
    { name: "Clamps (4+ bar/F-style, two 36 in.+)", required: true, category: "Clamping", purpose: "Edge banding, build-up lamination, holding the guide rail", owned: true, beginnerNote: "You can never have enough. Painter's tape adds surprising clamping force on edge banding." },
    { name: "Ratchet straps, 1 in. x 15 ft (2)", required: true, category: "Clamping", purpose: "Band-clamping the octagon stave glue-ups - the garage substitute for $80 of band clamps", owned: false, estimatedCostIfBuying: "$18-24 for a 2-pack", beginnerNote: "Pad the corners with tape-on cardboard so the ratchet body does not dent a stave." },
    { name: "Speed square", required: true, category: "Layout", purpose: "Square checks and the crosscut fence for the circular saw on 1x2 miters", owned: false, estimatedCostIfBuying: "$10-14" },
    { name: "Tape measure, 25 ft", required: true, category: "Layout", purpose: "Everything - and use ONE tape for the whole build (tapes disagree with each other by 1/16 in.)", owned: false, estimatedCostIfBuying: "$10-15 (you likely own one already)" },
    { name: "48 in. level or known-straight edge", required: true, category: "Layout", purpose: "Checking the top for flat during lamination and the floor stance at install", owned: false, estimatedCostIfBuying: "$25-40" },
    { name: "Hacksaw (24-32 TPI) + mill file", required: true, category: "Metalworking", purpose: "Cutting the 16 aluminum facets and killing every sharp edge", owned: false, estimatedCostIfBuying: "$15-22 for both" },
    { name: "Drill + countersink bit set", required: false, category: "Accessories", purpose: "3/32 pilots, 7/16 insert pilots, clean countersinks for trim screws", owned: false, substitute: "Most drill kits include the needed sizes; a chamfer can be cut with a larger bit turned by hand", estimatedCostIfBuying: "$15-22" },
    { name: "Jigsaw", required: false, category: "Power tool", purpose: "The four 3/4 in. corner radii on the top", owned: false, substitute: "Hand saw straight relief cuts + rasp + sanding block gets the same radius in 15 extra minutes per corner", rentalRecommended: false, estimatedCostIfBuying: "$49-79" },
    { name: "Miter saw", required: false, category: "Power tool", purpose: "Would speed the 1x2 edge-band miters and 2x4 cleats", owned: false, substitute: "Circular saw + speed square fence; sneak up on miters with test cuts", estimatedCostIfBuying: "$120-250 (not worth buying for this build alone)" },
    { name: "Trim router + 3/8 in. roundover bit", required: false, category: "Power tool", purpose: "A crisper factory-style edge roundover than hand sanding", owned: false, substitute: "80-grit block plus a pencil-line guide gets 90 percent of the look on the eased profile", estimatedCostIfBuying: "$70-110 with bit" },
    { name: "Shop vacuum + box fan", required: false, category: "Dust and air", purpose: "Dust collection at the sander and cross-ventilation while finishing", owned: false, substitute: "Sweep often, finish with the garage door cracked and a fan exhausting outward" },
  ],
  toolAwareNotes: [
    {
      missingTool: "Table saw",
      impact: "No safe way to rip full sheets or repeat-rip identical stave widths on your own equipment",
      workaround:
        "Have Home Depot's panel saw make the three big break-down cuts (see the Store Cut Sheet), then do every precision rip at home with your circular saw riding the shop-made straightedge guide from Step 2. The guide's edge IS the cut line - accuracy comes free.",
      workaroundType: "store_cut",
    },
    {
      missingTool: "Miter saw",
      impact: "The 1x2 edge-band miters and 2x4 cleats need clean, square crosscuts",
      workaround:
        "Clamp a speed square as a fence and crosscut with the circular saw. For the four 45-degree edge miters, mark with the square's 45 edge, cut 1/16 in. proud, and sneak up with a block plane or sanding block to a perfect fit.",
      workaroundType: "substitute_tool",
    },
    {
      missingTool: "Jigsaw",
      impact: "The 3/4 in. corner radii on the top cannot be cut with a circular saw",
      workaround:
        "Trace the radius from a spray-paint cap, make two straight relief cuts with a hand saw to remove the bulk, then rasp and sand to the line. Fifteen minutes per corner and impossible to ruin if you stay outside the line.",
      workaroundType: "technique_change",
    },
    {
      missingTool: "Router with roundover bit",
      impact: "The signature chunky roundover would be one clean pass with a 3/8 in. bit",
      workaround:
        "Draw two pencil guide lines 3/16 in. from each edge corner, then hand-sand a consistent roundover with an 80-grit block, refining through 120 and 180. Oak shapes predictably by hand; the pencil lines keep the profile even along all 21 feet of edge.",
      workaroundType: "technique_change",
    },
    {
      missingTool: "Band clamps",
      impact: "Eight-stave octagon glue-ups need even inward pressure all around",
      workaround: "Two 1 in. ratchet straps per column, positioned at the 1/3 points, with cardboard corner pads. Tighten in alternating small increments like lug nuts.",
      workaroundType: "substitute_tool",
    },
  ],
  buildReadiness: {
    score: 78,
    readyStatus: "mostly_ready",
    missingTools: [
      "Miter saw (fully worked around - speed square + circular saw)",
      "Jigsaw (only for 4 corner radii; hand-saw workaround included)",
      "Ratchet straps, hacksaw, speed square (about $45 of cheap additions on the shopping list)",
    ],
    missingMaterials: ["Everything on the shopping list - no existing inventory was declared"],
    skillGaps: [
      "First bevel-rip at 22.5 degrees: practice on the spare stave stock before cutting the real ones",
      "Large-surface film finishing: the 4-1/2 x 18 in. oak test strips exist precisely to rehearse this",
    ],
    workspaceConcerns: [
      "You need a 9 ft clear run plus operator space for the long rips - move the cars out for cutting days",
      "Garage finishing wants a calm, dust-settled day; sand in the morning, wipe down, finish after lunch",
    ],
    budgetConcerns: [
      "White oak ply price swings ($95-130 by region) can push the high end; birch top swap is the $40 escape hatch",
      "Plan sits comfortably inside your $400-900 range even at the padded high estimate of $840",
    ],
    safetyConcerns: ["Ventilation during spray-painting the facets - do it outdoors or with the door fully open", "Two-person lifts for the finished top (~90 lb)"],
    recommendation:
      "You are ready to start the weekend after shopping. Build the saw guide first (Step 2) - every accuracy problem downstream traces back to skipping it. The only genuinely new skills are the bevel rips and finish padding, and both get rehearsal steps on scrap before they count.",
  },
  difficultyBreakdown: {
    overall: "intermediate",
    cuttingAccuracy: "Moderate-high: long rips must stay within 1/16 in. over 82 in.; the shop-made guide makes that routine, freehand would make it impossible",
    assembly: "Moderate: nothing is heavy until the top is laminated; octagon glue-ups are fiddly but strap-clamped, not skill-clamped",
    joinery: "Easy-moderate: pocket screws, glue, and screws - no mortises, no dovetails; the original's M&T is replaced by hidden mechanical joints",
    finishMatching: "Hard: pale natural white oak is the least forgiving finish target; ambering products or skipped test boards will visibly miss the reference",
    toolComplexity: "Low-moderate: circular saw at a bevel setting is the most advanced operation in the plan",
    physicalHandling: "Moderate-hard: full sheets are awkward and the finished top is a ~90 lb two-person lift; everything else is one-person",
    safetyRisk: "Medium during the build (saw, dust, finishing vapors), low in service",
    timeCommitment: "28-34 focused hours across 3 weekends, plus glue and finish cure windows that cannot be rushed",
    repairability: "Good: knock-down design, replaceable facets, and a water-based film you can scuff-and-recoat in an afternoon",
    beginnerTolerance: "A careful beginner could follow this plan, but the Beginner path exists for a reason - it removes the two least forgiving operations (bevel rips, big miters)",
    notes: [
      "The difficulty is concentrated in about 6 of the 25 steps: the stave bevels, edge miters, and topcoat. Slow down there and the rest is assembly-line work.",
      "Every 'hard' step has a rehearsal on scrap built into the sequence.",
    ],
  },
  cutList: [
    { partName: "Tabletop panel", quantity: 1, material: "3/4 in. white oak veneer ply", dimensions: "82-1/2 x 38-1/2 in.", notes: "Grain along the length. Store-crosscut at 83 in., final trim at home with the guide." },
    { partName: "Build-up rail, long", quantity: 2, material: "3/4 in. white oak ply (offcut)", dimensions: "82-1/2 x 3 in.", notes: "Hidden under the perimeter; grain direction irrelevant." },
    { partName: "Build-up rail, end", quantity: 2, material: "3/4 in. white oak ply (offcut)", dimensions: "32-1/2 x 3 in." },
    { partName: "Cross brace", quantity: 3, material: "3/4 in. white oak ply (offcut)", dimensions: "32-1/2 x 3 in.", notes: "One at table center, one at each pedestal centerline (22 in. from each end)." },
    { partName: "Insert pad", quantity: 4, material: "3/4 in. white oak ply (offcut)", dimensions: "6 x 3 in.", notes: "Glued under the pedestal braces at bolt points - doubles thickness to 1-1/2 in. for the threaded inserts." },
    { partName: "Finish test strip", quantity: 2, material: "3/4 in. white oak ply (offcut)", dimensions: "20 x 3 in.", notes: "Sand these through the same schedule as the top. Non-negotiable." },
    { partName: "Edge band, long", quantity: 2, material: "1x2 solid white oak", dimensions: "84 in. net (cut 85, miter to fit)", notes: "45-degree miters both ends." },
    { partName: "Edge band, end", quantity: 2, material: "1x2 solid white oak", dimensions: "40 in. net (cut 41, miter to fit)" },
    { partName: "Pedestal stave", quantity: 16, material: "3/4 in. birch ply", dimensions: "27 x 7-7/16 in.", notes: "Both long edges beveled 22.5 degrees, bevels toed IN toward the back face. Cut 2 spares." },
    { partName: "Pedestal former (octagon)", quantity: 6, material: "3/4 in. birch ply", dimensions: "16-1/2 in. across flats", notes: "Three per column: flush top, middle, 1 in. up from bottom." },
    { partName: "Mounting plate (octagon)", quantity: 2, material: "3/4 in. birch ply", dimensions: "16-3/8 in. across flats", notes: "1/8 in. under former size to nest into the column top recess. Drill 3/8 in. bolt clearance holes before install." },
    { partName: "Saw-guide fence", quantity: 1, material: "3/4 in. birch ply", dimensions: "96 x 4 in.", notes: "MUST keep the factory edge - it is the straightness reference for the whole build." },
    { partName: "Saw-guide base", quantity: 1, material: "3/4 in. birch ply", dimensions: "96 x 10 in." },
    { partName: "Anti-rotation cleat", quantity: 4, material: "2x4 pine", dimensions: "12 in.", notes: "Screwed to the top blocking tight against two opposite flats of each mounting plate." },
    { partName: "Glue block", quantity: 8, material: "2x4 pine", dimensions: "3 in.", notes: "Reinforce formers inside the columns." },
    { partName: "Band facet", quantity: 16, material: "1/16 x 2 in. aluminum flat bar", dimensions: "7-7/16 in.", notes: "Hacksaw, then file every edge and corner smooth - these live at shin height." },
  ],
  cutOptimizationPlans: [
    {
      material: "3/4 in. white oak veneer plywood",
      sourceSize: "4 ft x 8 ft (1 sheet)",
      cuts: [
        { partName: "Tabletop panel", quantity: 1, dimensions: "82-1/2 x 38-1/2 in.", precision: "finish", notes: "Store crosscut at 83 in. gets it liftable; home-trim both axes with the guide." },
        { partName: "Build-up rail, long", quantity: 2, dimensions: "82-1/2 x 3 in.", precision: "rough", notes: "From the 9-3/8 in. rip drop alongside the panel." },
        { partName: "Build-up rail, end", quantity: 2, dimensions: "32-1/2 x 3 in.", precision: "rough" },
        { partName: "Cross brace", quantity: 3, dimensions: "32-1/2 x 3 in.", precision: "rough", notes: "From the 13 in. store-cut offcut, ripped into 3 in. strips." },
        { partName: "Insert pad", quantity: 4, dimensions: "6 x 3 in.", precision: "rough", notes: "From strip tails." },
        { partName: "Finish test strip", quantity: 2, dimensions: "20 x 3 in.", precision: "rough", notes: "From the fourth offcut strip - do not skip these." },
      ],
      estimatedWastePercent: 9,
      grainDirectionNotes: [
        "Panel face grain runs the 8 ft length = the table length. Confirm before the store cut - this is unfixable afterward.",
        "All other oak parts are hidden; ignore grain, chase yield.",
      ],
      sequenceNotes: [
        "Store makes ONE crosscut at 83 in. (good face toward the operator on a vertical panel saw).",
        "At home: rip the panel to 38-1/2 in. with the guide, keeping the factory long edge as your reference.",
        "Trim panel length to 82-1/2 in., cutting from the store-cut end, not the factory end.",
        "Rip the 9-3/8 in. drop into three 3 in. strips (two long rails + one strip for end rails); rip the 13 in. offcut into four 3 in. strips for braces, pads, and test strips.",
        "Painter's tape on every crosscut line - oak face veneer chips without it.",
      ],
    },
    {
      material: "3/4 in. birch plywood",
      sourceSize: "4 ft x 8 ft (2 sheets)",
      cuts: [
        { partName: "Saw-guide fence (4 in.) + base (10 in.)", quantity: 1, dimensions: "96 in. long each", precision: "rough", notes: "Sheet 1: rip from the factory-edge side FIRST - the factory edge becomes the guide." },
        { partName: "Pedestal stave", quantity: 12, dimensions: "27 x 7-7/16 in., 22.5-degree bevels", precision: "finish", notes: "Sheet 1: three store-crosscut slabs at 27-1/4 in., then 4 bevel-ripped staves per slab at home." },
        { partName: "Pedestal stave (+ 2 spares)", quantity: 6, dimensions: "27 x 7-7/16 in.", precision: "finish", notes: "Sheet 2, from the 29 in. end zone. Cut the spares - your first bevel rip should not be a keeper." },
        { partName: "Pedestal former", quantity: 6, dimensions: "16-1/2 in. octagon", precision: "finish", notes: "Sheet 2: 16-1/2 in. square blanks in a 2 x 4 grid, corners cut at 45 to octagons." },
        { partName: "Mounting plate", quantity: 2, dimensions: "16-3/8 in. octagon", precision: "finish" },
      ],
      estimatedWastePercent: 18,
      grainDirectionNotes: [
        "Stave face grain runs vertical (the 27 in. dimension) on all 16 - a horizontal-grain stave sticks out like a crooked picture frame.",
        "Octagon formers and plates: grain direction irrelevant.",
      ],
      sequenceNotes: [
        "Build the saw guide BEFORE cutting any staves; every stave rip rides it.",
        "Set the saw bevel to 22.5 degrees once and cut ALL stave edges in one session - re-setting the bevel mid-batch guarantees mismatched octagons.",
        "Test the bevel setting on spare stock: 8 offcuts taped into a ring should close with no gap. Adjust half a degree and retest until it does.",
        "Octagon blanks: mark 45-degree corner cuts using the 16-1/2 in. square minus 4-27/32 in. from each corner along both edges - or just trace the first good former onto the rest.",
      ],
    },
  ],
  storeCutSheet: {
    storeName: "Home Depot",
    intro:
      "Take this to the panel saw at the back of the lumber department. You are asking for 5 simple cuts across 3 sheets - well within the free-cut goodwill zone, but be ready for a per-cut charge past the first few. These are rough break-down cuts so the sheets fit in your car and handle safely; every final dimension gets re-trimmed at home.",
    requests: [
      {
        material: "3/4 in. white oak veneer plywood (1 sheet)",
        buySize: "4 ft x 8 ft",
        requestedCuts: [
          {
            label: "Top panel blank",
            cutTo: "Crosscut at 83 in. (one cut)",
            oversizedBy: "1/2 in. over the finished 82-1/2 in.",
            finalTrimAtHome: true,
            notes: "Ask for the good face toward the operator on an upright panel saw; tearout lands on the back face.",
          },
        ],
      },
      {
        material: "3/4 in. birch plywood (sheet 1 of 2)",
        buySize: "4 ft x 8 ft",
        requestedCuts: [
          { label: "Stave zone / guide-strip split", cutTo: "Rip at 33-1/2 in. (full 8 ft length)", oversizedBy: "generous - all parts re-cut at home", finalTrimAtHome: true },
          {
            label: "Stave slabs",
            cutTo: "Crosscut the 33-1/2 in. piece at 27-1/4 in., twice (yields 2 slabs + remainder)",
            oversizedBy: "1/4 in. over the finished 27 in. stave height",
            finalTrimAtHome: true,
            notes: "The leftover ~14 in. x 96 in. piece from the rip is the saw-guide stock - keep its factory edge pristine.",
          },
        ],
      },
      {
        material: "3/4 in. birch plywood (sheet 2 of 2)",
        buySize: "4 ft x 8 ft",
        requestedCuts: [
          {
            label: "Octagon-blank zone / stave zone split",
            cutTo: "Crosscut at 66-1/2 in. (one cut)",
            oversizedBy: "1/2 in. over the 66 in. blank grid",
            finalTrimAtHome: true,
            notes: "The 29 in. remainder becomes the last 4 staves plus spares.",
          },
        ],
      },
    ],
    warnings: [
      "Panel saws are calibrated for lumber-yard tolerance, not furniture tolerance: expect plus or minus 1/8 in. and occasional out-of-square. That is why nothing here is a final cut.",
      "Measure each cut piece before you leave the store - a cut 1/2 in. shy of the request turns the top panel into pedestal stock.",
      "Do not let a helpful associate talk you into cutting final dimensions 'to save you time at home.'",
      "Check the oak sheet for shipping damage on both faces and all four edges BEFORE the first cut - it is returnable until the blade touches it.",
    ],
    homeTrimNotes: [
      "Re-trim every store cut with your straightedge guide before using it as a reference edge.",
      "The oak panel: rip to 38-1/2 in. using the factory long edge as reference, then trim length to 82-1/2 in. cutting off the STORE-cut end.",
      "Stave slabs: shave 1/8 in. off one store-cut edge of each slab before bevel-ripping staves so every stave starts from a clean, straight, square edge.",
    ],
  },
  budgetBreakdown: {
    lines: [
      {
        category: "Lumber & sheet goods",
        items: [
          { name: "White oak veneer plywood, 3/4 in. 4x8", costLow: 98, costHigh: 128 },
          { name: "Birch plywood, 3/4 in. 4x8 (2)", costLow: 110, costHigh: 140 },
          { name: "White oak 1x2 x 8 ft (4)", costLow: 68, costHigh: 84 },
          { name: "Pine 2x4 x 8 ft (2)", costLow: 10, costHigh: 14 },
        ],
        subtotalLow: 286,
        subtotalHigh: 366,
      },
      {
        category: "Metal band & accents",
        items: [
          { name: "Aluminum flat bar 1/16 x 2 x 36 in. (4)", costLow: 44, costHigh: 56 },
          { name: "Self-etching primer spray", costLow: 9, costHigh: 12 },
          { name: "Aged-brass metallic spray (2)", costLow: 18, costHigh: 24 },
        ],
        subtotalLow: 71,
        subtotalHigh: 92,
      },
      {
        category: "Hardware & fasteners",
        items: [
          { name: "Pocket-hole screws #8 x 1-1/4 (100)", costLow: 9, costHigh: 12 },
          { name: "Multi-purpose screws #8 x 2-1/2 (50)", costLow: 11, costHigh: 16 },
          { name: "Trim-head screws #8 x 1-5/8 (25)", costLow: 8, costHigh: 12 },
          { name: "Threaded inserts 5/16-18 (8)", costLow: 9, costHigh: 14 },
          { name: "Hex bolts + washers 5/16 x 1-1/2 (6)", costLow: 6, costHigh: 9 },
          { name: "Felt pads, 2 in. heavy duty (8)", costLow: 5, costHigh: 9 },
          { name: "Ratchet straps 1 in. x 15 ft (2-pack)", costLow: 18, costHigh: 24 },
        ],
        subtotalLow: 66,
        subtotalHigh: 96,
      },
      {
        category: "Adhesives & fillers",
        items: [
          { name: "Titebond II, 16 oz", costLow: 10, costHigh: 13 },
          { name: "Loctite PL Premium, 10 oz", costLow: 8, costHigh: 11 },
          { name: "DAP Plastic Wood, natural", costLow: 5, costHigh: 9 },
        ],
        subtotalLow: 23,
        subtotalHigh: 33,
      },
      {
        category: "Paint & finish",
        items: [
          { name: "Water-based poly, matte, quart", costLow: 26, costHigh: 32 },
          { name: "Zinsser 1-2-3 primer, quart", costLow: 13, costHigh: 17 },
          { name: "Urethane alkyd enamel, quart (columns)", costLow: 30, costHigh: 36 },
          { name: "Applicator kit (rollers, brush, pads)", costLow: 12, costHigh: 17 },
        ],
        subtotalLow: 81,
        subtotalHigh: 102,
      },
      {
        category: "Sandpaper & abrasives",
        items: [
          { name: "5 in. discs, 120-220 assortment", costLow: 17, costHigh: 23 },
          { name: "Hand sheets 80/120 + block", costLow: 8, costHigh: 12 },
          { name: "Fine sanding sponges (2)", costLow: 4, costHigh: 6 },
        ],
        subtotalLow: 29,
        subtotalHigh: 41,
      },
      {
        category: "Safety gear",
        items: [
          { name: "N95 dust masks (10)", costLow: 12, costHigh: 16 },
          { name: "Safety glasses", costLow: 6, costHigh: 10 },
          { name: "Nitrile gloves (20)", costLow: 6, costHigh: 10 },
        ],
        subtotalLow: 24,
        subtotalHigh: 36,
      },
      {
        category: "Optional add-ons",
        items: [
          { name: "Figure-8 fasteners (solid-top upgrade only)", costLow: 6, costHigh: 9, optional: true },
          { name: "Tone-adjust stain, half pint (Sun Bleached)", costLow: 7, costHigh: 10, optional: true },
          { name: "Hearing protection earmuffs", costLow: 9, costHigh: 13, optional: true },
        ],
        subtotalLow: 22,
        subtotalHigh: 32,
      },
      {
        category: "Contingency",
        items: [{ name: "Mis-cut / oops buffer (~5%)", costLow: 0, costHigh: 42, optional: true }],
        subtotalLow: 0,
        subtotalHigh: 42,
      },
    ],
    materialsTotalLow: 580,
    materialsTotalHigh: 798,
    optionalToolsLow: 64,
    optionalToolsHigh: 101,
    grandTotalLow: 580,
    grandTotalHigh: 840,
    referencePrice: 3999,
    estimatedSavingsLow: 3159,
    estimatedSavingsHigh: 3419,
    confidence: 80,
    notes: [
      "The math, spelled out: required categories sum to $580 (all low) to $766 (all high). Grand total low = $580 (skip every optional). Grand total high = $766 + $32 optional add-ons + $42 contingency = $840.",
      "Materials total high ($798) = required high ($766) + optional add-ons ($32). Optional tools (jigsaw $49-79, bit set $15-22) are tracked separately and NOT in the grand total, matching your tool-costs-excluded setting.",
      "Sheet goods are the volatile line: white oak ply alone swings $30+ by region and week. Everything else is stable commodity pricing.",
      "Reference price ($3,999) is an unverified estimate - the product page blocked reading, and retail varies by finish and promotions.",
    ],
  },
  shoppingListByDepartment: [
    {
      store: "Home Depot",
      department: "Lumber & Sheet Goods",
      items: [
        { name: "White oak veneer plywood", quantity: "1 sheet", spec: "3/4 in. x 4 ft x 8 ft, A-grade face, veneer core", estimatedCostLow: 98, estimatedCostHigh: 128, required: true, notes: "Inspect both faces; get the store crosscut at 83 in. before leaving." },
        { name: "Birch plywood", quantity: "2 sheets", spec: "3/4 in. x 4 ft x 8 ft, B/BB", estimatedCostLow: 110, estimatedCostHigh: 140, required: true, notes: "Pick the two flattest on the stack; store cuts per the cut sheet." },
        { name: "Pine stud", quantity: "2", spec: "2x4 x 8 ft, kiln-dried, sighted straight", estimatedCostLow: 10, estimatedCostHigh: 14, required: true },
      ],
    },
    {
      store: "Home Depot",
      department: "Moulding & Trim",
      items: [
        { name: "White oak board 1x2", quantity: "4", spec: "1 in. x 2 in. x 8 ft S4S hardwood rack", estimatedCostLow: 68, estimatedCostHigh: 84, required: true, notes: "Buy 4 to pick 3 straight; red oak is the fallback if white oak is out of stock." },
      ],
    },
    {
      store: "Home Depot",
      department: "Hardware & Fasteners",
      items: [
        { name: "Aluminum flat bar", quantity: "4", spec: "1/16 in. x 2 in. x 36 in.", estimatedCostLow: 44, estimatedCostHigh: 56, required: true, notes: "Hardware aisle, near the threaded rod." },
        { name: "Pocket-hole screws", quantity: "1 box (100)", spec: "#8 x 1-1/4 in. coarse washer-head", estimatedCostLow: 9, estimatedCostHigh: 12, required: true },
        { name: "Multi-purpose screws", quantity: "1 box (50)", spec: "#8 x 2-1/2 in. star drive", estimatedCostLow: 11, estimatedCostHigh: 16, required: true },
        { name: "Trim-head screws", quantity: "1 box (25)", spec: "#8 x 1-5/8 in. trim head", estimatedCostLow: 8, estimatedCostHigh: 12, required: true },
        { name: "Threaded inserts", quantity: "1 pack (8)", spec: "5/16 in.-18 for wood", estimatedCostLow: 9, estimatedCostHigh: 14, required: true },
        { name: "Hex bolts + flat washers", quantity: "6 + 6", spec: "5/16 in.-18 x 1-1/2 in. zinc", estimatedCostLow: 6, estimatedCostHigh: 9, required: true },
        { name: "Felt pads", quantity: "1 pack (8)", spec: "2 in. round, heavy duty", estimatedCostLow: 5, estimatedCostHigh: 9, required: true },
        { name: "Ratchet straps", quantity: "1 pack (2)", spec: "1 in. x 15 ft", estimatedCostLow: 18, estimatedCostHigh: 24, required: true, notes: "These are your octagon band clamps." },
        { name: "Figure-8 tabletop fasteners", quantity: "1 pack (8)", spec: "steel, with #8 x 5/8 screws", estimatedCostLow: 6, estimatedCostHigh: 9, required: false, notes: "Only for a future solid-wood top upgrade." },
      ],
    },
    {
      store: "Home Depot",
      department: "Adhesives",
      items: [
        { name: "Titebond II", quantity: "1", spec: "16 oz", estimatedCostLow: 10, estimatedCostHigh: 13, required: true },
        { name: "Loctite PL Premium", quantity: "1", spec: "10 oz cartridge (needs a caulk gun)", estimatedCostLow: 8, estimatedCostHigh: 11, required: true },
        { name: "DAP Plastic Wood", quantity: "1", spec: "Natural, 5.5 oz+", estimatedCostLow: 5, estimatedCostHigh: 9, required: true },
      ],
    },
    {
      store: "Home Depot",
      department: "Sandpaper & Abrasives",
      items: [
        { name: "Sanding discs 5 in.", quantity: "~30", spec: "120/150/180/220 hook-and-loop assortment", estimatedCostLow: 17, estimatedCostHigh: 23, required: true },
        { name: "Hand sheets + block", quantity: "1 pack + 1", spec: "80 and 120 grit, cork/rubber block", estimatedCostLow: 8, estimatedCostHigh: 12, required: true },
        { name: "Fine sanding sponges", quantity: "2", spec: "220-320 equivalent", estimatedCostLow: 4, estimatedCostHigh: 6, required: true },
      ],
    },
    {
      store: "Home Depot",
      department: "Paint & Stain",
      items: [
        { name: "Water-based polyurethane, matte", quantity: "1 quart", spec: "Varathane Ultimate WB or Polycrylic, MATTE", estimatedCostLow: 26, estimatedCostHigh: 32, required: true, notes: "Water-based only - oil ambering ruins the pale oak look." },
        { name: "Zinsser Bulls Eye 1-2-3", quantity: "1 quart", spec: "water-based primer", estimatedCostLow: 13, estimatedCostHigh: 17, required: true },
        { name: "Urethane alkyd enamel", quantity: "1 quart", spec: "satin, tinted deep bronze-charcoal at the paint desk", estimatedCostLow: 30, estimatedCostHigh: 36, required: true },
        { name: "Self-etching primer", quantity: "1 can", spec: "Rust-Oleum, 12 oz aerosol", estimatedCostLow: 9, estimatedCostHigh: 12, required: true },
        { name: "Metallic spray, Aged Brass", quantity: "2 cans", spec: "Rust-Oleum Universal Metallic, 11 oz", estimatedCostLow: 18, estimatedCostHigh: 24, required: true },
        { name: "Applicators", quantity: "1 set", spec: "4 in. foam rollers x2, 2 in. synthetic brush, staining pads, tray", estimatedCostLow: 12, estimatedCostHigh: 17, required: true },
        { name: "Tone-adjust stain", quantity: "1 half pint", spec: "Varathane Sun Bleached (thin 50% if used)", estimatedCostLow: 7, estimatedCostHigh: 10, required: false, notes: "Only if test strips show the oak too warm for your room." },
      ],
    },
    {
      store: "Home Depot",
      department: "Safety Gear",
      items: [
        { name: "N95 dust masks", quantity: "10-pack", spec: "NIOSH N95", estimatedCostLow: 12, estimatedCostHigh: 16, required: true },
        { name: "Safety glasses", quantity: "1", spec: "wraparound, anti-fog", estimatedCostLow: 6, estimatedCostHigh: 10, required: true },
        { name: "Nitrile gloves", quantity: "20-pack", spec: "for glue and finish sessions", estimatedCostLow: 6, estimatedCostHigh: 10, required: true },
        { name: "Earmuffs", quantity: "1", spec: "NRR 24+", estimatedCostLow: 9, estimatedCostHigh: 13, required: false, notes: "Strongly recommended for the bevel-rip session." },
      ],
    },
  ],
  projectTimeline: [
    {
      phase: "Shop, store cuts & break-down",
      dayOrSession: "Weekend 1, Saturday",
      estimatedDuration: "4-5 hours (including the store run)",
      tasks: [
        "Buy everything on the list; get the 5 panel-saw cuts from the store cut sheet",
        "Build the straightedge saw guide (Step 2)",
        "Trim the oak panel to final size; rip build-up strips",
        "Cut edge band stock to rough length",
      ],
      notes: "Sheet goods ride flat or fully supported - a 3/4 in. sheet flexed over a tailgate can crack its face veneer.",
    },
    {
      phase: "Tabletop lamination & edges",
      dayOrSession: "Weekend 1, Sunday",
      estimatedDuration: "5-6 hours",
      tasks: ["Assemble and glue the build-up frame to the panel (Steps 4-5)", "Miter and glue the solid oak edge band (Steps 6-7)"],
      waitTime: "Overnight clamp time on the edge banding before flush-sanding",
      dependencies: ["Saw guide built", "Panel trimmed square"],
    },
    {
      phase: "Top shaping, inserts & sanding",
      dayOrSession: "Weekend 2, Saturday",
      estimatedDuration: "5-6 hours",
      tasks: ["Corner radii and edge roundover (Step 8)", "Threaded inserts (Step 9)", "Full sanding schedule on the top (Step 10)", "Start finish test strips (Step 11)"],
      waitTime: "Test strip coats dry overnight",
    },
    {
      phase: "Pedestal columns",
      dayOrSession: "Weekend 2, Sunday",
      estimatedDuration: "6-7 hours",
      tasks: ["Bevel-rip all 16 staves plus spares (Step 12)", "Cut formers and plates (Step 13)", "Glue up both octagon columns (Steps 14-15)"],
      waitTime: "Columns stay strapped overnight",
      dependencies: ["Saw guide", "Spare stave stock for bevel test ring"],
    },
    {
      phase: "Pedestal fit-out, priming & painting",
      dayOrSession: "Weekend 3, Saturday",
      estimatedDuration: "5-6 hours active, spread around recoat windows",
      tasks: ["Fit plates, pilot holes, fill and sand columns (Steps 16-17)", "Prime + 2 enamel coats on columns (Step 18)", "Cut, file, prime and paint the 16 aluminum facets (Steps 19-20)"],
      waitTime: "Enamel: 4+ hours between coats; facets: 1 hour between light coats, overnight before handling",
    },
    {
      phase: "Topcoat & assembly",
      dayOrSession: "Weekend 3, Sunday (+2 weeknight coats if you prefer)",
      estimatedDuration: "5-6 hours active",
      tasks: ["Three coats of poly on the top with scuffs between (Step 21)", "Bolt plates, mount columns, stand it up, level (Steps 22-23)", "Install band facets (Step 24)", "Final inspection (Step 25)"],
      waitTime: "Poly: 2-3 hours between coats; light use after 24 hours",
    },
    {
      phase: "Cure & settle",
      dayOrSession: "The following 1-4 weeks",
      estimatedDuration: "No work - just restraint",
      tasks: ["Placemats and coasters only for week 1", "No wet-wiping or cleaners for 30 days while the poly reaches full hardness", "Re-torque the 4 pedestal bolts after one week of use"],
      notes: "Beginner buffer: if this is your first build of this size, plan a fourth weekend. Every time estimate here assumes things mostly go right.",
    },
  ],
  preBuildChecklist: [
    "Confirm the room: 84 x 40 in. footprint plus 36 in. of chair clearance on all sides (13 x 10 ft dining area minimum for comfort).",
    "Walk the delivery path: the finished top is 84 in. long - check doorways, hall turns, and stair landings before building, not after.",
    "Line up your helper for two dates: tabletop lamination day and final stand-up day.",
    "Clear a 10 x 12 ft garage bay with a 9 ft straight run for rips; set up two sawhorses plus a sacrificial foam or 2x4 cutting bed.",
    "Fresh 40+ tooth carbide blade on the circular saw - the single cheapest upgrade to every cut in this build.",
    "Check garage temps: glue and finishes want 60-85 F. A June-July build is ideal; do not glue at 7 AM on a 50 F morning.",
    "Charge every battery and locate one working GFCI outlet within cord reach of the cut zone.",
    "Read Steps 1-25 once, end to end, before buying anything - you will shop smarter knowing where each part goes.",
    "Print the store cut sheet or have it on your phone at the panel saw.",
    "Set up dust control: box fan exhausting out the door, N95 for every sanding session.",
  ],
  steps: [
    {
      stepNumber: 1,
      title: "Stage the shop and acclimate the lumber",
      estimatedTime: "1 hour (then 48 hours of waiting)",
      goal: "Materials flat, dry, and adjusted to your garage before a single real cut",
      toolsNeeded: ["Tape measure", "48 in. level"],
      materialsNeeded: ["All sheet goods", "1x2 oak boards", "2x4s"],
      instructions: [
        "Stack the plywood dead flat on 2x4 stickers spaced every 16 in., store-cut pieces on top, and weight the stack with the birch offcuts.",
        "Stand the 1x2 oak boards on edge against a wall - never flat against concrete, which wicks moisture into one face and bows them in a day.",
        "Sight down each oak 1x2 and mark the three straightest with painter's tape: those become the edge band, the fourth is miter practice stock.",
        "Let everything sit 48 hours. Kiln-dried stock still moves when it changes buildings - the reference product copy brags about kiln-drying for exactly this reason.",
      ],
      measurementNotes: ["While you wait: verify the 84 x 40 footprint in the actual room with painter's tape on the floor."],
      safetyNotes: ["Two people for full sheets. A 3/4 in. oak-veneer sheet runs about 75 lb and wants to sail in any wind."],
      qualityCheck: "After 48 hours, no sheet rocks on a flat floor and no edge-band board shows new bow.",
      commonMistake: "Cutting day-one. Wood that acclimates AFTER cutting turns precise parts into banana-shaped parts.",
      phase: "Preparation",
    },
    {
      stepNumber: 2,
      title: "Build the straightedge saw guide",
      estimatedTime: "45 minutes",
      goal: "A zero-clearance guide that makes your circular saw cut exactly on a drawn line, every time",
      toolsNeeded: ["Circular saw", "Drill/driver", "Clamps", "Tape measure"],
      materialsNeeded: ["Saw-guide fence (96 x 4 in., factory edge)", "Saw-guide base (96 x 10 in.)", "Titebond II", "#8 x 1-1/4 pocket screws (as plain screws)"],
      instructions: [
        "Glue and screw the 4 in. fence strip on top of the 10 in. base, factory edge facing the wide side, flush along the back edge - screws every 12 in., clock them so no screw sits in the future saw path.",
        "Let the glue grab for 30 minutes, then clamp the assembly to the sawhorses.",
        "Run the saw down the guide with the shoe pressed against the factory edge, trimming the base: the cut edge is now EXACTLY where the blade cuts.",
        "Label the guide face UP THIS SIDE and store it flat or hanging - a dropped guide with a dinged edge lies to you forever after.",
      ],
      measurementNotes: ["After trimming, the base edge to fence distance equals your saw shoe offset - no more offset math for the rest of the build."],
      safetyNotes: ["Clamp at both ends for every guided cut. A shifting guide mid-cut is how kickback starts."],
      qualityCheck: "Make a test cut on scrap: the cut should split a pencil line laid under the guide edge.",
      commonMistake: "Using a wobbly aluminum straightedge instead. The zero-clearance edge also acts as a chip breaker on veneer - store-bought edges do not.",
      relatedMiniLessons: ["ml_straightedge_guide"],
      phase: "Preparation",
    },
    {
      stepNumber: 3,
      title: "Trim the tabletop panel to final size",
      estimatedTime: "1 hour",
      goal: "One perfect 82-1/2 x 38-1/2 in. oak panel, square within 1/16 in.",
      toolsNeeded: ["Circular saw + guide", "Clamps", "Tape measure", "Speed square"],
      materialsNeeded: ["Store-cut oak panel blank (83 x 48 in.)", "Painter's tape"],
      instructions: [
        "Support the panel on a sacrificial bed (foam board or 2x4 grid) good face DOWN - a circular saw blade cuts upward, so tearout lands on the up-facing back.",
        "Rip to 38-1/2 in. wide: measure from the FACTORY long edge at both ends, clamp the guide on the line, tape the cut path, cut in one smooth pass.",
        "Trim to 82-1/2 in. long, cutting the STORE-cut end off (keep the factory end): square the guide off the factory edge with the speed square first.",
        "Check the diagonals corner to corner: they must match within 1/16 in. If not, find which corner is off with the square and shave the offending end.",
      ],
      measurementNotes: [
        "Measure twice from the same reference edge with the same tape. Two tapes can disagree by 1/16 in. - use one tape for this entire project.",
        "Diagonals on this panel should each read about 91-1/16 in.",
      ],
      safetyNotes: ["Set blade depth to material thickness plus 1/4 in. - no more. Less blade below the work = less kickback energy."],
      qualityCheck: "Diagonals within 1/16 in.; no veneer chips along the taped cut lines.",
      commonMistake: "Referencing from a store-cut edge. Store cuts can be out of square by 1/8 in. over 4 ft, and the error compounds into everything.",
      relatedMiniLessons: ["ml_straightedge_guide", "ml_square_check"],
      phase: "Tabletop",
    },
    {
      stepNumber: 4,
      title: "Cut and pocket-hole the build-up frame parts",
      estimatedTime: "1 hour",
      goal: "All hidden top-thickening parts cut and drilled: rails, braces, pads, and the sacred test strips",
      toolsNeeded: ["Circular saw + guide", "Pocket hole jig", "Drill/driver"],
      materialsNeeded: ["Oak ply offcuts", "Pocket screws"],
      instructions: [
        "Rip the 9-3/8 in. drop into three 3 in. strips; crosscut two long rails at 82-1/2 in. and two end rails at 32-1/2 in. from the third.",
        "Rip the 13 in. offcut into four 3 in. strips: three cross braces at 32-1/2 in., four insert pads at 6 in., and two 20 in. finish test strips.",
        "Drill two pocket holes in each end of the end rails and braces (set jig and clip for 3/4 in. stock).",
        "Write part names on every piece in pencil - after this step they all look like identical brown sticks.",
      ],
      measurementNotes: ["Pedestal braces sit centered 22 in. from each panel end; mark those stations on the long rails now."],
      safetyNotes: ["Short rips need the workpiece clamped, never hand-held next to the guide."],
      qualityCheck: "Dry-stack the frame on the panel underside: rails flush to panel edges all around, braces at their stations.",
      commonMistake: "Skipping the test strips to 'save material.' They cost $0 (offcut) and prevent the #1 finishing disaster: discovering the wrong color on the actual tabletop.",
      relatedMiniLessons: ["ml_pocket_holes"],
      phase: "Tabletop",
    },
    {
      stepNumber: 5,
      title: "Glue the build-up frame to the panel",
      estimatedTime: "1.5 hours + overnight cure",
      goal: "A 1-1/2 in. thick perimeter and bolt-ready braces, laminated flat with zero gaps at the edges",
      toolsNeeded: ["Drill/driver", "Clamps (all of them)", "Pocket hole jig"],
      materialsNeeded: ["Panel", "Rails, braces, pads", "Titebond II", "Pocket screws", "#8 x 1-1/4 screws"],
      instructions: [
        "Assemble the frame flat on the floor first: pocket-screw end rails and braces between the long rails. Check its diagonals before the glue - the frame squares the panel edge, not the other way around.",
        "Flip the panel good face DOWN onto moving blankets. Spread glue on the frame (thin, even, edge to edge - a $2 glue spreader or an old gift card).",
        "Position the frame flush to all four panel edges, clamp the perimeter every 8 in., and add #8 x 1-1/4 screws through the frame into the panel every 10 in., 1/2 in. from the frame's inside edge.",
        "Glue the four insert pads under the two pedestal braces, centered 5-1/2 in. each side of the panel centerline; clamp or screw from the pad side.",
        "Scrape squeeze-out at the outside edges NOW with a putty knife - dried glue there will hold the edge band off the panel tomorrow.",
      ],
      measurementNotes: ["Frame flush to panel edge within 1/32 in. everywhere - the edge band bridges both layers and telegraphs any step."],
      safetyNotes: ["1-1/4 in. screws only. A 1-5/8 in. screw here exits through the show face, and there is no fixing that."],
      qualityCheck: "Run a straightedge across the underside: no rocking, no gaps between frame and panel visible at the edges.",
      commonMistake: "Starving the glue joint by over-clamping in one spot. Even cauls (straight 2x4s under the clamps) spread the pressure.",
      relatedMiniLessons: ["ml_pocket_holes", "ml_predrill"],
      phase: "Tabletop",
    },
    {
      stepNumber: 6,
      title: "Miter the solid oak edge band",
      estimatedTime: "1 hour",
      goal: "Four 1x2 oak pieces with 45-degree miters that close with no visible gap",
      toolsNeeded: ["Circular saw", "Speed square", "Clamps", "Sanding block"],
      materialsNeeded: ["Three selected 1x2 oak boards (+1 practice board)"],
      instructions: [
        "Practice first: make four 45-degree cuts on the spare board using the speed square as a clamped fence. Check each against the square; adjust your technique until two practice pieces close into a clean 90.",
        "Cut the two long pieces at 85 in. with one miter each, then hold them against the top in place and knife-mark the second miter directly off the panel corner - marking beats measuring on miters.",
        "Cut second miters 1/16 in. PROUD of the knife line, then sneak to the line with the sanding block, test-fitting against the panel each pass.",
        "Repeat for the two end pieces (rough 41 in.), fitting each corner to its already-cut neighbor.",
      ],
      measurementNotes: ["Label each piece and each corner (A-B-C-D). Miters are fitted pairs, not interchangeable parts."],
      safetyNotes: ["Clamp the board for every cut; a speed-square fence only works when the workpiece cannot move."],
      qualityCheck: "Dry-fit all four with painter's tape: every miter closed under hand pressure, band flush or a hair proud of the top surface (proud sands off; shy does not).",
      commonMistake: "Cutting all 8 miters to measured length in one session. Cumulative 1/32 in. errors leave the last corner open by 1/8 in.",
      phase: "Tabletop",
    },
    {
      stepNumber: 7,
      title: "Glue on the edge band",
      estimatedTime: "1.5 hours + overnight in the clamps",
      goal: "Solid oak permanently wrapped around the built-up edge, miters tight, top surface flush-ready",
      toolsNeeded: ["Clamps (bar + every F-clamp you own)", "Painter's tape"],
      materialsNeeded: ["Fitted edge band pieces", "Titebond II"],
      instructions: [
        "Dry-run the entire clamping first, including tape: you have a 10-minute open window and zero time to hunt for clamps mid-glue.",
        "Glue the two LONG bands first: even bead on the plywood edge, spread thin, position with the top face 1/32 in. proud of the panel, stretch painter's tape across the joint every 4 in. like stitches, then bar clamps every 10 in.",
        "After 45 minutes, glue both END bands, gluing the miter faces as well; tape the miters diagonally to pull them closed, then clamp.",
        "Leave everything clamped overnight. Scrape squeeze-out on the top face at the 30-minute rubbery stage - do not wipe it wet into the oak grain.",
      ],
      measurementNotes: ["Proud is the goal: 1/32 in. of band above the panel sands flush in minutes. A band that ends up LOW means re-sanding the entire top down to meet it."],
      safetyNotes: ["Wear gloves for glue-ups this size; Titebond is benign but 21 ft of squeeze-out gets everywhere."],
      qualityCheck: "Next morning: tap-test along the band - a hollow tick means a starved spot (inject glue with a syringe and re-clamp); miters should look like a pencil line.",
      commonMistake: "Wiping squeeze-out with a wet rag. It drives glue into open oak pores where it stays invisible until the finish reveals pale blotches - the top's most common heartbreak.",
      relatedMiniLessons: ["ml_edge_banding"],
      phase: "Tabletop",
    },
    {
      stepNumber: 8,
      title: "Shape the corners and the chunky roundover",
      estimatedTime: "1.5 hours",
      goal: "The signature detail: 3/4 in. corner radii and a soft, consistent 3/16 in. roundover on every top and bottom edge",
      toolsNeeded: ["Hand saw (or jigsaw)", "Rasp", "80/120 grit blocks", "Random orbit sander"],
      materialsNeeded: ["A spray can cap (~1-1/2 in. dia) as the radius template"],
      instructions: [
        "Trace the cap at each corner for a 3/4 in. radius that stays entirely within the solid oak miter - never cutting into the plywood field.",
        "Saw off the bulk with two straight cuts outside the line, then rasp to 1/16 in. shy, then block-sand exactly to the line.",
        "Draw the roundover guides: pencil lines 3/16 in. from every edge corner on both the face and the edge, all the way around.",
        "Roll the 80-grit block over the edge in long strokes until both pencil lines just disappear - that is a uniform 3/16 in. roundover by definition. Refine with 120.",
        "Do the bottom edge too, slightly smaller (1/8 in.) - hands find the bottom edge every time someone slides in a chair.",
      ],
      measurementNotes: ["The pencil-line method is self-verifying: line gone = profile done; line still there = keep sanding THAT spot, not everywhere."],
      safetyNotes: ["Rasp away from your holding hand. Fresh 80 grit removes skin exactly as fast as oak."],
      qualityCheck: "Close your eyes and run a palm around all 21 ft of edge - anything that registers as a flat, a lump, or a sharp spot gets 30 more seconds of block work.",
      commonMistake: "Power-sanding the roundover with the ROS: it rounds unevenly and can blow through the corner miter glue lines. This is hand-block territory.",
      relatedMiniLessons: ["ml_sanding_sequence"],
      phase: "Tabletop",
    },
    {
      stepNumber: 9,
      title: "Install the threaded inserts",
      estimatedTime: "45 minutes",
      goal: "Four 5/16-18 inserts dead-vertical in the doubled braces, ready to take the pedestal bolts for decades",
      toolsNeeded: ["Drill/driver", "7/16 in. bit", "Bolt + two jam nuts (driver tool)", "Speed square"],
      materialsNeeded: ["4 threaded inserts (+4 spares)", "Paste wax or bar soap"],
      instructions: [
        "Mark bolt points on the two pedestal braces: on the brace centerline, 5-1/2 in. each side of the table's long centerline (matching the mounting plate holes you will drill in Step 16).",
        "Drill 7/16 in. pilots 1-1/4 in. deep into the doubled brace+pad stack - tape flag on the bit as a depth stop. Check vertical against the speed square from two directions.",
        "Wax the insert threads. Thread a 5/16 bolt with two jam nuts locked together into the insert, and drive the insert with a wrench on the nuts - slow, vertical, no wobble.",
        "Stop when the insert sits 1/16 in. below flush. Back the bolt out. Repeat x4.",
      ],
      measurementNotes: ["Record the exact center-to-center distance of each insert pair - you will transfer these numbers to the mounting plates in Step 16."],
      safetyNotes: ["Clamp a support block under the brace while driving - insert torque can crack an unsupported glue line."],
      qualityCheck: "Thread a bolt fully in and out of each insert by hand. Any grinding = back it out and use a spare in a fresh adjacent hole.",
      commonMistake: "Driving inserts with a screwdriver in the slot - they walk sideways, cross-thread, and tear out. The bolt-and-jam-nut driver costs nothing and never fails.",
      relatedMiniLessons: ["ml_predrill"],
      phase: "Tabletop",
    },
    {
      stepNumber: 10,
      title: "Sand the top through the full schedule",
      estimatedTime: "1.5 hours",
      goal: "A glass-flat, scratch-pattern-free surface ready for finish - where the money look gets made",
      toolsNeeded: ["Random orbit sander", "120/150/180 discs", "Sanding block", "Vacuum + bright raking light"],
      materialsNeeded: ["Tack cloth or microfiber"],
      instructions: [
        "120 grit: flush the proud edge band to the panel FIRST, sander flat across both surfaces, checking constantly - the veneer under you is 1/40 in. thick and the band is solid; bias pressure toward the band.",
        "Then 120 over the whole field in overlapping 50 percent passes, moving 1 in. per second. Vacuum. Raking-light check for band scratches.",
        "150 grit full pass, then 180 full pass, vacuuming between each - grit left behind keeps cutting 120-size scratches during the 180 pass.",
        "Hand-block 180 along the solid band with the grain to erase any cross-grain swirls at the miter corners.",
        "Do NOT go past 180 on the field: burnished oak at 220+ takes water-based finish unevenly.",
      ],
      measurementNotes: ["Veneer check: if you ever see the glue line ghosting through (a darker patch that does not sand away), STOP sanding that area - you are at the veneer floor."],
      safetyNotes: ["N95 on for every minute of sanding. Oak dust is a listed sensitizer and carcinogen - this is the dustiest step in the build."],
      qualityCheck: "Wipe with mineral spirits (not water): the wetted surface previews the finish. Swirls, band scratches, or glue blotches show NOW, while you can still fix them.",
      commonMistake: "Skipping grits. 120 to 180 directly leaves 120 scratches that hide until the first coat of poly turns them into a road map.",
      relatedMiniLessons: ["ml_sanding_sequence"],
      phase: "Tabletop",
    },
    {
      stepNumber: 11,
      title: "Run the finish test strips",
      estimatedTime: "45 minutes active, overnight dry",
      goal: "Choose the exact top finish with evidence, not hope",
      toolsNeeded: ["Staining pads", "Sanding sponge"],
      materialsNeeded: ["Both 20 x 3 in. oak test strips (sanded like the top)", "WB poly", "Optional Sun Bleached stain"],
      instructions: [
        "Strip 1: three coats of the water-based matte poly straight over bare oak, scuffing with the fine sponge between coats - this is the default Natural look.",
        "Strip 2, half A: Sun Bleached stain thinned 50 percent with water, wiped on and off, then poly - the cooler, paler option.",
        "Strip 2, half B: one coat poly only - so you can see coat-count difference.",
        "Tomorrow, look at both in the actual dining room at morning and evening light, next to your reference photos. Pick. Write the winner on the strip.",
      ],
      measurementNotes: ["Label each zone with sharpie ON the strip (coats, product, date). Memory is not a finishing tool."],
      safetyNotes: ["Water-based products: still ventilate; low-VOC is not no-VOC."],
      qualityCheck: "The winning strip, held flat at arm's length under room light, should read as pale, even, and NOT plastic-shiny (that is what matte + thin coats buys you).",
      commonMistake: "Testing on a sanded-to-120 scrap when the top is sanded to 180. Different grit = different color. The strips went through the identical schedule for this reason.",
      relatedMiniLessons: ["ml_wb_poly"],
      phase: "Finishing",
    },
    {
      stepNumber: 12,
      title: "Bevel-rip the sixteen pedestal staves",
      estimatedTime: "2.5 hours",
      goal: "16 identical staves (plus 2 spares), 7-7/16 in. wide, both long edges at a precise 22.5 degrees",
      toolsNeeded: ["Circular saw + guide", "Clamps", "Speed square", "Earmuffs"],
      materialsNeeded: ["Stave slabs from both birch sheets", "Painter's tape (test ring)"],
      instructions: [
        "Set the saw bevel to 22.5 degrees. Cut 8 short offcuts from spare stock and tape them into a ring: if the ring closes with no gap, your setting is true. If it gapes outside, add a half degree; inside, subtract. Retest until perfect - this is the whole secret.",
        "Shave 1/8 in. off one store-cut edge of each slab square-and-straight first, so every stave references a clean edge.",
        "Rip each slab into 4 staves at 7-7/16 in. across the FACE (wide face), bevels toed in toward the back on both edges - each stave's section is a trapezoid, wide face out.",
        "Do not change the bevel setting until all 18 staves are cut. Stack them face-up as they come off the saw and mark the face with chalk.",
        "Trim all staves to exactly 27 in. long with the square-fence crosscut technique.",
      ],
      measurementNotes: ["Width tolerance is 1/32 in. - a single fat stave makes the octagon's last joint gape. Check every fourth stave against the first."],
      safetyNotes: ["Beveled cuts push the saw sideways slightly - two hands, slower feed, and clamps at both guide ends, no exceptions.", "This is the loudest session of the build: earmuffs on."],
      qualityCheck: "Tape 8 real staves into a dry ring standing on the bench: closed joints all around, across-flats measuring 18 in. plus or minus 1/8 in.",
      commonMistake: "Trusting the saw's bevel detent sticker. Detents lie by up to a degree, and 8 joints multiply that into a 16-degree total error. The tape-ring test is the only truth.",
      relatedMiniLessons: ["ml_straightedge_guide"],
      phase: "Pedestals",
    },
    {
      stepNumber: 13,
      title: "Cut the formers and mounting plates",
      estimatedTime: "1.5 hours",
      goal: "Six 16-1/2 in. octagon formers and two 16-3/8 in. mounting plates - the skeleton the staves wrap around",
      toolsNeeded: ["Circular saw + guide", "Speed square", "Drill/driver"],
      materialsNeeded: ["Octagon blank zone of birch sheet 2"],
      instructions: [
        "Cut eight 16-1/2 in. square blanks (bevel back at 0 degrees - check it, you just did a whole session at 22.5).",
        "Lay out the octagons: measure 4-27/32 in. from each corner along both edges, connect the marks, and saw the corners off with the guide.",
        "Make one PERFECT former first, test it inside your taped stave ring (it should slip in snug), then trace it onto the other seven blanks.",
        "For the two mounting plates, trim 1/16 in. off each flat (down to 16-3/8) so they nest into the column top recess without forcing; drill two 3/8 in. bolt clearance holes on each plate's centerline at the exact insert spacing you recorded in Step 9.",
      ],
      measurementNotes: ["Insert spacing from Step 9 transfers to the plates NOW, while both are bare wood and mistakes are free."],
      safetyNotes: ["Small octagon offcuts near the blade path - clear them between cuts, not during."],
      qualityCheck: "Every former slips into the taped test ring with light hand pressure - not loose, not hammered.",
      commonMistake: "Cutting all eight octagons from layout marks individually. Tracing the proven first one keeps them identical; independent layout gives you eight slightly different octagons.",
      relatedMiniLessons: ["ml_square_check"],
      phase: "Pedestals",
    },
    {
      stepNumber: 14,
      title: "Glue up pedestal column one (tape-hinge method)",
      estimatedTime: "1.5 hours + overnight strapped",
      goal: "Eight staves closed into one crisp octagon around its formers, first column",
      toolsNeeded: ["Ratchet straps x2", "Drill/driver", "Speed square"],
      materialsNeeded: ["8 staves", "3 formers", "Titebond II", "Painter's tape", "Cardboard corner pads"],
      instructions: [
        "Lay 8 staves edge to edge, OUTSIDE faces down, tops aligned against a straight batten. Stretch tape tight across every joint plus two full-length runs - this is the hinge.",
        "Flip the taped pack. Spread glue on every bevel face (both sides of each joint - beveled end grain drinks glue, so wet it, wait a minute, wet it again).",
        "Stand the pack up and roll it closed around the top and bottom formers (top former flush with stave tops, bottom former 1 in. up from the bottom). The tape pulls the outside tight like a piano hinge.",
        "Strap at the 1/3 points over cardboard pads. Tighten alternately in small clicks. Slide the middle former into place before final tension.",
        "Check: stand it on the flat bench and confirm vertical with the square on two adjacent flats; across-flats 18 in. plus or minus 1/8. Wipe interior squeeze-out. Leave strapped overnight.",
      ],
      measurementNotes: ["Top former flush at the top edge creates the 3/4 in. recess the mounting plate nests into - measure that recess (should be exactly plate thickness)."],
      safetyNotes: ["Glue window is about 10 minutes for 8 joints - full dry run first, glue second. Have a helper if this is your first rodeo."],
      qualityCheck: "All 8 joints closed with a thin, even squeeze-out line; column stands plumb on the bench.",
      commonMistake: "Straps cranked gun-tight, which bows staves inward between formers. Snug plus a click is enough - the tape and the geometry do most of the work.",
      relatedMiniLessons: ["ml_edge_banding", "ml_square_check"],
      phase: "Pedestals",
    },
    {
      stepNumber: 15,
      title: "Glue up column two and block both columns",
      estimatedTime: "1.5 hours",
      goal: "Second column glued, and both columns reinforced with glue blocks at every former",
      toolsNeeded: ["Ratchet straps", "Drill/driver"],
      materialsNeeded: ["8 staves", "3 formers", "8 glue blocks (2x4, 3 in.)", "Titebond II", "#8 x 2-1/2 screws"],
      instructions: [
        "Repeat Step 14 for column two - it will take half the time now.",
        "Once column one is out of straps: glue and screw a 2x4 block against the top former and bottom former interiors, two blocks each, screws into the former (2-1/2 in.) and a glue face against the stave interior.",
        "Do not screw blocks INTO the staves - a 2-1/2 in. screw through a block will exit the show face. Glue only against staves.",
        "Repeat blocking on column two tomorrow.",
      ],
      safetyNotes: ["Reaching inside a 27 in. column to drive screws: use the driver one-handed and keep the other hand out of the column - dropped drivers rattle around expensively."],
      qualityCheck: "Grab the top former and try to rack it by hand: no movement, no creak.",
      commonMistake: "Skipping blocks because the glue-up feels solid. Formers take the entire bolt-down load from the top - the blocks are what make that a structural joint instead of a shelf.",
      relatedMiniLessons: ["ml_predrill"],
      phase: "Pedestals",
    },
    {
      stepNumber: 16,
      title: "Fit the mounting plates and drill the trim-screw pilots",
      estimatedTime: "1 hour",
      goal: "Plates nesting perfectly in each column recess, with 8 hidden fixing points per column pre-drilled",
      toolsNeeded: ["Drill/driver", "3/32 in. bit", "Countersink", "Tape measure"],
      materialsNeeded: ["2 mounting plates"],
      instructions: [
        "Drop each plate into its column recess: it should sit flush with the stave tops, bearing on the top former. Sand the plate edges lightly if it binds; shim with veneer tape if sloppy beyond 1/16 in.",
        "With the plate seated, drill 3/32 in. pilots from OUTSIDE through each stave into the plate edge - one per stave, 3/8 in. down from the top edge, centered on each flat.",
        "Countersink each pilot just enough for the trim head to sit 1/32 proud (it pulls flush on final drive).",
        "Mark plate orientation vs column (pencil a matching V on plate and stave interior) - the holes only line up one way. Then remove the plates; they install for real in Step 22.",
      ],
      measurementNotes: ["3/8 in. down from the top edge puts every screw inside the shadow line under the tabletop overhang - invisible from any standing or sitting angle."],
      safetyNotes: ["Depth-flag the pilot bit at 1-1/2 in. so you never pop through the plate's far side."],
      qualityCheck: "Each plate drops in, seats flush, and all 8 pilots align on re-insertion (the V marks matched).",
      commonMistake: "Drilling pilots with the plate slightly proud of the recess - the screws then pull the plate crooked. Seat it fully first, confirm flush with a straightedge across the column top.",
      relatedMiniLessons: ["ml_predrill"],
      phase: "Pedestals",
    },
    {
      stepNumber: 17,
      title: "Fill, sand, and prime the columns",
      estimatedTime: "2 hours + dry time",
      goal: "Both columns paint-ready: joints invisible, facets crisp, primer locked on",
      toolsNeeded: ["Random orbit sander", "Sanding block", "Vacuum"],
      materialsNeeded: ["Wood filler", "120/180 discs", "Zinsser 1-2-3", "4 in. foam roller"],
      instructions: [
        "Fill any stave joint lines, tape bruises, and the pilot countersinks (leave the pilots themselves open - toothpick in each hole while filling).",
        "Sand facets with the block and 120 ALONG each flat - never across a corner. The crisp facet corners are the design; the sander eats them if it wraps.",
        "Then 180 by block. Ease each facet corner with exactly two hand passes of 180 - enough to hold paint, not enough to read as rounded.",
        "Vacuum, tack, and roll one coat of 1-2-3 primer. When dry (1 hour), block-sand shiny spots with 220 and spot-prime any filler that flashed dull.",
      ],
      safetyNotes: ["N95 for filler sanding - the dust is finer than wood dust and hangs longer."],
      qualityCheck: "Raking flashlight along each primed facet: joints and filled spots should be undetectable. Primer is the last cheap chance to fix them.",
      commonMistake: "Using the ROS on facet corners. Ten seconds of orbital wrap turns a crisp architectural corner into a soft blob that reads 'homemade' from across the room.",
      relatedMiniLessons: ["ml_sanding_sequence"],
      phase: "Finishing",
    },
    {
      stepNumber: 18,
      title: "Enamel the columns",
      estimatedTime: "1.5 hours active across a day (recoat windows)",
      goal: "A hard, even, deep bronze-charcoal film that reads as factory-finished metal-adjacent",
      toolsNeeded: ["4 in. foam roller", "2 in. brush", "Fine sanding sponge"],
      materialsNeeded: ["Urethane alkyd enamel, quart"],
      instructions: [
        "Set columns on scrap blocks so you can paint to the bottom edge without gluing them to the dropcloth.",
        "Coat one: roll each facet vertically in one wet pass, tip off lightly top-to-bottom with the dry roller edge. Do all 8 facets of one column, then the other - by then the first is set enough not to touch.",
        "Wait the full recoat window (4+ hours for urethane alkyds - read your can). Scuff with the fine sponge, dust off.",
        "Coat two the same way. Two thin coats beat one thick one everywhere, but especially on vertical facets where thick = curtains.",
      ],
      safetyNotes: ["Urethane alkyds are low-VOC but not zero: door open, fan exhausting, gloves on."],
      qualityCheck: "Next morning in daylight: even sheen on every facet, no roller stipple ridges, no drips at facet corners. A third coat is fine if coverage looks thin over filler spots.",
      commonMistake: "Recoating early because it feels dry. Alkyd hybrids skin fast but stay soft underneath; early recoating wrinkles the first coat like a raisin.",
      relatedMiniLessons: ["ml_wb_poly"],
      phase: "Finishing",
    },
    {
      stepNumber: 19,
      title: "Cut and prep the sixteen aluminum band facets",
      estimatedTime: "1.5 hours",
      goal: "16 facet plates at 7-7/16 in., every edge and corner filed dead smooth",
      toolsNeeded: ["Hacksaw", "Mill file", "Clamps", "Speed square"],
      materialsNeeded: ["4 aluminum flat bars", "220 sandpaper", "Rubbing alcohol + rags"],
      instructions: [
        "Mark 4 facets per bar at 7-7/16 in. with the square and a fine marker; clamp the bar to the bench over a wood backer with the cut line just past the edge.",
        "Hacksaw on the waste side of each line - long, slow strokes, letting the saw cut on the push. Aluminum this thin cuts in under a minute per line.",
        "File each cut edge square-ish and then kill EVERY edge and corner with two file passes at 45 degrees. These sit at shin height; a raw sheared corner is a Band-Aid dispenser.",
        "Scuff both faces with 220 (paint needs tooth on aluminum), then wipe every facet with alcohol until the rag comes away clean.",
      ],
      measurementNotes: ["A 1/16 in. length variance between facets disappears in the layout; a sharp corner does not. Prioritize the filing over the fitting."],
      safetyNotes: ["Gloves for the filing session; fresh-cut aluminum edges are surgical."],
      qualityCheck: "Run a bare thumb (gently) along every edge of every facet: nothing catches, nothing bites.",
      commonMistake: "Skipping the 220 scuff because the metal looks clean. Paint on smooth mill-finish aluminum peels in sheets within weeks - the scratch pattern is what the primer holds onto.",
      phase: "Pedestals",
    },
    {
      stepNumber: 20,
      title: "Prime and paint the facets aged brass",
      estimatedTime: "1 hour active + overnight cure",
      goal: "16 uniform brass-tone facets that read as one continuous band once installed",
      toolsNeeded: ["Cardboard spray board", "Nitrile gloves"],
      materialsNeeded: ["Self-etching primer", "Aged brass metallic spray x2"],
      instructions: [
        "Lay facets on a cardboard sheet outdoors or at the open garage door; press a loop of tape under each so overspray cannot flip them.",
        "One light coat of self-etch primer edge-on first, then face - it flashes fast; recoat per the can (usually within an hour).",
        "Three LIGHT coats of aged brass, 10-12 in. away, each pass starting and ending off the parts. Metallics show every heavy pass as a dark pool - thin is everything.",
        "Rotate your spray direction 90 degrees between coats so the metal flake lays evenly; let them cure overnight, untouched.",
      ],
      safetyNotes: ["Respirator or well-fitted mask plus real ventilation for rattle-can work. Overspray drifts 10+ feet - move the cars and anything you love."],
      qualityCheck: "All 16 side by side in daylight: identical tone and sheen. One odd facet now = one more light coat on that facet, not a shrug.",
      commonMistake: "Painting in wind or under 55 F: metallic sprays blush cloudy and dust-speckle. Wait for the calm afternoon.",
      phase: "Finishing",
    },
    {
      stepNumber: 21,
      title: "Topcoat the tabletop",
      estimatedTime: "2.5 hours active across 1-2 days",
      goal: "Three thin, even coats of matte water-based poly - the pale natural oak look, sealed for daily family use",
      toolsNeeded: ["Staining pad / fine synthetic pad", "Fine sanding sponge", "Bright raking light"],
      materialsNeeded: ["WB poly, matte (stir, NEVER shake)", "Tack cloth"],
      instructions: [
        "Pick the calm window: sanding done hours ago, floor misted or swept, fan OFF during application (dust moves when air moves).",
        "If your test strip chose the stain option, apply it now per the strip recipe and let it dry fully first.",
        "Coat 1: work in 6 in. wide lanes the full 84 in. length, WITH the grain, keeping a wet edge; do the edges and roundover first, field second. Thin coat - it should look barely wet, not milky-thick.",
        "Dry 2-3 hours, scuff with the fine sponge just enough to de-nib, vacuum + tack, coat 2. Repeat for coat 3. Do the underside edges' first 2 in. as well so no raw wood shows at the overhang.",
        "24 hours before light use; feather-light for the first week.",
      ],
      measurementNotes: ["Quart coverage math: ~125 sq ft per coat available, top needs ~26 sq ft per coat - you have margin for a fourth coat on the ends where wear concentrates."],
      safetyNotes: ["Ventilate between coats, not during. Water-based dries fast enough that airborne dust is the bigger enemy."],
      qualityCheck: "After coat 3 cures: raking light shows an even matte sheen, no lap lines, no dust nibs bigger than you can live with (a 3-day rub with a paper bag erases the tiny ones).",
      commonMistake: "Brushing back into partially-dried finish to fix a spot. Water-based tacks in minutes; touching it back rips the film. Note the flaw, keep moving, scuff and recoat - it disappears.",
      relatedMiniLessons: ["ml_wb_poly"],
      phase: "Finishing",
    },
    {
      stepNumber: 22,
      title: "Bolt the mounting plates and cleats to the top",
      estimatedTime: "1 hour",
      goal: "Both plates rigidly bolted to the cured top, boxed in by anti-rotation cleats",
      toolsNeeded: ["Drill/driver", "Wrench or socket for 5/16 bolts", "Speed square"],
      materialsNeeded: ["2 mounting plates", "4 hex bolts + washers", "4 anti-rotation cleats", "#8 x 2-1/2 screws"],
      instructions: [
        "Lay the top face-down on clean moving blankets on a swept floor (grit under a fresh finish will tattoo it).",
        "Position each plate over its insert pair (V mark toward the table center), bolts + washers through the plate's 3/8 in. holes into the inserts. Snug plus a quarter turn - inserts strip if you hulk them.",
        "Screw a 2x4 cleat tight against two opposite flats of each plate (2-1/2 in. screws into the build-up braces/rails, 1-1/4 in. of thread in the blocking, pre-drilled). The cleats take twist loads so the bolts never have to.",
        "Confirm each plate sits flat with no rock, and that plate flats are parallel to the table edges (the columns inherit this alignment)."],
      measurementNotes: ["Plate flats parallel to the table edge within 1/16 in. - eyeball-crooked columns are the kind of flaw you cannot unsee at dinner."],
      safetyNotes: ["Verify screw lengths against the stack-up before driving ANYTHING into the top from below: 2-1/2 in. screw + 3/4 in. cleat means 1-3/4 in. into a 1-1/2 in. thick assembly ONLY where blocking exists. Cleats sit on the braces - never drive into the 3/4 in. field."],
      qualityCheck: "Bolts snug, plates immovable by hand, no screw tips anywhere near daylight.",
      commonMistake: "Driving a cleat screw 1 in. off its mark into unblocked field - the one mistake in this plan that cannot be sanded away. Mark brace locations on the blanket-side face with tape before starting.",
      relatedMiniLessons: ["ml_predrill", "ml_wood_movement"],
      phase: "Assembly",
    },
    {
      stepNumber: 23,
      title: "Mount the columns and stand the table up",
      estimatedTime: "1.5 hours (helper required for the flip)",
      goal: "Columns locked over their plates, table standing, dead level, zero wobble",
      toolsNeeded: ["Drill/driver", "48 in. level", "Helper"],
      materialsNeeded: ["Both columns", "16 trim-head screws", "Felt pads"],
      instructions: [
        "With the top still face-down: lower each column over its plate (V marks aligned), seating the recess onto the plate.",
        "Drive the 16 trim screws through the existing stave pilots into the plate edges - snug, in a star pattern around each column, not full-torque circles.",
        "Stick 4 felt pads per column at the compass-point flats' bottom edge (alcohol-wipe the paint first).",
        "The flip, with two people: slide the table to the room on the blankets, then roll it up onto one long edge, walk the base down, lift-and-set. Never lift by the top overhang - lift the columns.",
        "Level check both directions on the top. Wobble = one felt pad shimmed with a second pad, or floor variance - find it with the level before blaming the build.",
      ],
      safetyNotes: ["This is a genuine 150 lb two-person flip. Clear the path, closed shoes, no kids in the room, lift with legs.", "Do not drag on felt across thresholds - pads peel and the column edge takes the hit."],
      qualityCheck: "Lean test at each end (a firm two-hand push down and slight rock): solid, silent, no tip inclination. Sight the columns from 10 ft: vertical and parallel.",
      commonMistake: "Standing it up in the garage and THEN discovering the dining room door. You measured the path in the pre-build checklist - honor it: move top and columns separately if the path is tight (that is why it bolts).",
      relatedMiniLessons: ["ml_square_check"],
      phase: "Assembly",
    },
    {
      stepNumber: 24,
      title: "Install the brass band facets",
      estimatedTime: "45 minutes + overnight adhesive cure",
      goal: "The jewelry: a crisp 2 in. aged-brass band wrapping each column base with an even 1/4 in. floor reveal",
      toolsNeeded: ["Caulk gun", "Painter's tape", "1/4 in. spacer scraps"],
      materialsNeeded: ["16 painted facets", "PL Premium"],
      instructions: [
        "Cut a few 1/4 in. spacer scraps; they set the floor reveal identically for every facet.",
        "Dry-place all 8 facets around one column first and mark each facet's flat with tape labels - facet-to-flat pairing matters if any facet is a hair off-length; hide joints on the room-facing side's back.",
        "Bead of PL (1/8 in., 1/2 in. in from edges, S-pattern) on a facet back, press onto its flat resting on the spacers, tape it top and bottom to the column.",
        "Repeat around both columns. Leave taped overnight; pull tape gently the next day and touch up any tape-pull spots with the brass can from 12 in."],
      measurementNotes: ["The reveal is the detail people's eyes lock onto: 1/4 in., identical, all the way around. Trust the spacers, not your eye."],
      safetyNotes: ["PL Premium on skin outlasts most weekends - gloves."],
      qualityCheck: "Crouch at kid height and circle the table: band height even, facet joints tight at the corners, no adhesive squeeze-out shining below the metal.",
      commonMistake: "Gluing facets before the enamel has cured hard (72 hours). Tape pulled off week-old paint is fine; tape pulled off day-old paint brings the paint with it.",
      phase: "Assembly",
    },
    {
      stepNumber: 25,
      title: "Final inspection and cure schedule",
      estimatedTime: "45 minutes",
      goal: "Sign off like a pro: verified stable, smooth, level, and scheduled into service gently",
      toolsNeeded: ["48 in. level", "Flashlight"],
      materialsNeeded: ["Leftover poly + 320 paper (touch-up kit - keep it forever)"],
      instructions: [
        "Run the full final checklist (next tab): wobble, level, edge-catch, fastener torque, finish flaws under raking light.",
        "Nylon-stocking test over the whole top and every edge: anywhere it snags gets a 320 kiss and a dab of poly.",
        "Write the build date and finish recipe (product, coats, stain-or-not) on painter's tape under the top - future-you refinishing a water ring will send thanks.",
        "Brief the household: placemats/coasters week one, no cleaners for 30 days, damp-cloth-only after that. The finish reaches full chemical hardness at about day 30.",
      ],
      qualityCheck: "The dinner test: plates, elbows, one enthusiastic 4-year-old. Silent, solid, and nobody can find the trim screws without being shown.",
      commonMistake: "Treating day-2 finish like year-2 finish. Water-based poly feels dry in hours but stays imprintable for weeks - a hot pizza box on day 3 leaves a permanent ring of regret.",
      phase: "Assembly",
    },
  ],
  diagrams: [
    {
      id: "dg_top_view",
      title: "Top view with dimensions",
      type: "svg",
      description: "Plan view of the 84 x 40 in. top showing pedestal positions (dashed, below), corner radii, and grain direction.",
      svg: `<svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">
  <text x="20" y="24" font-size="14" font-weight="bold" fill="#2B2926">TOP VIEW</text>
  <rect x="90" y="60" width="420" height="200" rx="10" fill="#F3E9D7" stroke="#2B2926" stroke-width="2"/>
  <line x1="240" y1="126" x2="360" y2="126" stroke="#A97B50" stroke-width="1.5"/>
  <polygon points="360,126 351,122 351,130" fill="#A97B50"/>
  <text x="300" y="118" text-anchor="middle" fill="#A97B50">face grain</text>
  <polygon points="245,178.7 218.7,205 181.3,205 155,178.7 155,141.3 181.3,115 218.7,115 245,141.3" fill="none" stroke="#A97B50" stroke-width="1.5" stroke-dasharray="6 4"/>
  <polygon points="445,178.7 418.7,205 381.3,205 355,178.7 355,141.3 381.3,115 418.7,115 445,141.3" fill="none" stroke="#A97B50" stroke-width="1.5" stroke-dasharray="6 4"/>
  <line x1="194" y1="160" x2="206" y2="160" stroke="#2B2926" stroke-width="1"/>
  <line x1="200" y1="154" x2="200" y2="166" stroke="#2B2926" stroke-width="1"/>
  <line x1="394" y1="160" x2="406" y2="160" stroke="#2B2926" stroke-width="1"/>
  <line x1="400" y1="154" x2="400" y2="166" stroke="#2B2926" stroke-width="1"/>
  <text x="200" y="222" text-anchor="middle" font-size="10" fill="#2B2926">pedestal below (dashed)</text>
  <line x1="90" y1="44" x2="90" y2="58" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="510" y1="44" x2="510" y2="58" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="90" y1="44" x2="510" y2="44" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="300" y="38" text-anchor="middle" fill="#2F6F4F">84 in. overall (estimated)</text>
  <line x1="524" y1="60" x2="538" y2="60" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="524" y1="260" x2="538" y2="260" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="531" y1="60" x2="531" y2="260" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="540" y="156" fill="#2F6F4F">40 in.</text>
  <text x="540" y="170" font-size="10" fill="#2F6F4F">(est.)</text>
  <line x1="200" y1="208" x2="200" y2="290" stroke="#2B2926" stroke-width="0.75" stroke-dasharray="3 3"/>
  <line x1="400" y1="208" x2="400" y2="290" stroke="#2B2926" stroke-width="0.75" stroke-dasharray="3 3"/>
  <line x1="90" y1="264" x2="90" y2="290" stroke="#2B2926" stroke-width="0.75" stroke-dasharray="3 3"/>
  <line x1="200" y1="284" x2="400" y2="284" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="300" y="278" text-anchor="middle" fill="#2F6F4F">40 in. center-to-center</text>
  <line x1="90" y1="284" x2="200" y2="284" stroke="#A97B50" stroke-width="1.5"/>
  <text x="145" y="302" text-anchor="middle" fill="#A97B50">22 in.</text>
  <text x="90" y="326" font-size="10" fill="#2B2926">Corners: 3/4 in. radius, kept within the solid oak edge band. All edges rounded 3/16 in.</text>
</svg>`,
      caption: "Pedestal centers 22 in. from each end leave a 13 in. end overhang - the tip-resistance sweet spot for this footprint.",
    },
    {
      id: "dg_side_elevation",
      title: "Side elevation",
      type: "svg",
      description: "Long-side view: 30 in. overall height, 1-1/2 in. built-up top, 18 in. faceted columns, 2 in. brass band with floor reveal.",
      svg: `<svg viewBox="0 0 600 310" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">
  <text x="20" y="24" font-size="14" font-weight="bold" fill="#2B2926">SIDE ELEVATION</text>
  <line x1="40" y1="250" x2="560" y2="250" stroke="#2B2926" stroke-width="2"/>
  <text x="44" y="264" font-size="10" fill="#2B2926">floor</text>
  <rect x="90" y="100" width="420" height="8" rx="3" fill="#F3E9D7" stroke="#2B2926" stroke-width="1.5"/>
  <rect x="155" y="108" width="90" height="142" fill="#EDE3CF" stroke="#2B2926" stroke-width="1.5"/>
  <rect x="355" y="108" width="90" height="142" fill="#EDE3CF" stroke="#2B2926" stroke-width="1.5"/>
  <line x1="177.5" y1="108" x2="177.5" y2="250" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="200" y1="108" x2="200" y2="250" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="222.5" y1="108" x2="222.5" y2="250" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="377.5" y1="108" x2="377.5" y2="250" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="400" y1="108" x2="400" y2="250" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="422.5" y1="108" x2="422.5" y2="250" stroke="#A97B50" stroke-width="0.75"/>
  <rect x="155" y="239" width="90" height="10" fill="#A97B50" stroke="#2B2926" stroke-width="1"/>
  <rect x="355" y="239" width="90" height="10" fill="#A97B50" stroke="#2B2926" stroke-width="1"/>
  <line x1="530" y1="100" x2="544" y2="100" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="530" y1="250" x2="544" y2="250" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="537" y1="100" x2="537" y2="250" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="548" y="180" fill="#2F6F4F">30 in.</text>
  <line x1="90" y1="98" x2="90" y2="82" stroke="#2B2926" stroke-width="0.75" stroke-dasharray="3 3"/>
  <line x1="155" y1="106" x2="155" y2="82" stroke="#2B2926" stroke-width="0.75" stroke-dasharray="3 3"/>
  <line x1="90" y1="86" x2="155" y2="86" stroke="#A97B50" stroke-width="1.5"/>
  <text x="122" y="78" text-anchor="middle" fill="#A97B50">13 in.</text>
  <line x1="48" y1="76" x2="88" y2="100" stroke="#2B2926" stroke-width="0.75"/>
  <text x="20" y="70" font-size="11" fill="#2B2926">1-1/2 in. built-up top</text>
  <line x1="245" y1="170" x2="355" y2="170" stroke="#2F6F4F" stroke-width="1"/>
  <text x="300" y="164" text-anchor="middle" font-size="11" fill="#2F6F4F">22 in. clear</text>
  <line x1="155" y1="268" x2="245" y2="268" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="200" y="284" text-anchor="middle" fill="#2F6F4F">18 in. across flats</text>
  <line x1="445" y1="244" x2="486" y2="284" stroke="#2B2926" stroke-width="0.75"/>
  <text x="330" y="298" font-size="11" fill="#2B2926">2 in. aged-brass band, 1/4 in. floor reveal</text>
</svg>`,
      caption: "No aprons, no stretchers - stiffness lives in the 1-1/2 in. built-up top and the bolted plate connections.",
    },
    {
      id: "dg_end_elevation",
      title: "End elevation",
      type: "svg",
      description: "End view: 40 in. top width over the 18 in. column, 11 in. overhang per side.",
      svg: `<svg viewBox="0 0 600 330" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">
  <text x="20" y="24" font-size="14" font-weight="bold" fill="#2B2926">END ELEVATION</text>
  <line x1="60" y1="270" x2="540" y2="270" stroke="#2B2926" stroke-width="2"/>
  <text x="64" y="284" font-size="10" fill="#2B2926">floor</text>
  <rect x="180" y="90" width="240" height="9" rx="3" fill="#F3E9D7" stroke="#2B2926" stroke-width="1.5"/>
  <rect x="246" y="99" width="108" height="171" fill="#EDE3CF" stroke="#2B2926" stroke-width="1.5"/>
  <line x1="273" y1="99" x2="273" y2="270" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="327" y1="99" x2="327" y2="270" stroke="#A97B50" stroke-width="0.75"/>
  <rect x="246" y="256" width="108" height="12" fill="#A97B50" stroke="#2B2926" stroke-width="1"/>
  <line x1="180" y1="74" x2="180" y2="88" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="420" y1="74" x2="420" y2="88" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="180" y1="74" x2="420" y2="74" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="300" y="68" text-anchor="middle" fill="#2F6F4F">40 in. (estimated)</text>
  <line x1="460" y1="90" x2="474" y2="90" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="460" y1="270" x2="474" y2="270" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="467" y1="90" x2="467" y2="270" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="478" y="185" fill="#2F6F4F">30 in.</text>
  <line x1="180" y1="104" x2="180" y2="118" stroke="#2B2926" stroke-width="0.75" stroke-dasharray="3 3"/>
  <line x1="180" y1="112" x2="246" y2="112" stroke="#A97B50" stroke-width="1.5"/>
  <text x="213" y="128" text-anchor="middle" font-size="11" fill="#A97B50">11 in.</text>
  <line x1="246" y1="290" x2="354" y2="290" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="300" y="306" text-anchor="middle" fill="#2F6F4F">18 in.</text>
  <text x="360" y="322" font-size="10" fill="#2B2926">Octagon shows 3 facets from this angle - reads as a drum from 6 ft.</text>
</svg>`,
      caption: "The 11 in. side overhang matches the reference proportions and keeps knees off the columns.",
    },
    {
      id: "dg_pedestal_exploded",
      title: "Pedestal exploded assembly",
      type: "svg",
      description: "How one pedestal goes together: mounting plate, 8-stave octagon column with 3 internal formers, and the 8-facet brass band.",
      svg: `<svg viewBox="0 0 620 470" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">
  <text x="20" y="24" font-size="14" font-weight="bold" fill="#2B2926">PEDESTAL - EXPLODED</text>
  <polygon points="351,87 327,111 293,111 269,87 269,53 293,29 327,29 351,53" fill="#F3E9D7" stroke="#2B2926" stroke-width="1.5"/>
  <circle cx="283" cy="70" r="4" fill="none" stroke="#2B2926" stroke-width="1.5"/>
  <circle cx="337" cy="70" r="4" fill="none" stroke="#2B2926" stroke-width="1.5"/>
  <text x="368" y="58" fill="#2B2926">mounting plate, 16-3/8 in. octagon</text>
  <text x="368" y="74" fill="#2B2926">2x 3/8 in. holes; 5/16-18 bolts up</text>
  <text x="368" y="90" fill="#2B2926">into tabletop inserts</text>
  <line x1="310" y1="115" x2="310" y2="150" stroke="#2F6F4F" stroke-width="1.5" stroke-dasharray="5 4"/>
  <polygon points="310,150 306,141 314,141" fill="#2F6F4F"/>
  <rect x="265" y="155" width="90" height="135" fill="#EDE3CF" stroke="#2B2926" stroke-width="1.5"/>
  <line x1="287.5" y1="155" x2="287.5" y2="290" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="310" y1="155" x2="310" y2="290" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="332.5" y1="155" x2="332.5" y2="290" stroke="#A97B50" stroke-width="0.75"/>
  <line x1="267" y1="166" x2="353" y2="166" stroke="#2B2926" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="267" y1="222" x2="353" y2="222" stroke="#2B2926" stroke-width="1" stroke-dasharray="4 3"/>
  <line x1="267" y1="278" x2="353" y2="278" stroke="#2B2926" stroke-width="1" stroke-dasharray="4 3"/>
  <text x="368" y="170" fill="#2B2926">top former: flush, creates the</text>
  <text x="368" y="184" fill="#2B2926">3/4 in. recess the plate nests into</text>
  <text x="368" y="226" fill="#2B2926">mid + bottom formers (16-1/2 in.)</text>
  <text x="368" y="240" fill="#2B2926">with 2x4 glue blocks</text>
  <circle cx="277" cy="160" r="2" fill="#2F6F4F"/>
  <circle cx="310" cy="160" r="2" fill="#2F6F4F"/>
  <circle cx="343" cy="160" r="2" fill="#2F6F4F"/>
  <text x="368" y="152" fill="#2F6F4F">8x trim screws in the shadow line</text>
  <rect x="150" y="155" width="37" height="135" fill="#F3E9D7" stroke="#2B2926" stroke-width="1.5"/>
  <line x1="150" y1="155" x2="145" y2="160" stroke="#2B2926" stroke-width="1"/>
  <line x1="187" y1="155" x2="192" y2="160" stroke="#2B2926" stroke-width="1"/>
  <text x="30" y="200" fill="#2B2926">stave x8:</text>
  <text x="30" y="215" fill="#2B2926">27 x 7-7/16 in.</text>
  <text x="30" y="230" fill="#2B2926">22.5-deg bevels</text>
  <line x1="192" y1="222" x2="260" y2="222" stroke="#2F6F4F" stroke-width="1.5" stroke-dasharray="5 4"/>
  <polygon points="260,222 251,218 251,226" fill="#2F6F4F"/>
  <line x1="310" y1="295" x2="310" y2="325" stroke="#2F6F4F" stroke-width="1.5" stroke-dasharray="5 4"/>
  <polygon points="310,325 306,316 314,316" fill="#2F6F4F"/>
  <rect x="265" y="330" width="20" height="10" fill="#A97B50" stroke="#2B2926" stroke-width="1"/>
  <rect x="288" y="330" width="20" height="10" fill="#A97B50" stroke="#2B2926" stroke-width="1"/>
  <rect x="311" y="330" width="20" height="10" fill="#A97B50" stroke="#2B2926" stroke-width="1"/>
  <rect x="334" y="330" width="20" height="10" fill="#A97B50" stroke="#2B2926" stroke-width="1"/>
  <text x="368" y="340" fill="#2B2926">band: 8 aluminum facets per column,</text>
  <text x="368" y="354" fill="#2B2926">2 x 7-7/16 in., aged brass, PL adhesive</text>
  <text x="30" y="420" fill="#2B2926">Assembly order: glue staves around formers (tape-hinge + ratchet straps),</text>
  <text x="30" y="436" fill="#2B2926">bolt plate to tabletop, drop column over plate, drive trim screws, band last.</text>
</svg>`,
      caption: "The plate bolts to the top; the column captures the plate. Eight tiny trim screws in the shadow line are all that show - and they do not.",
    },
    {
      id: "dg_top_section",
      title: "Tabletop build-up cross-section",
      type: "svg",
      description: "Edge section showing the 3/4 in. oak ply face, 3/4 in. build-up rail, and the solid 1x2 oak edge band that makes the top read 1-1/2 in. thick.",
      svg: `<svg viewBox="0 0 620 260" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">
  <text x="20" y="24" font-size="14" font-weight="bold" fill="#2B2926">TABLETOP EDGE - SECTION (1 in. = 60 px)</text>
  <rect x="40" y="70" width="420" height="45" fill="#F3E9D7" stroke="#2B2926" stroke-width="1.5"/>
  <line x1="40" y1="77" x2="460" y2="77" stroke="#A97B50" stroke-width="1" stroke-dasharray="5 3"/>
  <text x="52" y="100" fill="#2B2926">3/4 in. white oak veneer ply - show face up</text>
  <line x1="120" y1="77" x2="96" y2="46" stroke="#2B2926" stroke-width="0.75"/>
  <text x="30" y="42" font-size="10" fill="#A97B50">face veneer ~1/40 in. - sand with care</text>
  <rect x="280" y="115" width="180" height="45" fill="#EDE3CF" stroke="#2B2926" stroke-width="1.5"/>
  <text x="292" y="142" fill="#2B2926">3/4 in. build-up rail, 3 in. wide</text>
  <path d="M460 70 L478 70 Q498 70 498 90 L498 140 Q498 160 478 160 L460 160 Z" fill="#EDE3CF" stroke="#2B2926" stroke-width="1.5"/>
  <line x1="460" y1="70" x2="460" y2="160" stroke="#2B2926" stroke-width="0.75" stroke-dasharray="3 3"/>
  <line x1="350" y1="157" x2="350" y2="88" stroke="#2F6F4F" stroke-width="1.5" stroke-dasharray="4 3"/>
  <rect x="345" y="155" width="10" height="5" fill="#2F6F4F"/>
  <text x="238" y="180" fill="#2F6F4F">#8 x 1-1/4 in. screws + glue, every 10 in.</text>
  <line x1="524" y1="70" x2="538" y2="70" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="524" y1="160" x2="538" y2="160" stroke="#2F6F4F" stroke-width="1"/>
  <line x1="531" y1="70" x2="531" y2="160" stroke="#2F6F4F" stroke-width="1.5"/>
  <text x="540" y="112" fill="#2F6F4F">1-1/2 in.</text>
  <line x1="497" y1="73" x2="556" y2="44" stroke="#2B2926" stroke-width="0.75"/>
  <text x="470" y="38" font-size="10" fill="#2B2926">3/16 in. roundover, hand-sanded</text>
  <text x="466" y="120" font-size="10" fill="#2B2926" transform="rotate(90 470 116)">solid oak 1x2</text>
  <text x="40" y="210" font-size="11" fill="#2B2926">Band glued 1/32 in. PROUD of the panel, then sanded flush - never the other way around.</text>
  <text x="40" y="228" font-size="11" fill="#2B2926">At pedestal braces: insert pads double the stack to 1-1/2 in. for the 5/16-18 threaded inserts.</text>
</svg>`,
      caption: "Two 3/4 in. layers plus a solid edge = the chunky look with sheet-goods economics and no solid-panel wood movement drama.",
    },
    {
      id: "dg_oak_sheet_layout",
      title: "4x8 white oak sheet cut map",
      type: "svg",
      description: "Where every oak part comes from: one store crosscut, then home rips. About 9 percent waste.",
      svg: `<svg viewBox="0 0 620 370" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">
  <text x="20" y="24" font-size="14" font-weight="bold" fill="#2B2926">WHITE OAK 4x8 - CUT MAP</text>
  <rect x="40" y="50" width="528" height="264" fill="#FAF6EE" stroke="#2B2926" stroke-width="2"/>
  <rect x="40" y="50" width="457" height="212" fill="#F3E9D7" stroke="#2B2926" stroke-width="1.5"/>
  <text x="268" y="150" text-anchor="middle" font-size="13" fill="#2B2926">TOP PANEL</text>
  <text x="268" y="168" text-anchor="middle" fill="#2B2926">82-1/2 x 38-1/2 (home trim)</text>
  <line x1="180" y1="188" x2="356" y2="188" stroke="#A97B50" stroke-width="1.5"/>
  <polygon points="356,188 347,184 347,192" fill="#A97B50"/>
  <text x="268" y="204" text-anchor="middle" font-size="10" fill="#A97B50">face grain along length</text>
  <line x1="497" y1="50" x2="497" y2="314" stroke="#2F6F4F" stroke-width="2.5" stroke-dasharray="8 5"/>
  <text x="497" y="44" text-anchor="middle" fill="#2F6F4F">STORE CUT: crosscut at 83 in.</text>
  <line x1="40" y1="262" x2="497" y2="262" stroke="#2B2926" stroke-width="1.5"/>
  <line x1="40" y1="279" x2="497" y2="279" stroke="#A97B50" stroke-width="1" stroke-dasharray="5 3"/>
  <line x1="40" y1="296" x2="497" y2="296" stroke="#A97B50" stroke-width="1" stroke-dasharray="5 3"/>
  <text x="250" y="275" text-anchor="middle" font-size="10" fill="#2B2926">long rail 82-1/2 x 3 (x2, home rips)</text>
  <text x="250" y="309" text-anchor="middle" font-size="10" fill="#2B2926">third strip: end rails 32-1/2 x 3 (x2) + insert pads</text>
  <line x1="514" y1="50" x2="514" y2="314" stroke="#A97B50" stroke-width="1" stroke-dasharray="5 3"/>
  <line x1="531" y1="50" x2="531" y2="314" stroke="#A97B50" stroke-width="1" stroke-dasharray="5 3"/>
  <line x1="548" y1="50" x2="548" y2="314" stroke="#A97B50" stroke-width="1" stroke-dasharray="5 3"/>
  <text x="580" y="120" font-size="10" fill="#2B2926" transform="rotate(90 580 120)">braces x3 + test strips x2</text>
  <text x="40" y="336" font-size="10" fill="#2B2926">Allow a 1/8 in. saw kerf between every part - two parts never share a pencil line.</text>
  <text x="40" y="352" font-size="10" fill="#2B2926">Estimated waste: ~9 percent. Keep ALL offcuts until the table stands - they are pads, shims and test stock.</text>
</svg>`,
      caption: "One sheet of white oak covers the entire visible top: panel, hidden build-up, insert pads, and the finish test strips.",
    },
    {
      id: "dg_octagon_gluepup",
      title: "Octagon tape-hinge glue-up (fallback diagram)",
      type: "ascii",
      description: "The tape-hinge method for closing 8 beveled staves into one octagon column.",
      ascii: `TAPE-HINGE GLUE-UP  (viewed from above; outside faces DOWN on the tape)

 bevels meet -> open glue joints face UP while flat
  ______  ______  ______  ______  ______  ______  ______  ______
 /      \\/      \\/      \\/      \\/      \\/      \\/      \\/      \\
 \\______/\\______/\\______/\\______/\\______/\\______/\\______/\\______/
 ==================== painter's tape, stretched tight ============

 1. Lay all 8 staves edge-to-edge, OUTSIDE face down, tops aligned.
 2. Tape across every joint + two full-length runs. Flip the pack.
 3. Glue every bevel face. Roll the pack up around the formers -
    the tape closes each joint like a piano hinge.
 4. Two ratchet straps at the 1/3 points, cardboard corner pads,
    tighten in small alternating clicks (like lug nuts).
 5. Check: across-flats = 18 in. +/- 1/8, column plumb on the bench.

 CLOSED COLUMN (plan view)          across flats: 18 in.
        _________                   stave face:   7-7/16 in.
       /         \\                  bevel angle:  22.5 degrees
      /           \\                 (test ring BEFORE gluing:
     |             |                 8 scrap offcuts taped in a
     |             |                 circle must close gap-free)
      \\           /
       \\_________/`,
      caption: "If the dry tape-ring of scrap offcuts closes without a gap, the glue-up is already won.",
    },
  ],
  finishGuide: {
    referenceFinishDescription:
      "Pale, even, natural white oak with visible open grain and a low matte-to-satin sheen - no yellow or orange cast anywhere. Factory finish is almost certainly a UV-cured or high-end water-based system engineered to keep oak looking raw. Base wrap is a soft brushed-gold metallic.",
    confidence: 75,
    recommendedFinishSystem: [
      "Top: sand to 180 (no further), vacuum + tack",
      "3 thin coats Varathane Ultimate Water-Based Polyurethane, MATTE, applied with a pad, 2-3 hours between coats",
      "Fine-sponge scuff between coats; nothing after the final coat",
      "Columns: Zinsser 1-2-3 primer + 2 rolled coats urethane-alkyd satin enamel in deep bronze-charcoal",
      "Band facets: self-etching primer + 3 light coats Rust-Oleum Universal Aged Brass",
    ],
    budgetOption: [
      "Minwax Polycrylic Matte (usually $4-6 less than Varathane Ultimate) - slightly thinner-bodied, wants a 4th coat on the top",
      "Columns in standard interior satin enamel instead of urethane-alkyd - softer film, budget for touch-ups",
    ],
    premiumOption: [
      "General Finishes High Performance Flat (online order) - the small-shop standard for clear, dead-flat, durable water-based film",
      "Or a hardwax oil system (Rubio-style 2K oil, online) for the closest raw-wood hand feel - easier to spot-repair, needs annual refresh in hard-use zones",
      "Real brass bar stock for the band, clear-coated, no paint at all",
    ],
    stainPaintOptions: [
      { name: "No stain - clear matte WB poly over bare white oak", type: "clear system", note: "The default. White oak's natural color IS the reference color; the finish just has to not ruin it." },
      { name: "Varathane Sun Bleached, thinned 50% with water", type: "water-based stain (wash coat)", note: "Only if your test strip reads too warm/pink (common with the red oak substitute). Wipe on, wipe off fast." },
      { name: "Minwax Gel Stain, Aged Oak", type: "gel stain", note: "For the Budget path birch top only - gel sits on the surface and is the most blotch-resistant way to fake oak tone on birch." },
      { name: "Urethane-alkyd enamel, deep bronze-charcoal satin", type: "enamel (columns)", note: "Have the paint desk tint toward near-black bronze; bring the reference photo." },
    ],
    topcoatOptions: [
      { name: "Varathane Ultimate Water-Based Poly, Matte", note: "Recommended: widely stocked, self-leveling, genuinely non-yellowing." },
      { name: "Minwax Polycrylic, Matte", note: "Fine substitute; thinner solids, plan one extra coat." },
      { name: "General Finishes High Performance, Flat", note: "Premium online option; the flattest honest sheen of the three." },
    ],
    colorMatchingTips: [
      "White oak + water-based clear = the reference color, full stop. Every 'improvement' you add moves you AWAY from the target.",
      "Never let an oil-based product near this top - even one oil seal coat ambers white oak toward honey and you cannot un-amber it.",
      "Judge test strips in the dining room, not the garage: warm garage LEDs lie about yellow by a full shade.",
      "If using red oak ply instead: the 50%-thinned Sun Bleached wash kills most of the pink; test both halves of a strip to see the difference.",
      "Matte sheen is part of the color: the same finish in semi-gloss reads two shades yellower under ceiling light.",
      "Water-based poly raises grain on coat 1 - that roughness is normal, scuffs off, and does NOT mean you sanded badly.",
      "The band color target is aged brass, not gold: if your test facet reads like a trophy, add one more light coat - the pigment darkens as it builds.",
    ],
    testBoardInstructions: [
      "Use the two 20 x 3 in. oak strips cut from the SHEET OFFCUT and sanded through the identical 120-150-180 schedule - same wood, same scratch pattern, same thirst.",
      "Strip 1: the default recipe (3 coats matte WB poly, scuffed between). Label each coat zone with sharpie as you go.",
      "Strip 2: half with the Sun Bleached wash + poly, half with 1 coat poly only, for comparison.",
      "Dry overnight, then evaluate at morning and dinner light in the actual room against your reference photos.",
      "Write the winning recipe on the strip and DO NOT improvise past it on the real top.",
    ],
    commonProblems: [
      { problem: "Finish looks blotchy in patches", fix: "On oak this is almost always glue residue, not stain trouble: spot-sand the blotch to 180, wipe with mineral spirits to verify it is gone, recoat the area, then the whole surface." },
      { problem: "Milky white haze in the dried film", fix: "Coats went on too thick or too cold. Let it fully cure (48 h), scuff with 320, apply one thin coat above 60 F. Haze trapped deeper needs sanding back to clear film." },
      { problem: "Visible lap lines down the length", fix: "You lost the wet edge - the 84 in. length is unforgiving. Scuff with 320 and apply the next coat in full-length single passes, working faster with a slightly wetter pad." },
      { problem: "Grain feels rough after coat 1", fix: "Normal - water raises oak grain once. One pass with a fine sponge, dust off, recoat; coats 2 and 3 lay glass-smooth." },
      { problem: "Brass paint pooling dark at facet edges", fix: "Passes too heavy or too close. Sand the facet back with 220, re-shoot with 3 genuinely light coats from 12 in., moving before the surface wets fully." },
    ],
    curingNotes: [
      "Dry-to-touch (hours) is not cured (weeks): WB poly takes ~24 h for light use, 7 days for normal use, ~30 days for full chemical hardness.",
      "Coasters and placemats only in week 1; no plastic placemats left sitting for 30 days (they imprint soft film).",
      "No cleaning chemicals for 30 days - damp cloth only. After cure: mild soap and water is all this finish ever needs.",
      "Enamel columns: 72 h before tape or felt pads, 7 days before enthusiastic toddler contact counts as fair use.",
    ],
    applicationSteps: [
      "Vacuum the top, wipe with a barely-damp microfiber, let flash dry, then tack cloth.",
      "Stir the poly gently for a full minute (shaking = bubbles = permanent fisheyes in matte).",
      "Load the pad, then squeeze it to just-saturated - a dripping pad floods, a dry pad drags.",
      "Work in 6 in. lanes the full 84 in. length, with the grain, overlapping each lane 1 in. into the previous wet edge.",
      "Edges and roundover first with the pad wrapped over the profile, field immediately after, ends last.",
      "Walk away. Do not re-touch anything for 2 hours. Scuff, tack, repeat x2.",
    ],
  },
  miniLessons: [
    {
      id: "ml_pocket_holes",
      title: "Pocket holes that actually hold",
      skillCategory: "Joinery",
      difficulty: "beginner",
      explanation:
        "A pocket hole is a steep angled counterbore that lets a screw pull two boards together face-to-edge. The jig does the geometry; your only jobs are setting it for stock thickness and not overdriving the screw.",
      steps: [
        "Set BOTH adjustments to the stock thickness: the jig body height AND the bit's depth collar (3/4 in. for this build).",
        "Clamp the workpiece so it cannot rotate; drill until the collar kisses the jig, no deeper.",
        "Use coarse-thread screws in plywood and softwood, fine-thread in hardwood. Here: coarse #8 x 1-1/4.",
        "Drive with the clutch set low; the washer head should seat with a firm stop, not spin the workpiece fibers.",
      ],
      commonMistakes: ["Wrong screw length (1-1/2 in. screws in 3/4 stock poke through the far face)", "No clamp across the joint while driving - the screw's angle pushes boards out of alignment"],
      safetyNotes: ["Clear chips from the jig between holes; packed chips deflect the bit."],
    },
    {
      id: "ml_predrill",
      title: "Pre-drilling and countersinking",
      skillCategory: "Fastening",
      difficulty: "beginner",
      explanation:
        "A pilot hole gives the screw shank clearance so the threads pull wood together instead of wedging it apart. Near edges, in hardwood, and with trim screws it is the difference between a joint and a crack.",
      steps: [
        "Pilot diameter = the screw's core (shine a light behind: hold bit in front of screw, you should see threads, not shank).",
        "For #8 screws: 3/32 in. pilot in softwood/ply, 7/64 in hardwood.",
        "Tape-flag the bit for depth; drill square to the surface from two sightlines.",
        "Countersink until the head sits flush or 1/32 proud for trim heads that pull in.",
      ],
      commonMistakes: ["Skipping pilots within 2 in. of any edge (guaranteed split in oak)", "Pilot as deep as the screw is long - go 1/8 in. deeper so tips never bottom out"],
    },
    {
      id: "ml_square_check",
      title: "Checking square (the diagonal trick)",
      skillCategory: "Layout & accuracy",
      difficulty: "beginner",
      explanation:
        "A rectangle is square when its diagonals are equal - a truth no cheap square can argue with. On anything bigger than a cutting board, measure diagonals instead of trusting a square in a corner.",
      steps: [
        "Hook the tape on one corner, measure to the opposite corner. Repeat for the other pair.",
        "Equal within 1/16 in. = square. Not equal = push the two corners of the LONG diagonal toward each other and re-measure.",
        "On glue-ups, check diagonals after clamping - clamps love to rack assemblies out of square.",
        "For the octagon columns: across-flats measured on two opposite pairs does the same job.",
      ],
      commonMistakes: ["Measuring diagonals after the glue set instead of during clamp time", "Trusting a framing square that got dropped (check it against the diagonal method itself)"],
    },
    {
      id: "ml_sanding_sequence",
      title: "The sanding sequence: 120-150-180",
      skillCategory: "Surface prep",
      difficulty: "beginner",
      explanation:
        "Each grit exists to erase the previous grit's scratches with smaller ones. Skipping a grit does not save time - it hides big scratches under small ones until the finish floats them into view like a developing photograph.",
      steps: [
        "120: does all the real work - flattening, flushing, erasing machine marks. Spend 60 percent of total time here.",
        "Vacuum between grits: leftover 120 grit under a 180 disc keeps cutting 120-sized scratches.",
        "150 then 180: each a full, even pass at moderate speed (about 1 in. per second, half-overlap rows).",
        "Stop at 180 for water-based finishes on oak; keep the sander flat, never tilted on an edge.",
        "Final check: mineral spirits wipe under raking light shows every sin while it is still fixable.",
      ],
      commonMistakes: ["Pressing hard (the sander bogs, swirls appear) - the machine's weight plus fingertips is correct", "Lifting or landing a spinning disc on the work (crescent gouges)", "Power-sanding veneer edges - the 1/40 in. face disappears fast"],
      safetyNotes: ["N95 every time. Oak dust is a genuine long-term respiratory hazard, not sawdust folklore."],
    },
    {
      id: "ml_edge_banding",
      title: "Solid-wood edge banding on plywood",
      skillCategory: "Casework",
      difficulty: "intermediate",
      explanation:
        "Solid banding hides ply edges, survives chair-bump life, and lets you shape real profiles - the upgrade over iron-on veneer tape for anything that gets touched daily. The two rules: glue it proud, and let tape do half the clamping.",
      steps: [
        "Mill or buy banding slightly thicker than the panel edge is tall; aim to sit 1/32 in. proud of the show face.",
        "Dry-fit everything including clamps before opening the glue.",
        "Even glue film on the PLY edge (it drinks more than the hardwood); position, stretch painter's tape across the joint every 4 in., then clamps every 8-10 in.",
        "Scrape squeeze-out rubbery at ~30-45 min; flush the proud edge next day with a block or careful ROS.",
      ],
      commonMistakes: ["Banding flush or shy instead of proud - then the whole panel must come down to meet it", "Wiping wet squeeze-out into the grain (blotches under finish later)", "Miters cut to measured length instead of marked in place"],
    },
    {
      id: "ml_wood_movement",
      title: "Wood movement: why solid tops need special fasteners",
      skillCategory: "Engineering",
      difficulty: "intermediate",
      explanation:
        "Solid wood swells and shrinks across the grain with humidity - a 40 in. wide solid oak top moves about 1/4 in. between summer and winter. Bolt it down rigid and it cracks itself or rips its fasteners out. Plywood barely moves, which is why THIS build can bolt the top rigidly to inserts.",
      steps: [
        "Plywood/veneer tops: rigid attachment is fine (our inserts + bolts).",
        "Solid tops: use figure-8 fasteners, Z-clips, or slotted holes so the top can slide across the base seasonally.",
        "Always attach solid tops snug, never cranked - the top must float, not rattle.",
        "If you upgrade this table to the Premium solid top later: figure-8s are already on the optional hardware list.",
      ],
      commonMistakes: ["Gluing a solid top to its base ('it feels stronger') - the crack arrives the first January", "Confusing length movement (negligible) with width movement (the whole problem)"],
    },
    {
      id: "ml_straightedge_guide",
      title: "Circular saw + straightedge guide = track saw at 1/10 the price",
      skillCategory: "Cutting",
      difficulty: "beginner",
      explanation:
        "A shop-made guide (fence glued to a base, then trimmed by the saw itself) puts the cut edge exactly at the guide edge. Lay the guide ON your pencil line and cut - no offset math, and the guide's edge backs up the veneer against chipping.",
      steps: [
        "Build: 4 in. factory-edge fence glued + screwed onto a 10 in. base; first cut trims the base to your saw's exact offset.",
        "Use: guide edge ON the line (on the KEEP side), clamped both ends, saw shoe tight to the fence throughout.",
        "Score-line insurance on veneer: painter's tape on the cut line, or a knife score along the guide edge first.",
        "Feed steadily without stopping mid-cut; let the blade reach full speed before entering the wood.",
      ],
      commonMistakes: ["Clamping the guide on the waste side of the line (cut lands a kerf-width off)", "Letting the saw wander off the fence at the far end - keep hip pressure into the fence to the last inch"],
      safetyNotes: ["Support both sides of the cut so the kerf cannot pinch the blade closed - pinch = kickback.", "Blade depth: material + 1/4 in., no more."],
    },
    {
      id: "ml_wb_poly",
      title: "Applying water-based poly without streaks",
      skillCategory: "Finishing",
      difficulty: "intermediate",
      explanation:
        "Water-based poly dries in minutes, which is a gift (3 coats in a day) and a threat (zero tolerance for going back over tacky film). The technique is thin coats, a wet edge, and the discipline to leave mistakes alone until the next coat.",
      steps: [
        "Stir, never shake. Decant into a tray - working from the can contaminates it with dust and cured bits.",
        "Pad or fine synthetic brush; load modestly. Lay each stroke WITH the grain, full length where possible.",
        "Keep a wet edge: overlap the previous lane while it still glistens. On an 84 in. top that means moving briskly with lanes, not puddles.",
        "Thin coats x3 beats thick x1 on every axis: clarity, hardness, drips, dust.",
        "Between coats: fine sponge scuff (just de-nibbing, not sanding), vacuum, tack cloth.",
      ],
      commonMistakes: ["Re-brushing a spot that already tacked (rips the film - scuff and recoat instead)", "Shaking the can (bubble city)", "Fans blowing DURING application (dust delivery system)"],
      safetyNotes: ["Low-VOC still means ventilate between coats; gloves keep finish off skin during cleanup."],
    },
  ],
  mistakePrevention: [
    {
      mistake: "Sanding through the oak face veneer",
      whyItHappens: "The 1/40 in. face veneer offers no warning - it just gets slightly lighter, then the glue line ghosts through, then it is gone.",
      howToAvoid: "150+ grit only on the field after flushing; keep the sander moving and flat; bias pressure onto the solid band when flushing the edge; stop the moment any area looks 'washed out'.",
      howToFix: "There is no invisible fix. Small burn-through near the edge: shift to the Budget-path gel stain look on the whole top. Large: the panel becomes pedestal stock and you buy a new sheet - $100 tuition.",
      affectedSteps: [10, 21],
    },
    {
      mistake: "Bevel angle off by 1-2 degrees on the staves",
      whyItHappens: "Saw bevel detents and printed scales routinely lie by a degree, and 8 joints multiply the error by 16.",
      howToAvoid: "The tape-ring test with 8 scrap offcuts before cutting anything real; do not touch the bevel knob again until all 18 staves are cut.",
      howToFix: "Gaps under 1/16 in. close under the straps and fill invisibly (painted column). Bigger: recut with the corrected setting - this is why the plan includes 2 spare staves and spare slab stock.",
      affectedSteps: [12, 14, 15],
    },
    {
      mistake: "Miters that gap at one corner of the edge band",
      whyItHappens: "Cutting all miters to measured length lets 1/32 in. errors accumulate to the last corner.",
      howToAvoid: "Knife-mark each second miter in place against the actual panel; cut proud; sneak to the line with a block.",
      howToFix: "A sub-1/32 gap disappears with a burnish (rub the corner with a screwdriver shaft to fold fibers over) plus finish. Bigger gaps: recut the shortest piece - that is why you bought 4 boards for 3 runs.",
      affectedSteps: [6, 7],
    },
    {
      mistake: "Glue squeeze-out sealing the oak, causing finish blotches",
      whyItHappens: "Wet-wiping glue drives it into open oak pores where it is invisible until the finish beads over it.",
      howToAvoid: "Let squeeze-out get rubbery (30-45 min) and scrape it; mineral-spirits wipe under raking light before any finish (glue spots flash pale).",
      howToFix: "Spot-sand the blotch to 180, verify with another spirits wipe, recoat.",
      affectedSteps: [5, 7, 10],
    },
    {
      mistake: "Driving a cleat or plate screw into the unblocked 3/4 in. field",
      whyItHappens: "Working face-down, the brace locations are hidden under the assembly and easy to lose track of.",
      howToAvoid: "Before the top goes face-down, tape-label brace and rail positions on the underside edge. Verify every screw length against the local stack-up before driving.",
      howToFix: "A through-point in the show face: withdraw, steam the dimple, and fill the exit with clear lacquer stick after finishing - it will still show a fleck. Prevention is the whole game here.",
      affectedSteps: [22],
    },
    {
      mistake: "Inserts driven crooked or stripped",
      whyItHappens: "Screwdriver-slot driving and impatience - inserts want slow, vertical, waxed installation.",
      howToAvoid: "7/16 pilot checked vertical from two sightlines, waxed threads, bolt + jam-nut driver, hand wrench not impact.",
      howToFix: "Back it out, glue a hardwood dowel plug, redrill 1 in. away (the 6 in. pads leave room). 4 spares are in the hardware list.",
      affectedSteps: [9, 22],
    },
    {
      mistake: "Painting the aluminum facets without etch primer or scuffing",
      whyItHappens: "Clean shiny aluminum looks paint-ready; it is chemically the least paint-ready surface in the build.",
      howToAvoid: "220 scuff + alcohol wipe + self-etching primer, always, no shortcuts.",
      howToFix: "Peeling facets: strip with a razor + 220 back to bright metal and restart the paint stack. 20 minutes per facet of avoidable rework.",
      affectedSteps: [19, 20],
    },
    {
      mistake: "Rushing the finish recoat and cure windows",
      whyItHappens: "Water-based products feel dry in 30 minutes, so week-level cure times feel like superstition.",
      howToAvoid: "Recoat at the can's stated window, not at 'feels dry'; calendar the 7-day and 30-day marks; placemats week one.",
      howToFix: "Wrinkled recoat: let cure 72 h, sand flat, recoat. Imprinted objects in soft film: usually permanent - a scuff-and-recoat of the top surface is the recovery.",
      affectedSteps: [18, 20, 21, 24, 25],
    },
    {
      mistake: "Referencing measurements from store-cut or non-factory edges",
      whyItHappens: "All plywood edges look equally authoritative after the sheet is broken down.",
      howToAvoid: "Mark factory edges with tape at the store; the guide fence keeps its factory edge; every layout in Steps 3-4 names its reference edge.",
      howToFix: "A parallelogram panel caught at dry-fit: re-square from the two best edges and absorb the loss in the 1/2 in. oversizes built into the store cuts.",
      affectedSteps: [2, 3, 4, 12, 13],
    },
  ],
  commonProblems: [
    {
      problem: "Table wobbles on the floor",
      likelyCauses: ["Floor out of flat (most common by far)", "One column glued 1/16 in. out of plumb", "Felt pad thickness variation"],
      fix: "Level the top both directions first to find WHICH foot is short, then shim that flat's felt pad with a second pad. If the wobble follows the table when rotated 90 degrees, it is the table: loosen the 8 trim screws on the offending column, re-seat, re-drive.",
      severity: "minor",
    },
    {
      problem: "Top surface shows blotchy patches under the finish",
      likelyCauses: ["Glue residue at band/miter zones", "Burnished spots from over-sanding at 220+", "Silicone contamination from old furniture polish rags"],
      fix: "Identify with a mineral-spirits wipe (blotches flash pale). Sand the area to 180, re-wipe to verify, recoat thin. Silicone fisheyes need a full scuff and a barrier coat of dewaxed shellac (SealCoat) before more poly.",
      severity: "moderate",
    },
    {
      problem: "Veneer chipping (tearout) along cut lines",
      likelyCauses: ["No tape/score on the cut line", "Coarse framing blade", "Cutting with the good face toward the blade exit side"],
      fix: "Chips under 1/16 in. hide inside the 3/16 in. roundover or under the band. Bigger chips on a show edge: shift the trim line 1/8 in. (the store-cut oversize exists for this) and recut with tape + fresh blade.",
      severity: "moderate",
    },
    {
      problem: "Gap opening between edge band and panel months later",
      likelyCauses: ["Starved glue joint (over-clamped or thin glue)", "Band installed over dried squeeze-out ridge", "Big indoor humidity swings"],
      fix: "Work glue into the gap with a syringe and palette knife, clamp overnight, touch up finish. Keep the room in the 30-50 percent RH band the maintenance notes call for.",
      severity: "moderate",
    },
    {
      problem: "Top develops a slight cup or twist",
      likelyCauses: ["Finished one face only (unbalanced moisture exchange)", "Stored flat on concrete pre-build", "Extreme humidity events"],
      fix: "Prevention is Step 21's underside sealing and the acclimation in Step 1. An existing mild cup: loosen the pedestal bolts, let the top relax a week indoors, re-bolt; the build-up frame will pull light cupping flat.",
      severity: "serious",
    },
    {
      problem: "Streaks or dull lanes in the poly",
      likelyCauses: ["Lost wet edge on the 84 in. runs", "Shaken can (micro-bubbles)", "Recoated before the window"],
      fix: "Cure 48 h, scuff evenly with 320, one thin full-length coat with a wetter pad and faster pace. Streaks are always fixable - the film is rebuildable by design.",
      severity: "minor",
    },
    {
      problem: "A brass facet pops off or slides before cure",
      likelyCauses: ["PL applied to dusty paint", "No tape support while curing", "Facet bumped within 24 h"],
      fix: "Peel cured PL off the back with a razor, re-scuff both surfaces with 220, alcohol wipe, re-glue with fresh PL and tape + spacer support overnight.",
      severity: "minor",
    },
  ],
  safetyReview: {
    overallRisk: "medium",
    summary:
      "A furniture-scale build with well-understood risks: power saw work, wood dust, finishing vapors, and two heavy lifts during the build; low risk in daily use once assembled. Nothing here approaches the professional-review threshold, but the pedestal-stability and finish-cure notes matter specifically because kids live with this table.",
    hazards: [
      {
        level: "medium",
        category: "Power tools",
        issue: "Circular saw rips, including 22.5-degree bevel cuts where the blade is partially hidden by the shoe angle.",
        mitigation: "Guide clamped both ends for every cut; blade depth at stock + 1/4 in.; both hands on the saw; support both sides of every kerf against pinching.",
      },
      {
        level: "medium",
        category: "Dust",
        issue: "Oak dust is a sensitizer and listed carcinogen with chronic exposure; sanding sessions here are long.",
        mitigation: "N95 minimum for all sanding and sawing, vacuum between grits, box fan exhausting outdoors, sweep wet or vacuum rather than dry-sweeping.",
      },
      {
        level: "low",
        category: "Finishing vapors",
        issue: "Water-based poly and urethane-alkyd enamel are low-VOC but not zero; rattle-can sessions are the highest exposure.",
        mitigation: "Spray outdoors or at the open door, respirator for aerosol sessions, ventilate between (not during) poly coats, kids out of the garage on finishing days.",
      },
      {
        level: "medium",
        category: "Manual handling",
        issue: "75 lb sheets and a ~150 lb assembled table; the final flip is the single most injury-prone moment of the project.",
        mitigation: "Two-person rule for sheets and the flip; lift columns not overhang; clear paths; closed shoes.",
      },
      {
        level: "low",
        category: "Stability in use",
        issue: "Pedestal tables tip under extreme end loads; household has a 4- and a 7-year-old.",
        mitigation:
          "With pedestal centers 40 in. apart and our weight assumptions (~150 lb total), tipping requires roughly 300 lb applied straight down at the extreme end edge - far beyond a leaning child, but this is a conservative design estimate, NOT a certified rating. House rule stands: nobody sits or stands on the table.",
      },
      {
        level: "low",
        category: "Sharp edges",
        issue: "16 cut aluminum facets at child shin height.",
        mitigation: "Every edge and corner filed at 45 degrees in Step 19; adhesive coverage keeps edges backed; thumb-test before install.",
      },
    ],
    ppe: [
      "Safety glasses for all cutting, drilling, and metalwork",
      "N95 (minimum) for sanding and sawing; respirator for aerosol painting",
      "Hearing protection for the bevel-rip session (recommended everywhere)",
      "Nitrile gloves for glue-ups, PL adhesive, and finish work - and NO gloves near the spinning blade (snag risk)",
      "Closed shoes always; no loose sleeves at the saw",
    ],
    childPetNotes: [
      "Cured water-based poly and enamel films are inert and wipeable - appropriate for a surface kids eat at daily. 'Cured' means 30 days, not 'dry to touch'.",
      "Until day 30: no harsh cleaners, and wipe up standing liquids promptly while the film hardens.",
      "These finishes are not certified food-contact surfaces - use plates and placemats, which you were going to do anyway.",
      "The 3/4 in. corner radii and 3/16 in. roundovers exist because head-height corners and a 4-year-old share a household.",
      "Anti-tip wall anchoring is not standard practice for dining tables (unlike bookcases); the protection here is the engineered base footprint plus the no-climbing rule.",
      "Keep pets out of the garage on spray days; overspray settles on fur and gets groomed off.",
    ],
    structuralNotes: [
      "Designed for normal dining service: dishes, leaning adults, the occasional seated toddler lifted onto the edge for shoe-tying. It is not a bench, ladder, or stage.",
      "The bolted plate + captured-column joint spreads loads across 8 staves and 3 formers per pedestal - each connection is redundant to its neighbors.",
      "No guaranteed load ratings are stated or implied; all figures are conservative design estimates for a one-off garage build.",
      "Re-torque the 4 pedestal bolts after week one and at seasonal changes - wood compresses slightly under new hardware.",
    ],
    finishToxicityNotes: [
      "All specified finishes are low-VOC, water-cleanup products; the two aerosols (etch primer, brass metallic) are the only solvent-heavy items - use them outdoors.",
      "Fully cured films: inert, saliva-resistant, and cleanable with soap and water.",
      "Dispose of finish-soaked rags spread flat to dry, never balled in a bin (self-heating risk applies mainly to oil products, but the flat-dry habit is free).",
    ],
    professionalReviewRecommended: false,
  },
  alternatives: [
    {
      id: "alt_weekend",
      name: "The Two-Day Version",
      focus: "weekend",
      description:
        "Compress to one weekend: every cut from the store panel saw, square pedestal boxes with pocket screws, edge band butt-joined (no miters), finish the following weeknights.",
      estimatedCostLow: 300,
      estimatedCostHigh: 430,
      estimatedTime: "1 weekend of building + 3 weeknight finish sessions",
      pros: ["Standing table by Sunday night", "No bevel cuts, no miters, no metalwork", "Great confidence-builder before attempting the full version"],
      cons: ["Square columns and visible band butt-joints read simpler", "Store-cut tolerances demand more filling and fudging", "You will probably want to rebuild the pedestals later - budget emotionally for that"],
      keyChanges: ["All cuts store-made", "Square columns", "Butt-joined edge band", "Skip the metal band or use adhesive trim"],
    },
    {
      id: "alt_tool_limited",
      name: "No-Saw-At-All Version",
      focus: "tool_limited",
      description:
        "For an apartment or zero-saw situation: the store makes every single cut from a dimensioned cut sheet (bring this plan), and assembly happens with drill, jig, glue, and clamps only.",
      estimatedCostLow: 330,
      estimatedCostHigh: 480,
      estimatedTime: "2-3 weekends, mostly assembly and finishing",
      pros: ["Zero saw ownership required", "Assembly-only build is apartment-feasible (finishing still wants outdoor air)", "Store cuts are free-ish and repeatable"],
      cons: ["You inherit every 1/8 in. of panel-saw tolerance - design uses overlap joints to hide it", "Multiple store trips when a cut comes back wrong", "No mid-build adjustments possible"],
      keyChanges: ["Full store cut sheet (ask for their sharpest blade day - weekday mornings)", "Square pedestals sized to store-cut widths", "Edge band pre-cut to length, butt-joined"],
    },
    {
      id: "alt_cheapest",
      name: "The $200 Silhouette",
      focus: "cheapest",
      description: "The Minimum Viable Dupe as a standalone: birch, gel stain, square bases, nothing optional. Proof-of-size and proof-of-want.",
      estimatedCostLow: 180,
      estimatedCostHigh: 300,
      estimatedTime: "1-2 weekends",
      pros: ["Cheapest path to the footprint and silhouette", "Every dollar transfers as practice for the real build", "Genuinely serviceable table meanwhile"],
      cons: ["Half the visual match", "Birch + stain will never fool an oak-knower", "No band, no facets, no chunk"],
      keyChanges: ["All birch", "Gel stain finish system", "Square bases", "Permanent (non-knock-down) assembly"],
    },
    {
      id: "alt_premium",
      name: "Solid Oak Heirloom",
      focus: "premium",
      description: "The Premium path: solid white oak glue-up top from a hardwood dealer, real brass band, hardwax oil finish, figure-8 movement-tolerant attachment.",
      estimatedCostLow: 1500,
      estimatedCostHigh: 2100,
      estimatedTime: "5-6 weekends",
      pros: ["Refinishable for generations", "Real brass patinas like the original hardware", "The hand-feel of oil on solid oak is the actual luxury product"],
      cons: ["Requires panel-flattening skills/tools beyond this plan", "Triple the budget", "Wood movement engineering becomes mandatory, not optional"],
      keyChanges: ["5/4 solid oak top", "Figure-8 fasteners", "Hardwax oil system", "Brass bar stock band"],
    },
    {
      id: "alt_durable",
      name: "Restaurant-Grade Daily Driver",
      focus: "durable",
      description:
        "Same build, armored: a 4th and 5th poly coat on the top and ends, conversion to satin (hides micro-scratches better than matte), oak corner blocks inside the columns, and levelers instead of felt.",
      estimatedCostLow: 640,
      estimatedCostHigh: 920,
      estimatedTime: "3-4 weekends",
      pros: ["Film thickness where kid-use concentrates (ends and edges)", "Satin disguises wear years longer than matte", "Levelers solve floor problems permanently"],
      cons: ["Satin reads slightly shinier than the matte reference", "Extra cure windows stretch the calendar", "About $60 over the balanced budget"],
      keyChanges: ["5-coat top schedule", "Satin sheen", "Internal corner blocks", "Threaded levelers"],
    },
    {
      id: "alt_smaller",
      name: "Six-Seater (72 x 36)",
      focus: "smaller",
      description: "The same design at 72 x 36 in. with pedestals at 18 in. centers-from-ends - for rooms where 84 in. fails the tape-on-the-floor test.",
      estimatedCostLow: 470,
      estimatedCostHigh: 680,
      estimatedTime: "3 weekends (marginally faster)",
      pros: ["One oak sheet yields the top AND all build-up with margin", "Lighter: the flip becomes a one-strong-person job", "Better proportions in rooms under 12 ft"],
      cons: ["Seats 6, squeezes 8", "Pedestal spacing drops to 36 in. - end-tip margin shrinks slightly (still conservative)", "Less dramatic overhang"],
      keyChanges: ["Top 70-1/2 x 34-1/2 before banding", "Pedestal centers 18 in. from ends", "Same pedestal dimensions (do not shrink the columns)"],
    },
  ],
  builderHandoff: {
    projectSummary:
      "Commission an inspired-by version of a designer double-pedestal dining table: 84 x 40 x 30 in., chunky rounded-edge natural white oak top (target 1-1/2 to 1-3/4 in. visual thickness), two sculptural pedestal bases (faceted octagon or curved drum, builder's choice) with a 2 in. brass-tone metal band detail at the base.",
    referenceStyle:
      "Organic-modern; reference is the Pottery Barn Meadowview rectangular dining table in the Natural/Brushed Gold colorway (customer will supply photos). This is an inspired-by commission: capture the proportions, edge mass, pale non-ambered oak color, and the wood-to-metal contrast - an original piece in the same spirit, not a reproduction of theirs.",
    desiredDimensions:
      "84 in. L x 40 in. W x 30 in. H (estimates from photos - the customer is open to the builder confirming better proportions). Top thickness 1-1/2 in. minimum visual. Pedestals ~18 in. across, centered 22 in. from each end. Knock-down top connection required (doorway access).",
    materials: [
      "White oak throughout visible surfaces (veneer-core panel with solid edges acceptable and matches the original's construction; solid glue-up welcome at the higher quote)",
      "Metal band: brass or brass-finished, builder's discretion on attachment",
      "No particleboard in structural roles",
    ],
    finish: "Non-ambering clear system (water-based or 2K) keeping white oak pale and matte; cured film must be kid-safe wipeable. NO oil-based poly.",
    constructionNotes: [
      "Customer household includes ages 4 and 7: rounded corners (3/4 in. radius minimum), eased edges everywhere, conservative tip stability at the ends",
      "Everyday-use durability tier; table will see daily family meals and homework",
      "Knock-down: top must separate from bases with standard tools",
      "Floor is engineered hardwood - felt or leveler feet",
    ],
    budgetTarget: "$1,200-$2,000 for build and finish (customer's DIY alternative costs ~$580-840 in materials; the gap is what quality labor is worth)",
    qualityExpectations: [
      "Miters/joints tight enough to read as lines, not gaps, at arm's length",
      "Finish free of lap marks, dust nibs, and amber cast under dining-room light",
      "No visible fasteners from standing or seated positions",
      "Stable: zero wobble on a flat floor, confident under end loads",
    ],
    questionsForBuilder: [
      "Would you do curved drums or faceted columns at this budget, and what does each add?",
      "Veneer-core with solid edges, or full solid top - and how do you handle movement on the solid option?",
      "What finish system do you use to keep white oak this pale, and how does it repair after kid damage?",
      "Lead time, delivery, and whether install/leveling is included?",
      "Can you provide a sample board of the proposed finish on white oak before committing?",
    ],
    quoteRequestMessage:
      "Hi! I'm looking to commission a custom dining table inspired by a designer piece (photos attached): 84 x 40 x 30 in., two-pedestal base, thick rounded-edge natural white oak top, with a brass-tone band detail at the base of each pedestal. Key requirements: pale NON-yellowing finish on white oak, knock-down top for moving, kid-friendly rounded edges, and honest advice on veneer-core vs solid construction at my budget of roughly $1,200-$2,000. Could you share a ballpark quote, lead time, and whether you'd suggest faceted or curved bases at that price? I have a detailed spec sheet with dimensions and construction notes ready to send. Thanks!",
  },
  finalChecklist: [
    "Wobble test: firm two-hand pressure at each corner and each end - silent and solid",
    "Level check both axes on the top; shim felt pads if the floor is the culprit",
    "Nylon stocking pass over the entire top and every edge - snags get 320 + a poly dab",
    "All 4 pedestal bolts snug (re-check after week one of use)",
    "All 16 trim screws seated flush in the shadow line; filled and touched up where visible",
    "Band facets: even 1/4 in. reveal, no adhesive squeeze-out, every edge thumb-safe",
    "Raking-light pass over the top at night with a flashlight: no missed drips, nibs, or dull lanes",
    "Corner radii and roundovers feel identical at all four corners (close your eyes)",
    "Underside: build date + finish recipe written on tape; touch-up kit (leftover poly, 320, brass can) labeled and stored",
    "Doorway math confirmed for the final room placement BEFORE assembly in the garage",
    "Cure calendar on the fridge: day 7 (normal use), day 30 (cleaners OK); placemats week one",
    "Photos for the gallery: inspiration vs finished, plus one of the tape-hinge glue-up for bragging rights",
  ],
  maintenance: [
    "Daily: crumbs and spills with a barely-damp microfiber; dry immediately. That is 95 percent of the maintenance story.",
    "Weekly-ish: mild dish soap solution for sticky spots; never abrasive pads, never all-purpose sprays with ammonia.",
    "Never use silicone-based polishes (Pledge-type) - silicone contaminates the surface and sabotages every future refinish or touch-up.",
    "Keep indoor humidity between 30-50 percent; the veneer top is forgiving, but the solid edge band and your floors will both thank you.",
    "Re-torque the 4 pedestal bolts at each season change the first year, then annually.",
    "Check felt pads quarterly (kids slide chairs INTO pedestals; pads migrate); replace when compressed flat.",
    "Scratch touch-up: 320 scuff of the local area, one thin pad of the leftover poly, feathered out - invisible in 20 minutes.",
    "Every 3-5 years of hard use: full scuff with 320 and one refresh coat over the whole top brings it back to day one.",
  ],
  qaNotes: [
    "Budget arithmetic verified: 7 required category subtotals sum to exactly $580 (low) and $766 (high); grand total high of $840 = $766 + $32 optional add-ons + $42 contingency; savings figures recomputed from the $3,999 assumed reference price.",
    "Cut list cross-checked against both sheet layouts with 1/8 in. kerf allowances: all 16 oak parts fit the single oak sheet (9 percent waste); staves, formers, plates and saw guide fit two birch sheets (18 percent waste) including 2 spare staves.",
    "Every material referenced in Steps 1-25 appears in the shopping list; every tool referenced appears in the tools table with owned/workaround status; mini-lesson IDs in steps all resolve.",
    "Safety review passed at overall medium: no professional-review triggers (no wall anchoring, electrical, plumbing, or overhead loads); tip-resistance estimate flagged as a conservative design estimate, not a rating, per policy.",
    "Dimension confidence deliberately capped at 55 because the source page blocked extraction - the plan surfaces this in six places rather than hiding it. User should verify room fit before purchasing.",
    "Brand-safety check: reference named only as user-provided inspiration; inspired-by framing used throughout with no reproduction claims.",
  ],
  confidenceScore: 74,
  createdAt: GENERATED_AT,
  updatedAt: UPDATED_AT,
};

/* --------------------- derived version plans (v2, v3) ------------------- */

const budgetBudgetBreakdown: BudgetBreakdown = {
  lines: [
    {
      category: "Sheet goods",
      items: [{ name: "Birch plywood, 3/4 in. 4x8 (2)", costLow: 110, costHigh: 140 }],
      subtotalLow: 110,
      subtotalHigh: 140,
    },
    {
      category: "Trim & edge",
      items: [{ name: "Poplar 1x2 x 8 ft (4)", costLow: 32, costHigh: 48 }],
      subtotalLow: 32,
      subtotalHigh: 48,
    },
    {
      category: "Hardware, fasteners & adhesives",
      items: [
        { name: "Pocket-hole screws #8 x 1-1/4 (100)", costLow: 9, costHigh: 12 },
        { name: "Multi-purpose screws #8 x 2-1/2 (50)", costLow: 11, costHigh: 16 },
        { name: "Felt pads, 2 in. (8)", costLow: 5, costHigh: 9 },
        { name: "Titebond II, 16 oz", costLow: 10, costHigh: 13 },
        { name: "DAP Plastic Wood, natural", costLow: 5, costHigh: 9 },
      ],
      subtotalLow: 40,
      subtotalHigh: 59,
    },
    {
      category: "Finish & abrasives",
      items: [
        { name: "Minwax Gel Stain, Aged Oak, quart", costLow: 24, costHigh: 30 },
        { name: "Water-based poly, matte, quart", costLow: 26, costHigh: 32 },
        { name: "Dark bronze spray for bases (2)", costLow: 12, costHigh: 16 },
        { name: "Sanding discs + hand sheets", costLow: 24, costHigh: 32 },
      ],
      subtotalLow: 86,
      subtotalHigh: 110,
    },
    {
      category: "Safety gear",
      items: [
        { name: "N95 dust masks (10)", costLow: 12, costHigh: 16 },
        { name: "Safety glasses (if not already owned)", costLow: 0, costHigh: 8, optional: true },
      ],
      subtotalLow: 12,
      subtotalHigh: 24,
    },
    {
      category: "Contingency",
      items: [{ name: "Mis-cut / oops buffer (~10%)", costLow: 0, costHigh: 39, optional: true }],
      subtotalLow: 0,
      subtotalHigh: 39,
    },
  ],
  materialsTotalLow: 280,
  materialsTotalHigh: 381,
  optionalToolsLow: 49,
  optionalToolsHigh: 79,
  grandTotalLow: 280,
  grandTotalHigh: 420,
  referencePrice: 3999,
  estimatedSavingsLow: 3579,
  estimatedSavingsHigh: 3719,
  confidence: 82,
  notes: [
    "Category subtotals sum to $280 (all low, no optionals) through $420 (all high + optionals + 10% buffer).",
    "The gel stain quart is the one line NOT to cheapen further - it is the entire oak illusion on birch.",
    "Optional tools bucket = jigsaw only ($49-79); every other cut can be made at the store or with owned tools.",
  ],
};

const budgetPlan: BuildPlan = {
  ...demoPlan,
  id: "plan_demo_meadowview_v2",
  title: "Chunky Oak-Look Pedestal Dining Table - Budget Interpretation",
  snapshot: {
    ...demoPlan.snapshot,
    selectedBuildPath: "budget",
    difficulty: "Intermediate (light)",
    estimatedCostLow: 280,
    estimatedCostHigh: 420,
    estimatedTime: "2-3 weekends (16-22 hours hands-on)",
    visualMatchScore: 62,
    durabilityScore: 74,
    bestFor: "Getting the silhouette and the chunky edge when the budget stops at $400",
    mainMaterials: [
      "3/4 in. birch plywood (top + pedestals)",
      "Poplar 1x2 (built-up edge)",
      "Gel stain in oak tone",
    ],
    keyTools: ["Circular saw + guide (or store cuts)", "Drill/driver", "Pocket hole jig", "Random orbit sander"],
  },
  savingsStory: {
    ...demoPlan.savingsStory,
    estimatedDiyCostLow: 280,
    estimatedDiyCostHigh: 420,
    estimatedSavings: 3649,
    savingsPercentage: 91,
    laborTimeTradeoff:
      "Roughly 16-22 shop hours for about $3,600-$3,700 in savings against the estimated reference price - the highest savings rate of any path, paid for in visual fidelity rather than time.",
    explanation:
      "Every dollar of the $300 saved versus the Balanced build comes out of materials you can see: birch instead of white oak, gel stain instead of natural grain, painted bases without the metal band. The construction, sizes and joinery stay identical - so an upgrade later reuses everything you learned.",
  },
  buildPaths: demoPlan.buildPaths.map((p) => ({ ...p, recommended: p.name === "budget" })),
  recommendedPathReason:
    "This version pins the plan to the Budget path per your request: birch sheet goods, poplar edge, gel-stain finish system, no metal band. Same geometry, same steps, roughly half the materials bill of the Balanced build.",
  materials: [
    {
      name: "Birch plywood",
      category: "Sheet goods",
      quantity: "2 sheets",
      specification: "3/4 in. x 4 ft. x 8 ft., B/BB birch - one for the top and build-up, one for the pedestals",
      purpose: "Top show surface (gel-stained) plus all pedestal parts",
      estimatedCostLow: 110,
      estimatedCostHigh: 140,
      premiumAlternative: "Upgrade the top sheet to white oak ply (+$40-60) and this becomes most of the Balanced build",
      notes: "Pick the best face of the best sheet for the top; birch face veneer is as thin as oak's - same sanding cautions apply.",
    },
    {
      name: "Poplar board, 1x2",
      category: "Hardwood",
      quantity: "4 boards",
      specification: "1 in. x 2 in. x 8 ft. S4S poplar (actual 3/4 x 1-1/2)",
      purpose: "Built-up edge band; takes gel stain acceptably and machines easily",
      estimatedCostLow: 32,
      estimatedCostHigh: 48,
      budgetAlternative: "Primed pine 1x2 if the top will be painted instead of stained",
      notes: "Poplar's green streaks vanish under gel stain; pick boards without them anyway where you can.",
    },
    {
      name: "Gel stain",
      category: "Finish",
      quantity: "1 quart",
      specification: "Minwax Gel Stain, Aged Oak (test Hickory too if the store has samples)",
      purpose: "The oak illusion: gel sits on the surface and colors birch evenly where liquid stains blotch",
      estimatedCostLow: 24,
      estimatedCostHigh: 30,
      notes: "Two thin wiped coats beat one heavy one. Test boards are still mandatory - birch reads a full shade different from the can chip.",
    },
    ...demoPlan.materials.filter((m) =>
      ["Pine stud, 2x4", "Wood glue", "Wood filler", "Water-based polyurethane, matte", "Applicator kit", "Sanding discs, 5 in.", "Hand sanding sheets + block", "Fine sanding sponges"].includes(m.name)
    ),
    {
      name: "Dark bronze spray paint",
      category: "Finish",
      quantity: "2 cans",
      specification: "Rust-Oleum Painter's Touch 2X, Satin, Dark Bronze (or near-black bronze)",
      purpose: "Finish for the square pedestal boxes - replaces primer+enamel+band system",
      estimatedCostLow: 12,
      estimatedCostHigh: 16,
      notes: "Spray outside. Two light coats per face; birch drinks the first coat at edges.",
    },
  ],
  budgetBreakdown: budgetBudgetBreakdown,
  qaNotes: [
    "Derived from the Balanced plan (v1): geometry, cut dimensions, and step sequence unchanged; materials and finish system swapped per the Budget path definition.",
    "Budget arithmetic verified: lines sum to $280 low / $420 high including optionals and buffer.",
    "Pedestal variant: square columns per the Budget path remove Steps 12's bevel work - follow the square-box variant described in the Alternatives and Design Simplifier sections.",
    "Metal band deleted in this version: Steps 19, 20 and 24 become no-ops; column paint goes straight to the floor reveal line.",
  ],
  createdAt: "2026-06-28T09:30:00.000Z",
  updatedAt: "2026-06-28T09:30:00.000Z",
};

const beginnerBudgetBreakdown: BudgetBreakdown = {
  lines: [
    {
      category: "Lumber & sheet goods",
      items: [
        { name: "White oak veneer plywood, 3/4 in. 4x8", costLow: 98, costHigh: 128 },
        { name: "Birch plywood, 3/4 in. 4x8 (2)", costLow: 112, costHigh: 132 },
      ],
      subtotalLow: 210,
      subtotalHigh: 260,
    },
    {
      category: "Moulding & trim",
      items: [{ name: "White oak 1x2 x 8 ft (4)", costLow: 68, costHigh: 84 }],
      subtotalLow: 68,
      subtotalHigh: 84,
    },
    {
      category: "Hardware & adhesives",
      items: [
        { name: "Pocket-hole screws #8 x 1-1/4 (100)", costLow: 8, costHigh: 12 },
        { name: "Multi-purpose screws #8 x 2-1/2 (50)", costLow: 10, costHigh: 16 },
        { name: "Felt pads, 2 in. (8)", costLow: 5, costHigh: 9 },
        { name: "Titebond II, 16 oz", costLow: 10, costHigh: 13 },
        { name: "DAP Plastic Wood, natural", costLow: 5, costHigh: 9 },
        { name: "Metal-look adhesive trim, 2 in. x 15 ft roll", costLow: 15, costHigh: 22 },
      ],
      subtotalLow: 53,
      subtotalHigh: 81,
    },
    {
      category: "Paint & finish",
      items: [
        { name: "Water-based poly, matte, quart", costLow: 26, costHigh: 32 },
        { name: "Zinsser 1-2-3 primer, quart", costLow: 13, costHigh: 17 },
        { name: "Urethane alkyd enamel, quart", costLow: 30, costHigh: 36 },
        { name: "Applicator kit", costLow: 12, costHigh: 17 },
      ],
      subtotalLow: 81,
      subtotalHigh: 102,
    },
    {
      category: "Sandpaper & abrasives",
      items: [
        { name: "5 in. discs, 120-220 assortment", costLow: 17, costHigh: 23 },
        { name: "Hand sheets 80/120 + block", costLow: 8, costHigh: 12 },
        { name: "Fine sanding sponges (2)", costLow: 4, costHigh: 6 },
      ],
      subtotalLow: 29,
      subtotalHigh: 41,
    },
    {
      category: "Safety gear",
      items: [
        { name: "N95 dust masks (10)", costLow: 12, costHigh: 16 },
        { name: "Safety glasses", costLow: 6, costHigh: 10 },
        { name: "Nitrile gloves (20)", costLow: 6, costHigh: 10 },
      ],
      subtotalLow: 24,
      subtotalHigh: 36,
    },
    {
      category: "Contingency",
      items: [{ name: "Store-cut redo + oops buffer (~10%)", costLow: 0, costHigh: 56, optional: true }],
      subtotalLow: 0,
      subtotalHigh: 56,
    },
  ],
  materialsTotalLow: 465,
  materialsTotalHigh: 604,
  optionalToolsLow: 0,
  optionalToolsHigh: 0,
  grandTotalLow: 465,
  grandTotalHigh: 660,
  referencePrice: 3999,
  estimatedSavingsLow: 3339,
  estimatedSavingsHigh: 3534,
  confidence: 80,
  notes: [
    "Category subtotals sum to $465 low / $660 high (high includes the 10% buffer - beginner builds redo more cuts, so the buffer is bigger here than on the Balanced plan).",
    "No optional tools bucket: this version deliberately requires nothing beyond your owned tools plus the store panel saw.",
    "Keeps the real white oak top and edge - the beginner savings come from simpler bases and the adhesive band, not from the surfaces you touch.",
  ],
};

const beginnerPlan: BuildPlan = {
  ...demoPlan,
  id: "plan_demo_meadowview_v3",
  title: "Chunky Oak Pedestal Dining Table - Beginner-Friendly Build",
  snapshot: {
    ...demoPlan.snapshot,
    selectedBuildPath: "beginner",
    difficulty: "Confident beginner",
    estimatedCostLow: 465,
    estimatedCostHigh: 660,
    estimatedTime: "3 weekends (20-26 hours, most cuts made at the store)",
    visualMatchScore: 70,
    durabilityScore: 80,
    bestFor: "A first big furniture build: real oak where it counts, no bevel cuts, no metalwork",
    keyTools: ["Drill/driver", "Pocket hole jig", "Random orbit sander", "Clamps", "Store panel saw (all sheet cuts)"],
  },
  savingsStory: {
    ...demoPlan.savingsStory,
    estimatedDiyCostLow: 465,
    estimatedDiyCostHigh: 660,
    estimatedSavings: 3437,
    savingsPercentage: 86,
    laborTimeTradeoff:
      "About 20-26 hours - shorter than the Balanced build because the store's panel saw does the precision cutting and the square bases skip the octagon glue-ups entirely.",
    explanation:
      "Priced with every sheet cut made at the store, square pocket-screwed pedestal boxes, and an adhesive metal-look band instead of cut aluminum. You keep the white oak top and solid oak edge - the two things hands and eyes actually verify.",
  },
  buildPaths: demoPlan.buildPaths.map((p) => ({ ...p, recommended: p.name === "beginner" })),
  recommendedPathReason:
    "This version pins the plan to the Beginner path per your request: identical top construction to the Balanced build (oak ply + solid oak edge), square pedestal boxes with pocket screws instead of beveled octagons, and every sheet cut delegated to the store panel saw.",
  materials: [
    ...demoPlan.materials.filter(
      (m) => !["Aluminum flat bar", "Self-etching primer, spray", "Metallic spray paint, aged brass", "Construction adhesive"].includes(m.name)
    ),
    {
      name: "Metal-look adhesive trim",
      category: "Trim",
      quantity: "1 roll (2 in. x 15 ft)",
      specification: "Brushed brass-tone peel-and-stick trim, exterior-grade adhesive",
      purpose: "The band detail without cutting, filing, priming or painting metal",
      estimatedCostLow: 15,
      estimatedCostHigh: 22,
      notes: "Wrap each square base in one continuous run, seam on the back face; press hard with a roller or rag over 60 seconds per side.",
    },
  ],
  budgetBreakdown: beginnerBudgetBreakdown,
  qaNotes: [
    "Derived from the Balanced plan (v1): the tabletop steps (1-11, 21-22) apply unchanged; pedestal steps 12-16 are replaced by square pocket-screwed boxes (14 x 14 in., four sides plus cap) sized to the same 28-1/2 in. height; steps 19-20 (metalwork) are replaced by the adhesive trim.",
    "Budget arithmetic verified: lines sum to $465 low / $660 high; no optional-tools spend required by design.",
    "Square base tip-resistance is equivalent to the octagon at the same footprint width; the same no-climbing house rule applies.",
  ],
  createdAt: "2026-06-29T16:45:00.000Z",
  updatedAt: "2026-06-29T16:45:00.000Z",
};

/* ------------------------------ saved versions --------------------------- */

export const demoVersions: SavedPlanVersion[] = [
  {
    id: "ver_demo_meadowview_1",
    projectId: "proj_demo_meadowview",
    versionNumber: 1,
    versionName: "Balanced (recommended)",
    changeSummary:
      "Initial full plan on the recommended Balanced path: white oak veneer top with solid oak edge, faceted octagon pedestals, aged-brass aluminum band, water-based matte finish. $580-840.",
    buildPathType: "balanced",
    plan: demoPlan,
    createdAt: GENERATED_AT,
  },
  {
    id: "ver_demo_meadowview_2",
    projectId: "proj_demo_meadowview",
    versionNumber: 2,
    versionName: "Budget interpretation",
    changeSummary:
      "Refined for cost: birch throughout with Aged Oak gel stain, poplar edge band, square painted bases, metal band removed. Same geometry and step sequence; visual match drops from 82 to 62. $280-420.",
    buildPathType: "budget",
    plan: budgetPlan,
    createdAt: "2026-06-28T09:30:00.000Z",
  },
  {
    id: "ver_demo_meadowview_3",
    projectId: "proj_demo_meadowview",
    versionNumber: 3,
    versionName: "Beginner-friendly",
    changeSummary:
      "Refined for skill level: keeps the white oak top and solid oak edge, swaps beveled octagon columns for square pocket-screwed boxes, uses store panel-saw cuts for every sheet part, and replaces the cut-aluminum band with brass-look adhesive trim. $465-660.",
    buildPathType: "beginner",
    plan: beginnerPlan,
    createdAt: "2026-06-29T16:45:00.000Z",
  },
];
