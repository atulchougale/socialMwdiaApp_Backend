const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postsRoutes');
const commentRoutes = require('./routes/commentRoutes');
const chatRoutes = require('./routes/chatRoutes'); 
const socketio = require('socket.io');
const http = require('http'); 
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app); 


const io = socketio(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

// Connect to Database
connectDB();

// Middleware

app.use(express.json());
app.use('/uploads', express.static('uploads')); 

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(cors({
    origin: '*' || 'http://localhost:3000', 
    credentials: true
}));



// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
// });
// Route Middlewares
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/posts', postRoutes); // Posts routes
app.use('/api/comments', commentRoutes); // Comment routes
app.use('/api/chats', chatRoutes); // Chat routes


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat ${chatId}`);
  });

  socket.on('sendMessage', ({ chatId, message }) => {
    io.to(chatId).emit('message', message); 
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
