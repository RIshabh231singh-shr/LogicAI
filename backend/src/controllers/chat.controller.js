const { sendChatToAIService } = require('../services/aiServiceClient');

/**
 * Controller for LLM chat completions
 */
async function postChat(req, res, next) {
  try {
    const { prompt, system_prompt, temperature, structured } = req.body;
    const aiResponse = await sendChatToAIService({
      prompt: prompt.trim(),
      system_prompt: system_prompt || undefined,
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      structured: Boolean(structured),
    });

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse,
    });
  } catch (error) {
    console.error('LLM Chat processing error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: LLM chat processing failed',
      details: error.message,
    });
  }
}

module.exports = {
  postChat,
};
