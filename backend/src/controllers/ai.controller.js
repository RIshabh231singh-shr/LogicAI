const { sendEchoToAIService } = require('../services/aiServiceClient');

/**
 * Controller for AI inter-service communication / echo
 */
async function postEcho(req, res, next) {
  try {
    const { message } = req.body;
    const aiResponse = await sendEchoToAIService(message);
    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      aiServiceResponse: aiResponse,
    });
  } catch (error) {
    console.error('Failed to communicate with AI Service:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Failed to communicate with Python AI Service',
      details: error.message,
    });
  }
}

module.exports = {
  postEcho,
};
