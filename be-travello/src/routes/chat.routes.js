import express from "express";
import { chat } from "../controllers/chat.controller.js";

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Chat with Gemini AI
 * @access  Public
 * @body    { message: string, history?: array }
 */
router.post("/", chat);

export default router;
