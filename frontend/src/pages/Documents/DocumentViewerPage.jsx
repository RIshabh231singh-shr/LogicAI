import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Bookmark,
  Search,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function DocumentViewerPage() {
  const { selectedDocument, setCurrentRoute } = useWorkspace();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = selectedDocument?.pages || 24;

  const currentContent = selectedDocument?.content || 
    `Document: ${docName}\n\nPage ${currentPage} of ${totalPages}\n\nContent indexed into vector store. Use the Analysis page or RAG Query to retrieve grounded citations and inspect parsed chunks.`;

  return (
    <div className="space-y-4 animate-fadeIn flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Controls */}
      <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-workspace-border shadow-subtle shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentRoute('documents')}
            className="text-xs font-semibold text-workspace-secondary hover:text-workspace-text flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="h-4 w-px bg-workspace-border" />
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-brand-500" />
            <span className="text-xs font-semibold text-workspace-text">{docName}</span>
            <Badge variant="success" size="sm">
              Indexed
            </Badge>
          </div>
        </div>

        {/* Page Nav */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded text-workspace-secondary hover:bg-workspace-subtle disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-workspace-secondary font-mono">
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded text-workspace-secondary hover:bg-workspace-subtle disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 3-Column Viewer Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left: Page Index */}
        <div className="col-span-2 bg-white rounded-xl border border-workspace-border p-3 flex flex-col shadow-subtle overflow-y-auto">
          <div className="text-[11px] font-semibold text-workspace-muted uppercase tracking-wider px-2 mb-2">
            Pages
          </div>
          <div className="space-y-1">
            {Array.from({ length: Math.min(12, totalPages) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === pg
                    ? 'bg-brand-50 text-brand-600 font-semibold border border-brand-200'
                    : 'text-workspace-secondary hover:bg-workspace-subtle'
                }`}
              >
                <span>Page {pg}</span>
                {pg <= 3 && <Bookmark size={11} className="text-brand-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Middle: Document Page Body */}
        <div className="col-span-7 bg-white rounded-xl border border-workspace-border p-8 shadow-subtle flex flex-col overflow-y-auto font-sans leading-relaxed">
          <div className="border-b border-workspace-border pb-4 mb-6 flex items-center justify-between text-xs text-workspace-muted">
            <span>Section Document Text</span>
            <span className="font-mono text-[11px]">Offset: pg_{currentPage}_chunk_01</span>
          </div>

          <div className="text-sm text-workspace-text whitespace-pre-wrap leading-relaxed">
            {currentContent}
          </div>
        </div>

        {/* Right: Verified Evidence & Citations */}
        <div className="col-span-3 bg-white rounded-xl border border-workspace-border p-4 flex flex-col shadow-subtle space-y-4 overflow-y-auto">
          <div className="text-[11px] font-semibold text-workspace-muted uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-500" />
            Verified Evidence
          </div>

          <div className="p-3 bg-workspace-subtle/70 rounded-lg border border-workspace-border space-y-1.5 text-xs">
            <div className="font-semibold text-workspace-text">Finding #1</div>
            <p className="text-workspace-secondary text-[11px] leading-relaxed">
              API specifications designate PostgreSQL with pgvector as the primary retrieval store.
            </p>
            <div className="pt-1 text-[10px] font-mono text-brand-600">
              Source: {docName} · p.{currentPage}
            </div>
          </div>

          <div className="p-3 bg-workspace-subtle/70 rounded-lg border border-workspace-border space-y-1.5 text-xs">
            <div className="font-semibold text-workspace-text">Finding #2</div>
            <p className="text-workspace-secondary text-[11px] leading-relaxed">
              Hybrid search combines BM25 keyword matching with dense vectors using Reciprocal Rank Fusion.
            </p>
            <div className="pt-1 text-[10px] font-mono text-brand-600">
              Source: {docName} · p.{currentPage}
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-workspace-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setCurrentRoute('analysis')}
            >
              Analyze in Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
