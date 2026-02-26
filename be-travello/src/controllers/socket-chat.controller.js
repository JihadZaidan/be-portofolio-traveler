const { 
  UserAdminChatMessage, 
  createUserAdminMessage, 
  getMessagesByRoom, 
  getMessagesByUser, 
  getAllUnreadMessages, 
  markMessagesAsRead, 
  getUnreadCount,
  getUnreadCountForAdmin,
  getUnreadCountForUser,
  getLatestMessageForRoom,
  getConversationsWithUnreadCount
} = require('../models/UserAdminChatMessage.model.js');

class SocketChatController {
  static initializeSocket(io) {
    // Store connected users and admins
    const connectedUsers = new Map();
    const connectedAdmins = new Map();
    const typingUsers = new Set();

    io.on('connection', (socket) => {
      console.log(`🔗 New socket connection: ${socket.id}`);
      console.log(`🔗 Total connected sockets: ${io.sockets.sockets.size}`);

      // User joins chat
      socket.on('join_chat', async (userData) => {
        try {
          console.log('📥 Received join_chat data:', userData);
          const { userId, userName, userEmail, role } = userData;
          
          // Validate required fields
          if (!userId || !userName || !userEmail || !role) {
            console.error('❌ Missing required fields for join_chat:', { userId, userName, userEmail, role });
            socket.emit('error', { 
              message: 'Failed to join chat: Missing required information (userId, userName, userEmail, role)' 
            });
            return;
          }
          
          // Store user info
          socket.userId = userId;
          socket.userName = userName;
          socket.userEmail = userEmail;
          socket.role = role;
          
          console.log('👤 Socket user info set:', { 
            socketId: socket.id, 
            userId: socket.userId, 
            userName: socket.userName, 
            role: socket.role 
          });

          if (role === 'admin') {
            connectedAdmins.set(userId, socket.id);
            socket.join('admin_room');
            console.log(`👨‍💼 Admin ${userName} joined admin room`);
            console.log(`👨‍💼 Admin room members: ${io.sockets.adapter.rooms.get('admin_room')?.size || 0}`);
            
            // Send unread count to admin
            try {
              const unreadCount = await getUnreadCount();
              socket.emit('unread_count', { count: unreadCount });
              console.log(`📊 Sent unread count to admin: ${unreadCount}`);
            } catch (unreadError) {
              console.error('❌ Error getting unread count:', unreadError);
            }
            
            // Send all online users to admin
            const onlineUsers = Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
              id: userId,
              socketId,
              status: 'online'
            }));
            socket.emit('online_users', { users: onlineUsers });
            console.log(`👥 Sent online users to admin: ${onlineUsers.length} users`);
            
            // Auto-join admin to all existing user rooms for real-time message reception
            try {
              const allMessages = await getAllUnreadMessages();
              const uniqueUserIds = [...new Set(allMessages.map(msg => msg.senderId))];
              
              for (const userId of uniqueUserIds) {
                const roomId = `user_${userId}_admin`;
                socket.join(roomId);
                console.log(`👨‍💼 Admin auto-joined room: ${roomId}`);
              }
            } catch (error) {
              console.error('❌ Error auto-joining admin to user rooms:', error);
            }
          } else {
            connectedUsers.set(userId, socket.id);
            const roomId = `user_${userId}_admin`; // Unique room for each user-admin pair
            
            try {
              socket.join(roomId);
              console.log(`👤 User ${userName} joined room: ${roomId}`);

              // Get user's chat history
              const messages = await getMessagesByRoom(roomId);
              socket.emit('chat_history', { messages });
              console.log(`📜 Sent ${messages.length} messages to user ${userName}`);
              
              // Add user to admin list
              const userInfo = {
                id: userId,
                name: userName,
                email: userEmail,
                status: 'online',
                lastMessage: messages.length > 0 ? messages[messages.length - 1].message : 'No messages yet',
                unreadCount: 0,
                roomId: roomId
              };
              console.log('👤 Adding user to admin list (connected):', userInfo);
              io.to('admin_room').emit('user_update', userInfo);
              
            } catch (joinError) {
              console.error('❌ Error joining user room:', joinError);
              socket.emit('error', { 
                message: `Failed to join chat: Could not join room ${roomId}` 
              });
            }
          }

          // Broadcast user status
          io.emit('user_status', {
            userId,
            userName,
            status: 'online',
            role
          });

        } catch (error) {
          console.error('❌ Error in join_chat:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // Send message
      socket.on('send_message', async (messageData) => {
        try {
          console.log('📥 Received send_message event:', messageData);
          console.log('👤 Socket info:', { 
            socketId: socket.id, 
            userId: socket.userId, 
            userName: socket.userName, 
            role: socket.role 
          });
          
          const { message, receiverId, receiverName, messageType = 'user_to_admin', attachmentUrl, attachmentType } = messageData;
          
          // Create message in database
          const newMessage = await createUserAdminMessage({
            senderId: socket.userId,
            senderName: socket.userName,
            senderEmail: socket.userEmail,
            receiverId,
            receiverName,
            message,
            messageType,
            roomId: socket.role === 'admin' ? `user_${receiverId}_admin` : `user_${socket.userId}_admin`,
            attachmentUrl,
            attachmentType,
            status: 'sent'
          });

          const messageToSend = newMessage.toJSON();

          if (socket.role === 'admin') {
            // Admin sends message to specific user
            const userSocketId = connectedUsers.get(receiverId);
            const roomId = `user_${receiverId}_admin`;
            
            // Send to specific user if online
            if (userSocketId) {
              io.to(userSocketId).emit('receive_message', messageToSend);
              console.log(`📤 Admin message sent to user ${receiverId} via socket ${userSocketId}`);
              
              // Update message status to delivered
              await UserAdminChatMessage.update(
                { status: 'delivered' },
                { where: { id: newMessage.id } }
              );
            }
            
            // Send to specific room (includes all admins in this room)
            io.to(roomId).emit('receive_message', messageToSend);
            console.log(`📤 Admin message sent to room ${roomId}`);
            
            // Also send to admin room for admins not in this specific room
            socket.to('admin_room').emit('receive_message', messageToSend);
            console.log(`📤 Admin message also sent to admin_room`);
            
            // Send back to user for confirmation
            socket.emit('message_sent', messageToSend);
          } else {
            // User sends message to all admins
            console.log('📤 Sending message from user to admin_room:', messageToSend);
            
            // Send to all admins in admin_room
            io.to('admin_room').emit('receive_message', messageToSend);
            console.log('📤 User message sent to admin_room');
            
            // Send back to user for confirmation
            socket.emit('message_sent', messageToSend);
            
            // Update user info in admins' user list when they send a message
            const userRoomId = `user_${socket.userId}_admin`;
            const userInfo = {
              id: socket.userId,
              name: socket.userName,
              email: socket.userEmail,
              status: 'online',
              lastMessage: message,
              unreadCount: 1, // This message is unread
              roomId: userRoomId
            };
            console.log('👤 Updating user in admin list (new message):', userInfo);
            io.to('admin_room').emit('user_update', userInfo);
          }

          // Update unread count for admins
          if (socket.role !== 'admin') {
            const unreadCount = await getUnreadCount();
            io.to('admin_room').emit('unread_count', { count: unreadCount });
          }

          console.log(`💬 Message sent from ${socket.userName} (${socket.role})`);

        } catch (error) {
          console.error('❌ Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Mark messages as read
      socket.on('mark_read', async (messageIds) => {
        try {
          await markMessagesAsRead(messageIds);
          
          if (socket.role === 'admin') {
            // Update unread count for all admins
            const unreadCount = await getUnreadCount();
            io.to('admin_room').emit('unread_count', { count: unreadCount });
          }
          
          socket.emit('messages_marked_read', { messageIds });
        } catch (error) {
          console.error('❌ Error marking messages as read:', error);
          socket.emit('error', { message: 'Failed to mark messages as read' });
        }
      });

      // Get unread messages for admin
      socket.on('get_unread_messages', async () => {
        try {
          if (socket.role === 'admin') {
            const unreadMessages = await getAllUnreadMessages();
            socket.emit('unread_messages', { messages: unreadMessages });
          }
        } catch (error) {
          console.error('❌ Error getting unread messages:', error);
          socket.emit('error', { message: 'Failed to get unread messages' });
        }
      });

      // Typing indicators
      socket.on('typing_start', (data) => {
        if (socket.role === 'admin') {
          const userSocketId = connectedUsers.get(data.receiverId);
          if (userSocketId) {
            io.to(userSocketId).emit('user_typing', { 
              userName: socket.userName,
              isTyping: true 
            });
          }
        } else {
          typingUsers.add(socket.userId);
          io.to('admin_room').emit('user_typing', { 
            userName: socket.userName,
            userId: socket.userId,
            isTyping: true 
          });
        }
      });

      socket.on('typing_stop', (data) => {
        if (socket.role === 'admin') {
          const userSocketId = connectedUsers.get(data.receiverId);
          if (userSocketId) {
            io.to(userSocketId).emit('user_typing', { 
              userName: socket.userName,
              isTyping: false 
            });
          }
        } else {
          typingUsers.delete(socket.userId);
          io.to('admin_room').emit('user_typing', { 
            userName: socket.userName,
            userId: socket.userId,
            isTyping: false 
          });
        }
      });

      // Get online users
      socket.on('get_online_users', () => {
        if (socket.role === 'admin') {
          const onlineUsers = Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
            id: userId,
            socketId,
            status: 'online'
          }));
          socket.emit('online_users', { users: onlineUsers });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);

        if (socket.role === 'admin') {
          connectedAdmins.delete(socket.userId);
          socket.leave('admin_room');
        } else {
          connectedUsers.delete(socket.userId);
          typingUsers.delete(socket.userId);
        }

        // Broadcast user status
        if (socket.userId) {
          io.emit('user_status', {
            userId: socket.userId,
            userName: socket.userName,
            status: 'offline',
            role: socket.role
          });
        }

        // Notify admins about user disconnect
        if (socket.role !== 'admin') {
          io.to('admin_room').emit('user_left', {
            userId: socket.userId,
            userName: socket.userName
          });
        }
      });

      // Get chat history for specific user
      socket.on('get_chat_history', async (data) => {
        try {
          const { userId } = data;
          const roomId = `user_${userId}_admin`;
          const messages = await getMessagesByRoom(roomId);
          
          console.log(`📜 Getting chat history for user ${userId} from room ${roomId}: ${messages.length} messages`);
          
          // Send chat history to the requesting socket
          socket.emit('chat_history', { messages });
          
        } catch (error) {
          console.error('❌ Error getting chat history:', error);
          socket.emit('error', { message: 'Failed to get chat history' });
        }
      });

      // Join specific user room
      socket.on('join_user_room', async (userId) => {
        try {
          if (socket.role === 'admin') {
            const roomId = `user_${userId}_admin`;
            socket.join(roomId);
            console.log(`👤 ${socket.userName} joined user room: ${roomId}`);
            
            // Get and send chat history for this room
            const messages = await getMessagesByRoom(roomId);
            socket.emit('chat_history', { messages });
            console.log(`📜 Sent ${messages.length} messages from room ${roomId}`);
          } else {
            console.error('❌ Only admins can join user rooms');
            socket.emit('error', { message: 'Failed to join user room: Admin access required' });
          }
        } catch (error) {
          console.error('❌ Error joining user room:', error);
          socket.emit('error', { message: 'Failed to join user room' });
        }
      });

      // Leave specific room for admin
      socket.on('leave_user_room', (userId) => {
        try {
          if (socket.role === 'admin') {
            const roomId = `user_${userId}_admin`;
            socket.leave(roomId);
            console.log(`👨‍💼 Admin ${socket.userName} left user room: ${roomId}`);
          } else {
            console.log('❌ Only admins can leave user rooms');
            socket.emit('error', { message: 'Failed to leave user room: Admin access required' });
          }
        } catch (error) {
          console.error('❌ Error leaving user room:', error);
          socket.emit('error', { message: 'Failed to leave user room' });
        }
      });
    });
  }

  static getChatHistory = async (req, res) => {
    try {
      const { userId, roomId, limit } = req.query;
      
      if (userId) {
        const messages = await getMessagesByUser(userId);
        res.json({
          success: true,
          data: {
            messages: messages
          }
        });
      } else if (roomId) {
        const messages = await getMessagesByRoom(roomId);
        res.json({
          success: true,
          data: {
            messages: messages
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'userId or roomId is required'
        });
      }
    } catch (error) {
      console.error('❌ Error in getChatHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get chat history'
      });
    }
  };

  static getUnreadCount = async (req, res) => {
    try {
      const unreadCount = await getUnreadCount();
      res.json({
        success: true,
        data: {
          count: unreadCount
        }
      });
    } catch (error) {
      console.error('❌ Error in getUnreadCount:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count'
      });
    }
  };

  static getOnlineUsers = async (req, res) => {
    try {
      // This is a placeholder - needs io instance to get connected users
      res.json({
        success: true,
        data: {
          users: []
        }
      });
    } catch (error) {
      console.error('❌ Error in getOnlineUsers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get online users'
      });
    }
  };
}

module.exports = SocketChatController;
