const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const { 
  sendEchoToAIService, 
  sendChatToAIService, 
  uploadDocumentToAIService 
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend service listening on port ${PORT}`);
  });
}

module.exports = app;
