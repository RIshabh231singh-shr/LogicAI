import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Zap,
  Clock,
  Coins,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Search,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Dialog from '../../components/ui/Dialog';
import { observabilityApi } from '../../api/observability';
import { useToast } from '../../components/ui/Toast';

export default function ObservabilityPage() {
  const { addToast } = useToast();
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTrace, setActiveTrace] = useState(null);
  const [cacheQuery, setCacheQuery] = useState('What is the remote work policy?');
  const [cacheResult, setCacheResult] = useState(null);
  const [checkingCache, setCheckingCache] = useState(false);

  const fetchTraces = async () => {
    setLoading(true);
    try {
      const data = await observabilityApi.getTelemetryTraces();
      setTelemetry(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces();
  }, []);

  const handleTestCache = async () => {
    if (!cacheQuery.trim()) return;
    setCheckingCache(true);
    try {
      const res = await observabilityApi.checkSemanticCache(cacheQuery);
      setCacheResult(res);
      addToast(res.cached ? 'Semantic Cache HIT (< 2ms)!' : 'Semantic Cache MISS. Query executed.');
    } catch (err) {
      addToast(err.message || 'Cache check failed.', 'error');
    } finally {
      setCheckingCache(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-workspace-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-workspace-text">
            Observability &amp; Telemetry
          </h1>
          <p className="text-xs text-workspace-secondary mt-1">
            Real-time LLM inference telemetry, request latencies, token consumption, and semantic vector caching.
          </p>
        </div>
        <Button
          variant="secondary"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchTraces}
        >
          Refresh Traces
        </Button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle">
          <div className="text-[11px] font-semibold text-workspace-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Activity size={14} className="text-brand-500" />
            Total Recorded Traces
          </div>
          <div className="text-2xl font-bold text-workspace-text font-mono">
            {telemetry?.trace_count || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle">
          <div className="text-[11px] font-semibold text-workspace-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Cpu size={14} className="text-emerald-500" />
            Total Tokens Consumed
          </div>
          <div className="text-2xl font-bold text-workspace-text font-mono">
            {telemetry?.total_tokens_consumed?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle">
          <div className="text-[11px] font-semibold text-workspace-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Coins size={14} className="text-purple-500" />
            Estimated USD Cost
          </div>
          <div className="text-2xl font-bold text-workspace-text font-mono">
            ${telemetry?.total_cost_usd || '0.000000'}
          </div>
        </div>
      </div>

      {/* Semantic Response Cache Tester */}
      <div className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-workspace-text flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            Semantic Cache Lookup (Redis Vector Cache)
          </div>
          <span className="text-[11px] text-workspace-muted">
            Cosine similarity threshold: 0.95
          </span>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={cacheQuery}
            onChange={(e) => setCacheQuery(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-workspace-border bg-workspace-subtle/50 text-workspace-text focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="Enter query to check semantic cache hit..."
          />
          <Button size="sm" loading={checkingCache} onClick={handleTestCache} icon={Search}>
            Test Cache
          </Button>
        </div>

        {cacheResult && (
          <div className={`p-3 rounded-lg border text-xs ${
            cacheResult.cached 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-zinc-50 text-zinc-700 border-zinc-200'
          }`}>
            <span className="font-semibold">{cacheResult.cached ? 'CACHE HIT: ' : 'CACHE MISS: '}</span>
            {cacheResult.cached
              ? `Retrieved pre-computed answer instantly (Similarity: ${cacheResult.similarity_score})`
              : 'No matching vector found. Full LLM inference executed.'
            }
          </div>
        )}
      </div>

      {/* Request Traces Table */}
      <div className="bg-white rounded-xl border border-workspace-border shadow-subtle overflow-hidden">
        <div className="px-6 py-4 border-b border-workspace-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-workspace-text uppercase tracking-wider">
            Live Request Trace Log
          </h3>
          <span className="text-[11px] text-workspace-muted font-mono">
            {telemetry?.traces?.length || 0} traces recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-workspace-secondary">
            <thead className="bg-workspace-subtle/70 text-[11px] font-semibold text-workspace-muted uppercase tracking-wider border-b border-workspace-border">
              <tr>
                <th className="px-5 py-3">Trace ID</th>
                <th className="px-5 py-3">Endpoint Route</th>
                <th className="px-5 py-3">Latency</th>
                <th className="px-5 py-3">Tokens</th>
                <th className="px-5 py-3">Est. Cost</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-workspace-border font-mono">
              {telemetry?.traces?.slice(0, 15).map((t, idx) => (
                <tr
                  key={idx}
                  onClick={() => setActiveTrace(t)}
                  className="hover:bg-workspace-subtle/40 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3 text-brand-600 font-medium">
                    {t.trace_id?.slice(0, 14)}
                  </td>
                  <td className="px-5 py-3 text-workspace-text font-sans font-medium">
                    {t.path}
                  </td>
                  <td className="px-5 py-3 text-amber-600">
                    {t.total_latency_ms ? `${t.total_latency_ms.toFixed(1)}ms` : '1.2ms'}
                  </td>
                  <td className="px-5 py-3 text-workspace-secondary">
                    {t.llm_usage?.total_tokens || 0}
                  </td>
                  <td className="px-5 py-3 text-purple-600">
                    ${t.estimated_cost_usd?.toFixed(6) || '0.000000'}
                  </td>
                  <td className="px-5 py-3 font-sans">
                    <Badge variant={t.status === 'SUCCESS' ? 'success' : 'danger'} size="sm">
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ChevronRight size={14} className="text-workspace-muted group-hover:text-brand-500 inline transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trace Details Modal */}
      <Dialog
        isOpen={Boolean(activeTrace)}
        onClose={() => setActiveTrace(null)}
        title="Trace Inspection Details"
        description={`Trace ID: ${activeTrace?.trace_id || ''}`}
        maxWidth="max-w-2xl"
      >
        {activeTrace && (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-workspace-subtle rounded-lg border border-workspace-border space-y-1">
              <div className="text-[11px] text-workspace-muted font-sans uppercase">Prompt Ingested</div>
              <div className="text-workspace-text font-sans text-xs">{activeTrace.prompt}</div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-workspace-muted font-sans uppercase font-semibold">Execution Steps</div>
              <div className="space-y-1.5">
                {activeTrace.steps?.map((s, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-workspace-border rounded-md flex items-center justify-between">
                    <span className="font-semibold text-brand-600">Step {s.step_index}: {s.step_name}</span>
                    <span className="text-workspace-muted">+{s.elapsed_ms?.toFixed(2)}ms</span>
                  </div>
                ))}
              </div>
            </div>

            <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-lg text-[11px] overflow-x-auto">
              {JSON.stringify(activeTrace, null, 2)}
            </pre>
          </div>
        )}
      </Dialog>
    </div>
  );
}
