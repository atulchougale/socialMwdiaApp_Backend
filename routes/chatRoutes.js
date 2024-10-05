
const express = require('express');
const { sendMessage, getMessages } = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/send/:id',protect, sendMessage)

router.get('/:id',protect , getMessages);

module.exports = router;
