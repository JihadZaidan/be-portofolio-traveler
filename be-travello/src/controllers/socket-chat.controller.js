const AdminChat = require('../models/AdminChat');
const AdminChatMySQL = require('../models/AdminChatMySQL');
const mongoose = require('mongoose');

class SocketChatController {
    constructor() {
        this.connectedUsers = new Map(); // userId -> socket
        this.connectedAdmins = new Map(); // adminId -> socket
        this.userSockets = new Map(); // socketId -> userInfo
        this.adminSockets = new Map(); // socketId -> adminInfo
    }

    handleConnection(io, socket) {
        console.log('🔗 New socket connection:', socket.id);

        // Handle user connection
        socket.on('user:join', async (data) => {
            try {
                const { userInfo, userId } = data;
                
                // Store user connection
                this.userSockets.set(socket.id, { userInfo, userId, socket });
                if (userId) {
                    this.connectedUsers.set(userId, socket);
                }

                // Join user to their personal room
                const userRoom = `user_${userId || userInfo.email}`;
                socket.join(userRoom);

                // Find or create chat session with error handling
                let chatSession;
                try {
                    if (mongoose.connection.readyState === 1) {
                        // Use MongoDB if available
                        chatSession = await AdminChat.findOrCreateChat(userInfo, userId);
                    } else {
                        // Use MySQL fallback
                        chatSession = await AdminChatMySQL.findOrCreateChat(userInfo, userId);
                    }
                } catch (dbError) {
                    console.warn('⚠️ Could not create/find chat session:', dbError.message);
                    // Create a mock session for fallback
                    chatSession = {
                        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        status: 'waiting',
                        assignedAdmin: null,
                        unreadCount: { user: 0, admin: 0 }
                    };
                }
                
                // Join admin room for this chat
                socket.join(`chat_${chatSession.sessionId}`);

                console.log(`👤 User joined: ${userInfo.name} (${userInfo.email})`);
                console.log(`📱 User socket rooms: ${socket.rooms}`);

                // Notify all admins about new user
                io.to('admins').emit('admin:user_joined', {
                    userInfo,
                    sessionId: chatSession.sessionId,
                    timestamp: new Date()
                });

                // Send current chat status to user
                socket.emit('chat:status', {
                    sessionId: chatSession.sessionId,
                    status: chatSession.status,
                    assignedAdmin: chatSession.assignedAdmin,
                    unreadCount: chatSession.unreadCount?.user || 0
                });

            } catch (error) {
                console.error('❌ Error in user:join:', error);
                socket.emit('error', { message: 'Failed to join chat' });
            }
        });

        // Handle admin connection
        socket.on('admin:join', async (data) => {
            try {
                const { adminInfo, adminId } = data;
                
                // Store admin connection
                this.adminSockets.set(socket.id, { adminInfo, adminId, socket });
                if (adminId) {
                    this.connectedAdmins.set(adminId, socket);
                }

                // Join admin to admin room
                socket.join('admins');

                console.log(`👨‍💼 Admin joined: ${adminInfo.name} (${adminInfo.email})`);

                // Get active chats for admin with error handling
                let activeChats = [];
                try {
                    // Check if MongoDB is connected
                    if (mongoose.connection.readyState === 1) {
                        activeChats = await AdminChat.getActiveChats(adminId);
                    } else {
                        // Use MySQL fallback
                        activeChats = await AdminChatMySQL.getActiveChats(adminId);
                    }
                } catch (dbError) {
                    console.warn('⚠️ Could not fetch active chats from database:', dbError.message);
                    // Continue with empty chats array
                }
                
                // Send active chats to admin
                socket.emit('admin:active_chats', {
                    chats: activeChats,
                    timestamp: new Date()
                });

                // Notify other admins about new admin
                socket.broadcast.to('admins').emit('admin:admin_joined', {
                    adminInfo,
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('❌ Error in admin:join:', error);
                socket.emit('error', { message: 'Failed to join admin chat' });
            }
        });

        // Handle user message
        socket.on('message:send', async (data) => {
            try {
                const { message, sessionId, userInfo } = data;
                
                console.log(`💬 User message from ${socket.id}:`, message);

                // Find chat session with error handling
                let chatSession;
                try {
                    if (mongoose.connection.readyState === 1) {
                        chatSession = await AdminChat.findOne({ sessionId });
                    } else {
                        // For MySQL, we'll handle differently
                        chatSession = { sessionId, _id: true }; // Mock for compatibility
                    }
                } catch (dbError) {
                    console.warn('⚠️ Could not find chat session:', dbError.message);
                    chatSession = null;
                }

                if (!chatSession) {
                    // Create new session if not exists
                    try {
                        if (mongoose.connection.readyState === 1) {
                            chatSession = await AdminChat.create({
                                userInfo,
                                status: 'waiting'
                            });
                        } else {
                            // Use MySQL fallback
                            chatSession = await AdminChatMySQL.findOrCreateChat(userInfo, null);
                        }
                    } catch (createError) {
                        console.warn('⚠️ Could not create chat session:', createError.message);
                        // Create mock session for fallback
                        chatSession = {
                            sessionId: sessionId || `session-${Date.now()}`,
                            unreadCount: { admin: 1, user: 0 },
                            _id: true
                        };
                    }
                }

                // Add message to chat if real session exists
                if (chatSession._id || chatSession.sessionId) {
                    try {
                        if (mongoose.connection.readyState === 1) {
                            await chatSession.addMessage('user', message, userInfo.name);
                        } else {
                            // Use MySQL fallback
                            await AdminChatMySQL.addMessage(chatSession.sessionId, 'user', message, userInfo.name, null, 'text');
                        }
                    } catch (msgError) {
                        console.warn('⚠️ Could not add message to database:', msgError.message);
                    }
                }

                // Join rooms if not already joined
                socket.join(`chat_${sessionId}`);
                socket.join(`user_${userInfo.email}`);

                // Broadcast message to admins
                const messageData = {
                    sessionId: chatSession.sessionId,
                    message: {
                        sender: 'user',
                        senderName: userInfo.name,
                        message: message,
                        timestamp: new Date()
                    },
                    userInfo,
                    unreadCount: chatSession.unreadCount?.admin || 1
                };

                // Send to all admins
                io.to('admins').emit('message:new', messageData);
                
                // Send to specific admin room
                io.to(`chat_${sessionId}`).emit('message:new', messageData);

                console.log(`📤 Message broadcasted to admins`);

            } catch (error) {
                console.error('❌ Error in message:send:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle admin message
        socket.on('admin:message:send', async (data) => {
            try {
                const { message, sessionId, adminInfo } = data;
                
                console.log(`💬 Admin message from ${socket.id}:`, message);

                // Find chat session with error handling
                let chatSession;
                try {
                    if (mongoose.connection.readyState === 1) {
                        chatSession = await AdminChat.findOne({ sessionId });
                    } else {
                        // Use MySQL fallback
                        chatSession = await AdminChatMySQL.findChatBySessionId(sessionId);
                    }
                } catch (dbError) {
                    console.warn('⚠️ Could not find chat session:', dbError.message);
                    chatSession = null;
                }

                if (!chatSession) {
                    console.warn('⚠️ Chat session not found, creating fallback session');
                    // Create a fallback session for message delivery
                    chatSession = {
                        sessionId: sessionId,
                        userInfo: { name: 'User', email: 'user@example.com' },
                        status: 'active',
                        assignedAdmin: adminInfo.id,
                        unreadCount: { user: 1, admin: 0 }
                    };
                }

                // Assign admin and add message if real session exists
                if (chatSession._id || chatSession.sessionId) {
                    try {
                        if (mongoose.connection.readyState === 1 && chatSession._id) {
                            // MongoDB operations
                            if (!chatSession.assignedAdmin) {
                                await chatSession.assignAdmin(adminInfo.id);
                            }
                            await chatSession.addMessage('admin', message, adminInfo.name, adminInfo.id);
                        } else {
                            // MySQL fallback operations
                            await AdminChatMySQL.addMessage(sessionId, 'admin', message, adminInfo.name, adminInfo.id, 'text');
                        }
                    } catch (msgError) {
                        console.warn('⚠️ Could not add message to database:', msgError.message);
                    }
                }

                // Broadcast message to user
                const messageData = {
                    sessionId: chatSession.sessionId,
                    message: {
                        sender: 'admin',
                        senderName: adminInfo.name,
                        message: message,
                        timestamp: new Date()
                    },
                    adminInfo,
                    unreadCount: chatSession.unreadCount?.user || 0
                };

                // Broadcast message to user room
                io.to(`chat_${sessionId}`).emit('message:new', messageData);
                
                // Also try to send to user-specific room
                if (chatSession.userInfo?.email) {
                    io.to(`user_${chatSession.userInfo.email}`).emit('message:new', messageData);
                }

                console.log(`📤 Admin message sent to user in session: ${sessionId}`);

            } catch (error) {
                console.error('❌ Error in admin:message:send:', error);
                socket.emit('error', { message: 'Failed to send admin message' });
            }
        });

        // Handle user joining room
        socket.on('join', (data) => {
            console.log('🔗 User joined room:', data.room);
            
            // If admin joins a chat room, notify user in that room
            if (data.room && data.room.startsWith('chat_')) {
                const sessionId = data.room.replace('chat_', '');
                
                // Get the user session
                AdminChat.findOne({ sessionId }).then(chatSession => {
                    if (chatSession) {
                        // Notify user that admin has joined
                        socket.emit('message:new', {
                            sessionId: sessionId,
                            message: {
                                sender: 'system',
                                senderName: 'System',
                                message: `👨‍💼 Admin has joined this chat. How can I help you?`,
                                timestamp: new Date()
                            },
                            userInfo: chatSession.userInfo,
                            unreadCount: chatSession.unreadCount.user + 1
                        });
                        
                        console.log('📤 Notified user that admin joined room:', data.room);
                    }
                }).catch(err => {
                    console.error('❌ Error finding chat session for room join:', err);
                });
            }
        });
        socket.on('message:read', async (data) => {
            try {
                const { sessionId, reader } = data;
                
                const chatSession = await AdminChat.findOne({ sessionId });
                if (!chatSession) return;

                await chatSession.markAsRead(reader);

                // Notify other party
                const otherParty = reader === 'admin' ? 'user' : 'admin';
                io.to(`chat_${sessionId}`).emit('message:read', {
                    sessionId,
                    reader,
                    unreadCount: chatSession.unreadCount[otherParty]
                });

            } catch (error) {
                console.error('❌ Error in message:read:', error);
            }
        });

        // Handle typing indicators
        socket.on('typing:start', (data) => {
            const { sessionId, sender } = data;
            socket.to(`chat_${sessionId}`).emit('typing:start', {
                sessionId,
                sender
            });
        });

        socket.on('typing:stop', (data) => {
            const { sessionId, sender } = data;
            socket.to(`chat_${sessionId}`).emit('typing:stop', {
                sessionId,
                sender
            });
        });

        // Handle chat status changes
        socket.on('chat:status_change', async (data) => {
            try {
                const { sessionId, status, adminId } = data;
                
                const chatSession = await AdminChat.findOne({ sessionId });
                if (!chatSession) return;

                chatSession.status = status;
                if (status === 'active' && adminId) {
                    chatSession.assignedAdmin = adminId;
                }
                await chatSession.save();

                // Broadcast status change
                io.to(`chat_${sessionId}`).emit('chat:status', {
                    sessionId,
                    status,
                    assignedAdmin: chatSession.assignedAdmin
                });

                io.to('admins').emit('admin:chat_updated', {
                    sessionId,
                    status,
                    assignedAdmin: chatSession.assignedAdmin
                });

            } catch (error) {
                console.error('❌ Error in chat:status_change:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected:', socket.id);

            // Remove from user connections
            const userInfo = this.userSockets.get(socket.id);
            if (userInfo) {
                this.userSockets.delete(socket.id);
                if (userInfo.userId && this.connectedUsers.get(userInfo.userId) === socket) {
                    this.connectedUsers.delete(userInfo.userId);
                }

                // Notify admins about user disconnect
                socket.broadcast.emit('admin:user_left', {
                    userInfo: userInfo.userInfo,
                    timestamp: new Date()
                });
            }

            // Remove from admin connections
            const adminInfo = this.adminSockets.get(socket.id);
            if (adminInfo) {
                this.adminSockets.delete(socket.id);
                if (adminInfo.adminId && this.connectedAdmins.get(adminInfo.adminId) === socket) {
                    this.connectedAdmins.delete(adminInfo.adminId);
                }

                // Notify other admins about admin disconnect
                socket.broadcast.to('admins').emit('admin:admin_left', {
                    adminInfo: adminInfo.adminInfo,
                    timestamp: new Date()
                });
            }
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });
    }

    // Get connection statistics
    getStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            connectedAdmins: this.connectedAdmins.size,
            totalUserSockets: this.userSockets.size,
            totalAdminSockets: this.adminSockets.size
        };
    }

    // Send message to specific user
    sendToUser(userId, event, data) {
        const socket = this.connectedUsers.get(userId);
        if (socket) {
            socket.emit(event, data);
            return true;
        }
        return false;
    }

    // Send message to specific admin
    sendToAdmin(adminId, event, data) {
        const socket = this.connectedAdmins.get(adminId);
        if (socket) {
            socket.emit(event, data);
            return true;
        }
        return false;
    }

    // Broadcast to all admins
    broadcastToAdmins(io, event, data) {
        io.to('admins').emit(event, data);
    }

    // Broadcast to all users
    broadcastToUsers(io, event, data) {
        this.userSockets.forEach(({ socket }) => {
            socket.emit(event, data);
        });
    }
}

module.exports = SocketChatController;
