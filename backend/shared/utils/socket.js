// Socket.io instance holder
let io = null;

module.exports = {
  setIo: (socketIo) => {
    io = socketIo;
  },
  getIo: () => {
    return io;
  },
  emitToUser: (userId, event, data) => {
    if (io) {
      io.to(`user_${userId}`).emit(event, data);
    }
  },
  emit: (event, data) => {
    if (io) {
      io.emit(event, data);
    }
  },
};
