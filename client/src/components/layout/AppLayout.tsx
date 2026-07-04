import { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LEGAL_DISCLAIMER } from "@shared/constants";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-pine-600 text-white" : "text-soot hover:bg-sand"
  }`;

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-bdr">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-pine-600 text-white grid place-items-center text-lg" aria-hidden>
              🔨
            </span>
            <span className="font-bold text-lg leading-none">
              Dupe It <span className="text-pine-600">Yourself</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/projects" className={navLinkClass}>
              My Projects
            </NavLink>
            <NavLink to="/library" className={navLinkClass}>
              Dupe Library
            </NavLink>
            <NavLink to="/gallery" className={navLinkClass}>
              Gallery
            </NavLink>
            <NavLink to="/examples/designer-dining-table" className={navLinkClass}>
              Example Plan
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Settings
            </NavLink>
          </nav>
          <Link to="/projects/new" className="btn-ember btn-md shrink-0">
            + New Build Plan
          </Link>
        </div>
      </header>

      <main className={`flex-1 ${isLanding ? "" : "max-w-7xl w-full mx-auto px-4 sm:px-6 py-8"}`}>
        {children}
      </main>

      <footer className="no-print border-t border-bdr bg-parchment mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-soot font-semibold">
              <span aria-hidden>🔨</span> Dupe It Yourself
            </div>
            <nav className="flex flex-wrap gap-4 text-sm text-muted">
              <Link to="/projects" className="hover:text-ink">Projects</Link>
              <Link to="/library" className="hover:text-ink">Library</Link>
              <Link to="/gallery" className="hover:text-ink">Gallery</Link>
              <Link to="/settings" className="hover:text-ink">Settings</Link>
            </nav>
          </div>
          <p className="text-xs text-faint leading-relaxed max-w-4xl">{LEGAL_DISCLAIMER}</p>
        </div>
      </footer>
    </div>
  );
}
