const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sendEchoToAIService } = require('./services/aiServiceClient');

const app = express();
const PORT = process.env.PORT || 5000;

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend service listening on port ${PORT}`);
  });
}

module.exports = app;
