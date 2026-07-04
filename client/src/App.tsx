import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { PageSpinner } from "./components/ui/Spinner";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const NewProjectPage = lazy(() => import("./pages/NewProjectPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ProjectEditPage = lazy(() => import("./pages/ProjectEditPage"));
const ExportCenterPage = lazy(() => import("./pages/ExportCenterPage"));
const TroubleshootingPage = lazy(() => import("./pages/TroubleshootingPage"));
const HandoffPage = lazy(() => import("./pages/HandoffPage"));
const ExampleProjectPage = lazy(() => import("./pages/ExampleProjectPage"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const LibraryDetailPage = lazy(() => import("./pages/LibraryDetailPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const GalleryDetailPage = lazy(() => import("./pages/GalleryDetailPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
          <Route path="/projects/:id/export" element={<ExportCenterPage />} />
          <Route path="/projects/:id/troubleshooting" element={<TroubleshootingPage />} />
          <Route path="/projects/:id/handoff" element={<HandoffPage />} />
          <Route path="/examples/designer-dining-table" element={<ExampleProjectPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/:slug" element={<LibraryDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/gallery/:projectSlug" element={<GalleryDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
