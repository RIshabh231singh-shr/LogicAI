import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  FileText,
  Clock,
  ArrowRight,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { ProjectRowSkeleton } from '../../components/ui/Skeleton';
import CreateProjectDialog from './CreateProjectDialog';
import { projectsApi } from '../../api/projects';
import { useToast } from '../../components/ui/Toast';

export default function ProjectsPage() {
  const { projects, loadingProjects, refreshProjects, setSelectedProjectId, setCurrentRoute } = useWorkspace();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const handleDelete = async (e, projectId, projectName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      try {
        await projectsApi.deleteProject(projectId);
        addToast(`Project "${projectName}" deleted.`);
        refreshProjects();
      } catch (err) {
        addToast(err.message || 'Failed to delete project', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-workspace-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-workspace-text">Projects</h1>
          <p className="text-xs text-workspace-secondary mt-1">
            Organize architecture documents, RFCs, and engineering specifications into workspaces.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setCreateModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-2.5 text-workspace-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or scope..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-workspace-border rounded-lg text-workspace-text placeholder-workspace-muted focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>
        <span className="text-xs text-workspace-muted font-medium">
          Showing {filteredProjects.length} of {projects.length}
        </span>
      </div>

      {/* Project Table / Cards */}
      {loadingProjects ? (
        <div className="space-y-3">
          <ProjectRowSkeleton />
          <ProjectRowSkeleton />
          <ProjectRowSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchQuery ? 'No matching projects' : 'No projects yet'}
          description={
            searchQuery
              ? `No projects matched "${searchQuery}". Try a different search term.`
              : 'Create your first project workspace to start analyzing documents.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'New Project'}
          onAction={searchQuery ? () => setSearchQuery('') : () => setCreateModalOpen(true)}
          actionIcon={searchQuery ? Search : Plus}
        />
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                setSelectedProjectId(project.id);
                setCurrentRoute('projectDetails', { projectId: project.id });
              }}
              className="bg-white p-5 rounded-xl border border-workspace-border hover:border-workspace-borderHover shadow-subtle hover:shadow-card transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-workspace-text group-hover:text-brand-600 transition-colors">
                    {project.name}
                  </h3>
                  <Badge variant={project.status === 'Ready' ? 'success' : 'warning'} size="sm">
                    {project.status}
                  </Badge>
                </div>
                <p className="text-xs text-workspace-secondary line-clamp-1 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-workspace-muted shrink-0">
                <span className="flex items-center gap-1.5 font-medium text-workspace-secondary">
                  <FileText size={14} className="text-workspace-muted" />
                  {project.documentCount} {project.documentCount === 1 ? 'doc' : 'docs'}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock size={13} />
                  Recently
                </span>
                <button
                  onClick={(e) => handleDelete(e, project.id, project.name)}
                  title="Delete project"
                  className="p-1.5 text-workspace-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
                <ArrowRight size={15} className="text-workspace-muted group-hover:text-brand-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectDialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
