const {
  storeVectorChunksWithAIService,
  searchVectorStoreWithAIService,
} = require('../services/aiServiceClient');

/**
 * Controller for Vector storage
 */
async function storeVectorChunks(req, res, next) {
  try {
    const { chunks } = req.body;
    const aiResponse = await storeVectorChunksWithAIService(chunks);

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse,
    });
  } catch (error) {
    console.error('Vector store error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Vector store failed',
      details: error.message,
    });
  }
}

/**
 * Controller for Vector similarity search
 */
async function searchVectorStore(req, res, next) {
  try {
    const { query, top_k, metadata_filter } = req.body;
    const aiResponse = await searchVectorStoreWithAIService(
      query.trim(),
      typeof top_k === 'number' ? top_k : 3,
      metadata_filter || undefined
    );

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse,
    });
  } catch (error) {
    console.error('Vector search error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Vector search failed',
      details: error.message,
    });
  }
}

module.exports = {
  storeVectorChunks,
  searchVectorStore,
};
