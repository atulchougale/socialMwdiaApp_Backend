
const express = require('express');
const { startChat, sendMessage, getChatMessages } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Start or retrieve a chat
router.post('/', protect, startChat);

// Send a message
router.post('/send', protect, sendMessage);

// Get chat messages
router.get('/:chatId/messages', protect, getChatMessages);

module.exports = router;
