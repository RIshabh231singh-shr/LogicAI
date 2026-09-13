const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const { validateUpload, validateChunk } = require('../validators/document.validator');

// All document routes require authentication
router.use(requireAuth);

router.get('/', documentController.getDocuments);
router.post('/upload', uploadSingle('file'), validateUpload, documentController.uploadDocument);
router.delete('/:id', documentController.deleteDocument);
router.post('/chunk', validateChunk, documentController.chunkDocument);

module.exports = router;
