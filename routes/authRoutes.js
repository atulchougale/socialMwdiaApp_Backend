const express = require('express');
const { 
    registerUser, 
    loginUser, 
    updateProfile, 
    getUserProfile, 
    followUser, 
    unfollowUser, 
} = require('../controllers/authController');
const { searchUsers } = require('../controllers/authController'); 

const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

// Search users by username
router.get('/search', protect, searchUsers);

// Update user profile route
router.put('/profile', protect, upload.single('profilePicture'), updateProfile); 

// Get user profile by ID
router.get('/:id', getUserProfile);

// Follow a user route
router.put('/follow/:id', protect, followUser); 


// Unfollow a user route
router.put('/unfollow/:id', protect, unfollowUser); 





module.exports = router;
