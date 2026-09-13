const express = require('express');
const router = express.Router();
const embeddingController = require('../controllers/embedding.controller');
const {
  validateGenerateEmbedding,
  validateSimilarity,
} = require('../validators/embedding.validator');

router.post('/generate', validateGenerateEmbedding, embeddingController.generateEmbedding);
router.post('/similarity', validateSimilarity, embeddingController.calculateSimilarity);

module.exports = router;
