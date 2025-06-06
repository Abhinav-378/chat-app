const express = require('express');
const http = require("http");
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./db/index.js');
connectDB();

const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const messageRoutes = require('./routes/message.routes.js');
const groupRoutes = require('./routes/group.routes.js');
const jwt = require('jsonwebtoken');
const Message = require('./models/message.model.js'); // Import the Message model

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

io.on('connection', (socket) => {
  console.log('New Client connected')

  socket.on("join", (userId) => {
    console.log(`User ${userId} joined`);
    socket.join(userId);
  });

  socket.on("joinGroup", (groupId) => {
    console.log(`User joined group ${groupId}`);
    socket.join(`group:${groupId}`);
  });

  socket.on('private_message', async (msg) => {
    console.log('Received private message:', msg);
    
    // Save message to database
    try {
      const message = new Message({
        sender: msg.sender,
        recipient: msg.recipient,
        content: msg.content
      });
      await message.save();
      
      // Emit to both sender and recipient
      io.to(msg.recipient).emit('private_message', msg);
      io.to(msg.sender).emit('private_message', msg);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('groupMessage', async (msg) => {
    try {
      const message = new Message({
        sender: msg.sender,
        recipient: msg.recipient,
        recipientType: 'Group',
        content: msg.content
      });
      
      await message.save();
      // Await the populate operation
      const populatedMessage = await message.populate('sender', 'username');
      // console.log('Populated message:', populatedMessage);

      io.to(`group:${msg.recipient}`).emit('newGroupMessage', {
        ...populatedMessage.toJSON(),
        sender: {
          _id: populatedMessage.sender._id,
          username: populatedMessage.sender.username
        }
      });
    } catch (error) {
      console.error('Error sending group message:', error);
    }
  })

  socket.on('typing', (data)=>{
    socket.to(data.recipient).emit('userTyping', {
      sender: data.sender,
      isTyping: true
    })
  })

  socket.on('stopTyping', (data)=>{
    socket.to(data.recipient).emit('userTyping', {
      sender: data.sender,
      isTyping: false
    })
  })
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});