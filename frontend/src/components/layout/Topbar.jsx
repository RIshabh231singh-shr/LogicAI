import React from 'react';
import { ChevronRight, FolderKanban, LogOut } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const ROUTE_LABELS = {
  overview: 'Workspace Overview',
  projects: 'Projects',
  projectDetails: 'Project Details',
  documents: 'Documents',
  documentViewer: 'Document Viewer',
  analysis: 'Intelligence Analysis',
  comparison: 'Project Comparison',
  evaluation: 'Model Evaluation',
  observability: 'Observability & Traces',
  security: 'Security & Policy',
  settings: 'Workspace Settings',
};

export default function Topbar() {
  const { currentRoute, setCurrentRoute, selectedProject, projects, setSelectedProjectId, currentUser, logoutUser } = useWorkspace();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-workspace-border sticky top-0 z-20 px-8 flex items-center justify-between shadow-subtle">
      {/* Breadcrumb path */}
      <div className="flex items-center gap-2 text-xs text-workspace-secondary font-medium">
        <button
          onClick={() => setCurrentRoute('overview')}
          className="hover:text-workspace-text transition-colors"
        >
          LogicAI
        </button>
        <ChevronRight size={14} className="text-workspace-muted" />
        <span className="text-workspace-text font-semibold">
          {ROUTE_LABELS[currentRoute] || 'Workspace'}
        </span>
        {selectedProject && (currentRoute === 'analysis' || currentRoute === 'documents' || currentRoute === 'projectDetails') && (
          <>
            <ChevronRight size={14} className="text-workspace-muted" />
            <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded text-[11px] font-medium">
              {selectedProject.name}
            </span>
          </>
        )}
      </div>

      {/* Right controls: Project quick-switch & User profile / Logout */}
      <div className="flex items-center gap-4">
        {projects.length > 0 && (
          <div className="flex items-center gap-2">
            <FolderKanban size={14} className="text-workspace-muted" />
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs font-medium text-workspace-text bg-workspace-subtle hover:bg-zinc-200/60 border border-workspace-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dynamic User Profile Badge & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-workspace-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 text-white text-[11px] font-semibold flex items-center justify-center">
              {getInitials(currentUser?.name)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-workspace-text leading-none">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[10px] text-workspace-muted leading-tight mt-0.5">
                {currentUser?.email || ''}
              </span>
            </div>
          </div>

          <button
            onClick={logoutUser}
            title="Log Out"
            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
