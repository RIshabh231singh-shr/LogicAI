const {
  generateEmbeddingWithAIService,
  calculateSimilarityWithAIService,
} = require('../services/aiServiceClient');

/**
 * Controller for Vector embedding generation
 */
async function generateEmbedding(req, res, next) {
  try {
    const { text } = req.body;
    const aiResponse = await generateEmbeddingWithAIService(text.trim());

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse,
    });
  } catch (error) {
    console.error('Embedding generation error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Embedding generation failed',
      details: error.message,
    });
  }
}

/**
 * Controller for Similarity calculation
 */
async function calculateSimilarity(req, res, next) {
  try {
    const { query, candidates } = req.body;
    const aiResponse = await calculateSimilarityWithAIService(query.trim(), candidates);

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse,
    });
  } catch (error) {
    console.error('Similarity calculation error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Similarity calculation failed',
      details: error.message,
    });
  }
}

module.exports = {
  generateEmbedding,
  calculateSimilarity,
};
