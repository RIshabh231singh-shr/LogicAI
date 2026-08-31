import React from 'react';
import {
  FolderKanban,
  FileText,
  LineChart,
  GitCompare,
  CheckSquare,
  Activity,
  Settings,
  LayoutDashboard,
  Shield,
  Search,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const NAV_SECTIONS = [
  {
    title: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'projects', label: 'Projects', icon: FolderKanban },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'analysis', label: 'Analysis', icon: LineChart },
      { id: 'comparison', label: 'Comparison', icon: GitCompare },
    ],
  },
  {
    title: 'Intelligence & Ops',
    items: [
      { id: 'evaluation', label: 'Evaluations', icon: CheckSquare },
      { id: 'observability', label: 'Observability', icon: Activity },
      { id: 'security', label: 'Security & Policy', icon: Shield },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { currentRoute, setCurrentRoute, systemHealth, setGlobalSearchOpen } = useWorkspace();

  return (
    <aside className="w-64 h-screen bg-white border-r border-workspace-border flex flex-col fixed left-0 top-0 bottom-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-workspace-border shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentRoute('overview')}
        >
          <img src="/logo-mark.svg" alt="LogicAI" className="w-8 h-8 rounded-lg" />
          <span className="font-semibold text-base tracking-tight text-workspace-text">
            Logic<span className="text-brand-500">AI</span>
          </span>
        </div>
      </div>

      {/* Quick Search Shortcut Trigger */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-workspace-secondary bg-workspace-subtle hover:bg-zinc-200/60 border border-workspace-border rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <Search size={14} className="text-workspace-muted" />
            Search workspace...
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-workspace-muted bg-white border border-workspace-border rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold text-workspace-muted uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id || 
                  (item.id === 'projects' && currentRoute === 'projectDetails') ||
                  (item.id === 'documents' && currentRoute === 'documentViewer');

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentRoute(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-600 font-semibold'
                        : 'text-workspace-secondary hover:bg-workspace-subtle hover:text-workspace-text'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? 'text-brand-500' : 'text-workspace-muted'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-workspace-border bg-workspace-subtle/50">
        <div className="flex items-center justify-between text-xs text-workspace-secondary mb-2">
          <span className="font-medium text-[11px] text-workspace-muted uppercase tracking-wider">
            Engine Connectivity
          </span>
        </div>
        <div className="space-y-1.5 text-xs text-workspace-secondary">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${systemHealth.gateway === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              Gateway
            </span>
            <span className="text-[11px] font-mono text-workspace-muted">
              {systemHealth.gateway === 'online' ? 'Active' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${systemHealth.ai === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              AI Service
            </span>
            <span className="text-[11px] font-mono text-workspace-muted">
              {systemHealth.ai === 'online' ? ':8000' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
