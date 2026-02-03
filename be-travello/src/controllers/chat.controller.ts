import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatRequest {
  message: string;
  userId?: string;
  sessionId?: string;
}

interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    timestamp: string;
    sessionId?: string;
  };
  error?: string;
}

class ChatController {
  private static model: any;

  static initialize() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    ChatController.model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    });
  }

  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, userId, sessionId }: ChatRequest = req.body;

      if (!message || message.trim() === '') {
        res.status(400).json({
          success: false,
          error: 'Message is required'
        } as ChatResponse);
        return;
      }

      // Generate AI response
      const result = await ChatController.model.generateContent(message);
      const response = result.response.text();

      const chatResponse: ChatResponse = {
        success: true,
        data: {
          response,
          timestamp: new Date().toISOString(),
          sessionId: sessionId || 'default'
        }
      };

      res.json(chatResponse);
    } catch (error) {
      console.error('Chat API Error:', error);
      
      const errorResponse: ChatResponse = {
        success: false,
        error: 'Failed to generate response',
        data: {
          response: '',
          timestamp: new Date().toISOString()
        }
      };

      res.status(500).json(errorResponse);
    }
  }

  static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      
      // TODO: Implement chat history from database
      const historyResponse: ChatResponse = {
        success: true,
        data: {
          response: 'Chat history feature coming soon',
          timestamp: new Date().toISOString(),
          sessionId: sessionId as string || 'default'
        }
      };

      res.json(historyResponse);
    } catch (error) {
      console.error('Chat History Error:', error);
      
      const errorResponse: ChatResponse = {
        success: false,
        error: 'Failed to fetch chat history',
        data: {
          response: '',
          timestamp: new Date().toISOString()
        }
      };

      res.status(500).json(errorResponse);
    }
  }

  static async clearChat(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.query;
      
      // TODO: Implement clear chat from database
      const clearResponse: ChatResponse = {
        success: true,
        data: {
          response: 'Chat cleared successfully',
          timestamp: new Date().toISOString(),
          sessionId: sessionId as string || 'default'
        }
      };

      res.json(clearResponse);
    } catch (error) {
      console.error('Clear Chat Error:', error);
      
      const errorResponse: ChatResponse = {
        success: false,
        error: 'Failed to clear chat',
        data: {
          response: '',
          timestamp: new Date().toISOString()
        }
      };

      res.status(500).json(errorResponse);
    }
  }
}

export default ChatController;
