const express = require("express");
const UserAdminChatController = require("../controllers/user-admin-chat.controller.js");

const router = express.Router();

/**
 * @route   GET /api/user-admin-chat/conversations
 * @desc    Get all conversations for admin
 * @access  Public
 */
router.get("/conversations", UserAdminChatController.getConversations);

/**
 * @route   GET /api/user-admin-chat/room/:roomId/messages
 * @desc    Get messages for a specific room
 * @access  Public
 * @query   { limit? }
 */
router.get("/room/:roomId/messages", UserAdminChatController.getRoomMessages);

/**
 * @route   GET /api/user-admin-chat/user/:userId/messages
 * @desc    Get messages for a specific user
 * @access  Public
 * @query   { limit? }
 */
router.get("/user/:userId/messages", UserAdminChatController.getUserMessages);

/**
 * @route   POST /api/user-admin-chat/send
 * @desc    Send message (REST API fallback)
 * @access  Public
 * @body    { senderId, senderName, senderEmail, receiverId?, receiverName?, message, messageType?, roomId?, attachmentUrl?, attachmentType? }
 */
router.post("/send", UserAdminChatController.sendMessage);

/**
 * @route   PUT /api/user-admin-chat/mark-read
 * @desc    Mark messages as read
 * @access  Public
 * @body    { messageIds: string[] }
 */
router.put("/mark-read", UserAdminChatController.markMessagesRead);

/**
 * @route   GET /api/user-admin-chat/unread-count
 * @desc    Get unread messages count
 * @access  Public
 * @query   { userId?, role? }
 */
router.get("/unread-count", UserAdminChatController.getUnreadCount);

/**
 * @route   GET /api/user-admin-chat/unread-messages
 * @desc    Get unread messages (admin only)
 * @access  Public
 * @query   { role: 'admin' }
 */
router.get("/unread-messages", UserAdminChatController.getUnreadMessages);

/**
 * @route   GET /api/user-admin-chat/room/:roomId/latest
 * @desc    Get latest message for room
 * @access  Public
 */
router.get("/room/:roomId/latest", UserAdminChatController.getLatestMessage);

module.exports = router;
