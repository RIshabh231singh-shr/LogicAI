const express = require('express');
const router = express.Router();
const ragController = require('../controllers/rag.controller');
const { validateRAGQuery } = require('../validators/rag.validator');

router.post('/query', validateRAGQuery, ragController.executeQuery);

module.exports = router;
