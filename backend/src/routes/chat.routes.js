const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { validateChat } = require('../validators/chat.validator');

router.post('/', validateChat, chatController.postChat);

module.exports = router;
