
const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  senderId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
  },
  reciverId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
  },
  message:{
      type:String,
      required:true
  },
  conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default:[]
  },
},{timestamps:true})

module.exports = mongoose.model('Message', messageSchema);
