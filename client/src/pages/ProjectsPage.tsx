import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { SavedProjectsGrid } from "@/components/projects/SavedProjectsGrid";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await api.listProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (project: Project) => {
    const ok = window.confirm(
      `Delete “${project.title}”? This removes the project and its saved plans. This can't be undone.`
    );
    if (!ok) return;
    setDeletingId(project.id);
    setDeleteError(null);
    try {
      await api.deleteProject(project.id);
      setProjects(await api.listProjects());
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete the project.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Projects</h1>
          <p className="text-sm text-muted mt-1">
            Every inspired-by build plan you've started, in one place.
          </p>
        </div>
        <Link to="/projects/new" className="btn-primary btn-md">
          🔨 New Build Plan
        </Link>
      </div>

      {deleteError && (
        <p className="text-sm text-danger flex items-center gap-1.5">
          <span aria-hidden>⚠️</span> {deleteError}
        </p>
      )}

      {loading ? (
        <PageSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          icon="🪵"
          title="Start your first dupe"
          description="Paste a link or upload photos of an expensive piece you love, and get a practical build plan sized to your budget and tools."
          action={
            <Link to="/projects/new" className="btn-ember btn-lg">
              Create a Build Plan
            </Link>
          }
        />
      ) : (
        <SavedProjectsGrid projects={projects} onDelete={handleDelete} deletingId={deletingId} />
      )}
    </div>
  );
}
