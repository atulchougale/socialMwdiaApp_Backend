
const express = require('express');
const protect = require('../middleware/authMiddleware');
const { getUserBySearch, getCorrentChatters } = require('../controllers/userController');

const router = express.Router();

router.get('/search',protect,getUserBySearch);

router.get('/currentchatters',protect,getCorrentChatters)

module.exports = router;