import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { analysisApi } from '../../api/analysis';
import { useToast } from '../../components/ui/Toast';

export default function AnalysisPage() {
  const { selectedProject, setCurrentRoute } = useWorkspace();
  const { addToast } = useToast();
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [loadingQuery, setLoadingQuery] = useState(false);

  const handleRunQuery = async (e) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setLoadingQuery(true);
    try {
      const res = await analysisApi.runRAGQuery(customQuery, 3);
      setQueryResult(res.data || res);
      addToast('Query executed with grounded citations.');
    } catch (err) {
      addToast(err.message || 'Failed to execute query.', 'error');
    } finally {
      setLoadingQuery(false);
    }
  };

  const projectTitle = selectedProject?.name || 'Workspace Analysis';
  const hasDocuments = selectedProject && selectedProject.documents && selectedProject.documents.length > 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-workspace-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
              Intelligence Report
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-xs text-workspace-muted">
              {selectedProject ? `${selectedProject.documentCount || 0} indexed documents` : 'No project selected'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-workspace-text">
            {projectTitle}
          </h1>
        </div>
      </div>

      {/* Query Bar for Ad-hoc Evidence Retrieval */}
      <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-workspace-text flex items-center gap-2">
            <Search size={14} className="text-brand-500" />
            Query Project Knowledge Base
          </label>
          <span className="text-[11px] text-workspace-muted">
            Grounded RAG with verified page citations
          </span>
        </div>

        <form onSubmit={handleRunQuery} className="flex gap-3">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="e.g. Ask a question about indexed project architecture or policy..."
            className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-workspace-border bg-workspace-subtle/50 text-workspace-text focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all"
          />
          <Button type="submit" size="sm" loading={loadingQuery} icon={Sparkles}>
            Analyze Query
          </Button>
        </form>

        {queryResult && (
          <div className="mt-4 p-4 rounded-xl bg-brand-50/40 border border-brand-200/70 space-y-3">
            <div className="text-xs font-semibold text-brand-900 flex items-center justify-between">
              <span>Synthesized Answer</span>
              <Badge variant="primary" size="sm">Grounded</Badge>
            </div>
            <p className="text-xs text-zinc-800 leading-relaxed font-sans">
              {queryResult.answer}
            </p>

            {queryResult.citations && queryResult.citations.length > 0 && (
              <div className="pt-2 border-t border-brand-200/50 space-y-1.5">
                <div className="text-[11px] font-semibold text-brand-800 uppercase tracking-wider">
                  Extracted Evidence Citations
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {queryResult.citations.map((cit, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentRoute('documents')}
                      className="p-2.5 bg-white rounded-lg border border-brand-200/80 shadow-subtle hover:border-brand-400 cursor-pointer transition-colors"
                    >
                      <div className="text-[11px] font-mono font-medium text-brand-600 mb-1 flex items-center justify-between">
                        <span>{cit.source || 'Document'} · p.{cit.page_number || 1}</span>
                        <ExternalLink size={11} />
                      </div>
                      <p className="text-[11px] text-workspace-secondary italic line-clamp-2">
                        "{cit.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Summary Section */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-workspace-text flex items-center gap-2">
          <BookOpen size={16} className="text-brand-500" />
          System Overview
        </h2>
        <div className="bg-white p-6 rounded-xl border border-workspace-border shadow-subtle space-y-3">
          <p className="text-xs text-workspace-secondary leading-relaxed font-sans">
            {selectedProject?.architectureSummary || 
              'No analysis summary generated yet. Upload architecture documents or query the knowledge base above to generate grounded findings.'}
          </p>
        </div>
      </section>

      {/* Indexed Documents Section */}
      {hasDocuments && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-workspace-text flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Analyzed Documents &amp; Knowledge Base
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedProject.documents.map((doc) => (
              <div key={doc.id} className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-workspace-text">
                    {doc.name}
                  </span>
                  <Badge variant={doc.status === 'Indexed' ? 'success' : 'warning'} size="sm">
                    {doc.status}
                  </Badge>
                </div>
                <p className="text-xs text-workspace-secondary leading-relaxed">
                  Size: {doc.size} · Format: {doc.type} · Indexed into dense vector store.
                </p>
                <div
                  className="pt-2 text-[10px] font-mono text-brand-600 cursor-pointer hover:underline"
                  onClick={() => setCurrentRoute('documentViewer', { document: doc })}
                >
                  View Document Details →
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
