import { aiClient } from './client';

export const evaluationApi = {
  /**
   * Run quantitative RAG evaluation benchmark
   */
  runEvaluationBenchmark: (items) => {
    return aiClient.post('/api/v1/eval/run', { items });
  },
};
