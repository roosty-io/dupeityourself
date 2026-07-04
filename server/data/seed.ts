/**
 * Seeds the flagship demo project, its plan versions, the community gallery,
 * and default user preferences into storage on first boot (empty database).
 */
import type { UserPreferences } from "../../shared/types";
import { storage } from "../storage";
import { demoPlan, demoProject, demoVersions } from "./demoPlan";
import { galleryEntries } from "./gallery";

const SEED_TIME = "2026-07-01T12:00:00.000Z";

const defaultPreferences: UserPreferences = {
  id: "pref_default",
  userId: "user_default",
  preferredStores: ["Home Depot"],
  defaultBudgetMin: 100,
  defaultBudgetMax: 750,
  skillLevel: "beginner",
  workspaceType: "garage",
  units: "in",
  ownedTools: ["Drill/driver", "Clamps", "Measuring/layout tools"],
  inventory: [],
  subscriptionTier: "free",
  createdAt: SEED_TIME,
  updatedAt: SEED_TIME,
};

export async function seedDemoData(): Promise<void> {
  if (storage.hasAnyProjects()) return;

  await storage.saveProject(demoProject);

  // Save every version's plan object, then the canonical latest plan (v1).
  for (const version of demoVersions) {
    await storage.savePlan(version.plan);
    await storage.saveVersion(version);
  }
  await storage.savePlan(demoPlan);

  for (const entry of galleryEntries) {
    await storage.saveGalleryEntry(entry);
  }

  if (!storage.getPreferences()) {
    await storage.savePreferences(defaultPreferences);
  }

  console.log(
    `[seed] demo data loaded: project ${demoProject.id}, ${demoVersions.length} plan versions, ${galleryEntries.length} gallery entries`
  );
}
