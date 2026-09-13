const { query: dbQuery } = require('../config/db');
const {
  executeRAGQueryWithAIService,
  storeVectorChunksWithAIService,
} = require('../services/aiServiceClient');

/**
 * Controller for RAG query execution scoped to the authenticated user.
 * Automatically ensures user's indexed chunks in PostgreSQL are hydrated into the vector store.
 */
async function executeQuery(req, res, next) {
  try {
    const { query: queryText, top_k, metadata_filter } = req.body;
    const userId = req.user.id;

    if (!queryText || !queryText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query string is required and cannot be empty',
      });
    }

    // 1. Fetch user's chunks from PostgreSQL to guarantee vector store hydration
    try {
      const chunksResult = await dbQuery(
        `SELECT c.id, c.document_id, c.chunk_text, c.page_number, c.metadata, d.filename, d.original_name, d.project_id
         FROM document_chunks c
         JOIN documents d ON d.id = c.document_id
         WHERE c.user_id = $1`,
        [userId]
      );

      if (chunksResult.rows.length > 0) {
        const chunksToSync = chunksResult.rows.map((r) => ({
          chunk_id: r.id,
          document_id: r.document_id,
          text: r.chunk_text,
          page_number: r.page_number || 1,
          metadata: {
            ...(r.metadata || {}),
            user_id: userId,
            project_id: r.project_id,
            filename: r.original_name || r.filename,
          },
        }));

        await storeVectorChunksWithAIService(chunksToSync);
      }
    } catch (syncErr) {
      console.warn('Vector store chunk hydration warning (continuing):', syncErr.message);
    }

    // 2. Cross-user isolation: strictly scope by user_id
    const scopedFilter = {
      user_id: userId,
    };

    // If metadata_filter specifies a project_id, also apply it
    if (metadata_filter && metadata_filter.project_id) {
      scopedFilter.project_id = metadata_filter.project_id;
    }

    let aiResponse = await executeRAGQueryWithAIService(
      queryText.trim(),
      typeof top_k === 'number' ? top_k : 3,
      scopedFilter
    );

    // If no chunks were found with project_id filter, fallback to user_id filter
    // (in case document was uploaded prior to project assignment)
    if (
      scopedFilter.project_id &&
      (!aiResponse.data?.retrieved_chunks || aiResponse.data.retrieved_chunks.length === 0)
    ) {
      aiResponse = await executeRAGQueryWithAIService(
        queryText.trim(),
        typeof top_k === 'number' ? top_k : 3,
        { user_id: userId }
      );
    }

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse.data,
    });
  } catch (error) {
    console.error('RAG Query execution error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: RAG query execution failed',
      details: error.message,
    });
  }
}

module.exports = {
  executeQuery,
};
