/**
 * Demo community gallery entries. Image arrays are intentionally empty - the
 * UI renders emoji placeholders for demo content.
 */
import type { ProjectGalleryEntry } from "../../shared/types";

export const galleryEntries: ProjectGalleryEntry[] = [
  {
    id: "gal_meadowview_table",
    projectId: "proj_demo_meadowview",
    userId: "user_demo",
    slug: "oak-pedestal-table-first-big-build",
    title: "Oak Pedestal Dining Table - our first big build",
    description:
      "Followed the Balanced plan over three weekends (okay, three and a half). The tape-ring bevel test saved the pedestals - our saw's 22.5 detent was almost a full degree off. The top came out pale and matte exactly like the reference photos, and nobody has found the trim screws yet.",
    inspirationImages: [],
    inProgressImages: [],
    finishedImages: [],
    actualCost: 712,
    actualTime: "34 hours over 4 weekends",
    difficultyRating: 3,
    lessonsLearned: [
      "The store panel saw guy was 1/4 in. off on one cut - measure before you leave, like the plan says. We didn't, and it cost a return trip.",
      "Buy the 2 spare staves. We used both.",
      "Water-based poly really does dry too fast to fuss with. Lay it down, walk away.",
      "The 30-day placemat rule is a war with a 7-year-old, but the finish survived.",
    ],
    notes: "Total came in $30 under the high estimate even with the redo trip.",
    visibility: "public",
    createdAt: "2026-06-30T18:20:00.000Z",
  },
  {
    id: "gal_trestle_bench",
    projectId: "proj_gallery_trestle_bench",
    userId: "user_community_ana",
    slug: "trestle-bench-weekend-win",
    title: "Matching trestle bench in one honest weekend",
    description:
      "Built the trestle bench from the library as a companion piece. First time cutting angles - the half-laps took three tries on scrap before I trusted myself, and then the real ones went perfectly. Finished in the same water-based matte as our table.",
    inspirationImages: [],
    finishedImages: [],
    actualCost: 118,
    actualTime: "11 hours across two days",
    difficultyRating: 2,
    lessonsLearned: [
      "Cut all four trestle angles in one session without touching the saw setting - same lesson as the big table's staves, smaller stakes.",
      "A $12 speed square did everything a miter saw would have.",
    ],
    visibility: "public",
    createdAt: "2026-06-22T15:40:00.000Z",
  },
  {
    id: "gal_boucle_ottoman",
    projectId: "proj_gallery_boucle_ottoman",
    userId: "user_community_priya",
    slug: "boucle-ottoman-no-sewing-machine",
    title: "Boucle-style ottoman with zero sewing",
    description:
      "The staple-gun-only version, exactly per the plan. The pool-noodle rim trick is genius - soft rounded edge with no upholstery skills. Fabric was 60 percent of my budget and worth every dollar; the cheap boucle-look bolt at the fabric store pilled in the sample wash test.",
    inspirationImages: [],
    inProgressImages: [],
    finishedImages: [],
    actualCost: 139,
    actualTime: "9 hours plus a fabric-store detour",
    difficultyRating: 2,
    lessonsLearned: [
      "Do the wash test on a fabric sample BEFORE buying 2 yards. The plan said so. The plan was right.",
      "Pull the fabric in a star pattern (N, S, E, W, then diagonals), not around the circle - no puckers.",
    ],
    visibility: "public",
    createdAt: "2026-06-18T21:05:00.000Z",
  },
  {
    id: "gal_farmhouse_console",
    projectId: "proj_gallery_farmhouse_console",
    userId: "user_community_marcus",
    slug: "farmhouse-console-narrow-hallway",
    title: "Farmhouse console for a 13-inch hallway",
    description:
      "Every store console was 16+ inches deep and our hallway laughs at that. Built the library version at 13 in. deep with the store-bought turned legs. The layered weathered finish took two test boards to dial in - the first attempt looked like zebra paint, the second looked like grandma's farmhouse.",
    inspirationImages: [],
    finishedImages: [],
    actualCost: 187,
    actualTime: "16 hours over two weekends",
    difficultyRating: 3,
    lessonsLearned: [
      "Custom depth is THE reason to DIY furniture - no store sells your hallway's size.",
      "Test boards for layered finishes are mandatory, not homework.",
      "Pre-made turned legs feel like cheating. Cheat.",
    ],
    visibility: "public",
    createdAt: "2026-06-12T13:15:00.000Z",
  },
  {
    id: "gal_kids_bookshelf",
    projectId: "proj_gallery_kids_bookshelf",
    userId: "user_community_devon",
    slug: "front-facing-bookshelf-anchored",
    title: "Front-facing bookshelf - anchored before the books went on",
    description:
      "One sheet of birch ply, one Saturday of cutting, one Sunday of sanding and finishing, one week of waiting for cure (the hard part with an impatient 3-year-old). The plan makes wall anchoring an actual numbered step with hardware specs, which is the reason I picked it over the pin-board versions.",
    inspirationImages: [],
    inProgressImages: [],
    finishedImages: [],
    actualCost: 96,
    actualTime: "13 hours plus cure wait",
    difficultyRating: 2,
    lessonsLearned: [
      "Radius every corner more than feels necessary - toddlers find the one you skipped.",
      "The anti-tip strap went into a stud, not drywall anchors. Tested with my full weight pulling forward. Solid.",
      "Zero-VOC finish still needs its full cure before little hands and mouths - patience is part of the build.",
    ],
    visibility: "public",
    createdAt: "2026-06-05T10:50:00.000Z",
  },
];
