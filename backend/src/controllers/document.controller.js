const {
  uploadDocumentToAIService,
  chunkDocumentWithAIService,
  storeVectorChunksWithAIService,
} = require('../services/aiServiceClient');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { query } = require('../config/db');

/**
 * Controller for Document upload & ingestion:
 * 1. Uploads original document to Cloudinary
 * 2. Persists document metadata in PostgreSQL
 * 3. Sends to AI service for text extraction & chunking
 * 4. Stores chunks in Vector Store & PostgreSQL tagged with user_id
 */
async function uploadDocument(req, res, next) {
  try {
    const userId = req.user.id;
    const projectId = req.body.project_id || req.body.projectId || null;
    const file = req.file;

    // Validate project ownership if projectId provided
    if (projectId) {
      const projCheck = await query('SELECT id FROM projects WHERE id = $1 AND user_id = $2', [
        projectId,
        userId,
      ]);
      if (projCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Specified project does not exist or unauthorized',
        });
      }
    }

    // 1. Upload file buffer to Cloudinary
    let cloudResult = { public_id: '', secure_url: '' };
    try {
      cloudResult = await uploadBufferToCloudinary(file.buffer, file.originalname);
    } catch (cloudErr) {
      console.warn('Cloudinary upload warning (proceeding):', cloudErr.message);
    }

    // 2. Persist document record in PostgreSQL
    const docInsert = await query(
      `INSERT INTO documents (user_id, project_id, filename, original_name, cloudinary_public_id, cloudinary_url, mime_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        projectId,
        file.originalname,
        file.originalname,
        cloudResult.public_id || null,
        cloudResult.secure_url || null,
        file.mimetype,
        file.size,
      ]
    );

    const savedDoc = docInsert.rows[0];

    // 3. Forward to Python AI service for text extraction
    let aiExtractData = null;
    let chunks = [];
    try {
      const aiResponse = await uploadDocumentToAIService(
        file.buffer,
        file.originalname,
        file.mimetype
      );
      aiExtractData = aiResponse.data;

      // 4. Chunk the extracted text if present
      if (aiExtractData && aiExtractData.full_text && aiExtractData.full_text.trim()) {
        const chunkRes = await chunkDocumentWithAIService({
          text: aiExtractData.full_text,
          strategy: 'fixed',
          chunk_size: 500,
          chunk_overlap: 100,
          document_id: savedDoc.id,
          metadata: {
            user_id: userId,
            project_id: projectId,
            document_id: savedDoc.id,
            filename: file.originalname,
          },
        });

        if (chunkRes.chunks && chunkRes.chunks.length > 0) {
          chunks = chunkRes.chunks.map((c) => ({
            ...c,
            metadata: {
              ...(c.metadata || {}),
              user_id: userId,
              project_id: projectId,
              document_id: savedDoc.id,
              filename: file.originalname,
            },
          }));

          // 5. Store vector chunks in Python AI Vector Store
          await storeVectorChunksWithAIService(chunks).catch((err) =>
            console.warn('Vector store indexing error:', err.message)
          );

          // 6. Persist chunks in PostgreSQL
          for (let i = 0; i < chunks.length; i++) {
            const chk = chunks[i];
            await query(
              `INSERT INTO document_chunks (user_id, document_id, chunk_index, chunk_text, page_number, metadata)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                userId,
                savedDoc.id,
                i,
                chk.text,
                chk.page_number || 1,
                JSON.stringify(chk.metadata || {}),
              ]
            ).catch((err) => console.warn('Chunk persistence error:', err.message));
          }
        }
      }
    } catch (aiErr) {
      console.warn('AI processing error during ingest:', aiErr.message);
    }

    // Update project timestamp if attached
    if (projectId) {
      await query('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [projectId]);
    }

    return res.status(200).json({
      success: true,
      message: 'Document uploaded and indexed successfully',
      data: {
        id: savedDoc.id,
        filename: savedDoc.filename,
        original_name: savedDoc.original_name,
        cloudinary_url: savedDoc.cloudinary_url,
        cloudinary_public_id: savedDoc.cloudinary_public_id,
        size_bytes: savedDoc.size_bytes,
        mime_type: savedDoc.mime_type,
        project_id: savedDoc.project_id,
        uploaded_at: savedDoc.uploaded_at,
        total_pages: aiExtractData ? aiExtractData.total_pages : 1,
        total_characters: aiExtractData ? aiExtractData.total_characters : 0,
        chunk_count: chunks.length,
      },
    });
  } catch (error) {
    console.error('Document upload processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Document upload failed',
      details: error.message,
    });
  }
}

/**
 * Controller for listing user's documents
 */
async function getDocuments(req, res, next) {
  try {
    const userId = req.user.id;
    const { project_id } = req.query;

    let sql = `
      SELECT d.id, d.project_id, d.filename, d.original_name, d.cloudinary_url, 
             d.cloudinary_public_id, d.mime_type, d.size_bytes, d.uploaded_at,
             p.name AS project_name
      FROM documents d
      LEFT JOIN projects p ON p.id = d.project_id
      WHERE d.user_id = $1
    `;
    const params = [userId];

    if (project_id) {
      sql += ' AND d.project_id = $2';
      params.push(project_id);
    }

    sql += ' ORDER BY d.uploaded_at DESC';

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      documents: result.rows.map((r) => ({
        id: r.id,
        name: r.original_name || r.filename,
        filename: r.filename,
        projectId: r.project_id,
        projectName: r.project_name,
        url: r.cloudinary_url,
        cloudinaryPublicId: r.cloudinary_public_id,
        mimeType: r.mime_type,
        size: r.size_bytes,
        uploadedAt: r.uploaded_at,
      })),
    });
  } catch (error) {
    console.error('getDocuments error:', error);
    next(error);
  }
}

/**
 * Controller for deleting a document (from Cloudinary & DB)
 */
async function deleteDocument(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const findDoc = await query(
      'SELECT id, cloudinary_public_id, project_id FROM documents WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (findDoc.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or unauthorized',
      });
    }

    const doc = findDoc.rows[0];

    // Delete from Cloudinary
    if (doc.cloudinary_public_id) {
      await deleteFromCloudinary(doc.cloudinary_public_id);
    }

    // Delete from DB (cascades to document_chunks)
    await query('DELETE FROM documents WHERE id = $1', [id]);

    if (doc.project_id) {
      await query('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [doc.project_id]);
    }

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      id,
    });
  } catch (error) {
    console.error('deleteDocument error:', error);
    next(error);
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
      metadata: {
        ...(metadata || {}),
        user_id: req.user.id,
      },
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
  getDocuments,
  deleteDocument,
  chunkDocument,
};
