const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { 
  sendEchoToAIService, 
  sendChatToAIService, 
  uploadDocumentToAIService,
  chunkDocumentWithAIService,
  generateEmbeddingWithAIService,
  calculateSimilarityWithAIService,
  storeVectorChunksWithAIService,
  searchVectorStoreWithAIService
} = require('./services/aiServiceClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure in-memory storage for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Inter-Service Communication Endpoint
app.post('/api/ai/echo', async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Field "message" is required' });
  }

  try {
    const aiResponse = await sendEchoToAIService(message);
    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      aiServiceResponse: aiResponse
    });
  } catch (error) {
    console.error('Failed to communicate with AI Service:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Failed to communicate with Python AI Service',
      details: error.message
    });
  }
});

// LLM Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { prompt, system_prompt, temperature, structured } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Field "prompt" is required and cannot be empty' });
  }

  try {
    const aiResponse = await sendChatToAIService({
      prompt: prompt.trim(),
      system_prompt: system_prompt || undefined,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      structured: Boolean(structured)
    });

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse
    });
  } catch (error) {
    console.error('LLM Chat processing error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: LLM chat processing failed',
      details: error.message
    });
  }
});

// Document Upload Endpoint
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded. Expected multipart field "file"' });
  }

  try {
    const aiResponse = await uploadDocumentToAIService(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse.data
    });
  } catch (error) {
    console.error('Document upload processing error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Document ingestion failed',
      details: error.message
    });
  }
});

// Document Chunking Endpoint
app.post('/api/documents/chunk', async (req, res) => {
  const { text, strategy, chunk_size, chunk_overlap, document_id, metadata } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Field "text" is required and cannot be empty' });
  }

  try {
    const aiResponse = await chunkDocumentWithAIService({
      text: text.trim(),
      strategy: strategy || 'fixed',
      chunk_size: typeof chunk_size === 'number' ? chunk_size : 500,
      chunk_overlap: typeof chunk_overlap === 'number' ? chunk_overlap : 100,
      document_id: document_id || undefined,
      metadata: metadata || undefined
    });

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse
    });
  } catch (error) {
    console.error('Document chunking processing error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Document chunking failed',
      details: error.message
    });
  }
});

// Generate Embedding Endpoint
app.post('/api/embeddings/generate', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Field "text" is required and cannot be empty' });
  }

  try {
    const aiResponse = await generateEmbeddingWithAIService(text.trim());
    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse
    });
  } catch (error) {
    console.error('Embedding generation error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Embedding generation failed',
      details: error.message
    });
  }
});

// Similarity Ranking Endpoint
app.post('/api/embeddings/similarity', async (req, res) => {
  const { query, candidates } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Field "query" is required and cannot be empty' });
  }
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: 'Field "candidates" must be a non-empty array' });
  }

  try {
    const aiResponse = await calculateSimilarityWithAIService(query.trim(), candidates);
    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse
    });
  } catch (error) {
    console.error('Similarity calculation error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Similarity calculation failed',
      details: error.message
    });
  }
});

// Store Vector Chunks Endpoint
app.post('/api/vector/store', async (req, res) => {
  const { chunks } = req.body;

  if (!Array.isArray(chunks) || chunks.length === 0) {
    return res.status(400).json({ error: 'Field "chunks" must be a non-empty array' });
  }

  try {
    const aiResponse = await storeVectorChunksWithAIService(chunks);
    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse
    });
  } catch (error) {
    console.error('Vector store error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Vector store failed',
      details: error.message
    });
  }
});

// Vector Search Endpoint
app.post('/api/vector/search', async (req, res) => {
  const { query, top_k, metadata_filter } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Field "query" is required and cannot be empty' });
  }

  try {
    const aiResponse = await searchVectorStoreWithAIService(
      query.trim(),
      typeof top_k === 'number' ? top_k : 3,
      metadata_filter || undefined
    );

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse
    });
  } catch (error) {
    console.error('Vector search error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Vector search failed',
      details: error.message
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend service listening on port ${PORT}`);
  });
}

module.exports = app;
