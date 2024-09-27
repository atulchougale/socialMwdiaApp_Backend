const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const sendEmail = require("../utils/emailService");

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, postContent } = req.body;
    const image = req.files["image"] ? req.files["image"][0].path : "";
    const video = req.files["video"] ? req.files["video"][0].path : "";

    if (!title && !postContent && !image && !video) {
      return res
        .status(400)
        .json({ message: "Post must have either text, an image, or a video." });
    }

    const newPost = new Post({
      userId: req.user.id,
      title: title || "",
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

// Get a single post by ID
const getPostById = async (req, res) => {
  const postId = req.params.id;

  

  try {
      const post = await Post.findByIdAndUpdate(request.params.id, { $inc: { viewCount: 1 } })
          .populate('userId', 'username email' , { strictPopulate: false })
          .populate('comments')
          .exec();

      if (!post) {
          return res.status(404).json({ message: "Post not found." });
      }

      res.status(200).json(post);
  } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ message: error.message });
  }
};

// Get all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username')
      .populate('comments')
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
const updatePost = async (req, res) => {
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID format." });
  }

  try {
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    const updatedData = {
      title: req.body.title || existingPost.title,
      postContent: req.body.postContent || existingPost.postContent,
      image: req.files["image"] ? req.files["image"][0].path : existingPost.image,
      video: req.files["video"] ? req.files["video"][0].path : existingPost.video,
    };

    const updatedPost = await Post.findByIdAndUpdate(postId, updatedData, { new: true });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID format." });
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this post." });
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like or Unlike a post
const likePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID format." });
  }

  try {
    const post = await Post.findById(postId).populate('userId', 'username email');

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const postOwnerId = post.userId._id;

    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
      post.likes -= 1;

      await post.save();
      return res.status(200).json({ message: "Post unliked", post });
    }

    post.likedBy.push(userId);
    post.likes += 1;

    await post.save();
    res.status(200).json({ message: "Post liked", post });
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get likes of a post
const getLikesOfPost = async (req, res) => {
  const postId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID format." });
  }

  try {
    const post = await Post.findById(postId).populate("likedBy", "username");
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    res.status(200).json(post.likedBy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search posts by title or content
const searchPosts = async (req, res) => {
  const { query } = req.query;

  try {
    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { postContent: { $regex: query, $options: 'i' } }
      ]
    }).populate('userId', 'username email');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getUserPosts = async (req, res) => {
  const userId = req.user.id; // Assuming you're using middleware to attach the authenticated user

  try {
    const userPosts = await Post.find({ userId }).populate('userId', 'username email').sort({ createdAt: -1 });
    if (!userPosts) {
      return res.status(404).json({ message: "No posts found for this user." });
    }
    res.status(200).json(userPosts);
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
  getPostById,
  getUserPosts
};
