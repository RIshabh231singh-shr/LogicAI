const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { validateEcho } = require('../validators/ai.validator');

router.post('/echo', validateEcho, aiController.postEcho);

module.exports = router;
