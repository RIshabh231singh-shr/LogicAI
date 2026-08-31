import React, { useState, useMemo } from 'react';
import { Search, FolderKanban, FileText, LineChart, ChevronRight } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Dialog from '../ui/Dialog';

export default function GlobalSearchModal() {
  const { globalSearchOpen, setGlobalSearchOpen, projects, setCurrentRoute } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const matchedProjects = projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      .map((p) => ({
        type: 'project',
        id: p.id,
        title: p.name,
        subtitle: `${p.documentCount} documents · ${p.status}`,
        icon: FolderKanban,
        action: () => {
          setCurrentRoute('projectDetails', { projectId: p.id });
          setGlobalSearchOpen(false);
        },
      }));

    const matchedDocs = [];
    projects.forEach((p) => {
      p.documents.forEach((d) => {
        if (d.name.toLowerCase().includes(q)) {
          matchedDocs.push({
            type: 'document',
            id: d.id,
            title: d.name,
            subtitle: `In ${p.name} · ${d.pages} pages`,
            icon: FileText,
            action: () => {
              setCurrentRoute('documentViewer', { projectId: p.id, document: d });
              setGlobalSearchOpen(false);
            },
          });
        }
      });
    });

    return [...matchedProjects, ...matchedDocs];
  }, [searchQuery, projects, setCurrentRoute, setGlobalSearchOpen]);

  return (
    <Dialog
      isOpen={globalSearchOpen}
      onClose={() => setGlobalSearchOpen(false)}
      title="Quick Search"
      description="Jump directly to projects, documents, or analyses (⌘K)"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-workspace-muted" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, documents, topics..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-workspace-subtle border border-workspace-border rounded-lg text-workspace-text placeholder-workspace-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-workspace-border">
          {searchQuery && searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-workspace-muted">
              No matching projects or documents found for "{searchQuery}".
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between py-2.5 px-3 text-left hover:bg-workspace-subtle rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-white border border-workspace-border text-workspace-secondary group-hover:text-brand-600 group-hover:border-brand-200 transition-colors">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-workspace-text group-hover:text-brand-600 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-workspace-muted">{item.subtitle}</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-workspace-muted group-hover:text-brand-500 transition-colors" />
                </button>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-workspace-muted">
              Type keywords to search across all projects and indexed documents.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
