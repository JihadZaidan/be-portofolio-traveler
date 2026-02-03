import { successResponse, errorResponse } from "../utils/response.js";
import { v4 as uuidv4 } from 'uuid';
import db from "../config/database.js";

// Get all conversations for current user
export const getConversations = async (req, res, next) => {
    try {
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const conversations = await db.all(`
            SELECT 
                c.id,
                c.participant_1_id,
                c.participant_2_id,
                c.last_message,
                c.last_message_timestamp,
                c.created_at,
                c.updated_at,
                CASE 
                    WHEN c.participant_1_id = ? THEN u2.username
                    ELSE u1.username
                END as other_username,
                CASE 
                    WHEN c.participant_1_id = ? THEN 
                        CASE 
                            WHEN u2.display_name IS NOT NULL AND u2.display_name != '' THEN u2.display_name
                            ELSE u2.username
                        END
                    ELSE 
                        CASE 
                            WHEN u1.display_name IS NOT NULL AND u1.display_name != '' THEN u1.display_name
                            ELSE u1.username
                        END
                END as other_display_name,
                CASE 
                    WHEN c.participant_1_id = ? THEN u2.profile_picture
                    ELSE u1.profile_picture
                END as other_avatar,
                CASE 
                    WHEN c.participant_1_id = ? THEN 
                        (SELECT COUNT(*) FROM chat_messages_enhanced cm 
                         WHERE cm.conversation_id = c.id AND cm.receiver_id = ? AND cm.is_read = 0)
                    ELSE 
                        (SELECT COUNT(*) FROM chat_messages_enhanced cm 
                         WHERE cm.conversation_id = c.id AND cm.receiver_id = ? AND cm.is_read = 0)
                END as unread_count
            FROM conversations c
            JOIN users u1 ON c.participant_1_id = u1.id
            JOIN users u2 ON c.participant_2_id = u2.id
            WHERE c.participant_1_id = ? OR c.participant_2_id = ?
            ORDER BY c.last_message_timestamp DESC
            LIMIT ? OFFSET ?
        `, [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, limit, offset]);

        const total = await db.get(`
            SELECT COUNT(*) as count FROM conversations 
            WHERE participant_1_id = ? OR participant_2_id = ?
        `, [currentUserId, currentUserId]);

        res.status(200).json(successResponse({
            conversations,
            pagination: {
                page,
                limit,
                total: total.count,
                totalPages: Math.ceil(total.count / limit)
            }
        }));
    } catch (error) {
        next(error);
    }
};

