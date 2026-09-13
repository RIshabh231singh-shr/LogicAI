/**
 * Validates vector store request
 */
function validateStoreVector(req, res, next) {
  const { chunks } = req.body;
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return res.status(400).json({ error: 'Field "chunks" must be a non-empty array' });
  }
  next();
}

/**
 * Validates vector search request
 */
function validateSearchVector(req, res, next) {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Field "query" is required and cannot be empty' });
  }
  next();
}

module.exports = {
  validateStoreVector,
  validateSearchVector,
};
