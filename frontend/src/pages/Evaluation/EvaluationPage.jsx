import React, { useState } from 'react';
import {
  CheckSquare,
  Play,
  CheckCircle2,
  BarChart3,
  Gauge,
  Layers,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { evaluationApi } from '../../api/evaluation';
import { useToast } from '../../components/ui/Toast';

export default function EvaluationPage() {
  const { addToast } = useToast();
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const sampleItems = [
    {
      query: 'What is the employee annual leave policy?',
      expected_answer: 'Regular full-time employees accrue 20 annual leave days per year.',
      expected_source: 'Employee_Handbook.pdf',
      expected_page: 24,
    },
    {
      query: 'What are the rules regarding remote work?',
      expected_answer: 'Employees are permitted to work remotely up to two days per week with manager approval.',
      expected_source: 'Remote_Work_Policy.docx',
      expected_page: 5,
    }
  ];

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await evaluationApi.runEvaluationBenchmark(sampleItems);
      setEvalResult(res);
      addToast('Evaluation benchmark executed cleanly.');
    } catch (err) {
      addToast(err.message || 'Evaluation benchmark failed.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const scores = evalResult?.aggregate_scores;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-workspace-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-workspace-text">
            Model Evaluation &amp; Benchmarks
          </h1>
          <p className="text-xs text-workspace-secondary mt-1">
            Compute ground-truth Context Precision, Context Recall, Faithfulness, and Answer Relevance.
          </p>
        </div>
        <Button icon={Play} loading={evaluating} onClick={handleRunEvaluation}>
          Run Evaluation Benchmark
        </Button>
      </div>

      {/* Aggregate Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Context Precision', value: scores ? `${(scores.mean_context_precision * 100).toFixed(1)}%` : '—', desc: 'Signal-to-noise ratio' },
          { label: 'Context Recall', value: scores ? `${(scores.mean_context_recall * 100).toFixed(1)}%` : '—', desc: 'Retrieved ground-truth' },
          { label: 'Faithfulness', value: scores ? `${(scores.mean_faithfulness * 100).toFixed(1)}%` : '—', desc: 'Hallucination check' },
          { label: 'Answer Relevance', value: scores ? `${(scores.mean_answer_relevance * 100).toFixed(1)}%` : '—', desc: 'Query alignment score' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-5 rounded-xl border border-workspace-border shadow-subtle">
            <div className="text-[11px] font-semibold text-workspace-muted uppercase tracking-wider mb-1">
              {m.label}
            </div>
            <div className="text-2xl font-bold text-workspace-text font-mono">
              {m.value}
            </div>
            <div className="text-[11px] text-workspace-secondary mt-1">{m.desc}</div>
          </div>
        ))}
      </div>

      {/* Breakdown Table */}
      {evalResult && (
        <div className="bg-white rounded-xl border border-workspace-border shadow-subtle overflow-hidden">
          <div className="px-6 py-4 border-b border-workspace-border flex items-center justify-between">
            <h3 className="text-xs font-semibold text-workspace-text uppercase tracking-wider">
              Benchmark Item Results ({evalResult.evaluated_count})
            </h3>
            <Badge variant="success" size="sm">Benchmark Complete</Badge>
          </div>

          <div className="divide-y divide-workspace-border">
            {evalResult.item_breakdown.map((item, idx) => (
              <div key={idx} className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs font-semibold text-workspace-text">
                    Q: {item.query}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <Badge variant="primary" size="sm">Precision: {item.metrics.context_precision}</Badge>
                    <Badge variant="success" size="sm">Recall: {item.metrics.context_recall}</Badge>
                    <Badge variant="purple" size="sm">Faithfulness: {item.metrics.faithfulness}</Badge>
                  </div>
                </div>
                <div className="text-xs text-workspace-secondary bg-workspace-subtle/50 p-3 rounded-lg border border-workspace-border font-sans leading-relaxed">
                  <span className="font-semibold text-workspace-text">Synthesized: </span>
                  {item.generated_answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
