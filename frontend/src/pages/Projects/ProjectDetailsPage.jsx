import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  LineChart,
  GitCompare,
  Upload,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function ProjectDetailsPage() {
  const { selectedProject, setCurrentRoute } = useWorkspace();
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, documents, analysis, compare

  if (!selectedProject) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-workspace-secondary mb-4">No project selected.</p>
        <Button onClick={() => setCurrentRoute('projects')}>Go to Projects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back to projects breadcrumb */}
      <button
        onClick={() => setCurrentRoute('projects')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-workspace-secondary hover:text-workspace-text transition-colors"
      >
        <ArrowLeft size={14} /> Back to Projects
      </button>

      {/* Project Banner Header */}
      <div className="bg-white p-6 rounded-xl border border-workspace-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-xl font-bold tracking-tight text-workspace-text">
              {selectedProject.name}
            </h1>
            <Badge variant={selectedProject.status === 'Ready' ? 'success' : 'warning'} size="sm">
              {selectedProject.status}
            </Badge>
          </div>
          <p className="text-xs text-workspace-secondary max-w-2xl leading-relaxed mb-3">
            {selectedProject.description}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-workspace-muted font-medium">
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {selectedProject.documentCount} documents indexed
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Updated recently
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            icon={Upload}
            size="sm"
            onClick={() => setCurrentRoute('documents')}
          >
            Upload Documents
          </Button>
          <Button
            icon={LineChart}
            size="sm"
            onClick={() => setCurrentRoute('analysis')}
          >
            Analyze Project
          </Button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-workspace-border pb-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'documents', label: `Documents (${selectedProject.documentCount})` },
          { id: 'findings', label: `Findings & Architecture` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeSubTab === tab.id
                ? 'bg-brand-50 text-brand-600 font-semibold'
                : 'text-workspace-secondary hover:text-workspace-text hover:bg-workspace-subtle'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-3">
            <h3 className="text-xs font-semibold text-workspace-muted uppercase tracking-wider">
              Architecture Executive Summary
            </h3>
            <p className="text-xs text-workspace-secondary leading-relaxed font-sans">
              {selectedProject.architectureSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-2">
              <div className="text-xs font-medium text-workspace-muted flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Key Verified Decisions
              </div>
              <ul className="text-xs text-workspace-secondary space-y-1.5 list-disc list-inside">
                <li>Decoupled microservice architecture with Node API Gateway proxy layer</li>
                <li>PostgreSQL pgvector used for 384-dimensional cosine similarity indexing</li>
                <li>Grounded citations enforce evidence trace to source document pages</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-2">
              <div className="text-xs font-medium text-workspace-muted flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                Identified Technical Risks
              </div>
              <ul className="text-xs text-workspace-secondary space-y-1.5 list-disc list-inside">
                <li>Context window limits on long RFP documents require 500-char sliding chunking</li>
                <li>Prompt injection threat vectors mitigated via multi-layer guardrail inspection</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'documents' && (
        <div className="space-y-3">
          {selectedProject.documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setCurrentRoute('documentViewer', { document: doc })}
              className="bg-white p-4 rounded-xl border border-workspace-border hover:border-workspace-borderHover shadow-subtle hover:shadow-card flex items-center justify-between cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-workspace-subtle text-workspace-secondary group-hover:text-brand-600 transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-workspace-text group-hover:text-brand-600 transition-colors">
                    {doc.name}
                  </div>
                  <div className="text-[11px] text-workspace-muted">
                    {doc.type} • {doc.size} • {doc.pages} pages
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success" size="sm">
                  {doc.status}
                </Badge>
                <span className="text-xs text-brand-600 font-medium group-hover:underline">
                  Inspect &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'findings' && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-xl border border-workspace-border shadow-subtle space-y-3">
            <h3 className="text-sm font-semibold text-workspace-text">
              Architecture Analysis Findings
            </h3>
            <p className="text-xs text-workspace-secondary leading-relaxed">
              Based on the {selectedProject.documentCount} documents indexed in this project, LogicAI has identified structural patterns, service boundaries, and security policies.
            </p>
            <Button
              icon={LineChart}
              size="sm"
              onClick={() => setCurrentRoute('analysis')}
            >
              Open Full Intelligence Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
