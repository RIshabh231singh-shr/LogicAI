const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Middleware that verifies the JWT from Authorization header and attaches req.user.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or malformed authorization token',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid authentication token',
    });
  }
}

module.exports = {
  requireAuth,
};