// Get messages for a specific conversation
export const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const before = req.query.before;
        const offset = (page - 1) * limit;

        // Verify user is part of conversation
        const conversation = await db.get(`
            SELECT id FROM conversations 
            WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `, [conversationId, currentUserId, currentUserId]);

        if (!conversation) {
            return res.status(404).json(errorResponse("Conversation not found"));
        }

        let query = `
            SELECT 
                cm.id,
                cm.sender_id,
                cm.receiver_id,
                cm.message,
                cm.message_type,
                cm.file_url,
                cm.is_read,
                cm.timestamp,
                u.username as sender_name,
                u.display_name as sender_display_name,
                u.profile_picture as sender_avatar
            FROM chat_messages_enhanced cm
            JOIN users u ON cm.sender_id = u.id
            WHERE cm.conversation_id = ?
        `;

        const params = [conversationId];

        if (before) {
            query += ` AND cm.timestamp < ?`;
            params.push(before);
        }

        query += ` ORDER BY cm.timestamp DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const messages = await db.all(query, params);

        // Mark messages as read for current user
        await db.run(`
            UPDATE chat_messages_enhanced 
            SET is_read = 1 
            WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0
        `, [conversationId, currentUserId]);

        res.status(200).json(successResponse({
            messages: messages.reverse(), // Reverse to show oldest first
            pagination: {
                page,
                limit,
                hasMore: messages.length === limit
            }
        }));
    } catch (error) {
        next(error);
    }
};

// Send a message
export const sendMessage = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { message, messageType = 'text', fileUrl } = req.body;
        const currentUserId = req.user.id;

        if (!message && !fileUrl) {
            return res.status(400).json(errorResponse("Message or file URL is required"));
        }

        // Verify user is part of conversation
        const conversation = await db.get(`
            SELECT id, participant_1_id, participant_2_id 
            FROM conversations 
            WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `, [conversationId, currentUserId, currentUserId]);

        if (!conversation) {
            return res.status(404).json(errorResponse("Conversation not found"));
        }

        const receiverId = conversation.participant_1_id === currentUserId 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;

        const messageId = uuidv4();

        await db.run(`
            INSERT INTO chat_messages_enhanced (
                id, conversation_id, sender_id, receiver_id, 
                message, message_type, file_url, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            messageId, conversationId, currentUserId, receiverId,
            message, messageType, fileUrl, new Date().toISOString()
        ]);

        // Get the created message with sender details
        const newMessage = await db.get(`
            SELECT 
                cm.id,
                cm.sender_id,
                cm.receiver_id,
                cm.message,
                cm.message_type,
                cm.file_url,
                cm.is_read,
                cm.timestamp,
                u.username as sender_name,
                u.display_name as sender_display_name,
                u.profile_picture as sender_avatar
            FROM chat_messages_enhanced cm
            JOIN users u ON cm.sender_id = u.id
            WHERE cm.id = ?
        `, [messageId]);

        // Emit real-time message via WebSocket (if implemented)
        if (req.io) {
            req.io.to(`user_${receiverId}`).emit('new_message', {
                conversationId,
                message: newMessage
            });
        }

        res.status(201).json(successResponse(newMessage));
    } catch (error) {
        next(error);
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const currentUserId = req.user.id;

        // Verify user is part of conversation
        const conversation = await db.get(`
            SELECT id FROM conversations 
            WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `, [conversationId, currentUserId, currentUserId]);

        if (!conversation) {
            return res.status(404).json(errorResponse("Conversation not found"));
        }

        const result = await db.run(`
            UPDATE chat_messages_enhanced 
            SET is_read = 1 
            WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0
        `, [conversationId, currentUserId]);

        res.status(200).json(successResponse({
            messagesRead: result.changes
        }));
    } catch (error) {
        next(error);
    }
};

// Get online users
export const getOnlineUsers = async (req, res, next) => {
    try {
        const onlineUsers = await db.all(`
            SELECT 
                u.id,
                u.username,
                u.display_name,
                u.profile_picture,
                uos.last_seen,
                uos.socket_id
            FROM user_online_status uos
            JOIN users u ON uos.user_id = u.id
            WHERE uos.is_online = 1 AND uos.user_id != ?
            ORDER BY uos.last_seen DESC
        `, [req.user.id]);

        res.status(200).json(successResponse(onlineUsers));
    } catch (error) {
        next(error);
    }
};

// Update typing status
export const updateTypingStatus = async (req, res, next) => {
    try {
        const { conversationId, isTyping } = req.body;
        const currentUserId = req.user.id;

        if (!conversationId) {
            return res.status(400).json(errorResponse("Conversation ID is required"));
        }

        // Verify user is part of conversation
        const conversation = await db.get(`
            SELECT id, participant_1_id, participant_2_id 
            FROM conversations 
            WHERE id = ? AND (participant_1_id = ? OR participant_2_id = ?)
        `, [conversationId, currentUserId, currentUserId]);

        if (!conversation) {
            return res.status(404).json(errorResponse("Conversation not found"));
        }

        const otherUserId = conversation.participant_1_id === currentUserId 
            ? conversation.participant_2_id 
            : conversation.participant_1_id;

        // Clean up old typing indicators
        await db.run(`
            DELETE FROM typing_indicators 
            WHERE timestamp < datetime('now', '-5 minutes')
        `);

        if (isTyping) {
            // Add or update typing indicator
            await db.run(`
                INSERT OR REPLACE INTO typing_indicators (id, conversation_id, user_id, is_typing, timestamp)
                VALUES (?, ?, ?, ?, ?)
            `, [uuidv4(), conversationId, currentUserId, isTyping, new Date().toISOString()]);
        } else {
            // Remove typing indicator
            await db.run(`
                DELETE FROM typing_indicators 
                WHERE conversation_id = ? AND user_id = ?
            `, [conversationId, currentUserId]);
        }

        // Emit real-time typing status
        if (req.io) {
            req.io.to(`user_${otherUserId}`).emit('typing_status', {
                conversationId,
                userId: currentUserId,
                isTyping
            });
        }

        res.status(200).json(successResponse({ isTyping }));
    } catch (error) {
        next(error);
    }
};
