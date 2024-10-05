const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postsRoutes');
const commentRoutes = require('./routes/commentRoutes');
const chatRoutes = require('./routes/chatRoutes'); 
const userRouter = require('./routes/userRout');
const socketio = require('socket.io');
const http = require('http'); 
const path = require('path');
const cookieParser = require('cookie-parser');

const { app, server } = require("./Socket/socket")

dotenv.config();

// Connect to Database
connectDB();

// Middleware

app.use(express.json());
app.use(cookieParser()); 

app.use('/uploads', express.static('uploads')); 

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(cors({
    origin:'http://localhost:3000' || 'https://mysocialapp-07.netlify.app/', 
    credentials: true
}));






app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/posts', postRoutes); // Posts routes
app.use('/api/comments', commentRoutes); // Comment routes
app.use('/api/chats', chatRoutes); // Chat routes
app.use('/api/users', userRouter)


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 5000 ;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
