const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification'); 
const sendEmail = require('../utils/emailService');

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ username, email, password });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.searchUsers = async (req, res) => {
    // console.log('Reached searchUsers endpoint');
    const { query } = req.query;

    // console.log('Search Query:', query);
    
 
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        const users = await User.find({
            username: { $regex: query, $options: 'i' } 
        }).select('-password'); 

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: error.message });
    }
};


// Update User Profile
exports.updateProfile = async (req, res) => {
    const { username, email, bio } = req.body;

    let profilePicture = req.file ? req.file.path : undefined; 

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { username, email, bio, profilePicture },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get User Profile by ID
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.user) {
            return res.status(400).json({ message: 'User is not authenticated' });
        }

        if (req.user.following.includes(userToFollow._id)) {
            return res.status(400).json({ message: 'You are already following this user' });
        }

        req.user.following.push(userToFollow._id);
        userToFollow.followers.push(req.user._id);

        await req.user.save();
        await userToFollow.save();

        const message = `${req.user.username} started following you.`;
        await Notification.create({ userId: userToFollow._id, type: 'follow', message });

        const emailMessage = `Hello ${userToFollow.username},\n\n${req.user.username} has started following you on our platform! 
        You can now see their posts in your feed.\n\nBest regards,\nYour Social Media Team`;
        await sendEmail(userToFollow.email, 'New Follower Notification', emailMessage);

        res.status(200).json(userToFollow);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.user) {
            return res.status(400).json({ message: 'User is not authenticated' });
        }

        if (!req.user.following.includes(userToUnfollow._id)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        // Remove from following array
        req.user.following = req.user.following.filter(id => id.toString() !== userToUnfollow._id.toString());

        // Update the user in the database
        await User.findByIdAndUpdate(req.user._id, { following: req.user.following }, { new: true });

        userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id.toString());

       
        await userToUnfollow.save();

        
        const message = `${req.user.username} has unfollowed you.`;
        await sendEmail(userToUnfollow.email, 'Unfollow Notification', message);

        res.status(200).json({ message: 'Unfollowed successfully', user: userToUnfollow });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};










// Function to create a notification
const createNotification = async (userId, type, message) => {
    try {
        const notification = new Notification({
            userId,
            type,
            message,
        });
        await notification.save();
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};