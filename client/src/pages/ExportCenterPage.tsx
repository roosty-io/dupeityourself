import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ProjectWithPlan } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { ExportCenter } from "@/components/plan/ExportCenter";

export default function ExportCenterPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectWithPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProject(await api.getProject(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this project.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner />;
  if (error || !project) {
    return <ErrorState message={error ?? "Could not load this project."} onRetry={load} />;
  }

  const plan = project.plan;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted no-print">
        <Link to={`/projects/${project.id}`} className="hover:text-ink">
          ← Back to {project.title}
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-ink">📤 Export Center</h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Take your plan off the screen and into the garage. Print the full manual, load the shopping list on your
          phone, or hand the cut sheet straight to the store's panel saw counter.
        </p>
      </div>

      {plan ? (
        <ExportCenter projectId={project.id} planTitle={plan.title} hasCutSheet={Boolean(plan.storeCutSheet)} />
      ) : (
        <ErrorState message="This project doesn't have a generated plan yet — generate one first, then come back to export it." />
      )}

      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-1.5">💡 A few pointers</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
          <li>The Markdown plan opens in any notes app — handy for marking up measurements as you go.</li>
          <li>Print the shopping list or open the CSV on your phone before the store run so nothing gets missed.</li>
          <li>If you regenerate or refine the plan, re-download — exports always reflect the latest version.</li>
        </ul>
      </div>
    </div>
  );
}
