const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Sends a message to the Python AI service echo endpoint.
 * @param {string} message 
 * @returns {Promise<object>}
 */
async function sendEchoToAIService(message) {
  const endpoint = `${AI_SERVICE_URL}/api/v1/echo`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

/**
 * Sends a chat request to the Python AI service.
 * @param {object} chatPayload { prompt, system_prompt, temperature, structured }
 * @returns {Promise<object>}
 */
async function sendChatToAIService(chatPayload) {
  const endpoint = `${AI_SERVICE_URL}/api/v1/chat`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chatPayload),
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
      throw new Error('AI Service LLM request timed out after 10000ms');
    }
    throw error;
  }
}

/**
 * Uploads a document buffer to the Python AI service.
 * @param {Buffer} fileBuffer 
 * @param {string} filename 
 * @param {string} mimeType 
 * @returns {Promise<object>}
 */
async function uploadDocumentToAIService(fileBuffer, filename, mimeType) {
  const endpoint = `${AI_SERVICE_URL}/api/v1/documents/ingest`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: mimeType || 'application/octet-stream' });
    formData.append('file', blob, filename);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
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
      throw new Error('AI Service document upload timed out after 15000ms');
    }
    throw error;
  }
}

/**
 * Requests chunking of text from the Python AI service.
 * @param {object} chunkPayload { text, strategy, chunk_size, chunk_overlap, document_id, metadata }
 * @returns {Promise<object>}
 */
async function chunkDocumentWithAIService(chunkPayload) {
  const endpoint = `${AI_SERVICE_URL}/api/v1/documents/chunk`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chunkPayload),
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
      throw new Error('AI Service document chunking timed out after 10000ms');
    }
    throw error;
  }
}

/**
 * Generates vector embedding from Python AI service.
 * @param {string} text 
 * @returns {Promise<object>}
 */
async function generateEmbeddingWithAIService(text) {
  const endpoint = `${AI_SERVICE_URL}/api/v1/embeddings/generate`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
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
      throw new Error('AI Service embedding generation timed out after 5000ms');
    }
    throw error;
  }
}

/**
 * Calculates similarity ranking between query and candidates via Python AI service.
 * @param {string} query 
 * @param {Array<string>} candidates 
 * @returns {Promise<object>}
 */
async function calculateSimilarityWithAIService(query, candidates) {
  const endpoint = `${AI_SERVICE_URL}/api/v1/embeddings/similarity`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, candidates }),
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
      throw new Error('AI Service similarity calculation timed out after 10000ms');
    }
    throw error;
  }
}

module.exports = {
  sendEchoToAIService,
  sendChatToAIService,
  uploadDocumentToAIService,
  chunkDocumentWithAIService,
  generateEmbeddingWithAIService,
  calculateSimilarityWithAIService,
};
