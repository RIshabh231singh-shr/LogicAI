const { executeRAGQueryWithAIService } = require('../services/aiServiceClient');

/**
 * Controller for RAG query execution scoped to the authenticated user
 */
async function executeQuery(req, res, next) {
  try {
    const { query, top_k, metadata_filter } = req.body;
    
    // Cross-user isolation: Force metadata filter to include authenticated user_id
    const scopedFilter = {
      ...(metadata_filter || {}),
      user_id: req.user.id,
    };

    const aiResponse = await executeRAGQueryWithAIService(
      query.trim(),
      typeof top_k === 'number' ? top_k : 3,
      scopedFilter
    );

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
