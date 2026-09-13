import { apiClient, aiClient } from './client';

export const systemApi = {
  checkBackendHealth: () => apiClient.get('/api/health'),
  checkAiHealth: () => aiClient.get('/health'),
  getEcho: (message) => apiClient.post('/api/ai/echo', { message }),
};
