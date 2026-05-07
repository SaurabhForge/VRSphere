// Tracks active rooms and their participants
const rooms = {};

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Join Room ───────────────────────────────────────────────
    const leaveRoom = (roomId) => {
      if (!roomId || !rooms[roomId]?.[socket.id]) return;

      delete rooms[roomId][socket.id];
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { socketId: socket.id });
      io.to(roomId).emit('participant-count', Object.keys(rooms[roomId]).length);

      if (Object.keys(rooms[roomId]).length === 0) {
        delete rooms[roomId];
      }
    };

    socket.on('join-room', ({ roomId, userId, userName, userAvatar }) => {
      if (socket.data.roomId && socket.data.roomId !== roomId) {
        leaveRoom(socket.data.roomId);
      }

      socket.join(roomId);

      if (!rooms[roomId]) rooms[roomId] = {};
      rooms[roomId][socket.id] = { userId, userName, userAvatar, socketId: socket.id };

      // Tell everyone already in the room about the newcomer
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
        userAvatar,
      });

      // Send the new user the list of existing participants
      const existingUsers = Object.values(rooms[roomId]).filter(
        (u) => u.socketId !== socket.id
      );
      socket.emit('room-users', existingUsers);

      // Broadcast updated participant count
      io.to(roomId).emit('participant-count', Object.keys(rooms[roomId]).length);

      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.userAvatar = userAvatar;

      console.log(`👤 ${userName} joined room ${roomId}. Total: ${Object.keys(rooms[roomId]).length}`);
    });

    // ─── WebRTC Signaling ────────────────────────────────────────
    socket.on('webrtc-offer', ({ targetSocketId, offer, fromSocketId }) => {
      io.to(targetSocketId).emit('webrtc-offer', {
        offer,
        fromSocketId: socket.id,
      });
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit('webrtc-answer', {
        answer,
        fromSocketId: socket.id,
      });
    });

    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        candidate,
        fromSocketId: socket.id,
      });
    });

    // ─── Chat ────────────────────────────────────────────────────
    socket.on('send-message', ({ roomId, message, userId, userName, userAvatar }) => {
      const payload = {
        id: `${socket.id}-${Date.now()}`,
        message,
        userId,
        userName,
        userAvatar,
        timestamp: new Date().toISOString(),
      };
      io.to(roomId).emit('receive-message', payload);
    });

    // ─── Reactions ───────────────────────────────────────────────
    socket.on('send-reaction', ({ roomId, reaction, userName }) => {
      socket.to(roomId).emit('receive-reaction', { reaction, userName, socketId: socket.id });
    });

    // ─── Media State ─────────────────────────────────────────────
    socket.on('media-state', ({ roomId, audioEnabled, videoEnabled }) => {
      socket.to(roomId).emit('peer-media-state', {
        socketId: socket.id,
        audioEnabled,
        videoEnabled,
      });
    });

    // ─── Screen Share ────────────────────────────────────────────
    socket.on('screen-share-start', ({ roomId }) => {
      socket.to(roomId).emit('peer-screen-share-start', { socketId: socket.id });
    });

    socket.on('screen-share-stop', ({ roomId }) => {
      socket.to(roomId).emit('peer-screen-share-stop', { socketId: socket.id });
    });

    socket.on('leave-room', ({ roomId } = {}) => {
      const targetRoomId = roomId || socket.data.roomId;
      leaveRoom(targetRoomId);
      if (socket.data.roomId === targetRoomId) {
        delete socket.data.roomId;
      }
      console.log(`${socket.data.userName || socket.id} left room ${targetRoomId}`);
    });

    // ─── Disconnect ──────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomId, userName } = socket.data;
      if (roomId) {
        leaveRoom(roomId);
        console.log(`❌ ${userName || socket.id} left room ${roomId}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
