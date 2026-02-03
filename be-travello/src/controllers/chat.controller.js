import { chatWithGemini } from "../services/gemini.servce.js";
import { successResponse } from "../utils/response.js";

export const chat = async (req, res, next) => {
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
