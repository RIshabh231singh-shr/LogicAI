import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { ToastProvider } from './components/ui/Toast';
import AppLayout from './components/layout/AppLayout';

// Page components
import OverviewPage from './pages/Overview/OverviewPage';
import ProjectsPage from './pages/Projects/ProjectsPage';
import ProjectDetailsPage from './pages/Projects/ProjectDetailsPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import DocumentViewerPage from './pages/Documents/DocumentViewerPage';
import AnalysisPage from './pages/Analysis/AnalysisPage';
import ComparisonPage from './pages/Comparison/ComparisonPage';
import EvaluationPage from './pages/Evaluation/EvaluationPage';
import ObservabilityPage from './pages/Observability/ObservabilityPage';
import SettingsPage from './pages/Settings/SettingsPage';

function RouterOutlet() {
  const { currentRoute } = useWorkspace();

  switch (currentRoute) {
    case 'overview':
      return <OverviewPage />;
    case 'projects':
      return <ProjectsPage />;
    case 'projectDetails':
      return <ProjectDetailsPage />;
    case 'documents':
      return <DocumentsPage />;
    case 'documentViewer':
      return <DocumentViewerPage />;
    case 'analysis':
      return <AnalysisPage />;
    case 'comparison':
      return <ComparisonPage />;
    case 'evaluation':
      return <EvaluationPage />;
    case 'observability':
      return <ObservabilityPage />;
    case 'security':
    case 'settings':
      return <SettingsPage />;
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  return (
    <ToastProvider>
      <WorkspaceProvider>
        <AppLayout>
          <RouterOutlet />
        </AppLayout>
      </WorkspaceProvider>
    </ToastProvider>
  );
}
