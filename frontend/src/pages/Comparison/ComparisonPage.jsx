import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { comparisonApi } from '../../api/comparison';

export default function ComparisonPage() {
  const { projects } = useWorkspace();
  const [projectAId, setProjectAId] = useState(projects[0]?.id || '');
  const [projectBId, setProjectBId] = useState(projects[1]?.id || projects[0]?.id || '');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const projectA = projects.find((p) => p.id === projectAId) || projects[0];
  const projectB = projects.find((p) => p.id === projectBId) || projects[1] || projects[0];

  const handleRunComparison = async () => {
    if (!projectA || !projectB) return;
    setLoading(true);
    try {
      const data = await comparisonApi.compareProjects(projectA, projectB);
      setComparisonData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectA && projectB) {
      handleRunComparison();
    }
  }, [projectAId, projectBId]);

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl">
      {/* Header */}
      <div className="pb-6 border-b border-workspace-border">
        <h1 className="text-2xl font-bold tracking-tight text-workspace-text">
          Project &amp; Architecture Comparison
        </h1>
        <p className="text-xs text-workspace-secondary mt-1">
          Perform multi-dimensional architectural diffs across systems, technical stacks, security gates, and documented risks.
        </p>
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-workspace-text mb-2">
            Base Workspace (Project A)
          </label>
          <select
            value={projectAId}
            onChange={(e) => setProjectAId(e.target.value)}
            className="w-full text-xs font-medium text-workspace-text bg-workspace-subtle border border-workspace-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.documentCount} docs)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-workspace-text mb-2">
            Comparison Target (Project B)
          </label>
          <select
            value={projectBId}
            onChange={(e) => setProjectBId(e.target.value)}
            className="w-full text-xs font-medium text-workspace-text bg-workspace-subtle border border-workspace-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.documentCount} docs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid Table */}
      {comparisonData && (
        <div className="bg-white rounded-xl border border-workspace-border shadow-subtle overflow-hidden">
          <div className="grid grid-cols-12 bg-workspace-subtle/70 text-[11px] font-semibold text-workspace-muted uppercase tracking-wider border-b border-workspace-border px-6 py-3.5">
            <div className="col-span-3">Evaluation Dimension</div>
            <div className="col-span-4 text-workspace-text">{projectA?.name}</div>
            <div className="col-span-4 text-workspace-text">{projectB?.name}</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          <div className="divide-y divide-workspace-border">
            {comparisonData.categories.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 px-6 py-4 text-xs hover:bg-workspace-subtle/30 transition-colors">
                <div className="col-span-3 font-semibold text-workspace-text pr-4">
                  {row.category}
                </div>
                <div className="col-span-4 text-workspace-secondary pr-4 leading-relaxed font-sans">
                  {row.projectAValue}
                </div>
                <div className="col-span-4 text-workspace-secondary pr-4 leading-relaxed font-sans">
                  {row.projectBValue}
                </div>
                <div className="col-span-1 text-right">
                  <Badge variant="primary" size="sm">
                    Diff
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
