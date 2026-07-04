/**
 * File-backed storage for the MVP.
 *
 * A deliberately small persistence layer: everything lives in memory and is
 * flushed to JSON files under server/data/runtime/. The interface is shaped so
 * it can be swapped for Postgres (Drizzle/Prisma) later without touching
 * routes or agents.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import type {
  AgentRunRecord,
  BuildPlan,
  Project,
  ProjectGalleryEntry,
  SavedPlanVersion,
  UserPreferences,
} from "../shared/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data", "runtime");

export type PlanProgress = {
  projectId: string;
  checkedShoppingItems: string[];
  completedSteps: number[];
  notes: string;
};

type Db = {
  projects: Project[];
  plans: BuildPlan[];
  versions: SavedPlanVersion[];
  agentRuns: AgentRunRecord[];
  progress: PlanProgress[];
  gallery: ProjectGalleryEntry[];
  preferences: UserPreferences | null;
};

const emptyDb = (): Db => ({
  projects: [],
  plans: [],
  versions: [],
  agentRuns: [],
  progress: [],
  gallery: [],
  preferences: null,
});

const DB_FILE = path.join(DATA_DIR, "db.json");

class Storage {
  private db: Db = emptyDb();
  private writeQueue: Promise<void> = Promise.resolve();

  async init() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      const raw = await fs.readFile(DB_FILE, "utf-8");
      this.db = { ...emptyDb(), ...(JSON.parse(raw) as Partial<Db>) };
    } catch {
      this.db = emptyDb();
      await this.flush();
    }
  }

  private flush(): Promise<void> {
    this.writeQueue = this.writeQueue.then(() =>
      fs.writeFile(DB_FILE, JSON.stringify(this.db, null, 2), "utf-8").catch((err) => {
        console.error("storage flush failed:", err);
      })
    );
    return this.writeQueue;
  }

  /* projects */
  listProjects(): Project[] {
    return [...this.db.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  getProject(id: string): Project | undefined {
    return this.db.projects.find((p) => p.id === id);
  }
  async saveProject(project: Project): Promise<Project> {
    const idx = this.db.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) this.db.projects[idx] = project;
    else this.db.projects.push(project);
    await this.flush();
    return project;
  }
  async deleteProject(id: string): Promise<void> {
    this.db.projects = this.db.projects.filter((p) => p.id !== id);
    this.db.plans = this.db.plans.filter((p) => p.projectId !== id);
    this.db.versions = this.db.versions.filter((v) => v.projectId !== id);
    this.db.agentRuns = this.db.agentRuns.filter((r) => r.projectId !== id);
    this.db.progress = this.db.progress.filter((p) => p.projectId !== id);
    await this.flush();
  }

  /* plans */
  getPlan(id: string): BuildPlan | undefined {
    return this.db.plans.find((p) => p.id === id);
  }
  getLatestPlanForProject(projectId: string): BuildPlan | undefined {
    const project = this.getProject(projectId);
    if (project?.latestPlanId) return this.getPlan(project.latestPlanId);
    return this.db.plans
      .filter((p) => p.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }
  async savePlan(plan: BuildPlan): Promise<BuildPlan> {
    const idx = this.db.plans.findIndex((p) => p.id === plan.id);
    if (idx >= 0) this.db.plans[idx] = plan;
    else this.db.plans.push(plan);
    await this.flush();
    return plan;
  }

  /* versions */
  listVersions(projectId: string): SavedPlanVersion[] {
    return this.db.versions
      .filter((v) => v.projectId === projectId)
      .sort((a, b) => a.versionNumber - b.versionNumber);
  }
  async saveVersion(version: SavedPlanVersion): Promise<SavedPlanVersion> {
    this.db.versions.push(version);
    await this.flush();
    return version;
  }
  nextVersionNumber(projectId: string): number {
    return this.listVersions(projectId).length + 1;
  }

  /* agent runs */
  listAgentRuns(projectId: string): AgentRunRecord[] {
    return this.db.agentRuns.filter((r) => r.projectId === projectId);
  }
  async saveAgentRun(run: AgentRunRecord): Promise<void> {
    this.db.agentRuns.push(run);
    await this.flush();
  }

  /* progress */
  getProgress(projectId: string): PlanProgress {
    return (
      this.db.progress.find((p) => p.projectId === projectId) ?? {
        projectId,
        checkedShoppingItems: [],
        completedSteps: [],
        notes: "",
      }
    );
  }
  async saveProgress(progress: PlanProgress): Promise<void> {
    const idx = this.db.progress.findIndex((p) => p.projectId === progress.projectId);
    if (idx >= 0) this.db.progress[idx] = progress;
    else this.db.progress.push(progress);
    await this.flush();
  }

  /* gallery */
  listGallery(): ProjectGalleryEntry[] {
    return this.db.gallery;
  }
  getGalleryBySlug(slug: string): ProjectGalleryEntry | undefined {
    return this.db.gallery.find((g) => g.slug === slug);
  }
  async saveGalleryEntry(entry: ProjectGalleryEntry): Promise<void> {
    const idx = this.db.gallery.findIndex((g) => g.id === entry.id);
    if (idx >= 0) this.db.gallery[idx] = entry;
    else this.db.gallery.push(entry);
    await this.flush();
  }

  /* preferences (single default user for MVP) */
  getPreferences(): UserPreferences | null {
    return this.db.preferences;
  }
  async savePreferences(prefs: UserPreferences): Promise<UserPreferences> {
    this.db.preferences = prefs;
    await this.flush();
    return prefs;
  }

  /* util */
  hasAnyProjects(): boolean {
    return this.db.projects.length > 0;
  }
}

export const storage = new Storage();

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
