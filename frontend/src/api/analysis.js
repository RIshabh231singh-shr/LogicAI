import { apiClient, aiClient } from './client';

export const analysisApi = {
  /**
   * Run grounded RAG query with retrieved citations
   */
  runRAGQuery: (query, topK = 3, metadataFilter = null) => {
    return apiClient.post('/api/rag/query', {
      query,
      top_k: topK,
      metadata_filter: metadataFilter,
    });
  },

  /**
   * Run hybrid search + reranking
   */
  runHybridRetrieval: (query, topK = 3) => {
    return aiClient.post('/api/v1/retrieval/hybrid', {
      query,
      top_k: topK,
    });
  },

  /**
   * Run query rewrite analysis
   */
  rewriteQuery: (query) => {
    return aiClient.post('/api/v1/retrieval/rewrite', { query });
  },

  /**
   * Multi-query expansion
   */
  expandQuery: (query) => {
    return aiClient.post('/api/v1/retrieval/multi-query', { query });
  },

  /**
   * Run agent state loop
   */
  runAgent: (query) => {
    return aiClient.post('/api/v1/agent/run', { query });
  },

  /**
   * Multi-turn conversational memory chat
   */
  sendMemoryMessage: (sessionId, prompt) => {
    return aiClient.post('/api/v1/memory/chat', {
      session_id: sessionId,
      prompt,
    });
  },
};
