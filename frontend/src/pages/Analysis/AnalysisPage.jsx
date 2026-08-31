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

  const projectTitle = selectedProject?.name || 'Enterprise Core Banking Platform';

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
              Generated from {selectedProject?.documentCount || 4} verified documents
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-workspace-text">
            {projectTitle} — System Analysis
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
            placeholder="e.g. What is the remote work policy or service architecture?"
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
                        <span>{cit.source || 'Architecture_Spec.pdf'} · p.{cit.page_number || 1}</span>
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

      {/* Section 1: Executive Summary */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-workspace-text flex items-center gap-2">
          <BookOpen size={16} className="text-brand-500" />
          1. Executive Summary
        </h2>
        <div className="bg-white p-6 rounded-xl border border-workspace-border shadow-subtle space-y-3">
          <p className="text-xs text-workspace-secondary leading-relaxed font-sans">
            The analyzed project specification outlines a resilient, decoupled microservices architecture designed to support high-throughput, low-latency financial transactions and document operations. The system is engineered around an independent Node.js API Gateway coordinating with an asynchronous Python FastAPI GenAI and analytics engine.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-brand-600 font-medium">
            <span className="cursor-pointer hover:underline" onClick={() => setCurrentRoute('documents')}>
              Source: Core_Banking_Architecture.pdf · p.2
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:underline" onClick={() => setCurrentRoute('documents')}>
              Source: API_Gateway_Specifications.pdf · p.4
            </span>
          </div>
        </div>
      </section>

      {/* Section 2: Key Findings */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-workspace-text flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          2. Key Findings &amp; Architecture Decisions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-workspace-text">
                PostgreSQL + pgvector Dense Indexing
              </span>
              <Badge variant="success" size="sm">Verified</Badge>
            </div>
            <p className="text-xs text-workspace-secondary leading-relaxed">
              384-dimensional dense vectors generated with sentence-transformers are persisted in PostgreSQL using the pgvector extension, enabling unified relational metadata filtering with cosine similarity retrieval.
            </p>
            <div className="pt-2 text-[10px] font-mono text-brand-600 cursor-pointer hover:underline" onClick={() => setCurrentRoute('documents')}>
              Core_Banking_Architecture.pdf · p.8
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-workspace-text">
                Hybrid Search with Reciprocal Rank Fusion
              </span>
              <Badge variant="success" size="sm">Verified</Badge>
            </div>
            <p className="text-xs text-workspace-secondary leading-relaxed">
              Dense semantic similarity scores are fused with sparse BM25 keyword matching via Reciprocal Rank Fusion (RRF) to eliminate vocabulary mismatch across specialized financial nomenclature.
            </p>
            <div className="pt-2 text-[10px] font-mono text-brand-600 cursor-pointer hover:underline" onClick={() => setCurrentRoute('documents')}>
              API_Gateway_Specifications.pdf · p.12
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Identified Risks */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-workspace-text flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          3. Technical Risks &amp; Vulnerability Vectors
        </h2>
        <div className="bg-white p-6 rounded-xl border border-workspace-border shadow-subtle space-y-4">
          <div className="flex items-start gap-3 pb-4 border-b border-workspace-border">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-workspace-text">
                Context Window Saturation on Large Documents
              </div>
              <p className="text-xs text-workspace-secondary mt-0.5 leading-relaxed">
                Large RFP tables exceed single-chunk character limits. Mitigated by applying 500-char sliding windows with 100-char overlap.
              </p>
              <div className="mt-1.5 text-[10px] font-mono text-workspace-muted">
                Observed in: Cloud_Infrastructure_Terraform.txt · p.4
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-workspace-text">
                Prompt Injection &amp; Unauthorized Data Access
              </div>
              <p className="text-xs text-workspace-secondary mt-0.5 leading-relaxed">
                System enforces a 4-tier Role-Based Access Control gate and regex-based prompt injection pattern blocker before LLM synthesis.
              </p>
              <div className="mt-1.5 text-[10px] font-mono text-workspace-muted">
                Observed in: Security_RBAC_Matrix.xlsx · p.2
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Recommendations */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-workspace-text flex items-center gap-2">
          <Layers size={16} className="text-purple-500" />
          4. Strategic Recommendations
        </h2>
        <div className="bg-white p-6 rounded-xl border border-workspace-border shadow-subtle space-y-3">
          <ul className="text-xs text-workspace-secondary space-y-2 list-disc list-inside leading-relaxed">
            <li><strong className="text-workspace-text">Implement Semantic Response Caching:</strong> Cache common architectural query embeddings in Redis with a 0.95 cosine threshold to drop latency under 2ms.</li>
            <li><strong className="text-workspace-text">Adopt Cross-Encoder Reranking:</strong> Run the top 20 candidate vector chunks through cross-encoder scoring prior to LLM context construction.</li>
            <li><strong className="text-workspace-text">Continuous Automated Faithfulness Scoring:</strong> Track mean context precision and faithfulness continuously using the evaluation harness.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
