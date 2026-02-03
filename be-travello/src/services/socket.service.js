import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Socket.IO middleware for authentication
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

// Initialize Socket.IO
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Use authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.username} connected with socket ID: ${socket.id}`);

    // Join user to their personal room for direct messages
    socket.join(`user_${socket.userId}`);

    // Update online status
    updateUserOnlineStatus(socket.userId, socket.id, true);

    // Handle joining conversation rooms
    socket.on('join_conversation', async (conversationId) => {
      try {
        // Verify user is part of conversation
        const conversation = await db.get(`
          SELECT id FROM conversations 
          WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `, [conversationId, socket.userId, socket.userId]);

        if (conversation) {
          socket.join(`conversation_${conversationId}`);
          socket.emit('joined_conversation', { conversationId });
        } else {
          socket.emit('error', { message: 'Conversation not found' });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      socket.emit('left_conversation', { conversationId });
    });

    // Handle typing indicators
    socket.on('typing_start', async (data) => {
      const { conversationId } = data;
      
      try {
        // Verify user is part of conversation
        const conversation = await db.get(`
          SELECT participant_1_id, participant_2_id 
          FROM conversations 
          WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `, [conversationId, socket.userId, socket.userId]);

        if (conversation) {
          const otherUserId = conversation.participant_1_id === socket.userId 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;

          // Update typing status in database
          await db.run(`
            INSERT OR REPLACE INTO typing_indicators (id, conversation_id, user_id, is_typing, timestamp)
            VALUES (?, ?, ?, ?, ?)
          `, [`${socket.userId}-${conversationId}`, conversationId, socket.userId, true, new Date().toISOString()]);

          // Notify other user
          socket.to(`user_${otherUserId}`).emit('user_typing', {
            conversationId,
            userId: socket.userId,
            username: socket.username,
            isTyping: true
          });
        }
      } catch (error) {
        console.error('Error handling typing start:', error);
      }
    });

    socket.on('typing_stop', async (data) => {
      const { conversationId } = data;
      
      try {
        // Remove typing indicator
        await db.run(`
          DELETE FROM typing_indicators 
          WHERE conversation_id = ? AND user_id = ?
        `, [conversationId, socket.userId]);

        // Get conversation to notify other user
        const conversation = await db.get(`
          SELECT participant_1_id, participant_2_id 
          FROM conversations 
          WHERE id = ?
        `, [conversationId]);

        if (conversation) {
          const otherUserId = conversation.participant_1_id === socket.userId 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;

          // Notify other user
          socket.to(`user_${otherUserId}`).emit('user_typing', {
            conversationId,
            userId: socket.userId,
            username: socket.username,
            isTyping: false
          });
        }
      } catch (error) {
        console.error('Error handling typing stop:', error);
      }
    });

    // Handle message read status
    socket.on('mark_messages_read', async (data) => {
      const { conversationId } = data;
      
      try {
        // Mark messages as read
        await db.run(`
          UPDATE chat_messages_enhanced 
          SET is_read = 1 
          WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0
        `, [conversationId, socket.userId]);

        // Get conversation to notify other user
        const conversation = await db.get(`
          SELECT participant_1_id, participant_2_id 
          FROM conversations 
          WHERE id = ?
        `, [conversationId]);

        if (conversation) {
          const otherUserId = conversation.participant_1_id === socket.userId 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;

          // Notify other user that messages were read
          socket.to(`user_${otherUserId}`).emit('messages_read', {
            conversationId,
            readBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle user status changes
    socket.on('update_status', async (data) => {
      const { status } = data; // 'online', 'away', 'busy', etc.
      
      try {
        await db.run(`
          UPDATE user_online_status 
          SET last_seen = ? 
          WHERE user_id = ?
        `, [new Date().toISOString(), socket.userId]);

        // Broadcast status change to all connected users
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          username: socket.username,
          status,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.username} disconnected`);
      
      // Update offline status
      await updateUserOnlineStatus(socket.userId, socket.id, false);
    });
  });

  return io;
};

// Helper function to update user online status
const updateUserOnlineStatus = async (userId, socketId, isOnline) => {
  try {
    if (isOnline) {
      await db.run(`
        INSERT OR REPLACE INTO user_online_status (user_id, is_online, last_seen, socket_id)
        VALUES (?, 1, ?, ?)
      `, [userId, new Date().toISOString(), socketId]);
    } else {
      // Check if user has other active connections
      const activeConnections = await db.get(`
        SELECT COUNT(*) as count FROM user_online_status 
        WHERE user_id = ? AND is_online = 1 AND socket_id != ?
      `, [userId, socketId]);

      if (activeConnections.count === 0) {
        await db.run(`
          UPDATE user_online_status 
          SET is_online = 0, last_seen = ?, socket_id = NULL 
          WHERE user_id = ?
        `, [new Date().toISOString(), userId]);
      } else {
        // Just remove this socket connection
        await db.run(`
          DELETE FROM user_online_status 
          WHERE user_id = ? AND socket_id = ?
        `, [userId, socketId]);
      }
    }
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

// Helper function to emit new message to conversation participants
export const emitNewMessage = (io, conversationId, message, senderId) => {
  // Get conversation participants
  db.get(`
    SELECT participant_1_id, participant_2_id 
    FROM conversations 
    WHERE id = ?
  `, [conversationId]).then(conversation => {
    if (conversation) {
      const receiverId = conversation.participant_1_id === senderId 
        ? conversation.participant_2_id 
        : conversation.participant_1_id;

      // Send to conversation room
      io.to(`conversation_${conversationId}`).emit('new_message', {
        conversationId,
        message
      });

      // Send direct notification to receiver if not in conversation room
      io.to(`user_${receiverId}`).emit('new_message_notification', {
        conversationId,
        message,
        unreadCount: 1 // You might want to calculate actual unread count
      });
    }
  }).catch(error => {
    console.error('Error emitting new message:', error);
  });
};
