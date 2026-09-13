import React, { useState, useEffect } from 'react';
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
  Upload,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { analysisApi } from '../../api/analysis';
import { documentsApi } from '../../api/documents';
import { useToast } from '../../components/ui/Toast';

export default function AnalysisPage() {
  const { selectedProject, setCurrentRoute } = useWorkspace();
  const { addToast } = useToast();
  const [customQuery, setCustomQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [apiDocs, setApiDocs] = useState([]);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await documentsApi.getDocuments(selectedProject?.id);
        if (res && res.documents) {
          setApiDocs(res.documents);
        }
      } catch (err) {
        console.warn('AnalysisPage loadDocs error:', err);
      }
    }
    loadDocs();
  }, [selectedProject?.id]);

  const effectiveDocs = (selectedProject?.documents && selectedProject.documents.length > 0)
    ? selectedProject.documents
    : apiDocs;

  const handleRunQuery = async (e) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setLoadingQuery(true);
    try {
      const filter = selectedProject?.id ? { project_id: selectedProject.id } : null;
      const res = await analysisApi.runRAGQuery(customQuery, 3, filter);
      setQueryResult(res.data || res);
      addToast('Query executed with grounded citations.');
    } catch (err) {
      addToast(err.message || 'Failed to execute query.', 'error');
    } finally {
      setLoadingQuery(false);
    }
  };

  const projectTitle = selectedProject?.name || 'Workspace Analysis';
  const hasDocuments = effectiveDocs && effectiveDocs.length > 0;

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
              {effectiveDocs.length} indexed document{effectiveDocs.length === 1 ? '' : 's'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-workspace-text">
            {projectTitle}
          </h1>
        </div>
        <div>
          <Button
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={() => setCurrentRoute('documents')}
          >
            Upload More Documents
          </Button>
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
                        <span>{cit.source || 'Document'} · p.{cit.page || 1}</span>
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
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-workspace-text flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            Analyzed Documents &amp; Knowledge Base
          </h2>
          <span className="text-xs text-workspace-muted font-medium">
            {effectiveDocs.length} Total
          </span>
        </div>

        {hasDocuments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {effectiveDocs.map((doc) => (
              <div key={doc.id} className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-workspace-text truncate max-w-[240px]">
                    {doc.name || doc.filename}
                  </span>
                  <Badge variant="success" size="sm">
                    {doc.status || 'Indexed'}
                  </Badge>
                </div>
                <p className="text-xs text-workspace-secondary leading-relaxed">
                  Size: {doc.size || '1.6 MB'} · Format: {doc.type || 'PDF'} · Indexed into vector store.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <button
                    className="text-[11px] font-mono text-brand-600 hover:text-brand-700 font-medium"
                    onClick={() => setCurrentRoute('documentViewer', { document: doc })}
                  >
                    View Document Details →
                  </button>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium"
                    >
                      <span>Cloudinary</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-dashed border-workspace-border text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-workspace-text">No documents in this workspace yet</h3>
              <p className="text-xs text-workspace-secondary mt-1 max-w-sm mx-auto">
                Upload architecture documents, PDFs, or specifications to index them into the vector store and generate grounded intelligence.
              </p>
            </div>
            <Button
              size="sm"
              icon={Upload}
              onClick={() => setCurrentRoute('documents')}
            >
              Upload Document
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
