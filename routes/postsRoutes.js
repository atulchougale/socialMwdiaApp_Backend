const express = require('express');
const router = express.Router();
const {
    createPost,
    getPosts,
    updatePost,
    deletePost,
    likePost,
    getLikesOfPost,
    searchPosts,
    getPostById,
    getUserPosts
} = require('../controllers/postsController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Protected routes
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createPost); // Create a post
router.get('/', getPosts); // Get all posts
router.get('/posts/:id', getPostById); // Get a post by ID
router.put('/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updatePost); // Update a post
router.delete('/:id', protect, deletePost); // Delete a post
router.post('/:id/like', protect, likePost); // Like a post
router.get('/:id/likes', protect, getLikesOfPost); // Get likes of a post
router.get('/search', protect, searchPosts); // Search posts by title or content
router.get('/user/:id', protect, getUserPosts);

module.exports = router;
