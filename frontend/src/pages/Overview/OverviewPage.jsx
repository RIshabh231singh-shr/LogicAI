import React, { useState } from 'react';
import {
  FolderKanban,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileSearch,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ProjectRowSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import CreateProjectDialog from '../Projects/CreateProjectDialog';

export default function OverviewPage() {
  const { projects, loadingProjects, setCurrentRoute, setSelectedProjectId } = useWorkspace();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalDocuments = projects.reduce((acc, p) => acc + (p.documentCount || 0), 0);
  const totalFindings = projects.reduce((acc, p) => acc + (p.findingsCount || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-workspace-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-workspace-text">
            Good morning, Rishabh
          </h1>
          <p className="text-xs text-workspace-secondary mt-1">
            Your intelligence workspaces and analyzed project documents at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={FileText}
            onClick={() => setCurrentRoute('documents')}
          >
            Upload Documents
          </Button>
          <Button
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* High-Level Workspace Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle">
          <div className="text-xs font-medium text-workspace-muted mb-1 flex items-center gap-1.5">
            <FolderKanban size={14} className="text-brand-500" />
            Active Projects
          </div>
          <div className="text-2xl font-bold text-workspace-text">{projects.length}</div>
          <div className="text-[11px] text-workspace-secondary mt-1">All workspaces indexed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle">
          <div className="text-xs font-medium text-workspace-muted mb-1 flex items-center gap-1.5">
            <FileText size={14} className="text-indigo-500" />
            Analyzed Documents
          </div>
          <div className="text-2xl font-bold text-workspace-text">{totalDocuments}</div>
          <div className="text-[11px] text-workspace-secondary mt-1">Processed into semantic vector store</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle">
          <div className="text-xs font-medium text-workspace-muted mb-1 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            Grounded Findings
          </div>
          <div className="text-2xl font-bold text-workspace-text">{totalFindings}</div>
          <div className="text-[11px] text-workspace-secondary mt-1">Backed by citations &amp; page references</div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-workspace-text">Recent Projects</h2>
            <p className="text-xs text-workspace-secondary">
              Jump directly into documents, findings, and architecture analysis.
            </p>
          </div>
          <button
            onClick={() => setCurrentRoute('projects')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            View all projects <ArrowRight size={13} />
          </button>
        </div>

        {loadingProjects ? (
          <div className="space-y-3">
            <ProjectRowSkeleton />
            <ProjectRowSkeleton />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects created yet"
            description="Create your first project to organize documents and generate evidence-backed architectural analysis."
            actionLabel="Create Project"
            actionIcon={Plus}
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project) => (
              <div
                key={project.id}
                onClick={() => {
                  setSelectedProjectId(project.id);
                  setCurrentRoute('projectDetails', { projectId: project.id });
                }}
                className="bg-white p-5 rounded-xl border border-workspace-border hover:border-workspace-borderHover shadow-subtle hover:shadow-card transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-workspace-text group-hover:text-brand-600 transition-colors">
                      {project.name}
                    </h3>
                    <Badge variant={project.status === 'Ready' ? 'success' : 'warning'} size="sm">
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-workspace-secondary line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-workspace-border flex items-center justify-between text-xs text-workspace-muted">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FileText size={13} />
                    {project.documentCount} {project.documentCount === 1 ? 'document' : 'documents'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock size={12} />
                    Updated recently
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Launchpad to Core Workflows */}
      <div className="p-6 bg-white rounded-xl border border-workspace-border shadow-subtle">
        <h3 className="text-sm font-semibold text-workspace-text mb-1">
          Evidence-Backed Document Intelligence
        </h3>
        <p className="text-xs text-workspace-secondary mb-4 leading-relaxed">
          LogicAI analyzes multiple project documents to extract architecture decisions, identify risks, compare topologies, and ground every conclusion in cited evidence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setCurrentRoute('analysis')}
            className="flex items-center gap-3 p-3.5 rounded-lg border border-workspace-border hover:border-brand-200 hover:bg-brand-50/50 text-left transition-colors group"
          >
            <div className="p-2 rounded-md bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
              <FileSearch size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-workspace-text group-hover:text-brand-600">
                Run Analysis
              </div>
              <div className="text-[11px] text-workspace-muted">Extract insights &amp; risks</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentRoute('comparison')}
            className="flex items-center gap-3 p-3.5 rounded-lg border border-workspace-border hover:border-brand-200 hover:bg-brand-50/50 text-left transition-colors group"
          >
            <div className="p-2 rounded-md bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <FolderKanban size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-workspace-text group-hover:text-brand-600">
                Compare Projects
              </div>
              <div className="text-[11px] text-workspace-muted">Diff system architectures</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentRoute('observability')}
            className="flex items-center gap-3 p-3.5 rounded-lg border border-workspace-border hover:border-brand-200 hover:bg-brand-50/50 text-left transition-colors group"
          >
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-workspace-text group-hover:text-brand-600">
                Observability
              </div>
              <div className="text-[11px] text-workspace-muted">Inspect traces &amp; latency</div>
            </div>
          </button>
        </div>
      </div>

      <CreateProjectDialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
