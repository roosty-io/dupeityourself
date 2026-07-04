import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { BuilderHandoffBrief, ProjectWithPlan } from "@shared/types";
import { api } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/EmptyState";
import { BuilderHandoffBriefCard } from "@/components/plan/BuilderHandoffBriefCard";

export default function HandoffPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectWithPlan | null>(null);
  const [brief, setBrief] = useState<BuilderHandoffBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const proj = await api.getProject(id);
      setProject(proj);
      if (proj.plan?.builderHandoff) {
        setBrief(proj.plan.builderHandoff);
      } else {
        // no plan brief on file — ask the server to draft one fresh
        const res = await api.builderHandoff(id);
        setBrief(res.brief);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the builder handoff brief.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSpinner />;
  if (error || !project || !brief) {
    return <ErrorState message={error ?? "Could not load the builder handoff brief."} onRetry={load} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <nav className="text-sm text-muted no-print">
        <Link to={`/projects/${project.id}`} className="hover:text-ink">
          ← Back to {project.title}
        </Link>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-ink">📦 Builder Handoff</h1>
        <p className="text-sm text-muted mt-1 max-w-2xl">
          Decided this one's a job for a pro? This brief gives a local woodworker or maker everything they need to
          quote it accurately — dimensions, materials, finish, and quality expectations.
        </p>
      </div>

      <BuilderHandoffBriefCard brief={brief} projectId={project.id} />

      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-1.5">💬 Getting good quotes</h3>
        <ul className="list-disc pl-4 space-y-1 text-sm text-soot">
          <li>Send the brief to 2–3 builders — quotes for custom work commonly vary by 50% or more.</li>
          <li>Ask to see photos of similar past work, especially the finish quality up close.</li>
          <li>Agree on wood species, finish product, and dimensions in writing before any deposit.</li>
        </ul>
      </div>
    </div>
  );
}
