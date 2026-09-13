const config = require('../config/env');

/**
 * 404 Not Found handler for unmatched routes
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Not Found - ${req.originalUrl}`,
  });
}

/**
 * Global Express error handling middleware
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500;
  
  const response = {
    success: false,
    error: err.message || 'Internal Server Error',
  };

  if (err.details) {
    response.details = err.details;
  }

  // Include stack trace only in development
  if (config.nodeEnv === 'development' && !err.isOperational && err.stack) {
    response.stack = err.stack;
  }

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
