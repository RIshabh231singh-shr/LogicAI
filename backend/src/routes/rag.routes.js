const express = require('express');
const router = express.Router();
const ragController = require('../controllers/rag.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateRAGQuery } = require('../validators/rag.validator');

router.post('/query', requireAuth, validateRAGQuery, ragController.executeQuery);

module.exports = router;
