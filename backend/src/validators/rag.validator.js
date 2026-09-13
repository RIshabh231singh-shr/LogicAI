/**
 * Validates RAG query request
 */
function validateRAGQuery(req, res, next) {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Field "query" is required and cannot be empty' });
  }
  next();
}

module.exports = {
  validateRAGQuery,
};
