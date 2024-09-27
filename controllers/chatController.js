
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// Start a new chat or retrieve existing chat
exports.startChat = async (req, res) => {
  try {
    const { participantId } = req.body; 
    const userId = req.user.id; 

    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (!chat) {
      chat = new Chat({ participants: [userId, participantId] });
      await chat.save();
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const sender = req.user.id;

    const newMessage = new Message({
      chatId,
      sender,
      text,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
