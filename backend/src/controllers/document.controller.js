const {
  uploadDocumentToAIService,
  chunkDocumentWithAIService,
} = require('../services/aiServiceClient');

/**
 * Controller for Document upload & ingestion
 */
async function uploadDocument(req, res, next) {
  try {
    const aiResponse = await uploadDocumentToAIService(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse.data,
    });
  } catch (error) {
    console.error('Document upload processing error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Document ingestion failed',
      details: error.message,
    });
  }
}

/**
 * Controller for Document chunking
 */
async function chunkDocument(req, res, next) {
  try {
    const { text, strategy, chunk_size, chunk_overlap, document_id, metadata } = req.body;
    const aiResponse = await chunkDocumentWithAIService({
      text: text.trim(),
      strategy: strategy || 'fixed',
      chunk_size: typeof chunk_size === 'number' ? chunk_size : 500,
      chunk_overlap: typeof chunk_overlap === 'number' ? chunk_overlap : 100,
      document_id: document_id || undefined,
      metadata: metadata || undefined,
    });

    return res.status(200).json({
      success: true,
      gateway: 'node-backend',
      data: aiResponse,
    });
  } catch (error) {
    console.error('Document chunking processing error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Bad Gateway: Document chunking failed',
      details: error.message,
    });
  }
}

module.exports = {
  uploadDocument,
  chunkDocument,
};
