const Comment = require("../models/Comment");
const Post = require("../models/Post");

const Notification = require("../models/Notification");
const sendEmail = require("../utils/emailService");

// Create a new comment
const createComment = async (req, res) => {
  try {
    const newComment = new Comment({
      postId: req.params.postId,
      userId: req.user.id,
      commentText: req.body.commentText,
    });

    const savedComment = await newComment.save();

    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { comments: savedComment._id },
    });

    const post = await Post.findById(req.params.postId).populate('userId', 'username email');
    const postOwnerId = post.userId;
    const message = `${req.user.username} commented on your post.`;

    await createNotification(postOwnerId, "comment", message);
    //console.log(post.userId.email);
    
    const emailMessage = `Hello ${post.userId.username},\n\nYou have received a new comment on your post titled "${post.postContent}":\n\n"${savedComment.commentText}"\n\nCheck it out on your profile!\n\nBest regards,\nYour Social Media Team`;
    await sendEmail(
      post.userId.email,
      "New Comment on Your Post",
      emailMessage
    );

    res.status(201).json(savedComment);
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

// Get all comments for a post
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate(
      "userId",
      "username"
    );
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      const Notification = require("../models/Notification"); // Import Notification model

      // Create a new comment
      const createComment = async (req, res) => {
        try {
          const newComment = new Comment({
            postId: req.params.postId,
            userId: req.user.id,
            commentText: req.body.commentText,
          });

          const savedComment = await newComment.save();

          // Update the post to include the new comment
          await Post.findByIdAndUpdate(req.params.postId, {
            $push: { comments: savedComment._id },
          });

          // Create a notification for the post owner
          const post = await Post.findById(req.params.postId); // Fetch the post to get the owner ID
          const postOwnerId = post.userId; // Assuming post has a userId field that references the owner
          const message = `${req.user.username} commented on your post.`;

          await createNotification(postOwnerId, "comment", message); // Call the notification function

          res.status(201).json(savedComment);
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
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this comment" });
    }

    comment.commentText = req.body.commentText;
    const updatedComment = await comment.save();
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    await Post.findByIdAndUpdate(req.params.postId, {
      $pull: { comments: req.params.commentId },
    });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
