// socket.js
const socketIo = require('socket.io');
const Message = require('./model/message'); 

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin:process.env.FRONTEND_MAIN_ROUTE,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`);

    socket.on('joinRoom', ({ trainerId, clientId }) => {
      const roomId = trainerId < clientId ? `${trainerId}-${clientId}` : `${clientId}-${trainerId}`;
      socket.join(roomId);
      console.log(`User joined room ${roomId}`);
    });

    socket.on('message', async (data) => {
      const roomId = data.senderId < data.receiverId
        ? `${data.senderId}-${data.receiverId}`
        : `${data.receiverId}-${data.senderId}`;

      console.log(`${roomId} ROOM ID`, data.text);
      socket.to(roomId).emit('message', data);

      try {
        const newMessage = new Message(data);
        await newMessage.save();
      } catch (error) {
        console.error('Error saving message to DB:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

// Export the `initializeSocket` function and the `io` instance
module.exports = {
  initializeSocket,
  getIo: () => io,
};
