import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { 
    getConversations, 
    getMessages, 
    sendMessage, 
    markMessagesAsRead,
    getOnlineUsers,
    updateTypingStatus
} from "../controllers/chat.controller.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 * @query   ?page=1&limit=20
 */
router.get("/conversations", getConversations);

/**
 * @route   GET /api/chat/conversations/:conversationId/messages
 * @desc    Get messages for a specific conversation
 * @access  Private
 * @query   ?page=1&limit=50&before=timestamp
 */
router.get("/conversations/:conversationId/messages", getMessages);

/**
 * @route   POST /api/chat/conversations/:conversationId/messages
 * @desc    Send a message in a conversation
 * @access  Private
 * @body    { message: string, messageType?: 'text'|'image'|'file', fileUrl?: string }
 */
router.post("/conversations/:conversationId/messages", sendMessage);

/**
 * @route   PUT /api/chat/conversations/:conversationId/read
 * @desc    Mark messages as read in a conversation
 * @access  Private
 */
router.put("/conversations/:conversationId/read", markMessagesAsRead);

/**
 * @route   GET /api/chat/online-users
 * @desc    Get list of online users
 * @access  Private
 */
router.get("/online-users", getOnlineUsers);

/**
 * @route   POST /api/chat/typing
 * @desc    Update typing status
 * @access  Private
 * @body    { conversationId: string, isTyping: boolean }
 */
router.post("/typing", updateTypingStatus);

/**
 * @route   POST /api/chat/start-conversation
 * @desc    Start a new conversation with a user
 * @access  Private
 * @body    { participantId: string }
 */
router.post("/start-conversation", async (req, res, next) => {
    try {
        const { participantId } = req.body;
        const currentUserId = req.user.id;

        if (!participantId) {
            return res.status(400).json({ error: "Participant ID is required" });
        }

        if (participantId === currentUserId) {
            return res.status(400).json({ error: "Cannot start conversation with yourself" });
        }

        // Check if conversation already exists
        const existingConv = await db.get(`
            SELECT id FROM conversations 
            WHERE (participant_1_id = ? AND participant_2_id = ?) 
            OR (participant_1_id = ? AND participant_2_id = ?)
        `, [currentUserId, participantId, participantId, currentUserId]);

        if (existingConv) {
            return res.status(200).json({
                success: true,
                data: {
                    conversationId: existingConv.id,
                    isNew: false
                }
            });
        }

        // Create new conversation
        const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await db.run(`
            INSERT INTO conversations (id, participant_1_id, participant_2_id)
            VALUES (?, ?, ?)
        `, [conversationId, currentUserId, participantId]);

        res.status(201).json({
            success: true,
            data: {
                conversationId,
                isNew: true
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
