import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ProjectWithPlan } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { TroubleshootingPanel } from "@/components/plan/TroubleshootingPanel";

export default function TroubleshootingPage() {
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

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted no-print">
        <Link to={`/projects/${project.id}`} className="hover:text-ink">
          ← Back to {project.title}
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-ink">🔧 Troubleshooting</h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Hit a snag mid-build? Describe what's happening and get a diagnosis based on this project's materials,
          joinery, and steps — not generic advice.
        </p>
      </div>

      <TroubleshootingPanel projectId={project.id} />

      <div className="card p-5 border-amber-200 bg-amber-50">
        <h3 className="font-semibold text-amber-900 mb-1.5">⚠️ Safety first</h3>
        <p className="text-sm text-amber-900 leading-relaxed">
          If anything feels structurally unstable — a leg that shifts under load, a cracked joint, a split board in a
          load-bearing part — stop building and don't let anyone use the piece until it's fixed. When a diagnosis is
          marked <span className="font-semibold">Safety stop</span>, treat it seriously. For anything load-bearing or
          wall-mounted, a quick look from an experienced builder is cheap insurance.
        </p>
      </div>
    </div>
  );
}
