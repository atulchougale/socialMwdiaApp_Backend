const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  commentText: { type: String, required: true },
  ownerName: { type: String },
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
