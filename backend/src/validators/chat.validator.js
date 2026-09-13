/**
 * Validates request payload for Chat endpoint
 */
function validateChat(req, res, next) {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Field "prompt" is required and cannot be empty' });
  }
  next();
}

module.exports = {
  validateChat,
};
