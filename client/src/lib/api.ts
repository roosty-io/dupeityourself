import type {
  AdvisorChatRequest,
  AdvisorChatResponse,
  BuildPlan,
  BuilderHandoffBrief,
  CreateProjectInput,
  DupeLibraryEntry,
  FeasibilityQuestion,
  GenerationState,
  Project,
  ProjectGalleryEntry,
  ProjectWithPlan,
  RefineRequest,
  SavedPlanVersion,
  TroubleshootingResponse,
  UpdateProjectInput,
  UserPreferences,
} from "@shared/types";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /* ------------------------------ projects ------------------------------ */
  listProjects: () => request<Project[]>("/projects"),
  getProject: (id: string) => request<ProjectWithPlan>(`/projects/${id}`),
  createProject: (input: CreateProjectInput) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(input) }),
  updateProject: (id: string, input: UpdateProjectInput) =>
    request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  deleteProject: (id: string) => request<{ ok: true }>(`/projects/${id}`, { method: "DELETE" }),

  /* ------------------------------ pipeline ------------------------------ */
  analyzeProject: (id: string) =>
    request<Project>(`/projects/${id}/analyze`, { method: "POST", body: "{}" }),
  getFeasibilityQuestions: (id: string) =>
    request<FeasibilityQuestion[]>(`/projects/${id}/feasibility-questions`, {
      method: "POST",
      body: "{}",
    }),
  generatePlan: (id: string, pathPreference?: string) =>
    request<{ started: boolean }>(`/projects/${id}/generate-plan`, {
      method: "POST",
      body: JSON.stringify({ pathPreference }),
    }),
  getGenerationStatus: (id: string) => request<GenerationState>(`/projects/${id}/generation-status`),

  /* ----------------------------- refinement ----------------------------- */
  refinePlan: (id: string, req: RefineRequest) =>
    request<{ plan: BuildPlan; version: SavedPlanVersion }>(`/projects/${id}/refine`, {
      method: "POST",
      body: JSON.stringify(req),
    }),
  troubleshoot: (id: string, problem: string) =>
    request<TroubleshootingResponse>(`/projects/${id}/troubleshoot`, {
      method: "POST",
      body: JSON.stringify({ problem }),
    }),
  advisorChat: (id: string, req: AdvisorChatRequest) =>
    request<AdvisorChatResponse>(`/projects/${id}/advisor-chat`, {
      method: "POST",
      body: JSON.stringify(req),
    }),
  builderHandoff: (id: string) =>
    request<{ brief: BuilderHandoffBrief; markdown: string }>(`/projects/${id}/builder-handoff`, {
      method: "POST",
      body: "{}",
    }),

  /* ---------------------------- plan progress --------------------------- */
  updatePlanProgress: (
    id: string,
    progress: { checkedShoppingItems?: string[]; completedSteps?: number[]; notes?: string }
  ) =>
    request<{ ok: true }>(`/projects/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify(progress),
    }),
  getPlanProgress: (id: string) =>
    request<{ checkedShoppingItems: string[]; completedSteps: number[]; notes: string }>(
      `/projects/${id}/progress`
    ),

  /* ------------------------------- exports ------------------------------ */
  exportUrls: (id: string) => ({
    csv: `/api/projects/${id}/export/csv`,
    checklist: `/api/projects/${id}/export/checklist.md`,
    planMarkdown: `/api/projects/${id}/export/plan.md`,
    storeCutSheet: `/api/projects/${id}/export/store-cut-sheet.md`,
    builderHandoff: `/api/projects/${id}/export/builder-handoff.md`,
  }),

  /* --------------------------- library/gallery -------------------------- */
  listLibrary: () => request<DupeLibraryEntry[]>("/library"),
  getLibraryEntry: (slug: string) => request<DupeLibraryEntry & { plan?: BuildPlan }>(`/library/${slug}`),
  listGallery: () => request<ProjectGalleryEntry[]>("/gallery"),
  getGalleryEntry: (slug: string) => request<ProjectGalleryEntry>(`/gallery/${slug}`),

  /* ----------------------------- preferences ---------------------------- */
  getPreferences: () => request<UserPreferences>("/preferences"),
  updatePreferences: (prefs: Partial<UserPreferences>) =>
    request<UserPreferences>("/preferences", { method: "PUT", body: JSON.stringify(prefs) }),

  /* -------------------------------- demo -------------------------------- */
  getDemoProject: () => request<ProjectWithPlan>("/demo-project"),
};
