import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { ToastProvider } from './components/ui/Toast';
import AppLayout from './components/layout/AppLayout';
import AuthPage from './pages/Auth/AuthPage';

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

function MainApp() {
  const { isAuthenticated, authLoading, loginUser } = useWorkspace();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-500 font-medium">Initializing LogicAI workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={loginUser} />;
  }

  return (
    <AppLayout>
      <RouterOutlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <WorkspaceProvider>
        <MainApp />
      </WorkspaceProvider>
    </ToastProvider>
  );
}
