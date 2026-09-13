const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { uploadSingle } = require('../middleware/upload.middleware');
const { validateUpload, validateChunk } = require('../validators/document.validator');

router.post('/upload', uploadSingle('file'), validateUpload, documentController.uploadDocument);
router.post('/chunk', validateChunk, documentController.chunkDocument);

module.exports = router;
