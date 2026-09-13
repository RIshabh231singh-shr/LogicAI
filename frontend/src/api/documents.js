import { apiClient } from './client';

export const documentsApi = {
  /**
   * Uploads an actual file (PDF, TXT, DOCX) to the ingestion pipeline (Cloudinary + PGVector)
   */
  uploadDocument: (file, onUploadProgress, projectId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('project_id', projectId);
    }

    return apiClient.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
  },

  /**
   * Fetches indexed documents for the authenticated user (and optional project)
   */
  getDocuments: (projectId = null) => {
    const params = projectId ? { project_id: projectId } : {};
    return apiClient.get('/api/documents', { params });
  },

  /**
   * Deletes a document from Cloudinary and PostgreSQL
   */
  deleteDocument: (documentId) => {
    return apiClient.delete(`/api/documents/${documentId}`);
  },

  /**
   * Chunks raw document text using fixed-size or sentence sliding window
   */
  chunkText: ({ text, strategy = 'fixed', chunkSize = 500, chunkOverlap = 100, documentId = '', metadata = null }) => {
    return apiClient.post('/api/documents/chunk', {
      text,
      strategy,
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
      document_id: documentId,
      metadata,
    });
  },

  /**
   * Stores generated chunks into the vector store
   */
  storeChunks: (chunks) => {
    return apiClient.post('/api/vector/store', { chunks });
  },

  /**
   * Performs ANN vector similarity search
   */
  searchVectorStore: (query, topK = 3, metadataFilter = null) => {
    return apiClient.post('/api/vector/search', {
      query,
      top_k: topK,
      metadata_filter: metadataFilter,
    });
  },
};
