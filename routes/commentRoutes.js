const express = require('express');
const router = express.Router();
const { createComment, getComments, updateComment, deleteComment } = require('../controllers/commentController');
const protect = require('../middleware/authMiddleware');

// Create a comment
router.post('/:postId', protect, createComment); 

// Get all comments for a post
router.get('/:postId', protect, getComments); 

// Update a comment
router.put('/:postId/:commentId', protect, updateComment); 

// Delete a comment
router.delete('/:postId/:commentId', protect, deleteComment); 

module.exports = router;
