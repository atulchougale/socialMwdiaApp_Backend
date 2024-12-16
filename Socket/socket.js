const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://mysocialapp-07.netlify.app'], // Updated to include both development and production origins
    methods: ['GET', 'POST'],
  },
});

// User socket mapping for tracking online users
const userSocketmap = {};

// Get the socket ID of a receiver by their user ID
const getReceiverSocketId = (receiverId) => {
  return userSocketmap[receiverId];
};

// Handle Socket.IO connections
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId !== 'undefined') {
    userSocketmap[userId] = socket.id; // Map userId to socket ID
  }

  // Emit the updated list of online users
  io.emit('getOnlineUsers', Object.keys(userSocketmap));

  // Handle user disconnect
  socket.on('disconnect', () => {
    delete userSocketmap[userId]; // Remove user from the map
    io.emit('getOnlineUsers', Object.keys(userSocketmap)); // Broadcast updated list
  });
});

module.exports = { server, app, io, getReceiverSocketId };
