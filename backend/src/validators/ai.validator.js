/**
 * Validates request payload for Echo endpoint
 */
function validateEcho(req, res, next) {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Field "message" is required' });
  }
  next();
}

module.exports = {
  validateEcho,
};
