# Plan component contract

Every file below lives in `client/src/components/plan/` and uses **named exports**
with the exact export name and props listed. Pages under `client/src/pages/` use
**default exports** (required by lazy imports in `App.tsx`).

Import types from `@shared/types`, constants from `@shared/constants`, helpers from
`@/lib/format`, api from `@/lib/api`, UI primitives from `@/components/ui/*`.

## Group A (plan-core agent)

| File | Export | Props |
|---|---|---|
| OverviewTab.tsx | `OverviewTab` | `{ plan: BuildPlan }` |
| WorthItScoreCard.tsx | `WorthItScoreCard` | `{ score: WorthItScore }` |
| SavingsStoryCard.tsx | `SavingsStoryCard` | `{ story: SavingsStory }` |
| ConfidenceBreakdownCard.tsx | `ConfidenceBreakdownCard` | `{ confidence: ConfidenceBreakdown }` |
| BuildReadinessCard.tsx | `BuildReadinessCard` | `{ readiness: BuildReadiness }` |
| DifficultyBreakdownCard.tsx | `DifficultyBreakdownCard` | `{ difficulty: DifficultyBreakdown }` |
| BuildPathComparison.tsx | `BuildPathComparison` | `{ paths: BuildPath[]; selected?: BuildPathType; onSelect?: (p: BuildPathType) => void; recommendedReason?: string }` |
| VersionComparisonTable.tsx | `VersionComparisonTable` | `{ versions: SavedPlanVersion[]; currentPlanId?: string }` |
| MaterialsTable.tsx | `MaterialsTable` | `{ materials: MaterialItem[]; title?: string }` |
| MaterialSwapSimulator.tsx | `MaterialSwapSimulator` | `{ swaps: MaterialSwapOption[] }` |
| ToolsTable.tsx | `ToolsTable` | `{ tools: ToolItem[]; toolAwareNotes: ToolAwareNote[] }` |
| BudgetBreakdownCard.tsx | `BudgetBreakdownCard` | `{ budget: BudgetBreakdown }` |
| ShoppingListMode.tsx | `ShoppingListMode` | `{ departments: ShoppingListDepartment[]; checkedItems: string[]; onToggle: (key: string) => void }` — item key is `` `${department}::${item.name}` `` |
| CutOptimizerCard.tsx | `CutOptimizerCard` | `{ cutList: CutListItem[]; plans: CutOptimizationPlan[] }` |
| StoreCutSheetCard.tsx | `StoreCutSheetCard` | `{ sheet: StoreCutSheet }` |
| ProjectTimelineCard.tsx | `ProjectTimelineCard` | `{ phases: ProjectTimelinePhase[] }` |

Group A also owns `client/src/pages/ProjectDetailPage.tsx` (default export), which
imports Group B components below by these exact names/paths.

## Group B (plan-extras agent)

| File | Export | Props |
|---|---|---|
| StepByStepGuide.tsx | `StepByStepGuide` | `{ steps: BuildStep[]; completedSteps: number[]; onToggleStep: (n: number) => void; miniLessons: MiniLesson[] }` |
| DiagramViewer.tsx | `DiagramViewer` | `{ diagrams: DiagramSpec[] }` |
| FinishMatchingGuide.tsx | `FinishMatchingGuide` | `{ guide: FinishGuide }` |
| MiniLessonsSection.tsx | `MiniLessonsSection` | `{ lessons: MiniLesson[] }` (also export `MiniLessonCard` with `{ lesson: MiniLesson }`) |
| MistakePreventionSection.tsx | `MistakePreventionSection` | `{ mistakes: MistakeWarning[]; commonProblems: CommonProblem[] }` |
| SafetyDesignReviewCard.tsx | `SafetyDesignReviewCard` | `{ review: SafetyDesignReview }` |
| AlternativesPanel.tsx | `AlternativesPanel` | `{ alternatives: AlternativeOption[]; minimumViableDupe: MinimumViableDupe; designSimplifier: DesignSimplifierNotes }` |
| TroubleshootingPanel.tsx | `TroubleshootingPanel` | `{ projectId: string }` |
| ProjectAdvisorChat.tsx | `ProjectAdvisorChat` | `{ projectId: string }` |
| BuilderHandoffBriefCard.tsx | `BuilderHandoffBriefCard` | `{ brief: BuilderHandoffBrief; projectId: string }` |
| ExportCenter.tsx | `ExportCenter` | `{ projectId: string; planTitle: string; hasCutSheet: boolean }` |

Group B also owns these pages (default exports): `ExportCenterPage.tsx`,
`TroubleshootingPage.tsx`, `HandoffPage.tsx`, `ProjectEditPage.tsx`,
`ExampleProjectPage.tsx`.

## Wizard group

`client/src/components/wizard/ProcessingPipeline.tsx` exports
`ProcessingPipeline` with props `{ projectId: string; onComplete: () => void }`.
It polls `api.getGenerationStatus(projectId)` every ~700ms and renders the
`AGENT_STAGES` progress list. ProjectDetailPage (Group A) renders it when
`project.generation.status === "running"`.

## Server data contract (demo-data agent → server agent)

- `server/data/demoPlan.ts` exports `demoProject: Project` (id `proj_demo_meadowview`,
  `isDemo: true`, `status: "ready"`, `latestPlanId: "plan_demo_meadowview_v1"`),
  `demoPlan: BuildPlan` (id `plan_demo_meadowview_v1`), and
  `demoVersions: SavedPlanVersion[]` (v1 balanced = demoPlan, plus budget and
  beginner variants with their own plan objects).
- `server/data/library.ts` exports `libraryEntries: DupeLibraryEntry[]`.
- `server/data/gallery.ts` exports `galleryEntries: ProjectGalleryEntry[]`.
- `server/data/seed.ts` exports `seedDemoData(): Promise<void>` — seeds demo
  project/plan/versions/gallery/default preferences into `storage` when empty.
