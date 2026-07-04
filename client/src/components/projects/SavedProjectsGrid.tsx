import { Link } from "react-router-dom";
import type { Project, ProjectStatus, SourceType } from "@shared/types";
import { Badge } from "@/components/ui/Badge";
import type { BadgeTone } from "@/components/ui/Badge";
import { formatDate, titleCase } from "@/lib/format";

const STATUS_META: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draft", tone: "gray" },
  analyzing: { label: "Analyzing", tone: "yellow" },
  questions: { label: "Needs answers", tone: "yellow" },
  generating: { label: "Generating", tone: "orange" },
  ready: { label: "Ready", tone: "green" },
  error: { label: "Error", tone: "red" },
};

const SOURCE_META: Record<SourceType, { emoji: string; label: string }> = {
  url: { emoji: "🔗", label: "From a link" },
  images: { emoji: "📷", label: "From photos" },
  description: { emoji: "💬", label: "From a description" },
  mixed: { emoji: "📦", label: "From mixed sources" },
};

export function SavedProjectsGrid({
  projects,
  onDelete,
  deletingId,
}: {
  projects: Project[];
  onDelete: (project: Project) => void;
  deletingId?: string | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const status = STATUS_META[project.status];
        const source = SOURCE_META[project.sourceType];
        return (
          <div
            key={project.id}
            className="card p-5 flex flex-col gap-3 hover:shadow-lift transition-shadow"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" title={source.label} aria-label={source.label}>
                {source.emoji}
              </span>
              <Badge tone={status.tone}>{status.label}</Badge>
              {project.isDemo && <Badge tone="oak">Demo</Badge>}
            </div>

            <Link to={`/projects/${project.id}`} className="group min-w-0">
              <h3 className="font-semibold text-ink group-hover:text-pine-700 transition-colors leading-snug">
                {project.title}
              </h3>
            </Link>

            <div className="flex flex-wrap gap-1.5">
              <span className="chip bg-sand text-soot">{project.projectType}</span>
              <span className="chip bg-oak-100 text-oak-800">{titleCase(project.category)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 mt-auto pt-2 border-t border-bdr/70">
              <span className="text-xs text-faint">⏱️ {formatDate(project.createdAt)}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="btn-ghost btn-sm text-danger hover:bg-red-50"
                  onClick={() => onDelete(project)}
                  disabled={deletingId === project.id}
                  aria-label={`Delete ${project.title}`}
                >
                  {deletingId === project.id ? "Deleting…" : "Delete"}
                </button>
                <Link to={`/projects/${project.id}`} className="btn-secondary btn-sm">
                  Open →
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
