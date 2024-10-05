const { model } =require ('mongoose');

const { Server } = require ( 'socket.io');
const http = require ( 'http');
const express = require ( 'express');

const app = express();


const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:['http://localhost:3000' || 'https://mysocialapp-07.netlify.app/'],
        methods:["GET","POST"]
    }
});

 const getReceiverSocketId = (reciverId)=>{
    return userSocketmap[reciverId];
  }
  const userSocketmap = {}; //{userId,socketid}
  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
   
    if(userId !== "undefined") userSocketmap[userId] = socket.id;
    io.emit("getOnlineUsers",Object.keys(userSocketmap))
  
    socket.on('disconnect', () => {
      delete userSocketmap[userId],   
    io.emit("getOnlineUsers",Object.keys(userSocketmap))
    });
  });
  
  module.exports = {server, app , io , getReceiverSocketId}