import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <div className="text-5xl mb-4" aria-hidden>
        🪵
      </div>
      <h1 className="text-3xl font-bold text-ink">404 — this page didn't make the cut</h1>
      <p className="text-sm text-muted mt-3">
        We measured twice, but this page isn't here. Maybe the link is old, or maybe it was never
        built.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link to="/" className="btn-primary btn-md">
          🔨 Back to home
        </Link>
        <Link to="/projects" className="btn-secondary btn-md">
          My Projects
        </Link>
        <Link to="/library" className="btn-ghost btn-md">
          Dupe Library →
        </Link>
      </div>
    </div>
  );
}
