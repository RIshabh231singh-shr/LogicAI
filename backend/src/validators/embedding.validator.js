/**
 * Validates embedding generation request
 */
function validateGenerateEmbedding(req, res, next) {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Field "text" is required and cannot be empty' });
  }
  next();
}

/**
 * Validates similarity calculation request
 */
function validateSimilarity(req, res, next) {
  const { query, candidates } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Field "query" is required and cannot be empty' });
  }
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: 'Field "candidates" must be a non-empty array' });
  }
  next();
}

module.exports = {
  validateGenerateEmbedding,
  validateSimilarity,
};
