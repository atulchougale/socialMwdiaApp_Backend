
const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Get notifications for a user
router.get('/', protect, getNotifications); 

// Mark a notification as read
router.put('/:id/read', protect, markAsRead); 

module.exports = router;
