const express = require("express");
const SocketChatController = require("../controllers/socket-chat.controller.js");

const router = express.Router();

/**
 * @route   GET /api/socket/chat/history
 * @desc    Get chat history by user or room
 * @access  Public
 * @query   { userId?, roomId?, limit? }
 */
router.get("/history", SocketChatController.getChatHistory);

/**
 * @route   GET /api/socket/chat/unread-count
 * @desc    Get unread messages count
 * @access  Public
 */
router.get("/unread-count", SocketChatController.getUnreadCount);

/**
 * @route   GET /api/socket/chat/online-users
 * @desc    Get online users (placeholder - needs io instance)
 * @access  Public
 */
router.get("/online-users", SocketChatController.getOnlineUsers);

module.exports = router;
