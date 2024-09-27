const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/emailService");



// Create a new post
const createPost = async (req, res) => {
  try {
    const { postContent } = req.body;
    const image = req.files["image"] ? req.files["image"][0].path : "";
    const video = req.files["video"] ? req.files["video"][0].path : "";

    if (!postContent && !image && !video) {
      return res
        .status(400)
        .json({ message: "Post must have either text, an image, or a video." });
    }

    const newPost = new Post({
      userId: req.user.id,
      postContent: postContent || "",
      image: image || "",
      video: video || "",
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "username");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const updatedData = {
      postContent: req.body.postContent || existingPost.postContent,
      image: req.files["image"]
        ? req.files["image"][0].path
        : existingPost.image,
      video: req.files["video"]
        ? req.files["video"][0].path
        : existingPost.video,
    };

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like or Unlike a post
// Like or Unlike a post
const likePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
  
    try {
      // Populate the post with the user details
      const post = await Post.findById(postId).populate('userId', 'username email');
  
      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }
  
      const postOwnerId = post.userId._id; // Access the owner's ID
  
      if (post.likedBy.includes(userId)) {
        post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
        post.likes -= 1;
  
        await post.save();
  
        const message = `${req.user.username} unliked your post.`;
        await createNotification(postOwnerId, "unlike", message);
  
        return res.status(200).json({ message: "Post unliked", post });
      }
  
      post.likedBy.push(userId);
      post.likes += 1;
  
      await post.save();
  
      const message = `${req.user.username} liked your post.`;
      await createNotification(postOwnerId, "like", message);
  
      // Send email notification to the post owner
      const emailMessage = `Hello ${post.userId.username},\n\nYour post titled "${post.postContent}" has received a new like from ${req.user.username}!\n\nCheck it out on your profile.\n\nBest regards,\nYour Social Media Team`;
      await sendEmail(post.userId.email, "New Like on Your Post", emailMessage);
  
      res.status(200).json({ message: "Post liked", post });
    } catch (error) {
      console.error('Error liking/unliking post:', error); // For debugging purposes
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

// Get likes of a post
const getLikesOfPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "likedBy",
      "username"
    );
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post.likedBy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchPosts = async (req, res) => {
  const { query } = req.query; 
  
  
  try {
      const posts = await Post.find({
          $or: [
              { title: { $regex: query, $options: 'i' } }, // Search by title
              { postContent: { $regex: query, $options: 'i' } } // Search by content
          ]
      });

      res.status(200).json(posts);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  likePost,
  getLikesOfPost,
  searchPosts,
};
