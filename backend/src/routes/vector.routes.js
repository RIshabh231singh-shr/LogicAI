const express = require('express');
const router = express.Router();
const vectorController = require('../controllers/vector.controller');
const {
  validateStoreVector,
  validateSearchVector,
} = require('../validators/vector.validator');

router.post('/store', validateStoreVector, vectorController.storeVectorChunks);
router.post('/search', validateSearchVector, vectorController.searchVectorStore);

module.exports = router;
