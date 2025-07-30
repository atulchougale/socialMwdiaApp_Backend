const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postsRoutes');
const commentRoutes = require('./routes/commentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRouter = require('./routes/userRout');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const { app, server } = require('./Socket/socket');

dotenv.config();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define allowed origins for CORS
const allowedOrigins = ['http://localhost:3000', 'https://mysocialapp-07.netlify.app', 'http://10.223.117.212:3000'];

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies and other credentials
  })
);

// Handle preflight requests
app.options('*', cors());

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// API routes
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/posts', postRoutes); // Posts routes
app.use('/api/comments', commentRoutes); // Comment routes
app.use('/api/chats', chatRoutes); // Chat routes
app.use('/api/users', userRouter);

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
