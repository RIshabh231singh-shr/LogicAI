import { aiClient } from './client';

export const observabilityApi = {
  /**
   * Fetch complete telemetry request traces, token metrics, and estimated USD cost
   */
  getTelemetryTraces: () => {
    return aiClient.get('/api/v1/telemetry/traces');
  },

  /**
   * Execute semantic cache check and response lookup
   */
  checkSemanticCache: (prompt) => {
    return aiClient.post('/api/v1/cache/chat', { prompt });
  },
};
