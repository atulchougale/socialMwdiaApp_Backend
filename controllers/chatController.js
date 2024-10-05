const Conversation = require("../models/Chat");
const Message = require("../models/Message");
const { getReceiverSocketId, io } = require("../Socket/socket");

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const {message} = req.body;
    const {id:reciverId} = req.params;
    // console.log("reciverId",reciverId);
    
    const senderId = req.user._id;
    // console.log("senderId",senderId);
    


    let chats = await Conversation.findOne({
        participants:{$all:[senderId , reciverId]}
    })
    // console.log("chats",chats);
    

    if(!chats){
        chats = await Conversation.create({
            participants:[senderId , reciverId],
        })
    }

    const newMessages = new Message({
        senderId,
        reciverId,
        message,
        conversationId: chats._id
    })

    // console.log("newMessages",newMessages);
    

    if(newMessages){
        chats.messages.push(newMessages._id);
    }

    await Promise.all([chats.save(),newMessages.save()]);

    //  SOCKET.IO function 
     const reciverSocketId = getReceiverSocketId(reciverId);
     if(reciverSocketId){
        io.to(reciverSocketId).emit("newMessage",newMessages)
     }


    res.status(201).send(newMessages)

} catch (error) {
    res.status(500).send({
        success: false,
        message: error
    })
    console.log(`error in sendMessage ${error}`);
}
};

// Get chat messages
exports.getMessages = async (req, res) => {
  try {
    const { id: reciverId } = req.params;
    const senderId = req.user._id;

    const chats = await Conversation.findOne({
      participants: { $all: [senderId, reciverId] },
    }).populate("messages");

    if (!chats) return res.status(200).send([]);
    const message = chats.messages;
    res.status(200).send(message);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error,
    });
    console.log(`error in getMessage ${error}`);
  }
};




// Delete a single message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params; 
    const senderId = req.user._id; 

   
    const message = await Message.findOne({ _id: messageId, senderId });

    if (!message) {
      return res.status(404).send({ success: false, message: "Message not found or unauthorized." });
    }

  
    await Message.findByIdAndDelete(messageId);

    await Conversation.updateOne(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    res.status(200).send({ success: true, message: "Message deleted successfully." });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
    console.log(`Error in deleteMessage: ${error.message}`);
  }
};
