/**
 * Validates file upload request
 */
function validateUpload(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Expected multipart field "file"' });
  }
  next();
}

/**
 * Validates document chunking request
 */
function validateChunk(req, res, next) {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Field "text" is required and cannot be empty' });
  }
  next();
}

module.exports = {
  validateUpload,
  validateChunk,
};
