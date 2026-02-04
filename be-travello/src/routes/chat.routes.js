const express = require("express");
const { chat } = require("../controllers/chat.controller.js");

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Chat with Gemini AI
 * @access  Public
 * @body    { message: string, history?: array }
 */
router.post("/", chat);

module.exports = router;
