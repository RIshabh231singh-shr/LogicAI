const app = require('./app');
const config = require('./config/env');
const { initDb } = require('./config/db');

// Initialize database tables before listening or asynchronously
initDb().catch((err) => {
  console.error('Database initialization warning:', err.message);
});

const server = app.listen(config.port, () => {
  console.log(`Backend service listening on port ${config.port} (${config.nodeEnv})`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
