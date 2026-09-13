const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health.routes');
const aiRoutes = require('./routes/ai.routes');
const chatRoutes = require('./routes/chat.routes');
const documentRoutes = require('./routes/document.routes');
const embeddingRoutes = require('./routes/embedding.routes');
const vectorRoutes = require('./routes/vector.routes');
const ragRoutes = require('./routes/rag.routes');

const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routes
app.use('/', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/embeddings', embeddingRoutes);
app.use('/api/vector', vectorRoutes);
app.use('/api/rag', ragRoutes);

// Catch-all 404 for unmatched routes
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
