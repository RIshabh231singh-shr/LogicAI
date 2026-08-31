const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Sends a message to the Python AI service echo endpoint.
 * @param {string} message 
 * @returns {Promise<object>}
 */
async function sendEchoToAIService(message) {
  const endpoint = `${AI_SERVICE_URL}/api/v1/echo`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`AI Service Error (${response.status}): ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('AI Service request timed out after 5000ms');
    }
    throw error;
  }
}

module.exports = {
  sendEchoToAIService,
};
