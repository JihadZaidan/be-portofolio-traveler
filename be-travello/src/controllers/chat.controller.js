const { chatWithGemini } = require("../services/gemini.servce.js");
const { successResponse } = require("../utils/response.js");

const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (history && !Array.isArray(history)) {
      return res.status(400).json({ error: "History must be an array" });
    }

    const reply = await chatWithGemini(message, history);

    res.status(200).json({
      success: true,
      data: {
        response: reply,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat };
